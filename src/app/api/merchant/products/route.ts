import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireMerchant } from '@/lib/auth';
import { ProductStatus } from '@prisma/client';

export async function GET() {
  try {
    const user = await requireMerchant();
    const shop = await prisma.shop.findFirst({ where: { ownerId: user.id } });
    if (!shop) return NextResponse.json({ error: 'Shop not found' }, { status: 404 });

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
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireMerchant();
    const shop = await prisma.shop.findFirst({ where: { ownerId: user.id } });
    if (!shop) return NextResponse.json({ error: 'Shop not found' }, { status: 404 });

    const body = await req.json();
    const {
      name,
      description,
      price,
      salePrice,
      sku,
      stock,
      lowStockThreshold,
      status,
      mallCategoryId,
      shopCategoryId,
      brand,
      images, // array of { url: string, altText?: string, isPrimary?: boolean }
      variants, // array of { name: string, price: number, stock: number, sku?: string }
    } = body;

    if (!name || !description || price === undefined) {
      return NextResponse.json({ error: 'Name, description, and price are required' }, { status: 400 });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return NextResponse.json({ error: 'Invalid price value' }, { status: 400 });
    }

    // Generate unique slug for this shop
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = baseSlug;
    let counter = 1;
    while (await prisma.product.findFirst({ where: { shopId: shop.id, slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const product = await prisma.product.create({
      data: {
        shopId: shop.id,
        name: name.trim(),
        slug,
        description: description.trim(),
        price: numPrice,
        salePrice: salePrice ? Number(salePrice) : null,
        sku: sku ? sku.trim() : null,
        stock: stock !== undefined ? Math.max(0, parseInt(stock, 10)) : 0,
        lowStockThreshold: lowStockThreshold !== undefined ? parseInt(lowStockThreshold, 10) : 5,
        status: status ? (status as ProductStatus) : ProductStatus.PUBLISHED,
        isAvailable: true,
        mallCategoryId: mallCategoryId || null,
        shopCategoryId: shopCategoryId || null,
        brand: brand ? brand.trim() : null,
        images: {
          create: Array.isArray(images) && images.length > 0
            ? images.map((img: { url: string; altText?: string; isPrimary?: boolean }, index: number) => ({
                url: img.url,
                altText: img.altText || name,
                displayOrder: index,
                isPrimary: img.isPrimary || index === 0,
              }))
            : [],
        },
        variants: {
          create: Array.isArray(variants) && variants.length > 0
            ? variants.map((v: { name: string; price: number; stock: number; sku?: string }) => ({
                name: v.name,
                price: Number(v.price),
                stock: parseInt(String(v.stock), 10) || 0,
                sku: v.sku || null,
              }))
            : [],
        },
      },
      include: {
        images: true,
        variants: true,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireMerchant();
    const shop = await prisma.shop.findFirst({ where: { ownerId: user.id } });
    if (!shop) return NextResponse.json({ error: 'Shop not found' }, { status: 404 });

    const body = await req.json();
    const {
      id,
      name,
      description,
      price,
      salePrice,
      sku,
      stock,
      lowStockThreshold,
      status,
      mallCategoryId,
      shopCategoryId,
      brand,
      images,
      variants,
    } = body;

    if (!id) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });

    // Strict tenant isolation check: verify that this product belongs to THIS merchant's shop
    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing || existing.shopId !== shop.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to modify this product' },
        { status: 403 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      // If new images provided, recreate
      if (Array.isArray(images)) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.productImage.createMany({
          data: images.map((img: { url: string; altText?: string; isPrimary?: boolean }, index: number) => ({
            productId: id,
            url: img.url,
            altText: img.altText || name || existing.name,
            displayOrder: index,
            isPrimary: img.isPrimary || index === 0,
          })),
        });
      }

      // If new variants provided, recreate
      if (Array.isArray(variants)) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        await tx.productVariant.createMany({
          data: variants.map((v: { name: string; price: number; stock: number; sku?: string }) => ({
            productId: id,
            name: v.name,
            price: Number(v.price),
            stock: parseInt(String(v.stock), 10) || 0,
            sku: v.sku || null,
          })),
        });
      }

      return tx.product.update({
        where: { id },
        data: {
          ...(name ? { name: name.trim() } : {}),
          ...(description ? { description: description.trim() } : {}),
          ...(price !== undefined ? { price: Number(price) } : {}),
          ...(salePrice !== undefined ? { salePrice: salePrice ? Number(salePrice) : null } : {}),
          ...(sku !== undefined ? { sku: sku ? sku.trim() : null } : {}),
          ...(stock !== undefined ? { stock: Math.max(0, parseInt(stock, 10)) } : {}),
          ...(lowStockThreshold !== undefined ? { lowStockThreshold: parseInt(lowStockThreshold, 10) } : {}),
          ...(status ? { status: status as ProductStatus } : {}),
          ...(mallCategoryId !== undefined ? { mallCategoryId: mallCategoryId || null } : {}),
          ...(shopCategoryId !== undefined ? { shopCategoryId: shopCategoryId || null } : {}),
          ...(brand !== undefined ? { brand: brand ? brand.trim() : null } : {}),
        },
        include: {
          images: true,
          variants: true,
        },
      });
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireMerchant();
    const shop = await prisma.shop.findFirst({ where: { ownerId: user.id } });
    if (!shop) return NextResponse.json({ error: 'Shop not found' }, { status: 404 });

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });

    // Strict tenant check
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.shopId !== shop.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
