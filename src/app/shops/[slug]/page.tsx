import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { StorefrontHeader } from '@/components/StorefrontHeader';
import { ProductCard } from '@/components/ProductCard';
import { EmptyState } from '@/components/EmptyState';
import { Package, ShieldCheck, Truck, RotateCcw, MessageCircle } from 'lucide-react';
import { buildShopWhatsAppLink } from '@/lib/whatsapp';

import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await props.params;
    const shop = await prisma.shop.findUnique({
      where: { slug },
      select: { name: true, description: true, tagline: true, location: true },
    });
    if (!shop) return { title: 'Shop Not Found | The Ultimate Virtual Mall' };
    const desc = shop.tagline || shop.description || `Shop at ${shop.name} on The Ultimate Virtual Mall Ghana.`;
    return {
      title: `${shop.name} | The Ultimate Virtual Mall`,
      description: desc.slice(0, 160),
      openGraph: {
        title: `${shop.name} | Storefront`,
        description: desc.slice(0, 160),
      },
    };
  } catch {
    return { title: 'Shop Storefront | The Ultimate Virtual Mall' };
  }
}

export default async function ShopStorefrontPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { slug } = await props.params;
  const { category: categorySlug } = await props.searchParams;

  let shop: any = null;

  try {
    shop = await prisma.shop.findUnique({
      where: { slug },
      include: {
        shopCategories: {
          where: { isActive: true },
          include: {
            _count: {
              select: {
                products: {
                  where: { status: 'PUBLISHED', isAvailable: true },
                },
              },
            },
          },
          orderBy: { displayOrder: 'asc' },
        },
        products: {
          where: {
            status: 'PUBLISHED',
            isAvailable: true,
            ...(categorySlug && categorySlug !== 'all'
              ? { shopCategory: { slug: categorySlug } }
              : {}),
          },
          include: {
            images: { orderBy: { displayOrder: 'asc' } },
            variants: true,
            shop: {
              select: {
                id: true,
                name: true,
                slug: true,
                baseDeliveryFee: true,
                whatsappNumber: true,
                location: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { products: true, reviews: true },
        },
      },
    });
  } catch (error) {
    console.warn('Prerender / database fetch fallback on ShopStorefrontPage:', error);
  }

  if (!shop || shop.status !== 'ACTIVE') {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Storefront Header with Template Styling */}
      <StorefrontHeader
        shop={shop as any}
        activeCategory={categorySlug || 'all'}
        categories={shop.shopCategories}
      />

      {/* Main Storefront Catalogue */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {categorySlug && categorySlug !== 'all'
                ? shop.shopCategories.find((c: any) => c.slug === categorySlug)?.name || 'Products'
                : 'All Shop Items'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Showing {shop.products.length} genuine product {shop.products.length === 1 ? 'listing' : 'listings'}
            </p>
          </div>
        </div>

        {shop.products.length === 0 ? (
          <div className="text-center py-16 px-6 max-w-xl mx-auto rounded-3xl bg-white border border-slate-200/90 shadow-sm">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {categorySlug && categorySlug !== 'all'
                ? 'No Products In This Category'
                : 'Catalogue In Preparation'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              {categorySlug && categorySlug !== 'all'
                ? `There are currently no products listed under "${shop.shopCategories.find((c: any) => c.slug === categorySlug)?.name || categorySlug}" for ${shop.name}. Browse other categories or view all products.`
                : `${shop.name} has secured their storefront in The Ultimate Virtual Mall and is currently preparing their product listings.`}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {categorySlug && categorySlug !== 'all' && (
                <Link
                  href={`/shops/${shop.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition"
                >
                  <span>View All Shop Products</span>
                </Link>
              )}
              {shop.whatsappNumber && (
                <a
                  href={buildShopWhatsAppLink({
                    whatsappNumber: shop.whatsappNumber,
                    shopName: shop.name,
                    shopUrl: `https://theultimatemall.com/shops/${shop.slug}`,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Contact Merchant on WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {shop.products.map((product: any) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
