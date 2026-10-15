import React from 'react';
import { Truck, RotateCcw, MapPin } from 'lucide-react';

export default function ShippingReturnsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Delivery, Fulfilment & Returns
        </h1>
        <p className="text-xs text-slate-500 mb-8">Ghanaian Fulfilment Guide</p>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-8 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">How Multi-Seller Delivery Works</h2>
            </div>
            <p>
              Because The Ultimate Virtual Mall hosts multiple independent merchants, your items may be shipped
              from different locations across Ghana (e.g. Spintex, Osu, or Kumasi). Delivery charges are
              calculated per merchant to ensure accurate courier reimbursement.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Ghanaian Addresses & Landmarks</h2>
            </div>
            <p>
              When checking out, please provide your Region, City/Town, and prominent landmark (e.g. &quot;Behind Total
              Fuel Station&quot;) or your Ghana Post GPS Digital Address (e.g. GA-492-1022) to enable accurate dispatch
              by dispatch riders.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <RotateCcw className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Return and Refund Policy</h2>
            </div>
            <p>
              Each merchant configures their specific return policy visible on their storefront. Unless stated
              otherwise, items returned within 7 days in original, undamaged packaging qualify for exchange or
              refund.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
