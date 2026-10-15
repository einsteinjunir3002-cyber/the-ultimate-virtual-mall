'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';

function VerifyPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const reference = searchParams.get('reference');

  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    async function verify() {
      if (!reference) {
        setStatus('failed');
        setErrorMessage('No payment reference found in callback URL.');
        return;
      }

      try {
        const res = await fetch(`/api/payments/verify?reference=${encodeURIComponent(reference)}`);
        const data = await res.json();

        if (res.ok && data.success) {
          clearCart();
          setStatus('success');
          setOrderNumber(data.orderNumber);
          // Redirect after 2 seconds
          setTimeout(() => {
            router.push(`/orders/${data.orderNumber}?ref=${encodeURIComponent(reference)}`);
          }, 2000);
        } else {
          setStatus('failed');
          setErrorMessage(data.error || 'Payment verification could not be confirmed.');
        }
      } catch (e) {
        setStatus('failed');
        setErrorMessage('Network error during payment verification.');
      }
    }

    verify();
  }, [reference, clearCart, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-lg">
        {status === 'verifying' && (
          <div className="space-y-4">
            <div className="w-12 h-12 mx-auto border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <h2 className="text-xl font-extrabold text-slate-900">Verifying Payment...</h2>
            <p className="text-xs text-slate-500">
              Confirming transaction with Paystack gateway. Please do not close this window.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Payment Confirmed!</h2>
            <p className="text-xs text-slate-600">
              Order <span className="font-bold text-slate-900">{orderNumber}</span> has been paid and
              dispatched to the respective shops.
            </p>
            <p className="text-[11px] text-slate-400">Redirecting to your order receipt...</p>
            <Link
              href={`/orders/${orderNumber}?ref=${encodeURIComponent(reference || '')}`}
              className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
            >
              View Order Confirmation
            </Link>
          </div>
        )}

        {status === 'failed' && (
          <div className="space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Payment Incomplete</h2>
            <p className="text-xs text-slate-600">{errorMessage}</p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/cart"
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Return to Cart
              </Link>
              <Link
                href="/contact"
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                Contact Support
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyPaymentContent />
    </Suspense>
  );
}
