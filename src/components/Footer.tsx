'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ShieldCheck, Truck, CreditCard, HeartHandshake, PhoneCall } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-sm w-full overflow-hidden">
      {/* Value Proposition Strip */}
      <div className="border-b border-slate-800/80 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Verified Merchants</h4>
                <p className="text-xs text-slate-400">Strictly reviewed independent shops</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Ghana MoMo & Cards</h4>
                <p className="text-xs text-slate-400">Secured via Paystack Ghana</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Nationwide Delivery</h4>
                <p className="text-xs text-slate-400">Direct from sellers & couriers</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Verified Reviews</h4>
                <p className="text-xs text-slate-400">Only real paying customers can rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-sm">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                The Ultimate <span className="text-indigo-400">Mall</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The Ultimate Virtual Mall is Ghana’s premier digital shopping mall hosting verified independent
              businesses. Shop multi-vendor carts with seamless Mobile Money and card payments.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
                MTN MoMo
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
                Telecel Cash
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
                AT Money
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
                Visa / MC
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Mall Directory</h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/shops" className="hover:text-white transition">
                  All Merchant Shops
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition">
                  Browse Product Catalog
                </Link>
              </li>
              <li>
                <Link href="/products?sort=latest" className="hover:text-white transition">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-4">For Merchants</h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/merchant/onboard" className="text-indigo-400 font-semibold hover:underline">
                  Open Your Shop
                </Link>
              </li>
              <li>
                <Link href="/merchant/dashboard" className="hover:text-white transition">
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <Link href="/seller-terms" className="hover:text-white transition">
                  Seller Guidelines & Fees
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Support & Legal</h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Customer Support
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping-returns" className="hover:text-white transition">
                  Delivery & Returns
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2026 The Ultimate Virtual Mall. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5" /> Support: +233 24 123 4567
            </span>
            <span>•</span>
            <span>Currency: Ghana Cedi (GH₵)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
