'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatGhs } from '@/lib/commission';
import { X, Trash2, Plus, Minus, ShoppingBag, Store, ArrowRight } from 'lucide-react';

export function CartDrawer() {
  const {
    groupedByShop,
    totalItemCount,
    itemsSubtotal,
    deliveryTotal,
    grandTotal,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Multi-Seller Cart</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {groupedByShop.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-1">Your Cart is Empty</h4>
                <p className="text-xs text-slate-500 mb-6 max-w-xs mx-auto">
                  Discover amazing shops and unique products across The Ultimate Virtual Mall.
                </p>
                <Link
                  href="/products"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="inline-flex px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              groupedByShop.map((shopGroup) => (
                <div
                  key={shopGroup.shopId}
                  className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm"
                >
                  {/* Shop Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <Link
                      href={`/shops/${shopGroup.shopSlug}`}
                      onClick={() => setIsCartDrawerOpen(false)}
                      className="flex items-center gap-2 group"
                    >
                      <Store className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition">
                        {shopGroup.shopName}
                      </span>
                    </Link>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Delivery: {formatGhs(shopGroup.deliveryFee)}
                    </span>
                  </div>

                  {/* Items in this shop */}
                  <div className="space-y-3">
                    {shopGroup.items.map((item) => (
                      <div key={item.productId} className="flex gap-3 items-center">
                        <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
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

                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-xs text-slate-900 truncate">
                            {item.name}
                          </h5>
                          <p className="text-xs font-extrabold text-indigo-600 mt-0.5">
                            {formatGhs(item.price)}
                          </p>

                          {/* Quantity selector */}
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="p-1 text-slate-600 hover:text-slate-900 transition"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-xs font-bold text-slate-800">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="p-1 text-slate-600 hover:text-slate-900 transition"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.productId)}
                              className="p-1 text-slate-400 hover:text-rose-500 transition"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {groupedByShop.length > 0 && (
            <div className="p-5 border-t border-slate-100 bg-slate-50/70 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatGhs(itemsSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Delivery Total</span>
                  <span className="font-semibold text-slate-900">{formatGhs(deliveryTotal)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-extrabold text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-indigo-600">{formatGhs(grandTotal)}</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="text-center">
                <button
                  onClick={clearCart}
                  className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition"
                >
                  Clear Entire Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
