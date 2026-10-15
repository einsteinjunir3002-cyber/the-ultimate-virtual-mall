'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatGhs } from '@/lib/commission';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  Store,
  ArrowLeft,
  Lock,
  AlertCircle,
} from 'lucide-react';

const GHANA_REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Central',
  'Eastern',
  'Western',
  'Western North',
  'Volta',
  'Oti',
  'Northern',
  'Savannah',
  'North East',
  'Upper East',
  'Upper West',
  'Bono',
  'Bono East',
  'Ahafo',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, groupedByShop, itemsSubtotal, deliveryTotal, grandTotal } = useCart();

  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [region, setRegion] = useState('Greater Accra');
  const [city, setCity] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [digitalAddress, setDigitalAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Items to Check Out</h2>
          <p className="text-xs text-slate-500 mb-6">Your shopping cart is currently empty.</p>
          <Link
            href="/products"
            className="inline-flex px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
          >
            Go to Catalogue
          </Link>
        </div>
      </div>
    );
  }

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId || undefined,
            name: i.name,
            quantity: i.quantity,
          })),
          deliveryAddress: {
            fullName,
            phone,
            region,
            city,
            streetAddress,
            digitalAddress,
            deliveryNotes,
          },
          guestEmail: !user ? email : undefined,
          guestName: !user ? fullName : undefined,
          guestPhone: !user ? phone : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to initialize checkout');
        setLoading(false);
        return;
      }

      // Redirect customer to Paystack payment authorization URL
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        setErrorMessage('Failed to receive payment authorization link');
        setLoading(false);
      }
    } catch (err) {
      console.error('Checkout submit error:', err);
      setErrorMessage('A network error occurred while connecting to payment provider');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Cart</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>256-bit Encrypted Checkout</span>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">
          Secure Order Checkout
        </h1>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Delivery & Customer Information (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Customer Details Box */}
            <div className="rounded-3xl bg-white border border-slate-200/90 p-6 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-900 mb-4">1. Customer Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Kwame Mensah"
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kwame@example.com"
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number (MoMo / Delivery Call) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0244 123 456"
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Required for courier delivery updates and Mobile Money authorization.
                  </p>
                </div>
              </div>
            </div>

            {/* Ghanaian Delivery Address Box */}
            <div className="rounded-3xl bg-white border border-slate-200/90 p-6 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-900 mb-4">
                2. Delivery Destination (Ghana)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Region *</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                  >
                    {GHANA_REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r} Region
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City / Town *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Accra, Tema, Kumasi, Takoradi"
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Street Address & Nearest Landmark *
                  </label>
                  <input
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="e.g. House No. 12, Behind Shell Fuel Station, Spintex Road"
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ghana Post GPS Digital Address (Optional)
                  </label>
                  <input
                    type="text"
                    value={digitalAddress}
                    onChange={(e) => setDigitalAddress(e.target.value)}
                    placeholder="e.g. GA-492-1022"
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 uppercase"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Special Delivery Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Instructions for riders, gate directions, or preferred drop-off times..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>
            </div>

            {/* Payment Provider Notice */}
            <div className="rounded-3xl bg-slate-900 text-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-sm">Paystack Payment Integration</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Clicking the button below will securely transfer you to the official Paystack payment gateway.
                You can complete your payment in Ghana Cedis using MTN Mobile Money, Telecel Cash, AT
                Money, or any Visa/Mastercard.
              </p>
            </div>
          </div>

          {/* Multi-Seller Order Breakdown (Right 5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl bg-white border border-slate-200/90 p-6 shadow-sm sticky top-28 space-y-5">
              <h3 className="font-extrabold text-base text-slate-900">Order Summary</h3>

              {/* Breakdown by Merchant */}
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {groupedByShop.map((group) => (
                  <div
                    key={group.shopId}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span className="flex items-center gap-1.5 truncate">
                        <Store className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="truncate">{group.shopName}</span>
                      </span>
                      <span>{formatGhs(group.subtotal)}</span>
                    </div>

                    <div className="space-y-1 pl-5 text-[11px] text-slate-500">
                      {group.items.map((i) => (
                        <div key={i.productId} className="flex justify-between">
                          <span className="truncate max-w-[170px]">
                            {i.quantity}x {i.name}
                          </span>
                          <span className="font-semibold text-slate-700">
                            {formatGhs(i.price * i.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-1.5 border-t border-slate-200/80 flex justify-between text-[11px] font-semibold text-slate-600">
                      <span>Shop Delivery Fee</span>
                      <span>{formatGhs(group.deliveryFee)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <div className="flex justify-between">
                  <span>Merchandise Subtotal</span>
                  <span className="font-bold text-slate-900">{formatGhs(itemsSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Delivery Across Shops</span>
                  <span className="font-bold text-slate-900">{formatGhs(deliveryTotal)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-base font-black text-slate-900">
                  <span>Order Grand Total</span>
                  <span className="text-indigo-600">{formatGhs(grandTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{loading ? 'Initializing Secure Payment...' : 'Pay with Paystack'}</span>
              </button>

              <p className="text-center text-[10px] text-slate-400">
                Guaranteed safe checkout • All merchants operate under The Ultimate Virtual Mall platform
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
