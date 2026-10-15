import { NextRequest, NextResponse } from 'next/server';
import { PaymentMethod, PaymentStatus, FulfillmentStatus, ProductStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { initializePaystackTransaction } from '@/lib/paystack';
import { apiError, HttpError, readJson } from '@/lib/http';
import { checkoutSchema } from '@/lib/validation';
import { buildPlan, normalizeLines, fromPesewas, newOrderNumber, newPaymentReference, type CatalogProduct } from '@/lib/checkout';
import { releaseExpiredPendingOrders, releaseOrderStock } from '@/lib/orders';
import { clientIp, hit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const rl = hit(`checkout:${clientIp(req)}`, 20, 10 * 60_000);
    if (!rl.ok) {
      return NextResponse.json({ error: 'Too many checkout attempts. Please wait a few minutes.' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } });
    }

    const user = await getCurrentUser();
    const body = checkoutSchema.parse(await readJson(req));

    const email = user?.email || body.guestEmail;
    if (!email) throw new HttpError(400, 'Email address is required for order confirmation');

    // Normalise & validate quantities (whole numbers ≥ 1, duplicates merged)
    const lines = normalizeLines(body.items as { productId: string; variantId?: string | null; quantity: unknown }[]);

    // Free stock held by abandoned checkouts before we check availability
    await releaseExpiredPendingOrders().catch((e) => console.error('[checkout] expiry sweep failed', e));

    const config = await prisma.platformConfig.findUnique({ where: { id: 'default' } });
    const commissionPercent = Number(config?.defaultCommissionPercent ?? 5);

    // Prices, stock and shop ownership come ONLY from the database — never from the client
    const products = await prisma.product.findMany({
      where: { id: { in: [...new Set(lines.map((l) => l.productId))] }, status: ProductStatus.PUBLISHED, isAvailable: true, shop: { status: 'ACTIVE' } },
      include: { shop: true, variants: true, images: { where: { isPrimary: true }, take: 1 } },
    });
    const catalog = new Map<string, CatalogProduct>(
      products.map((p) => [
        p.id,
        {
          id: p.id, name: p.name, shopId: p.shopId, shopName: p.shop.name,
          price: Number(p.price), salePrice: p.salePrice ? Number(p.salePrice) : null, stock: p.stock,
          deliveryFee: Number(p.shop.baseDeliveryFee ?? 0), image: p.images[0]?.url ?? null,
          variants: p.variants.map((v) => ({ id: v.id, name: v.name, price: Number(v.price), salePrice: v.salePrice ? Number(v.salePrice) : null, stock: v.stock })),
        },
      ])
    );

    const plan = buildPlan(lines, catalog, commissionPercent);
    if (plan.totalPesewas <= 0) throw new HttpError(400, 'Order total must be greater than zero');

    const orderNumber = newOrderNumber();
    const reference = newPaymentReference();
    const address = body.deliveryAddress;

    // 1) Reserve stock + create the order atomically. Each decrement is conditional
    //    (stock >= qty) so concurrent buyers can never oversell.
    const order = await prisma.$transaction(async (tx) => {
      for (const shop of plan.shops) {
        for (const it of shop.items) {
          const res = it.variantId
            ? await tx.productVariant.updateMany({ where: { id: it.variantId, stock: { gte: it.quantity } }, data: { stock: { decrement: it.quantity } } })
            : await tx.product.updateMany({ where: { id: it.productId, stock: { gte: it.quantity } }, data: { stock: { decrement: it.quantity } } });
          if (res.count === 0) throw new HttpError(409, `Sorry, "${it.productName}" just sold out. Please update your cart.`);
        }
      }

      const parent = await tx.parentOrder.create({
        data: {
          orderNumber,
          customerId: user?.id ?? null,
          guestEmail: user ? null : email,
          guestName: user ? null : address.fullName,
          guestPhone: user ? null : address.phone,
          deliveryAddress: address,
          itemsTotal: fromPesewas(plan.itemsPesewas),
          deliveryTotal: fromPesewas(plan.deliveryPesewas),
          totalAmount: fromPesewas(plan.totalPesewas),
          currency: 'GHS',
          paymentStatus: PaymentStatus.PENDING,
          paymentMethod: PaymentMethod.PAYSTACK,
          paystackReference: reference,
        },
      });

      let n = 1;
      for (const shop of plan.shops) {
        await tx.sellerOrder.create({
          data: {
            parentOrderId: parent.id,
            shopId: shop.shopId,
            subOrderNumber: `${orderNumber}-${n++}`,
            itemsTotal: fromPesewas(shop.itemsPesewas),
            deliveryFee: fromPesewas(shop.deliveryPesewas),
            platformCommissionRate: commissionPercent,
            platformCommissionAmount: fromPesewas(shop.commissionPesewas),
            sellerEarnings: fromPesewas(shop.sellerEarningsPesewas),
            status: FulfillmentStatus.PENDING,
            items: {
              create: shop.items.map((it) => ({
                productId: it.productId, variantId: it.variantId, productName: it.productName, variantName: it.variantName,
                unitPrice: fromPesewas(it.unitPesewas), quantity: it.quantity, subtotal: fromPesewas(it.subtotalPesewas), productImage: it.image,
              })),
            },
            commissionRecord: {
              create: {
                shopId: shop.shopId,
                grossAmount: fromPesewas(shop.totalPesewas),
                commissionPercentage: commissionPercent,
                commissionAmount: fromPesewas(shop.commissionPesewas),
                netSellerAmount: fromPesewas(shop.sellerEarningsPesewas),
              },
            },
          },
        });
      }
      return parent;
    });

    // 2) Start the payment with Paystack. If that fails, give the stock back immediately.
    const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const init = await initializePaystackTransaction({
      email,
      amountPesewas: plan.totalPesewas,
      reference,
      callbackUrl: `${origin}/checkout/verify`,
      metadata: { orderNumber, customerName: address.fullName, phone: address.phone },
    });

    if (!init.status || !init.data) {
      await releaseOrderStock(order.id, 'FAILED');
      return NextResponse.json({ error: init.message || 'Payment could not be started' }, { status: 502 });
    }

    await prisma.parentOrder.update({ where: { id: order.id }, data: { paystackAccessCode: init.data.access_code } });

    return NextResponse.json({
      success: true,
      orderNumber,
      authorizationUrl: init.data.authorization_url,
      reference,
      totalAmount: plan.totalPesewas / 100,
    });
  } catch (error) {
    return apiError(error, 'checkout');
  }
}
