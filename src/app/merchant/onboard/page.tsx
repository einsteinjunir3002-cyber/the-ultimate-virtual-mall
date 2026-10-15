'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Store,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Truck,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

const CATEGORIES = [
  'Electronics & Gadgets',
  'Fashion & Apparel',
  'Beauty & Cosmetics',
  'Groceries & Essentials',
  'Home & Furniture',
  'Food & Beverages',
  'Books & Stationery',
  'Sports & Fitness',
  'Automotive & Hardware',
];

export default function MerchantOnboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [checkingApp, setCheckingApp] = useState(true);

  // Form states
  const [shopName, setShopName] = useState('');
  const [desiredSlug, setDesiredSlug] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [location, setLocation] = useState('');
  const [businessRegNumber, setBusinessRegNumber] = useState('');
  const [nationalIdNumber, setNationalIdNumber] = useState('');
  const [proposedDelivery, setProposedDelivery] = useState(
    'In-house courier within city + third-party transport/courier nationwide'
  );
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-generate slug from shop name
  const handleShopNameChange = (val: string) => {
    setShopName(val);
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');
    setDesiredSlug(slug);
  };

  useEffect(() => {
    if (!user) {
      setCheckingApp(false);
      return;
    }

    // Check if user already has a shop or pending application
    async function checkStatus() {
      try {
        const res = await fetch('/api/merchant/apply');
        if (res.ok) {
          const data = await res.json();
          if (data.application) {
            setExistingApplication(data.application);
          }
        }
      } catch (e) {
        console.error('Check application error:', e);
      } finally {
        setCheckingApp(false);
      }
    }

    checkStatus();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setErrorMessage('Please review and accept the merchant guidelines and terms.');
      return;
    }

    setErrorMessage(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/merchant/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName,
          desiredSlug,
          category,
          description,
          phone,
          whatsappNumber,
          location,
          businessRegNumber,
          nationalIdNumber,
          proposedDelivery,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setExistingApplication(data.application);
      } else {
        setErrorMessage(data.error || 'Failed to submit application');
      }
    } catch {
      setErrorMessage('A network error occurred while submitting your application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || checkingApp) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If not logged in, prompt to log in or register first
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-3">
            Open a Shop in The Ultimate Virtual Mall
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-8">
            To submit your business application and secure your customized storefront, please sign in or
            create a merchant account first.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/register"
              className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
            >
              Register Account First
            </Link>
            <Link
              href="/auth/login"
              className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
            >
              Sign In Existing Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If user already has an active shop
  if (user.shop) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
            Storefront Active: {user.shop.name}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-8">
            Your independent shop is approved and active in the mall. Access your merchant dashboard to
            manage orders, products, and storefront settings.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/merchant/dashboard"
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
            >
              Open Merchant Dashboard
            </Link>
            <Link
              href={`/shops/${user.shop.slug}`}
              className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
            >
              View My Public Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If application exists and is pending review
  if (existingApplication && existingApplication.status === 'PENDING') {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-4">
            <span>Status: Under Review</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-3">
            Application Submitted for &quot;{existingApplication.shopName}&quot;
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            Your application was received on{' '}
            {new Date(existingApplication.submittedAt).toLocaleDateString()} and is being reviewed by
            The Ultimate Virtual Mall administration.
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left text-xs text-slate-600 space-y-1 mb-8">
            <p>
              <strong>Proposed URL:</strong> theultimatemall.com/shops/{existingApplication.desiredSlug}
            </p>
            <p>
              <strong>Category:</strong> {existingApplication.category}
            </p>
            <p>
              <strong>Location:</strong> {existingApplication.location}
            </p>
          </div>

          <p className="text-xs text-slate-400">
            Once approved by Big Sam (Platform Super Admin), your storefront will automatically be
            provisioned and accessible in your seller dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Application form
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Merchant Onboarding Application</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Apply to Open Your Virtual Shop
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Reach shoppers across Ghana with your customizable online boutique, automated inventory, and
            Paystack mobile money checkout.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 mb-4">
            <h3 className="text-base font-extrabold text-slate-900">1. Shop Branding & Identity</h3>
            <p className="text-xs text-slate-500">How your business appears to shoppers in the mall.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Shop Name *</label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => handleShopNameChange(e.target.value)}
                placeholder="e.g. Accra Tech Boutique"
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Storefront URL Slug *
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-500">
                <span>theultimatemall.com/shops/</span>
                <input
                  type="text"
                  required
                  value={desiredSlug}
                  onChange={(e) => setDesiredSlug(e.target.value.toLowerCase())}
                  placeholder="accra-tech"
                  className="w-full p-2.5 bg-transparent text-slate-900 font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary Business Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Shop Description & Mission *</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your products, quality standards, and brand story..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div className="border-b border-slate-100 pb-4 pt-4 mb-4">
            <h3 className="text-base font-extrabold text-slate-900">2. Contact & Physical Operations</h3>
            <p className="text-xs text-slate-500">Where you are located and how customers contact you.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Business Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="024 123 4567"
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                WhatsApp Customer Support Number
              </label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="024 123 4567 (for direct chat button)"
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Business City / Location *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Osu, Accra or Adum, Kumasi"
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Proposed Delivery & Fulfilment Arrangements
              </label>
              <textarea
                rows={2}
                value={proposedDelivery}
                onChange={(e) => setProposedDelivery(e.target.value)}
                placeholder="Detail whether you deliver yourself, use courier partners, or offer customer pickup..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div className="border-b border-slate-100 pb-4 pt-4 mb-4">
            <h3 className="text-base font-extrabold text-slate-900">3. Verification Documents (Optional)</h3>
            <p className="text-xs text-slate-500">Helps expedite your application approval.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Business Registration (RGD / Registrar General Number)
              </label>
              <input
                type="text"
                value={businessRegNumber}
                onChange={(e) => setBusinessRegNumber(e.target.value)}
                placeholder="e.g. BN-12345678"
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ghana Card Number (National ID)
              </label>
              <input
                type="text"
                value={nationalIdNumber}
                onChange={(e) => setNationalIdNumber(e.target.value)}
                placeholder="e.g. GHA-123456789-0"
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 uppercase"
              />
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="pt-4 border-t border-slate-100">
            <label className="flex items-start gap-3 cursor-pointer p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition">
              <input
                type="checkbox"
                required
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 mt-0.5 shrink-0"
              />
              <span className="text-xs text-slate-700 leading-relaxed">
                I confirm that the business information provided is accurate and genuine. I agree to operate
                my storefront in accordance with The Ultimate Virtual Mall platform rules, commission policies,
                and Ghanaian consumer protection regulations.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <Store className="w-4 h-4 text-amber-400" />
            <span>{submitting ? 'Submitting Application...' : 'Submit Merchant Application'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
