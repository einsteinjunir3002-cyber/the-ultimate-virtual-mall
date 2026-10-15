'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { formatGhs } from '@/lib/commission';
import {
  ShieldCheck,
  Building2,
  Store,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  DollarSign,
  Settings,
  Users,
  Search,
  Check,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function SuperAdminPortal() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'stats' | 'applications' | 'shops' | 'orders' | 'config'>('stats');
  const [stats, setStats] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({
    defaultCommissionPercent: '5.0',
    mallName: 'The Ultimate Virtual Mall',
    contactEmail: 'support@theultimatemall.com',
    maintenanceMode: false,
  });
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load Admin Data
  const loadAdminData = async () => {
    try {
      const [statsRes, appRes, shopRes, ordRes, cfgRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/applications'),
        fetch('/api/admin/shops'),
        fetch('/api/admin/orders'),
        fetch('/api/admin/config'),
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.stats);
      }
      if (appRes.ok) {
        const d = await appRes.json();
        setApplications(d.applications || []);
      }
      if (shopRes.ok) {
        const d = await shopRes.json();
        setShops(d.shops || []);
      }
      if (ordRes.ok) {
        const d = await ordRes.json();
        setOrders(d.orders || []);
      }
      if (cfgRes.ok) {
        const d = await cfgRes.json();
        if (d.config) setConfig(d.config);
      }
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login');
        return;
      }
      if (user.role !== 'SUPER_ADMIN') {
        router.push('/');
        return;
      }
      loadAdminData();
    }
  }, [user, authLoading]);

  // Handle Application Approval / Rejection
  const handleApplicationAction = async (applicationId: string, action: 'APPROVE' | 'REJECT', notes?: string) => {
    setActionMessage(null);
    try {
      const res = await fetch('/api/admin/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, action, adminNotes: notes }),
      });

      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'success', text: data.message });
        loadAdminData();
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Failed to process application' });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Network error processing action' });
    }
  };

  // Toggle Shop Active / Suspended
  const handleToggleShopStatus = async (shopId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch('/api/admin/shops', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId, status: newStatus }),
      });
      if (res.ok) {
        setActionMessage({ type: 'success', text: `Shop status changed to ${newStatus}` });
        loadAdminData();
      }
    } catch (e) {
      console.error('Toggle status error:', e);
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (shopId: string, isFeatured: boolean) => {
    try {
      const res = await fetch('/api/admin/shops', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId, isFeatured: !isFeatured }),
      });
      if (res.ok) {
        loadAdminData();
      }
    } catch (e) {
      console.error('Toggle feature error:', e);
    }
  };

  // Mark Settlement as Settled
  const handleMarkSettled = async (commissionRecordId: string) => {
    try {
      const res = await fetch('/api/admin/settlements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commissionRecordId, status: 'SETTLED' }),
      });
      if (res.ok) {
        setActionMessage({ type: 'success', text: 'Settlement recorded as SETTLED' });
        loadAdminData();
      }
    } catch (e) {
      console.error('Settlement error:', e);
    }
  };

  // Save Platform Config
  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage(null);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setActionMessage({ type: 'success', text: 'Platform configuration saved successfully' });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Failed to update platform settings' });
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">
            Verifying Platform Super Admin Access...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Top Banner */}
      <div className="bg-slate-950 border-b border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Mall Administration Portal
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/30 uppercase tracking-wider">
                    Super Admin: Big Sam
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Global mall oversight, merchant vetting, commission ledger, and catalogue moderation.
                </p>
              </div>
            </div>

            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition border border-slate-700 self-start sm:self-auto"
            >
              Public Mall View →
            </Link>
          </div>

          {/* Navigation Bar */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('stats')}
              className={`pb-3 px-3.5 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'stats'
                  ? 'border-indigo-500 text-white font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Mall Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              className={`pb-3 px-3.5 border-b-2 transition flex items-center gap-2 relative ${
                activeTab === 'applications'
                  ? 'border-indigo-500 text-white font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Seller Applications</span>
              {stats?.pendingApplications > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                  {stats.pendingApplications}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('shops')}
              className={`pb-3 px-3.5 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'shops'
                  ? 'border-indigo-500 text-white font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Merchant Shops ({shops.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-3 px-3.5 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'orders'
                  ? 'border-indigo-500 text-white font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Platform Orders & Commissions</span>
            </button>

            <button
              onClick={() => setActiveTab('config')}
              className={`pb-3 px-3.5 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'config'
                  ? 'border-indigo-500 text-white font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Platform Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {actionMessage && (
          <div
            className={`mb-6 p-4 rounded-2xl text-xs font-semibold flex items-center gap-3 ${
              actionMessage.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-300'
                : 'bg-rose-950/80 border border-rose-500 text-rose-300'
            }`}
          >
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* TAB 1: OVERVIEW & REAL METRICS */}
        {activeTab === 'stats' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-xs font-bold text-slate-400">Total Paid Mall Volume</span>
                <p className="text-2xl font-black text-white mt-1">
                  {formatGhs(stats?.totalGrossVolume || 0)}
                </p>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Across all verified seller orders
                </span>
              </div>

              <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-xs font-bold text-slate-400">Platform Commission Earned</span>
                <p className="text-2xl font-black text-emerald-400 mt-1">
                  {formatGhs(stats?.totalCommissionEarned || 0)}
                </p>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Calculated from paid suborders
                </span>
              </div>

              <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-xs font-bold text-slate-400">Approved Merchant Shops</span>
                <p className="text-2xl font-black text-white mt-1">
                  {stats?.activeShops || 0} / {stats?.totalShops || 0}
                </p>
                <span className="text-[11px] text-slate-400 block mt-1">
                  {stats?.pendingApplications || 0} applications awaiting approval
                </span>
              </div>

              <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-xs font-bold text-slate-400">Published Products</span>
                <p className="text-2xl font-black text-white mt-1">
                  {stats?.totalProducts || 0}
                </p>
                <span className="text-[11px] text-slate-400 block mt-1">Real merchant items</span>
              </div>
            </div>

            {/* Empty state announcement if brand new */}
            {stats?.totalShops === 0 && (
              <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 text-center max-w-2xl mx-auto space-y-3">
                <ShieldCheck className="w-12 h-12 text-indigo-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Platform Zero State Active</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  No mock merchants or dummy products have been created. Real sellers who submit
                  applications via the onboarding flow will appear in the <strong>Seller Applications</strong>{' '}
                  tab for your immediate approval.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SELLER APPLICATIONS */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-white">Merchant Applications</h3>
                <p className="text-xs text-slate-400">
                  Review applicant credentials. Approving an application automatically provisions the
                  shop, category structure, and seller dashboard.
                </p>
              </div>
            </div>

            {applications.length === 0 ? (
              <div className="p-12 text-center bg-slate-800/50 rounded-3xl border border-slate-700 text-slate-400">
                <Clock className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <h4 className="font-bold text-white text-base mb-1">No Applications Pending</h4>
                <p className="text-xs text-slate-400">
                  When new prospective merchants register and submit business details, they will appear
                  here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-6 rounded-3xl bg-slate-800/70 border border-slate-700/80 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-700/60 gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-base text-white">{app.shopName}</h4>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              app.status === 'PENDING'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : app.status === 'APPROVED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 block mt-0.5">
                          Applicant: {app.user.name} ({app.user.email}) • Submitted:{' '}
                          {new Date(app.submittedAt).toLocaleDateString()}
                        </span>
                      </div>

                      {app.status === 'PENDING' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApplicationAction(app.id, 'APPROVE')}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Approve & Provision Shop</span>
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Reason for rejection (optional):');
                              handleApplicationAction(app.id, 'REJECT', reason || undefined);
                            }}
                            className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 text-xs font-bold transition border border-rose-500/30"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                      <div>
                        <span className="text-slate-500 block">Proposed Slug:</span>
                        <strong className="text-indigo-400 font-mono">/shops/{app.desiredSlug}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Category:</span>
                        <strong>{app.category}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Location:</span>
                        <strong>{app.location}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Phone / WhatsApp:</span>
                        <strong>
                          {app.phone} {app.whatsappNumber ? `• WA: ${app.whatsappNumber}` : ''}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Reg / Ghana Card:</span>
                        <strong>
                          {app.businessRegNumber || 'N/A'} • {app.nationalIdNumber || 'N/A'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Proposed Delivery:</span>
                        <span className="line-clamp-2">{app.proposedDelivery || 'Standard'}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400">
                      <span className="font-bold text-slate-300">Description: </span>
                      {app.description}
                    </div>

                    {app.adminNotes && (
                      <p className="text-xs text-amber-300 italic">
                        <strong>Admin Note:</strong> {app.adminNotes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SHOPS MANAGEMENT */}
        {activeTab === 'shops' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-white">Registered Mall Shops</h3>
              <p className="text-xs text-slate-400">
                Manage storefront visibility, feature merchants on homepage, or suspend violators.
              </p>
            </div>

            {shops.length === 0 ? (
              <div className="p-12 text-center bg-slate-800/50 rounded-3xl border border-slate-700 text-slate-400">
                <Store className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <h4 className="font-bold text-white text-base mb-1">Zero Registered Shops</h4>
                <p className="text-xs text-slate-400">
                  Approved merchants will appear here once applications are processed.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-3xl bg-slate-800/80 border border-slate-700 shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-700 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Shop</th>
                      <th className="p-4">Owner</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Catalogue</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Featured</th>
                      <th className="p-4 text-right">Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 text-slate-300">
                    {shops.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-700/30 transition">
                        <td className="p-4">
                          <Link
                            href={`/shops/${s.slug}`}
                            target="_blank"
                            className="font-bold text-white hover:text-indigo-400 flex items-center gap-1.5"
                          >
                            <span>{s.name}</span>
                            <ExternalLink className="w-3 h-3 text-slate-500" />
                          </Link>
                          <span className="text-[11px] text-slate-400 font-mono">/shops/{s.slug}</span>
                        </td>

                        <td className="p-4">
                          <span className="block font-semibold text-white">{s.owner.name}</span>
                          <span className="text-[11px] text-slate-400">{s.owner.email}</span>
                        </td>

                        <td className="p-4 text-slate-300">{s.businessCategory}</td>

                        <td className="p-4 text-slate-300">{s._count?.products || 0} products</td>

                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              s.status === 'ACTIVE'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>

                        <td className="p-4">
                          <button
                            onClick={() => handleToggleFeatured(s.id, s.isFeatured)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                              s.isFeatured
                                ? 'bg-amber-500 text-slate-950 shadow'
                                : 'bg-slate-700 text-slate-400 hover:text-white'
                            }`}
                          >
                            {s.isFeatured ? '★ Featured' : 'Standard'}
                          </button>
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleToggleShopStatus(s.id, s.status)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                              s.status === 'ACTIVE'
                                ? 'bg-rose-600/20 text-rose-300 hover:bg-rose-600/40 border border-rose-500/30'
                                : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/40 border border-emerald-500/30'
                            }`}
                          >
                            {s.status === 'ACTIVE' ? 'Suspend' : 'Reinstate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ORDERS & SETTLEMENTS */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-white">Platform Orders & Commissions</h3>
              <p className="text-xs text-slate-400">
                Inspect ParentOrders, merchant allocations, and record manual settlements.
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="p-12 text-center bg-slate-800/50 rounded-3xl border border-slate-700 text-slate-400">
                <DollarSign className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <h4 className="font-bold text-white text-base mb-1">No Orders Processed Yet</h4>
                <p className="text-xs text-slate-400">
                  Transactions completed with Paystack will appear here with commission splits.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-6 rounded-3xl bg-slate-800/70 border border-slate-700/80 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-700 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">Order #{ord.orderNumber}</h4>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.paymentStatus === 'PAID'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {ord.paymentStatus}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Placed on {new Date(ord.createdAt).toLocaleDateString()} • Paystack Ref:{' '}
                          <code className="text-indigo-400">{ord.paystackReference || 'N/A'}</code>
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-white">
                          {formatGhs(ord.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Suborders per seller */}
                    <div className="space-y-3">
                      {ord.sellerOrders.map((so: any) => (
                        <div
                          key={so.id}
                          className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <span className="font-bold text-white block">
                              Shop: {so.shop.name} ({so.subOrderNumber})
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              Status: {so.status} • Delivery: {formatGhs(so.deliveryFee)}
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            <div>
                              <span className="text-slate-400 text-[11px] block">Platform Fee:</span>
                              <span className="font-black text-amber-400">
                                {formatGhs(so.platformCommissionAmount)} ({so.platformCommissionRate}%)
                              </span>
                            </div>

                            <div>
                              <span className="text-slate-400 text-[11px] block">Seller Net:</span>
                              <span className="font-black text-emerald-400">
                                {formatGhs(so.sellerEarnings)}
                              </span>
                            </div>

                            {so.commissionRecord && (
                              <div>
                                {so.commissionRecord.settlementStatus === 'SETTLED' ? (
                                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                                    ✓ Settled
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleMarkSettled(so.commissionRecord.id)}
                                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold"
                                  >
                                    Mark Settled
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PLATFORM CONFIG */}
        {activeTab === 'config' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-white">Mall Platform Settings</h3>
              <p className="text-xs text-slate-400">
                Adjust platform commission rate, mall identity, and support channels.
              </p>
            </div>

            <form onSubmit={handleConfigSubmit} className="p-8 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mall Name</label>
                <input
                  type="text"
                  value={config.mallName}
                  onChange={(e) => setConfig({ ...config, mallName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Default Platform Commission (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={config.defaultCommissionPercent}
                  onChange={(e) => setConfig({ ...config, defaultCommissionPercent: e.target.value })}
                  placeholder="5.0"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Applicable percentage automatically charged on merchandise item sales.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Support Email Address
                </label>
                <input
                  type="email"
                  value={config.contactEmail}
                  onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={config.maintenanceMode}
                    onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span className="text-xs font-bold text-slate-300">
                    Enable Maintenance Mode (Pause new checkouts)
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition"
              >
                Save Platform Settings
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
