import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Privacy & Data Protection Policy
        </h1>
        <p className="text-xs text-slate-500 mb-8">
          In alignment with Ghanaian Data Protection Act (Act 843)
        </p>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-2">1. Data Minimization</h2>
            <p>
              We collect only the personal information strictly necessary to process customer orders, deliver
              packages via Ghanaian courier networks, and manage merchant accounts.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 mb-2">2. Payment Security</h2>
            <p>
              The Ultimate Virtual Mall never stores or processes credit card CVVs or Mobile Money PINs. All
              financial transactions are handled through Paystack’s PCI-DSS compliant infrastructure.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 mb-2">3. Tenant Isolation</h2>
            <p>
              Each merchant is restricted to viewing delivery details only for items purchased from their
              specific shop. A merchant cannot access customer records from other independent shops.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
