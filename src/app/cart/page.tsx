'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatGhs } from '@/lib/commission';
import {
  ShoppingBag,
  Store,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
} from 'lucide-react';

export default function CartPage() {
  const {
    groupedByShop,
    totalItemCount,
    itemsSubtotal,
    deliveryTotal,
    grandTotal,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  if (groupedByShop.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 px-4">
        <div className="max-w-md mx-auto text-center bg-white rounded-3xl p-10 border border-slate-200/90 shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            You haven’t added any items yet. Browse genuine products from independent shops across the
            mall.
          </p>
          <Link
            href="/products"
            className="inline-flex px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition"
          >
            Explore Catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Shopping Cart</h1>
            <p className="text-xs text-slate-500 mt-1">
              {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} from {groupedByShop.length}{' '}
              independent {groupedByShop.length === 1 ? 'merchant' : 'merchants'}
            </p>
          </div>

          <button
            onClick={clearCart}
            className="text-xs font-bold text-rose-600 hover:underline"
          >
            Clear Entire Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Items by Merchant (Left 8 Cols) */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            {groupedByShop.map((group) => (
              <div
                key={group.shopId}
                className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 p-3.5 sm:p-6 shadow-sm"
              >
                {/* Shop Banner Header */}
                <div className="flex items-center justify-between pb-3 sm:pb-4 mb-4 sm:mb-5 border-b border-slate-100 flex-wrap gap-2">
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <Link
                        href={`/shops/${group.shopSlug}`}
                        className="font-extrabold text-sm text-slate-900 hover:text-indigo-600 transition"
                      >
                        {group.shopName}
                      </Link>
                      <span className="block text-[11px] text-slate-400">Independent Storefront</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-slate-100">
                    <Truck className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Shop Delivery: </span>
                    <span className="font-extrabold text-slate-900">{formatGhs(group.deliveryFee)}</span>
                  </div>
                </div>

                {/* Items in this Shop */}
                <div className="space-y-3 sm:space-y-4">
                  {group.items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 py-3 border-b border-slate-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <ShoppingBag className="w-6 h-6" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{item.name}</h4>
                          {item.variantName && (
                            <span className="text-[11px] font-semibold text-slate-500 block truncate">
                              Option: {item.variantName}
                            </span>
                          )}
                          <p className="text-xs font-black text-indigo-600 mt-0.5">
                            {formatGhs(item.price)}
                          </p>
                        </div>
                      </div>

                      {/* Quantity & Subtotal */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                        <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-bold"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-xs font-extrabold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-bold"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-black text-slate-900 min-w-[70px] text-right">
                          {formatGhs(item.price * item.quantity)}
                        </span>

                        <button
                          onClick={() => removeItem(item.productId)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition"
                          title="Remove from Cart"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shop Subtotal Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs font-semibold text-slate-600">
                  <span>Shop Merchandise Subtotal</span>
                  <span className="font-extrabold text-slate-900">{formatGhs(group.subtotal)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Summary (Right 4 Cols) */}
          <div className="lg:col-span-4">
            <div className="rounded-3xl bg-white border border-slate-200/90 p-6 shadow-sm sticky top-28 space-y-5">
              <h3 className="font-extrabold text-base text-slate-900">Order Breakdown</h3>

              <div className="space-y-2.5 text-xs text-slate-600 border-b border-slate-100 pb-4">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-slate-900">{formatGhs(itemsSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Delivery Charges</span>
                  <span className="font-bold text-slate-900">{formatGhs(deliveryTotal)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Independent Sellers</span>
                  <span>{groupedByShop.length} shops</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="font-extrabold text-base text-slate-900">Grand Total</span>
                <span className="text-2xl font-black text-indigo-600">{formatGhs(grandTotal)}</span>
              </div>

              <Link
                href="/checkout"
                className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="pt-2 text-[11px] text-slate-500 space-y-1.5">
                <p className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Secured Payment via Paystack Ghana</span>
                </p>
                <p>Accepting MTN MoMo, Telecel Cash, AT Money, Visa & Mastercard</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
