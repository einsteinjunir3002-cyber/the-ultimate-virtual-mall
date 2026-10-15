import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ShieldCheck, Store, Users, MapPin, Truck } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            About The Ultimate Virtual Mall
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Ghana’s central multi-tenant digital shopping mall hosting independent, verified merchants under
            one unified digital roof.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-8 text-sm text-slate-600 leading-relaxed">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 mb-2">Our Vision</h2>
            <p>
              The Ultimate Virtual Mall was designed to replicate the vibrant, high-trust experience of a
              major physical shopping mall in Ghana. Rather than operating as an isolated retail storefront,
              our platform empowers hundreds of authentic local entrepreneurs, artisans, and boutiques to
              manage their individual storefronts while benefiting from unified customer discovery, multi-seller
              checkout, and verified Mobile Money payments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <ShieldCheck className="w-6 h-6 text-indigo-600 mb-2" />
              <h3 className="font-bold text-slate-900 text-base mb-1">Strict Merchant Vetting</h3>
              <p className="text-xs text-slate-500">
                Every business must apply and receive administrative approval from platform management before
                publishing products, ensuring customer protection.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <Truck className="w-6 h-6 text-indigo-600 mb-2" />
              <h3 className="font-bold text-slate-900 text-base mb-1">Decentralized Fulfilment</h3>
              <p className="text-xs text-slate-500">
                Sellers configure their own delivery zones across Accra and nationwide, supported by real
                courier tracking numbers and customer pickup options.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h2 className="text-lg font-extrabold text-slate-900 mb-2">Are you a merchant?</h2>
            <p className="mb-4">
              We provide ready-made, customizable digital storefronts so business owners never have to hire a web
              developer or write code to sell online.
            </p>
            <Link
              href="/merchant/onboard"
              className="inline-flex px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
            >
              Open Your Shop Today
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
