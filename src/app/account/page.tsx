'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { formatGhs } from '@/lib/commission';
import { User, Package, ShoppingBag, ArrowRight, Clock, CheckCircle2, LogOut } from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
      return;
    }

    async function loadOrders() {
      try {
        const res = await fetch('/api/customer/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (e) {
        console.error('Failed to load customer orders:', e);
      } finally {
        setOrdersLoading(false);
      }
    }

    if (user) {
      loadOrders();
    }
  }, [user, isLoading, router]);

  if (isLoading || ordersLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Card */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-8 shadow-sm mb-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Customer Account
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{user.name}</h1>
              <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Order History */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Your Order History</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Track packages and view payment receipts across all mall merchants.
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-900 text-base mb-1">No Orders Placed Yet</h3>
              <p className="text-xs text-slate-500 mb-6">
                When you purchase products in the mall, your receipt and tracking will appear here.
              </p>
              <Link
                href="/products"
                className="inline-flex px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900">
                        Order #{ord.orderNumber}
                      </h4>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.paymentStatus === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 block mt-1">
                      {new Date(ord.createdAt).toLocaleDateString()} • {ord.sellerOrders.length}{' '}
                      {ord.sellerOrders.length === 1 ? 'shop' : 'shops'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <span className="text-base font-black text-slate-900">
                      {formatGhs(ord.totalAmount)}
                    </span>
                    <Link
                      href={`/orders/${ord.orderNumber}`}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <span>View Receipt & Tracking</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
