import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMerchantContext } from '@/lib/merchant';
import { productCreateSchema, productUpdateSchema } from '@/lib/validation';
import { apiError, HttpError, readJson } from '@/lib/http';

export async function GET() {
  try {
    const { shop } = await getMerchantContext();

    const products = await prisma.product.findMany({
      where: { shopId: shop.id },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        variants: true,
        mallCategory: true,
        shopCategory: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ products });
  } catch (error) {
    return apiError(error, 'merchant.products.get');
  }
}

export async function POST(req: NextRequest) {
  try {
    const { shop } = await getMerchantContext({ requireActive: true });

    const body = await readJson(req);
    const parsed = productCreateSchema.parse(body);

    const baseSlug = parsed.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'product';

    let slug = baseSlug;
    let counter = 1;
    while (await prisma.product.findFirst({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const product = await prisma.product.create({
      data: {
        shopId: shop.id,
        name: parsed.name,
        slug,
        description: parsed.description,
        price: parsed.price,
        salePrice: parsed.salePrice ?? null,
        sku: parsed.sku ?? null,
        stock: parsed.stock ?? 0,
        lowStockThreshold: parsed.lowStockThreshold ?? 5,
        status: parsed.status ?? 'PUBLISHED',
        mallCategoryId: parsed.mallCategoryId || null,
        shopCategoryId: parsed.shopCategoryId || null,
        brand: parsed.brand ?? null,
        images: {
          create: (parsed.images ?? []).map((img, index) => ({
            url: img.url,
            altText: img.altText ?? parsed.name,
            displayOrder: index,
            isPrimary: img.isPrimary ?? index === 0,
          })),
        },
        variants: {
          create: (parsed.variants ?? []).map((v) => ({
            name: v.name,
            price: v.price,
            salePrice: v.salePrice ?? null,
            stock: v.stock,
            sku: v.sku ?? null,
          })),
        },
      },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        variants: true,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    return apiError(error, 'merchant.products.post');
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { shop } = await getMerchantContext({ requireActive: true });

    const body = await readJson(req);
    const parsed = productUpdateSchema.parse(body);

    const existing = await prisma.product.findUnique({
      where: { id: parsed.id },
      include: { variants: true },
    });

    if (!existing || existing.shopId !== shop.id) {
      throw new HttpError(403, 'Forbidden: You do not have permission to modify this product');
    }

    const finalPrice = parsed.price !== undefined ? parsed.price : Number(existing.price);
    const finalSalePrice = parsed.salePrice !== undefined ? parsed.salePrice : (existing.salePrice !== null ? Number(existing.salePrice) : null);
    if (finalSalePrice !== null && finalSalePrice >= finalPrice) {
      throw new HttpError(400, 'Sale price must be lower than the regular price');
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (parsed.images) {
        await tx.productImage.deleteMany({ where: { productId: existing.id } });
        if (parsed.images.length > 0) {
          await tx.productImage.createMany({
            data: parsed.images.map((img, index) => ({
              productId: existing.id,
              url: img.url,
              altText: img.altText ?? parsed.name ?? existing.name,
              displayOrder: index,
              isPrimary: img.isPrimary ?? index === 0,
            })),
          });
        }
      }

      if (parsed.variants) {
        const existingVariants = existing.variants;
        const seenVariantIds = new Set<string>();

        for (const v of parsed.variants) {
          const match = existingVariants.find(
            (ev) => !seenVariantIds.has(ev.id) && (ev.name.toLowerCase() === v.name.toLowerCase() || (v.sku && ev.sku === v.sku))
          );
          if (match) {
            seenVariantIds.add(match.id);
            await tx.productVariant.update({
              where: { id: match.id },
              data: {
                name: v.name,
                price: v.price,
                salePrice: v.salePrice ?? null,
                stock: v.stock,
                sku: v.sku ?? null,
              },
            });
          } else {
            const created = await tx.productVariant.create({
              data: {
                productId: existing.id,
                name: v.name,
                price: v.price,
                salePrice: v.salePrice ?? null,
                stock: v.stock,
                sku: v.sku ?? null,
              },
            });
            seenVariantIds.add(created.id);
          }
        }

        const toDelete = existingVariants.filter((ev) => !seenVariantIds.has(ev.id));
        if (toDelete.length > 0) {
          await tx.productVariant.deleteMany({
            where: { id: { in: toDelete.map((d) => d.id) } },
          });
        }
      }

      return tx.product.update({
        where: { id: existing.id },
        data: {
          ...(parsed.name ? { name: parsed.name } : {}),
          ...(parsed.description ? { description: parsed.description } : {}),
          ...(parsed.price !== undefined ? { price: parsed.price } : {}),
          ...(parsed.salePrice !== undefined ? { salePrice: parsed.salePrice } : {}),
          ...(parsed.sku !== undefined ? { sku: parsed.sku } : {}),
          ...(parsed.brand !== undefined ? { brand: parsed.brand } : {}),
          ...(parsed.stock !== undefined ? { stock: parsed.stock } : {}),
          ...(parsed.lowStockThreshold !== undefined ? { lowStockThreshold: parsed.lowStockThreshold } : {}),
          ...(parsed.status ? { status: parsed.status } : {}),
          ...(parsed.mallCategoryId !== undefined ? { mallCategoryId: parsed.mallCategoryId } : {}),
          ...(parsed.shopCategoryId !== undefined ? { shopCategoryId: parsed.shopCategoryId } : {}),
        },
        include: {
          images: { orderBy: { displayOrder: 'asc' } },
          variants: true,
        },
      });
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    return apiError(error, 'merchant.products.put');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { shop } = await getMerchantContext({ requireActive: true });

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');
    if (!id) throw new HttpError(400, 'Product ID is required');

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.shopId !== shop.id) {
      throw new HttpError(403, 'Forbidden: You do not have permission to delete this product');
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    return apiError(error, 'merchant.products.delete');
  }
}
