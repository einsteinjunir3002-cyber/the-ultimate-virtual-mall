import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { calculateSellerSplit } from '@/lib/commission';
import { initializePaystackTransaction } from '@/lib/paystack';
import { FulfillmentStatus, PaymentMethod, PaymentStatus, ProductStatus } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const { items, deliveryAddress, guestEmail, guestName, guestPhone } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 });
    }

    if (!deliveryAddress || !deliveryAddress.fullName || !deliveryAddress.phone || !deliveryAddress.city) {
      return NextResponse.json({ error: 'Please provide complete delivery details' }, { status: 400 });
    }

    const email = user?.email || guestEmail;
    if (!email) {
      return NextResponse.json({ error: 'Email address is required for order confirmation' }, { status: 400 });
    }

    // 1. Fetch current platform configuration for commission rate
    const config = await prisma.platformConfig.findUnique({ where: { id: 'default' } });
    const commissionPercent = Number(config?.defaultCommissionPercent || 5.0);

    // 2. Fetch all products from database to verify stock, price, status and ownership
    const productIds = items.map((i: { productId: string }) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: ProductStatus.PUBLISHED,
        isAvailable: true,
      },
      include: {
        shop: true,
        images: { where: { isPrimary: true }, take: 1 },
      },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Validate that every cart item exists and has enough stock
    for (const item of items) {
      const dbProduct = productMap.get(item.productId);
      if (!dbProduct) {
        return NextResponse.json(
          { error: `Product "${item.name}" is no longer available.` },
          { status: 400 }
        );
      }
      if (dbProduct.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${dbProduct.name}". Only ${dbProduct.stock} left in stock.`,
          },
          { status: 400 }
        );
      }
    }

    // 3. Group validated items by shop
    const shopGroupMap = new Map<
      string,
      {
        shop: typeof dbProducts[0]['shop'];
        items: Array<{
          product: typeof dbProducts[0];
          quantity: number;
          unitPrice: number;
          subtotal: number;
          image?: string;
        }>;
        itemsTotal: number;
        deliveryFee: number;
      }
    >();

    for (const item of items) {
      const dbProduct = productMap.get(item.productId)!;
      const unitPrice = dbProduct.salePrice ? Number(dbProduct.salePrice) : Number(dbProduct.price);
      const subtotal = unitPrice * item.quantity;

      if (!shopGroupMap.has(dbProduct.shopId)) {
        shopGroupMap.set(dbProduct.shopId, {
          shop: dbProduct.shop,
          items: [],
          itemsTotal: 0,
          deliveryFee: Number(dbProduct.shop.baseDeliveryFee || 0),
        });
      }

      const group = shopGroupMap.get(dbProduct.shopId)!;
      group.items.push({
        product: dbProduct,
        quantity: item.quantity,
        unitPrice,
        subtotal,
        image: dbProduct.images[0]?.url || undefined,
      });
      group.itemsTotal += subtotal;
    }

    // 4. Calculate grand total
    let overallItemsTotal = 0;
    let overallDeliveryTotal = 0;

    shopGroupMap.forEach((g) => {
      overallItemsTotal += g.itemsTotal;
      overallDeliveryTotal += g.deliveryFee;
    });

    const grandTotal = overallItemsTotal + overallDeliveryTotal;

    // 5. Generate unique Order Number and Paystack Reference
    const timestamp = Date.now().toString().slice(-6);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `UVM-${timestamp}-${randomSuffix}`;
    const paystackRef = `PAY-${orderNumber}-${Date.now()}`;

    // Callback URL for user after payment
    const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const callbackUrl = `${origin}/checkout/verify`;

    // 6. Initialize Paystack transaction
    const paystackInit = await initializePaystackTransaction({
      email,
      amountInGhs: grandTotal,
      reference: paystackRef,
      callbackUrl,
      metadata: {
        orderNumber,
        customerName: deliveryAddress.fullName,
        phone: deliveryAddress.phone,
      },
    });

    if (!paystackInit.status || !paystackInit.data) {
      return NextResponse.json(
        { error: paystackInit.message || 'Payment initialization failed' },
        { status: 500 }
      );
    }

    // 7. Atomically create ParentOrder, SellerOrders, OrderItems, CommissionRecords and decrement stock
    const createdOrder = await prisma.$transaction(async (tx) => {
      // Create Parent Order
      const parentOrder = await tx.parentOrder.create({
        data: {
          orderNumber,
          customerId: user?.id || null,
          guestEmail: !user ? email : null,
          guestName: !user ? deliveryAddress.fullName : null,
          guestPhone: !user ? deliveryAddress.phone : null,
          deliveryAddress,
          itemsTotal: overallItemsTotal,
          deliveryTotal: overallDeliveryTotal,
          totalAmount: grandTotal,
          currency: 'GHS',
          paymentStatus: PaymentStatus.PENDING,
          paymentMethod: PaymentMethod.PAYSTACK,
          paystackReference: paystackRef,
          paystackAccessCode: paystackInit.data?.access_code || null,
        },
      });

      let subOrderCounter = 1;

      // Create a suborder for each merchant shop
      for (const [shopId, group] of shopGroupMap.entries()) {
        const split = calculateSellerSplit(group.itemsTotal, group.deliveryFee, commissionPercent);
        const subOrderNumber = `${orderNumber}-${subOrderCounter++}`;

        const sellerOrder = await tx.sellerOrder.create({
          data: {
            parentOrderId: parentOrder.id,
            shopId,
            subOrderNumber,
            itemsTotal: split.itemsTotal,
            deliveryFee: split.deliveryFee,
            platformCommissionRate: split.commissionRatePercent,
            platformCommissionAmount: split.commissionAmount,
            sellerEarnings: split.sellerEarnings,
            status: FulfillmentStatus.PENDING,
            items: {
              create: group.items.map((it) => ({
                productId: it.product.id,
                productName: it.product.name,
                unitPrice: it.unitPrice,
                quantity: it.quantity,
                subtotal: it.subtotal,
                productImage: it.image || null,
              })),
            },
            commissionRecord: {
              create: {
                shopId,
                grossAmount: split.orderTotal,
                commissionPercentage: split.commissionRatePercent,
                commissionAmount: split.commissionAmount,
                netSellerAmount: split.sellerEarnings,
              },
            },
          },
        });

        // Decrement product stock
        for (const it of group.items) {
          await tx.product.update({
            where: { id: it.product.id },
            data: {
              stock: { decrement: it.quantity },
            },
          });
        }
      }

      return parentOrder;
    });

    return NextResponse.json({
      success: true,
      orderNumber: createdOrder.orderNumber,
      authorizationUrl: paystackInit.data.authorization_url,
      reference: paystackRef,
      totalAmount: grandTotal,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to process checkout' }, { status: 500 });
  }
}
