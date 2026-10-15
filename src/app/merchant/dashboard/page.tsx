'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { formatGhs } from '@/lib/commission';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Palette,
  DollarSign,
  Plus,
  Store,
  AlertTriangle,
  CheckCircle2,
  Truck,
  Upload,
  Eye,
  Trash2,
  Edit,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';

export default function MerchantDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'branding' | 'earnings'>('overview');
  const [shop, setShop] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [mallCategories, setMallCategories] = useState<any[]>([]);
  const [shopCategories, setShopCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Product modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    salePrice: '',
    stock: '10',
    lowStockThreshold: '3',
    sku: '',
    brand: '',
    mallCategoryId: '',
    shopCategoryId: '',
    imageUrl: '',
    status: 'PUBLISHED',
  });
  const [productSaving, setProductSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Shop Branding Form state
  const [brandingForm, setBrandingForm] = useState({
    name: '',
    tagline: '',
    description: '',
    logoUrl: '',
    bannerUrl: '',
    location: '',
    phone: '',
    whatsappNumber: '',
    themeColor: '#0f172a',
    templateStyle: 'MODERN_MINIMAL',
    deliveryPolicy: '',
    returnPolicy: '',
    baseDeliveryFee: '20.00',
    pickupAvailable: true,
  });
  const [brandingSaving, setBrandingSaving] = useState(false);
  const [brandingNotice, setBrandingNotice] = useState<string | null>(null);

  // Order status modal
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState('CONFIRMED');
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Load merchant data
  const loadMerchantData = async () => {
    try {
      const [shopRes, statsRes, prodRes, ordRes, catRes] = await Promise.all([
        fetch('/api/merchant/shop'),
        fetch('/api/merchant/stats'),
        fetch('/api/merchant/products'),
        fetch('/api/merchant/orders'),
        fetch('/api/merchant/categories'),
      ]);

      if (shopRes.ok) {
        const sData = await shopRes.json();
        setShop(sData.shop);
        setBrandingForm({
          name: sData.shop.name || '',
          tagline: sData.shop.tagline || '',
          description: sData.shop.description || '',
          logoUrl: sData.shop.logoUrl || '',
          bannerUrl: sData.shop.bannerUrl || '',
          location: sData.shop.location || '',
          phone: sData.shop.phone || '',
          whatsappNumber: sData.shop.whatsappNumber || '',
          themeColor: sData.shop.themeColor || '#0f172a',
          templateStyle: sData.shop.templateStyle || 'MODERN_MINIMAL',
          deliveryPolicy: sData.shop.deliveryPolicy || '',
          returnPolicy: sData.shop.returnPolicy || '',
          baseDeliveryFee: String(sData.shop.baseDeliveryFee || '20.00'),
          pickupAvailable: sData.shop.pickupAvailable ?? true,
        });
      }

      if (statsRes.ok) {
        const stData = await statsRes.json();
        setStats(stData.stats);
      }

      if (prodRes.ok) {
        const pData = await prodRes.json();
        setProducts(pData.products || []);
      }

      if (ordRes.ok) {
        const oData = await ordRes.json();
        setOrders(oData.orders || []);
      }

      if (catRes.ok) {
        const cData = await catRes.json();
        setMallCategories(cData.mallCategories || []);
        setShopCategories(cData.shopCategories || []);
      }
    } catch (e) {
      console.error('Failed to load merchant data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
    if (user) {
      loadMerchantData();
    }
  }, [user, authLoading]);

  // Image upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setProductForm((prev) => ({ ...prev, imageUrl: data.url }));
      }
    } catch (e) {
      console.error('Upload error:', e);
    } finally {
      setUploadingImage(false);
    }
  };

  // Product Save
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductSaving(true);

    try {
      const payload: any = {
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        salePrice: productForm.salePrice ? Number(productForm.salePrice) : null,
        stock: Number(productForm.stock),
        lowStockThreshold: Number(productForm.lowStockThreshold),
        sku: productForm.sku || null,
        brand: productForm.brand || null,
        mallCategoryId: productForm.mallCategoryId || null,
        shopCategoryId: productForm.shopCategoryId || null,
        status: productForm.status,
        images: productForm.imageUrl ? [{ url: productForm.imageUrl, isPrimary: true }] : [],
      };

      let res;
      if (editingProductId) {
        payload.id = editingProductId;
        res = await fetch('/api/merchant/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/merchant/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setShowProductModal(false);
        setEditingProductId(null);
        setProductForm({
          name: '',
          description: '',
          price: '',
          salePrice: '',
          stock: '10',
          lowStockThreshold: '3',
          sku: '',
          brand: '',
          mallCategoryId: '',
          shopCategoryId: '',
          imageUrl: '',
          status: 'PUBLISHED',
        });
        loadMerchantData();
      }
    } catch (e) {
      console.error('Save product error:', e);
    } finally {
      setProductSaving(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/merchant/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) loadMerchantData();
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  // Edit product trigger
  const handleEditProduct = (prod: any) => {
    setEditingProductId(prod.id);
    setProductForm({
      name: prod.name,
      description: prod.description,
      price: String(prod.price),
      salePrice: prod.salePrice ? String(prod.salePrice) : '',
      stock: String(prod.stock),
      lowStockThreshold: String(prod.lowStockThreshold || 3),
      sku: prod.sku || '',
      brand: prod.brand || '',
      mallCategoryId: prod.mallCategoryId || '',
      shopCategoryId: prod.shopCategoryId || '',
      imageUrl: prod.images?.[0]?.url || '',
      status: prod.status,
    });
    setShowProductModal(true);
  };

  // Branding update
  const handleBrandingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBrandingSaving(true);
    setBrandingNotice(null);

    try {
      const res = await fetch('/api/merchant/shop', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandingForm),
      });

      if (res.ok) {
        setBrandingNotice('Storefront settings updated successfully!');
        loadMerchantData();
      } else {
        setBrandingNotice('Failed to update storefront settings.');
      }
    } catch {
      setBrandingNotice('Error connecting to server.');
    } finally {
      setBrandingSaving(false);
    }
  };

  // Order status update
  const handleUpdateOrderStatus = async (orderId: string) => {
    try {
      const res = await fetch('/api/merchant/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: newOrderStatus,
          courierName: courierName || undefined,
          trackingNumber: trackingNumber || undefined,
        }),
      });
      if (res.ok) {
        setUpdatingOrderId(null);
        loadMerchantData();
      }
    } catch (e) {
      console.error('Order status update error:', e);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading Seller Dashboard...</p>
        </div>
      </div>
    );
  }

  // If user does not have an approved shop yet
  if (!shop) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-200">
          <Store className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Active Shop Found</h2>
          <p className="text-xs text-slate-500 mb-6">
            You do not currently operate an approved shop on this account.
          </p>
          <Link
            href="/merchant/onboard"
            className="inline-flex px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
          >
            Apply to Open a Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Dashboard Top Header */}
      <div className="bg-slate-900 text-white py-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">
                  Seller Dashboard
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Shop: {shop.status}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {shop.name}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/shops/${shop.slug}`}
                target="_blank"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition flex items-center gap-1.5"
              >
                <span>View Live Storefront</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={() => {
                  setEditingProductId(null);
                  setProductForm({
                    name: '',
                    description: '',
                    price: '',
                    salePrice: '',
                    stock: '10',
                    lowStockThreshold: '3',
                    sku: '',
                    brand: '',
                    mallCategoryId: '',
                    shopCategoryId: '',
                    imageUrl: '',
                    status: 'PUBLISHED',
                  });
                  setShowProductModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 px-3 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`pb-3 px-3 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'products'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Product Catalogue ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-3 px-3 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'orders'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Store Orders ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('branding')}
              className={`pb-3 px-3 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'branding'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Storefront Customization</span>
            </button>

            <button
              onClick={() => setActiveTab('earnings')}
              className={`pb-3 px-3 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'earnings'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Earnings & Settlements</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
                <span className="text-xs font-bold text-slate-400">Total Completed Sales</span>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {formatGhs(stats?.totalNetEarnings || 0)}
                </p>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Net seller earnings after platform fee
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
                <span className="text-xs font-bold text-slate-400">Total Orders</span>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {stats?.totalOrders || 0}
                </p>
                <span className="text-[11px] text-slate-500 block mt-1">
                  {stats?.pendingOrders || 0} pending processing
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
                <span className="text-xs font-bold text-slate-400">Published Products</span>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {stats?.productsCount || 0}
                </p>
                <span className="text-[11px] text-slate-500 block mt-1">Active in catalogue</span>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
                <span className="text-xs font-bold text-slate-400">Low Stock Warnings</span>
                <p className="text-2xl font-black text-amber-600 mt-1">
                  {stats?.lowStockCount || 0}
                </p>
                <span className="text-[11px] text-slate-500 block mt-1">Items at or below threshold</span>
              </div>
            </div>

            {/* If zero activity, show guided onboarding */}
            {stats?.totalOrders === 0 && stats?.productsCount === 0 && (
              <div className="p-8 rounded-3xl bg-gradient-to-tr from-indigo-900 to-slate-900 text-white shadow-xl">
                <h3 className="text-xl font-extrabold mb-2">Welcome to Your Storefront Dashboard!</h3>
                <p className="text-xs text-slate-300 max-w-xl mb-6 leading-relaxed">
                  Your shop is officially provisioned and online. To start making genuine sales, follow the
                  onboarding checklist below:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                    <span className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center mb-2">
                      1
                    </span>
                    <h4 className="text-sm font-bold">Customize Storefront</h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Add your logo, cover banner, and WhatsApp customer number.
                    </p>
                    <button
                      onClick={() => setActiveTab('branding')}
                      className="mt-3 text-xs font-bold text-amber-300 hover:underline"
                    >
                      Configure Branding →
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                    <span className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center mb-2">
                      2
                    </span>
                    <h4 className="text-sm font-bold">Add Products</h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Upload your real products, set prices in GH₵, and set stock.
                    </p>
                    <button
                      onClick={() => setShowProductModal(true)}
                      className="mt-3 text-xs font-bold text-amber-300 hover:underline"
                    >
                      Publish Item →
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                    <span className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center mb-2">
                      3
                    </span>
                    <h4 className="text-sm font-bold">Receive Orders</h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Shoppers checkout with MoMo; receive orders here for fulfillment.
                    </p>
                    <Link
                      href={`/shops/${shop.slug}`}
                      target="_blank"
                      className="mt-3 text-xs font-bold text-amber-300 hover:underline block"
                    >
                      Preview Shop →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PRODUCT MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Your Product Catalogue</h3>
                <p className="text-xs text-slate-500">
                  Products published here appear directly in your storefront and in the mall-wide catalogue.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingProductId(null);
                  setProductForm({
                    name: '',
                    description: '',
                    price: '',
                    salePrice: '',
                    stock: '10',
                    lowStockThreshold: '3',
                    sku: '',
                    brand: '',
                    mallCategoryId: '',
                    shopCategoryId: '',
                    imageUrl: '',
                    status: 'PUBLISHED',
                  });
                  setShowProductModal(true);
                }}
                className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Upload New Product</span>
              </button>
            </div>

            {products.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-900 text-base mb-1">No Products Yet</h4>
                <p className="text-xs text-slate-500 mb-6">
                  Add your first real product to make your storefront visible and active.
                </p>
                <button
                  onClick={() => setShowProductModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
                >
                  Create Product
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-3xl bg-white border border-slate-200/90 shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Product</th>
                      <th className="p-4">Price (GH₵)</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition">
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                            {p.images?.[0]?.url ? (
                              <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Package className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block truncate max-w-[200px]">
                              {p.name}
                            </span>
                            <span className="text-[11px] text-slate-400">SKU: {p.sku || 'N/A'}</span>
                          </div>
                        </td>

                        <td className="p-4 font-black text-slate-900">
                          {formatGhs(p.salePrice || p.price)}
                          {p.salePrice && (
                            <span className="block text-[10px] text-slate-400 line-through">
                              {formatGhs(p.price)}
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              p.stock <= p.lowStockThreshold
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {p.stock} units
                          </span>
                        </td>

                        <td className="p-4 text-slate-500">
                          {p.mallCategory?.name || p.shopCategory?.name || 'General'}
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === 'PUBLISHED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>

                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleEditProduct(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* TAB 3: ORDER MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Orders Received</h3>
              <p className="text-xs text-slate-500">
                Orders placed by customers for your shop. Update fulfillment status and provide courier
                tracking.
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
                <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-900 text-base mb-1">No Orders Received Yet</h4>
                <p className="text-xs text-slate-500">
                  When customers purchase your products, they will appear here with customer delivery
                  details.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => {
                  const addr = ord.parentOrder.deliveryAddress as any;
                  return (
                    <div
                      key={ord.id}
                      className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                        <div>
                          <span className="text-xs font-bold text-slate-900">
                            Suborder: {ord.subOrderNumber} (Parent: {ord.parentOrder.orderNumber})
                          </span>
                          <span className="block text-[11px] text-slate-400">
                            Placed on {new Date(ord.createdAt).toLocaleDateString()} • Payment Status:{' '}
                            <strong className="text-slate-700">{ord.parentOrder.paymentStatus}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Fulfillment: {ord.status}
                          </span>
                          <button
                            onClick={() => {
                              setUpdatingOrderId(ord.id);
                              setNewOrderStatus(ord.status);
                              setCourierName(ord.courierName || '');
                              setTrackingNumber(ord.trackingNumber || '');
                            }}
                            className="px-3 py-1 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                          >
                            Update Status
                          </button>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {ord.items.map((it: any) => (
                          <div key={it.id} className="flex justify-between text-xs">
                            <span className="font-semibold text-slate-800">
                              {it.quantity}x {it.productName}
                            </span>
                            <span className="font-bold text-slate-900">{formatGhs(it.subtotal)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Customer Address Details */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="font-bold text-slate-900 block">
                            Recipient: {addr.fullName} ({addr.phone})
                          </span>
                          <span className="text-[11px]">
                            {addr.streetAddress}, {addr.city}, {addr.region} Region{' '}
                            {addr.digitalAddress ? `(GPS: ${addr.digitalAddress})` : ''}
                          </span>
                        </div>
                        <div className="text-right text-xs">
                          <span className="block text-slate-400">Your Net Earnings:</span>
                          <span className="text-sm font-black text-emerald-600">
                            {formatGhs(ord.sellerEarnings)}
                          </span>
                        </div>
                      </div>

                      {/* Update Modal / Form Inline */}
                      {updatingOrderId === ord.id && (
                        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3 animate-in fade-in">
                          <h5 className="font-bold text-xs text-slate-900">
                            Update Fulfillment Status & Courier
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <select
                              value={newOrderStatus}
                              onChange={(e) => setNewOrderStatus(e.target.value)}
                              className="p-2 rounded-xl border border-slate-300 text-xs bg-white"
                            >
                              <option value="CONFIRMED">CONFIRMED (Order Accepted)</option>
                              <option value="PROCESSING">PROCESSING (Packing Item)</option>
                              <option value="SHIPPED">SHIPPED (With Courier/Rider)</option>
                              <option value="READY_FOR_PICKUP">READY FOR PICKUP</option>
                              <option value="DELIVERED">DELIVERED (Fulfilled)</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>

                            <input
                              type="text"
                              value={courierName}
                              onChange={(e) => setCourierName(e.target.value)}
                              placeholder="Courier (e.g. Speedaf / Rider)"
                              className="p-2 rounded-xl border border-slate-300 text-xs"
                            />

                            <input
                              type="text"
                              value={trackingNumber}
                              onChange={(e) => setTrackingNumber(e.target.value)}
                              placeholder="Tracking Ref / Driver Phone"
                              className="p-2 rounded-xl border border-slate-300 text-xs"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id)}
                              className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                            >
                              Save Status
                            </button>
                            <button
                              onClick={() => setUpdatingOrderId(null)}
                              className="px-4 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: STOREFRONT BRANDING & TEMPLATE */}
        {activeTab === 'branding' && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Storefront Customization</h3>
              <p className="text-xs text-slate-500">
                Choose your template style, colors, banners, and policies.
              </p>
            </div>

            {brandingNotice && (
              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold">
                {brandingNotice}
              </div>
            )}

            <form onSubmit={handleBrandingSubmit} className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shop Name</label>
                  <input
                    type="text"
                    value={brandingForm.name}
                    onChange={(e) => setBrandingForm({ ...brandingForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={brandingForm.tagline}
                    onChange={(e) => setBrandingForm({ ...brandingForm, tagline: e.target.value })}
                    placeholder="e.g. Best Gadgets in Osu"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Template Style</label>
                  <select
                    value={brandingForm.templateStyle}
                    onChange={(e) => setBrandingForm({ ...brandingForm, templateStyle: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="MODERN_MINIMAL">Modern Minimalist (Clean & Fast)</option>
                    <option value="LUXURY_BOUTIQUE">Luxury Boutique (Gold & High-End)</option>
                    <option value="MARKETPLACE_GRID">Marketplace Grid (High Volume)</option>
                    <option value="WARM_ARTISAN">Warm Artisan (Crafts & Handmade)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Theme Brand Color</label>
                  <input
                    type="color"
                    value={brandingForm.themeColor}
                    onChange={(e) => setBrandingForm({ ...brandingForm, themeColor: e.target.value })}
                    className="w-full h-10 p-1 rounded-xl border border-slate-200 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Base Delivery Fee (GH₵)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={brandingForm.baseDeliveryFee}
                    onChange={(e) => setBrandingForm({ ...brandingForm, baseDeliveryFee: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Logo Image URL</label>
                  <input
                    type="text"
                    value={brandingForm.logoUrl}
                    onChange={(e) => setBrandingForm({ ...brandingForm, logoUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Banner Cover Image URL</label>
                  <input
                    type="text"
                    value={brandingForm.bannerUrl}
                    onChange={(e) => setBrandingForm({ ...brandingForm, bannerUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Inquiry Number</label>
                  <input
                    type="tel"
                    value={brandingForm.whatsappNumber}
                    onChange={(e) => setBrandingForm({ ...brandingForm, whatsappNumber: e.target.value })}
                    placeholder="024 123 4567"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Business Phone</label>
                  <input
                    type="tel"
                    value={brandingForm.phone}
                    onChange={(e) => setBrandingForm({ ...brandingForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Policy Notice</label>
                  <input
                    type="text"
                    value={brandingForm.deliveryPolicy}
                    onChange={(e) => setBrandingForm({ ...brandingForm, deliveryPolicy: e.target.value })}
                    placeholder="e.g. Delivery in Greater Accra within 24 hours. Outside Accra: 48 hours."
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Return & Refund Policy</label>
                  <input
                    type="text"
                    value={brandingForm.returnPolicy}
                    onChange={(e) => setBrandingForm({ ...brandingForm, returnPolicy: e.target.value })}
                    placeholder="e.g. Returns accepted within 7 days in undamaged packaging."
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={brandingSaving}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition disabled:opacity-50"
              >
                {brandingSaving ? 'Saving Changes...' : 'Save Storefront Settings'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: EARNINGS & SETTLEMENTS */}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Financial Records & Settlements</h3>
              <p className="text-xs text-slate-500">
                Accurate, transparent records of all customer payments, platform commissions, and net
                payouts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
                <span className="text-xs font-bold text-slate-400">Total Net Earnings</span>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {formatGhs(stats?.totalNetEarnings || 0)}
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
                <span className="text-xs font-bold text-slate-400">Settled to Your Account</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">
                  {formatGhs(stats?.totalSettled || 0)}
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
                <span className="text-xs font-bold text-slate-400">Pending Settlement</span>
                <p className="text-2xl font-black text-amber-600 mt-1">
                  {formatGhs(stats?.totalUnsettled || 0)}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-700 leading-relaxed">
              <strong>Settlement Notice:</strong> Marketplace transactions are securely collected via
              Paystack in Ghana Cedis. In accordance with platform policy, platform commissions (typically 5%)
              are deducted, and net funds are settled directly by mall management.
            </div>
          </div>
        )}
      </div>

      {/* Product Create / Edit Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-slate-200 my-8">
            <h3 className="text-lg font-extrabold text-slate-900 mb-1">
              {editingProductId ? 'Edit Product' : 'Add New Product to Store'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Fill in accurate details. Genuine stock and prices will be published immediately.
            </p>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (GH₵) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="150.00"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sale Price (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.salePrice}
                    onChange={(e) => setProductForm({ ...productForm, salePrice: e.target.value })}
                    placeholder="120.00"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Low Stock Warning Threshold</label>
                  <input
                    type="number"
                    value={productForm.lowStockThreshold}
                    onChange={(e) => setProductForm({ ...productForm, lowStockThreshold: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mall Category</label>
                  <select
                    value={productForm.mallCategoryId}
                    onChange={(e) => setProductForm({ ...productForm, mallCategoryId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="">Select Global Category</option>
                    {mallCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    placeholder="e.g. Apple, Nike"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Detailed specifications, features, and warranty..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              {/* Image upload / URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Image</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    placeholder="Image URL or upload a file"
                    className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                  <label className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5 inline mr-1" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={productSaving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow disabled:opacity-50"
                >
                  {productSaving ? 'Saving...' : editingProductId ? 'Update Product' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
