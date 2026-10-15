import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Customer Terms and Conditions
        </h1>
        <p className="text-xs text-slate-500 mb-8">Last Updated: 2026</p>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-2">1. The Marketplace Platform</h2>
            <p>
              The Ultimate Virtual Mall operates as a digital mall hosting independent merchant shops in Ghana.
              When placing an order with multiple merchants, your order is split into seller-specific suborders
              fulfilled directly by each respective merchant.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 mb-2">2. Pricing and Payments</h2>
            <p>
              All prices are listed in Ghana Cedis (GH₵). Payments are securely collected through Paystack via
              Mobile Money (MTN MoMo, Telecel Cash, AT Money) or debit/credit cards. Orders are fulfilled only
              after transaction verification is confirmed.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 mb-2">3. Verified Purchase Reviews</h2>
            <p>
              To eliminate fake reviews, only customers who have placed a paid order containing a specific item
              are permitted to submit a review and rating for that product.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
