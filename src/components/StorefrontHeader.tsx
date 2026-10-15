'use client';

import React from 'react';
import Link from 'next/link';
import { TemplateStyle } from '@prisma/client';
import { Store, MapPin, Phone, MessageCircle, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { buildShopWhatsAppLink } from '@/lib/whatsapp';
import { formatGhs } from '@/lib/commission';

interface StorefrontHeaderProps {
  shop: {
    id: string;
    name: string;
    slug: string;
    tagline?: string | null;
    description?: string | null;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    businessCategory: string;
    location: string;
    phone: string;
    whatsappNumber?: string | null;
    themeColor?: string;
    templateStyle: TemplateStyle;
    baseDeliveryFee: number | string;
    deliveryPolicy?: string | null;
    returnPolicy?: string | null;
    rating: number | string;
    reviewCount: number;
  };
  activeCategory?: string;
  onSelectCategory?: (slug: string) => void;
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
    _count?: { products: number };
  }>;
}

export function StorefrontHeader({
  shop,
  activeCategory,
  onSelectCategory,
  categories = [],
}: StorefrontHeaderProps) {
  const shopUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/shops/${shop.slug}`
    : `/shops/${shop.slug}`;

  const whatsAppLink = shop.whatsappNumber
    ? buildShopWhatsAppLink({
        whatsappNumber: shop.whatsappNumber,
        shopName: shop.name,
        shopUrl,
      })
    : null;

  // Custom styling based on templateStyle
  const isLuxury = shop.templateStyle === TemplateStyle.LUXURY_BOUTIQUE;
  const isArtisan = shop.templateStyle === TemplateStyle.WARM_ARTISAN;

  return (
    <div className="w-full">
      {/* Cover / Banner Area */}
      <div className="relative h-48 sm:h-64 lg:h-80 w-full overflow-hidden bg-slate-900">
        {shop.bannerUrl ? (
          <img
            src={shop.bannerUrl}
            alt={`${shop.name} Banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${
              isLuxury
                ? 'bg-gradient-to-r from-neutral-950 via-amber-950 to-neutral-950'
                : isArtisan
                ? 'bg-gradient-to-r from-stone-900 via-amber-900 to-stone-900'
                : 'bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900'
            }`}
          >
            <Store className="w-16 h-16 text-white/10" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

        {/* Mall Backlink pill */}
        <div className="absolute top-4 left-4 z-10">
          <Link
            href="/shops"
            className="px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-xs font-bold text-white border border-white/20 hover:bg-slate-900 transition flex items-center gap-1.5 shadow"
          >
            <span>← Back to Mall Directory</span>
          </Link>
        </div>
      </div>

      {/* Shop Profile Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 sm:-mt-20 pb-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            {/* Logo and Shop Name */}
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-white p-1.5 border-4 border-white shadow-xl overflow-hidden shrink-0">
                {shop.logoUrl ? (
                  <img
                    src={shop.logoUrl}
                    alt={shop.name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div
                    className="w-full h-full rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold"
                    style={{ backgroundColor: shop.themeColor || '#4f46e5' }}
                  >
                    {shop.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="mb-2">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {shop.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Storefront
                  </span>
                </div>

                {shop.tagline && (
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    {shop.tagline}
                  </p>
                )}

                <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {shop.location}
                  </span>
                  <span>•</span>
                  <span>Category: {shop.businessCategory}</span>
                  <span>•</span>
                  <span className="font-semibold text-indigo-600">
                    Base Delivery: {formatGhs(shop.baseDeliveryFee)}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact / WhatsApp CTAs */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto mt-2 sm:mt-0 self-start sm:self-end">
              {whatsAppLink && (
                <a
                  href={whatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial justify-center px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition text-center"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              )}

              <a
                href={`tel:${shop.phone}`}
                className="flex-1 sm:flex-initial justify-center px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs shadow-sm flex items-center gap-2 transition text-center"
              >
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>Call Store</span>
              </a>
            </div>
          </div>

          {/* Description & Policies Strip */}
          {shop.description && (
            <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
              {shop.description}
            </p>
          )}

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-500">
            {shop.deliveryPolicy && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Fulfilment & Delivery</span>
                  <span>{shop.deliveryPolicy}</span>
                </div>
              </div>
            )}

            {shop.returnPolicy && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                <RotateCcw className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Returns Policy</span>
                  <span>{shop.returnPolicy}</span>
                </div>
              </div>
            )}
          </div>

          {/* In-Shop Category Tabs */}
          {categories.length > 0 && (
            <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
              <Link
                href={`/shops/${shop.slug}`}
                scroll={false}
                onClick={(e) => {
                  if (onSelectCategory) {
                    e.preventDefault();
                    onSelectCategory('all');
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
                  activeCategory === 'all' || !activeCategory
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Products
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/shops/${shop.slug}?category=${c.slug}`}
                  scroll={false}
                  onClick={(e) => {
                    if (onSelectCategory) {
                      e.preventDefault();
                      onSelectCategory(c.slug);
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
                    activeCategory === c.slug
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{c.name}</span>
                  {typeof c._count?.products === 'number' && c._count.products > 0 && (
                    <span className="ml-1.5 opacity-70">({c._count.products})</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
