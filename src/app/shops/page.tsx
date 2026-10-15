import React from 'react';
import { prisma } from '@/lib/prisma';
import { ShopCard } from '@/components/ShopCard';
import { EmptyState } from '@/components/EmptyState';
import { Store, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default async function ShopsDirectoryPage(props: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const searchParams = await props.searchParams;
  const categoryFilter = searchParams.category;
  const searchQuery = searchParams.search;

  const [categories, shops] = await Promise.all([
    prisma.mallCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.shop.findMany({
      where: {
        status: 'ACTIVE',
        ...(categoryFilter
          ? { businessCategory: { contains: categoryFilter, mode: 'insensitive' } }
          : {}),
        ...(searchQuery
          ? {
              OR: [
                { name: { contains: searchQuery, mode: 'insensitive' } },
                { description: { contains: searchQuery, mode: 'insensitive' } },
                { location: { contains: searchQuery, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        _count: {
          select: { products: { where: { status: 'PUBLISHED', isAvailable: true } } },
        },
      },
      orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }, { createdAt: 'desc' }],
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
            Mall Shops Directory
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            Explore independent shops, boutiques, and merchants operating within The Ultimate Virtual Mall.
            Each merchant manages their own curated storefront, prices, and delivery settings.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-8 p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <form method="GET" className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="search"
              defaultValue={searchQuery || ''}
              placeholder="Search shops by name, category or city..."
              className="w-full pl-10 pr-20 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Filter
            </button>
          </form>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
            <Link
              href="/shops"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
                !categoryFilter
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories
            </Link>
            {categories.slice(0, 6).map((c) => (
              <Link
                key={c.id}
                href={`/shops?category=${encodeURIComponent(c.name)}`}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
                  categoryFilter === c.name
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Shops Grid or Empty State */}
        {shops.length === 0 ? (
          <EmptyState
            type="shops"
            title={
              searchQuery || categoryFilter
                ? 'No Shops Match Your Search Filter'
                : 'Your next favourite shop will be here.'
            }
            description={
              searchQuery || categoryFilter
                ? 'Try broadening your search term or selecting a different category.'
                : 'No registered merchants have published active storefronts yet. Real Ghanaian business owners are invited to apply and set up their ready-made shop today.'
            }
            actionText="Open a Shop Today"
            actionHref="/merchant/onboard"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
