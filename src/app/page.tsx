import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { EmptyState } from '@/components/EmptyState';
import { ShopCard } from '@/components/ShopCard';
import { ProductCard } from '@/components/ProductCard';
import {
  ShoppingBag,
  Store,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Sparkles,
  Search,
  CheckCircle2,
  Building2,
  Package,
} from 'lucide-react';

export default async function HomePage() {
  // Fetch real data from PostgreSQL
  const [categories, activeShops, recentProducts] = await Promise.all([
    prisma.mallCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.shop.findMany({
      where: { status: 'ACTIVE' },
      include: {
        _count: {
          select: { products: { where: { status: 'PUBLISHED', isAvailable: true } } },
        },
      },
      take: 6,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        isAvailable: true,
        shop: { status: 'ACTIVE' },
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
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-16 sm:py-24 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-bold mb-6 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>The Next Generation Multi-Vendor E-Commerce Experience</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
              Shop Ghana’s Premier <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-amber-300">
                Virtual Shopping Mall
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl font-normal">
              Experience the physical shopping mall translated into an ultra-modern digital ecosystem.
              Discover independent Ghanaian businesses, shop multi-seller carts, and check out securely
              using Mobile Money and bank cards.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Link
                href="/products"
                className="px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Explore Mall Catalogue</span>
              </Link>

              <Link
                href="/merchant/onboard"
                className="px-7 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm backdrop-blur-md flex items-center justify-center gap-2 transition"
              >
                <Store className="w-4 h-4 text-amber-400" />
                <span>Open Your Shop</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Horizontal Carousel */}
      <section className="border-b border-slate-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
              Mall Global Categories
            </h2>
            <Link href="/products" className="text-xs font-bold text-indigo-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200/90 bg-slate-50/80 hover:bg-indigo-50/60 hover:border-indigo-200 hover:text-indigo-600 shrink-0 text-xs font-bold text-slate-700 transition"
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Mall Content */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
        {/* Featured / Active Shops Section */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 mb-1 block">
                Independent Storefronts
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Featured Mall Shops
              </h2>
            </div>
            {activeShops.length > 0 && (
              <Link
                href="/shops"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
              >
                <span>Browse All Shops Directory</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {activeShops.length === 0 ? (
            <EmptyState
              type="shops"
              title="Your next favourite shop will be here."
              description="The Ultimate Virtual Mall is ready for launch with zero fake merchants or dummy records. Real Ghanaian business owners are invited to register, undergo administrative review, and establish their customized online storefronts."
              actionText="Open a Shop in The Mall"
              actionHref="/merchant/onboard"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeShops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          )}
        </div>

        {/* Recently Added Products Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 mb-1 block">
                Mall Catalogue
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Recently Added Products
              </h2>
            </div>
            {recentProducts.length > 0 && (
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
              >
                <span>View Full Catalogue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {recentProducts.length === 0 ? (
            <EmptyState
              type="products"
              title="No Products Uploaded Yet"
              description="No products have been published yet because this platform uses only genuine merchant listings. Are you an approved merchant? Log in to your seller dashboard to publish your actual products."
              actionText="Merchant Login & Upload"
              actionHref="/auth/login"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recentProducts.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Become a Merchant Spotlight Banner */}
      <section className="bg-slate-900 text-white py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-8 sm:p-12 relative overflow-hidden shadow-2xl">
            <div className="max-w-2xl">
              <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-extrabold uppercase tracking-wider inline-block mb-4">
                Merchant Opportunity
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
                Are you a business owner in Ghana? Open your shop today.
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-8">
                Join The Ultimate Virtual Mall to receive a ready-made, fully customizable digital
                storefront, automated inventory management, seller dashboard, direct WhatsApp inquiry
                integration, and secure payments via Paystack.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Ready-made professional storefront templates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>MTN MoMo, Telecel Cash & Cards accepted</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Configurable seller-managed or courier delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Direct customer WhatsApp ordering integration</span>
                </div>
              </div>

              <Link
                href="/merchant/onboard"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition"
              >
                <Store className="w-4 h-4" />
                <span>Apply to Open a Shop</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
