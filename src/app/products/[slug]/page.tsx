import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProductStatus, ShopStatus } from '@prisma/client';
import ProductDetailClient from '@/components/ProductDetailClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await props.params;
    const product = await prisma.product.findFirst({
      where: {
        slug,
        status: ProductStatus.PUBLISHED,
        shop: { status: ShopStatus.ACTIVE },
      },
      include: {
        shop: { select: { name: true } },
        images: { orderBy: { displayOrder: 'asc' }, take: 1 },
      },
    });

    if (!product) {
      return { title: 'Product Not Found | The Ultimate Virtual Mall' };
    }

    const title = `${product.name} | ${product.shop.name} - The Ultimate Virtual Mall`;
    const description = (product.description || '').slice(0, 160);
    const imageUrl = product.images?.[0]?.url;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const canonical = `${baseUrl}/products/${product.slug}`;

    return {
      title,
      description,
      alternates: {
        canonical,
      },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: 'The Ultimate Virtual Mall',
        images: imageUrl ? [{ url: imageUrl }] : [],
      },
    };
  } catch {
    return { title: 'Product Details | The Ultimate Virtual Mall' };
  }
}

export default async function ProductDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  let product: any = null;
  let relatedProducts: any[] = [];

  try {
    product = await prisma.product.findFirst({
      where: {
        slug,
        status: ProductStatus.PUBLISHED,
        shop: { status: ShopStatus.ACTIVE },
      },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            tagline: true,
            description: true,
            logoUrl: true,
            location: true,
            phone: true,
            whatsappNumber: true,
            baseDeliveryFee: true,
            pickupAvailable: true,
            deliveryPolicy: true,
            returnPolicy: true,
            rating: true,
            reviewCount: true,
          },
        },
        images: { orderBy: { displayOrder: 'asc' } },
        variants: true,
        mallCategory: true,
        shopCategory: true,
        reviews: {
          include: {
            customer: { select: { name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (product) {
      // Fetch related products
      relatedProducts = await prisma.product.findMany({
        where: {
          id: { not: product.id },
          status: ProductStatus.PUBLISHED,
          isAvailable: true,
          OR: [
            { shopId: product.shopId },
            { mallCategoryId: product.mallCategoryId },
          ],
          shop: { status: ShopStatus.ACTIVE },
        },
        take: 4,
        include: {
          shop: { select: { name: true, slug: true } },
          images: { where: { isPrimary: true }, take: 1 },
        },
      });
    }
  } catch (err) {
    console.error('Error fetching product in server component:', err);
  }

  if (!product) {
    notFound();
  }

  // Generate Product JSON-LD schema
  const primaryImage = product.images?.[0]?.url;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: primaryImage ? [primaryImage] : [],
    description: product.description,
    sku: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: product.brand || product.shop.name,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'GHS',
      price: Number(product.salePrice || product.price),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: product.shop.name,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient initialProduct={product} initialRelated={relatedProducts} />
    </>
  );
}
