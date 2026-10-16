'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import {
  ShoppingBag,
  Store,
  Search,
  ShoppingCart,
  User as UserIcon,
  ShieldCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Package,
} from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { totalItemCount, setIsCartDrawerOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav max-w-full overflow-hidden">
      {/* Top Banner Notice */}
      <div className="w-full bg-slate-900 text-slate-300 text-[11px] sm:text-xs py-1.5 px-3 sm:px-4 text-center font-medium overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-1.5 sm:gap-2 leading-tight">
          <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <span className="truncate sm:whitespace-normal">
            Ghana’s Premier Digital Shopping Destination • Seamless Mobile Money & Card Payments via Paystack
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Mall Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-base sm:text-xl tracking-tight text-slate-900 leading-tight truncate">
                The Ultimate <span className="text-indigo-600">Mall</span>
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-slate-500 hidden xs:block truncate">
                Virtual Multi-Vendor Hub
              </span>
            </div>
          </Link>

          {/* Mall-wide Search Bar (Desktop) */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-lg relative items-center"
          >
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search all products, brands, or merchant shops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-24 py-2.5 rounded-full border border-slate-200 bg-slate-50/80 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
              >
                Search
              </button>
            </div>
          </form>

          {/* Navigation Links & Action Buttons */}
          <div className="flex items-center gap-3 sm:gap-5">
            <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600">
              <Link href="/shops" className="hover:text-indigo-600 transition flex items-center gap-1.5">
                <Store className="w-4 h-4 text-slate-400" />
                Shops Directory
              </Link>
              <Link href="/products" className="hover:text-indigo-600 transition flex items-center gap-1.5">
                <Package className="w-4 h-4 text-slate-400" />
                Browse Catalog
              </Link>
            </nav>

            {/* Merchant CTA */}
            {(!user || user.role === 'CUSTOMER') && (
              <Link
                href="/merchant/onboard"
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 shadow-sm transition"
              >
                <Store className="w-3.5 h-3.5" />
                Open a Shop
              </Link>
            )}

            {/* Cart Button with Count Badge */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm hover:border-slate-300 transition"
              aria-label="Open Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 text-slate-700" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow">
                  {totalItemCount}
                </span>
              )}
            </button>

            {/* User Account Menu */}
            <div className="relative">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold max-w-[100px] truncate hidden sm:inline">
                      {user.name}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {user.role}
                        </span>
                      </div>

                      {user.role === 'SUPER_ADMIN' && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100/80 transition"
                        >
                          <ShieldCheck className="w-4 h-4 text-indigo-600" />
                          Platform Admin (Big Sam)
                        </Link>
                      )}

                      {user.role === 'MERCHANT' && (
                        <Link
                          href="/merchant/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-500" />
                          Merchant Dashboard
                        </Link>
                      )}

                      {user.shop && (
                        <Link
                          href={`/shops/${user.shop.slug}`}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Store className="w-4 h-4 text-slate-500" />
                          View My Storefront
                        </Link>
                      )}

                      <Link
                        href="/account"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Package className="w-4 h-4 text-slate-500" />
                        My Order History
                      </Link>

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={logout}
                          className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Link
                    href="/auth/login"
                    className="hidden sm:inline-flex px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="hidden sm:inline-flex px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition shrink-0"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 py-4 px-2 space-y-3">
            <form onSubmit={handleSearch} className="relative w-full mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products or shops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-20 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
              >
                Go
              </button>
            </form>

            <div className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
              <Link
                href="/shops"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2"
              >
                <Store className="w-4 h-4 text-indigo-600" />
                Shops Directory
              </Link>
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2"
              >
                <Package className="w-4 h-4 text-indigo-600" />
                Browse Catalog
              </Link>
              <Link
                href="/merchant/onboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-2 font-bold"
              >
                <Store className="w-4 h-4 text-amber-600" />
                Open a Shop / Merchant Onboarding
              </Link>
            </div>

            {/* Mobile Account Section */}
            {user ? (
              <div className="pt-2 border-t border-slate-100 flex flex-col space-y-1 text-sm font-semibold">
                <div className="px-3 py-1 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  Signed in as <span className="text-slate-700">{user.name}</span>
                </div>
                {user.role === 'SUPER_ADMIN' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-rose-500" />
                    Super Admin Console
                  </Link>
                )}
                {(user.role === 'MERCHANT' || user.role === 'SUPER_ADMIN') && (
                  <Link
                    href="/merchant/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-xl text-indigo-600 hover:bg-indigo-50 flex items-center gap-2"
                  >
                    <Store className="w-4 h-4 text-indigo-500" />
                    Merchant Dashboard
                  </Link>
                )}
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                >
                  <Package className="w-4 h-4 text-slate-500" />
                  My Order History
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
