import React from 'react';
import Link from 'next/link';
import { Store, ShoppingBag, Sparkles, PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  type: 'shops' | 'products' | 'cart' | 'orders';
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
}

export function EmptyState({
  type,
  title,
  description,
  actionText,
  actionHref,
}: EmptyStateProps) {
  if (type === 'shops') {
    return (
      <div className="text-center py-16 px-6 max-w-2xl mx-auto rounded-3xl bg-gradient-to-b from-white to-slate-50 border border-slate-200/80 shadow-sm">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Store className="w-8 h-8" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Premier Shopping Mall Opening</span>
        </div>
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-3">
          {title || 'Your next favourite shop will be here.'}
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-8 max-w-lg mx-auto">
          {description ||
            'We are actively approving Ghana’s finest merchants and artisans. Are you a business owner? Secure your shop in The Ultimate Virtual Mall and start selling to shoppers nationwide.'}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={actionHref || '/merchant/onboard'}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-md shadow-slate-900/10 transition flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            {actionText || 'Open Your Shop in the Mall'}
          </Link>
          <Link
            href="/contact"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold transition"
          >
            Learn About Merchant Benefits
          </Link>
        </div>
      </div>
    );
  }

  if (type === 'products') {
    return (
      <div className="text-center py-16 px-6 max-w-2xl mx-auto rounded-3xl bg-gradient-to-b from-white to-slate-50 border border-slate-200/80 shadow-sm">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-3">
          {title || 'Products Are Currently Being Stocked'}
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-8 max-w-lg mx-auto">
          {description ||
            'Approved merchants are currently uploading their genuine catalogues. Check back shortly or register your business to feature your products here.'}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/merchant/onboard"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/10 transition flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Become a Merchant
          </Link>
          <Link
            href="/shops"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold transition"
          >
            Explore Directory
          </Link>
        </div>
      </div>
    );
  }

  // Cart or Orders empty
  return (
    <div className="text-center py-12 px-4 max-w-md mx-auto">
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
        <ShoppingBag className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title || 'Nothing here yet'}</h3>
      <p className="text-slate-500 text-xs mb-6 leading-relaxed">
        {description || 'Browse our directory to discover exciting shops and items.'}
      </p>
      {actionHref && (
        <Link
          href={actionHref}
          className="inline-flex px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition"
        >
          {actionText || 'Start Browsing'}
        </Link>
      )}
    </div>
  );
}
