import React from 'react';
import Link from 'next/link';
import { Store, ShieldCheck, DollarSign } from 'lucide-react';

export default function SellerTermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Merchant Guidelines & Commission Terms
          </h1>
          <p className="text-xs text-slate-500">
            Effective as of 2026 • Platform version 1.0
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-8 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 mb-2">1. Merchant Application & Approval</h2>
            <p>
              Operating an independent storefront in The Ultimate Virtual Mall is subject to administrative
              review. The platform owner reserves the right to request proof of business registration, Ghana
              Card verification, or physical shop location to maintain a high-trust digital ecosystem.
            </p>
          </div>

          <div>
            <h2 className="text-base font-extrabold text-slate-900 mb-2">2. Commission & Revenue Model</h2>
            <p>
              The Ultimate Virtual Mall operates on a transparent, performance-based commission model:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-slate-700">
              <li>
                <strong>Default Sales Commission:</strong> 5.0% on completed merchandise sales (excluding
                shipping fees).
              </li>
              <li>
                <strong>Delivery Charges:</strong> 100% of the customer-paid delivery fee is allocated directly
                to the fulfilling merchant.
              </li>
              <li>
                <strong>Payment Processing:</strong> Standard Paystack transaction processing fees apply to
                electronic payments.
              </li>
              <li>
                <strong>Settlement:</strong> Net merchant earnings are settled according to recorded orders in
                the seller dashboard.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-extrabold text-slate-900 mb-2">3. Prohibited Products & Behaviour</h2>
            <p>
              Merchants must never upload counterfeit goods, illegal substances, dangerous weapons, or
              misleading product claims. Any merchant found violating platform standards will be immediately
              suspended.
            </p>
          </div>

          <div>
            <h2 className="text-base font-extrabold text-slate-900 mb-2">4. Tenant Isolation & Privacy</h2>
            <p>
              The platform enforces strict server-side tenant isolation. No merchant can view or modify
              another seller&apos;s product catalogue, orders, customer records, or financial statistics.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
            <Link
              href="/merchant/onboard"
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow"
            >
              Start Merchant Application
            </Link>
            <Link href="/contact" className="text-xs font-bold text-indigo-600 hover:underline">
              Contact Platform Administration
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
