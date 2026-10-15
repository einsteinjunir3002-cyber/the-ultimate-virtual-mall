import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import { EmptyState } from '@/components/EmptyState';
import { Package, Search, Filter, SlidersHorizontal } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProductsCatalogPage(props: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    shop?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const { q, category: categorySlug, shop: shopSlug, sort = 'latest' } = searchParams;

  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price-asc') orderBy = { price: 'asc' };
  if (sort === 'price-desc') orderBy = { price: 'desc' };

  let categories: any[] = [];
  let products: any[] = [];

  try {
    const [c, p] = await Promise.all([
      prisma.mallCategory.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
      }),
      prisma.product.findMany({
        where: {
          status: 'PUBLISHED',
          isAvailable: true,
          shop: {
            status: 'ACTIVE',
            ...(shopSlug ? { slug: shopSlug } : {}),
          },
          ...(categorySlug ? { mallCategory: { slug: categorySlug } } : {}),
          ...(q
            ? {
                OR: [
                  { name: { contains: q, mode: 'insensitive' } },
                  { description: { contains: q, mode: 'insensitive' } },
                  { brand: { contains: q, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
        include: {
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
          images: { orderBy: { displayOrder: 'asc' } },
          variants: true,
        },
        orderBy,
      }),
    ]);
    categories = c;
    products = p;
  } catch (error) {
    console.warn('Prerender / database fetch fallback on ProductsCatalogPage:', error);
  }

  const currentCategory = categories.find((c) => c.slug === categorySlug);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {currentCategory ? currentCategory.name : 'Mall Product Catalogue'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse published products from verified Ghanaian merchants. Add items from multiple shops
            into one unified cart.
          </p>
        </div>

        {/* Filter and Search Controls */}
        <div className="mb-8 p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <form method="GET" className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={q || ''}
              placeholder="Search products by title or brand..."
              className="w-full pl-10 pr-20 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Search
            </button>
          </form>

          {/* Sort selector */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <label className="text-xs font-bold text-slate-500 shrink-0">Sort By:</label>
            <div className="flex items-center gap-1.5 text-xs">
              <Link
                href={`/products?${new URLSearchParams({
                  ...(q ? { q } : {}),
                  ...(categorySlug ? { category: categorySlug } : {}),
                  sort: 'latest',
                })}`}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  sort === 'latest'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Newest
              </Link>
              <Link
                href={`/products?${new URLSearchParams({
                  ...(q ? { q } : {}),
                  ...(categorySlug ? { category: categorySlug } : {}),
                  sort: 'price-asc',
                })}`}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  sort === 'price-asc'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Price: Low to High
              </Link>
              <Link
                href={`/products?${new URLSearchParams({
                  ...(q ? { q } : {}),
                  ...(categorySlug ? { category: categorySlug } : {}),
                  sort: 'price-desc',
                })}`}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  sort === 'price-desc'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Price: High to Low
              </Link>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Link
            href="/products"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
              !categorySlug
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
                categorySlug === c.slug
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {/* Products Grid or Empty State */}
        {products.length === 0 ? (
          <EmptyState
            type="products"
            title={q || categorySlug ? 'No Products Match Your Criteria' : 'No Products In The Catalogue Yet'}
            description={
              q || categorySlug
                ? 'Try checking for spelling errors, clearing your search query, or viewing a different category.'
                : 'Approved merchants are currently stocking their shops. Zero fake products are listed on The Ultimate Virtual Mall.'
            }
            actionText="Browse Shops Directory"
            actionHref="/shops"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
