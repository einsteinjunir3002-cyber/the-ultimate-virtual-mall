import React from 'react';
import Link from 'next/link';
import { Store, MapPin, Star, Package, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatGhs } from '@/lib/commission';

interface ShopCardProps {
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
    rating: any;
    reviewCount: number;
    baseDeliveryFee: any;
    _count?: {
      products?: number;
    };
  };
}

export function ShopCard({ shop }: ShopCardProps) {
  const numRating = Number(shop.rating || 0);
  const productsCount = shop._count?.products || 0;

  return (
    <div className="group rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 hover:border-indigo-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-200 flex flex-col overflow-hidden">
      {/* Banner */}
      <div className="relative h-24 sm:h-28 w-full bg-slate-900 overflow-hidden">
        {shop.bannerUrl ? (
          <img
            src={shop.bannerUrl}
            alt={shop.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center opacity-90">
            <Store className="w-8 h-8 text-indigo-400/40" />
          </div>
        )}

        <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-[10px] sm:text-[11px] font-bold text-slate-200 border border-slate-700/60 flex items-center gap-1">
          <ShieldCheck className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-400" />
          <span>Verified Merchant</span>
        </div>
      </div>

      {/* Profile & Info */}
      <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between pt-0 relative">
        {/* Floating Logo */}
        <div className="-mt-7 sm:-mt-8 mb-2.5 sm:mb-3 flex items-end justify-between">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white p-1 border-2 border-white shadow-md shadow-slate-900/10 overflow-hidden shrink-0">
            {shop.logoUrl ? (
              <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover rounded-lg sm:rounded-xl" />
            ) : (
              <div className="w-full h-full rounded-lg sm:rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold flex items-center justify-center text-base sm:text-lg">
                {shop.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] sm:text-[11px] font-semibold border border-slate-200">
            {shop.businessCategory}
          </span>
        </div>

        <div>
          <h4 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 transition mb-1 line-clamp-1">
            {shop.name}
          </h4>

          {shop.tagline ? (
            <p className="text-xs text-slate-500 line-clamp-1 mb-2.5">{shop.tagline}</p>
          ) : (
            <p className="text-xs text-slate-400 line-clamp-1 mb-2.5">Independent Storefront</p>
          )}

          <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{shop.location}</span>
            </span>

            {numRating > 0 && (
              <span className="flex items-center gap-1 font-bold text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {numRating.toFixed(1)} ({shop.reviewCount})
              </span>
            )}
          </div>
        </div>

        {/* Footer Meta */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-slate-600 font-medium">
            <Package className="w-3.5 h-3.5 text-slate-400" />
            <span>{productsCount} {productsCount === 1 ? 'item' : 'items'}</span>
          </div>

          <Link
            href={`/shops/${shop.slug}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 group-hover:translate-x-0.5 transition"
          >
            <span>Visit Shop</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
