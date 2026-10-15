import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { ProductStatus, ShopStatus } from '@prisma/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const [shops, products] = await Promise.all([
    prisma.shop.findMany({
      where: { status: ShopStatus.ACTIVE },
      select: { slug: true, updatedAt: true },
    }),
    prisma.product.findMany({
      where: {
        status: ProductStatus.PUBLISHED,
        isAvailable: true,
        shop: { status: ShopStatus.ACTIVE },
      },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shops`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  const shopPages: MetadataRoute.Sitemap = shops.map((s) => ({
    url: `${baseUrl}/shops/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticPages, ...shopPages, ...productPages];
}
