'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatGhs } from '@/lib/commission';
import { buildProductWhatsAppLink } from '@/lib/whatsapp';
import {
  ShoppingBag,
  ShoppingCart,
  MessageCircle,
  Store,
  MapPin,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Share2,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { addItem } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/public/products/${params.slug}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data.product);
          setRelatedProducts(data.relatedProducts || []);
          if (data.product.variants?.length > 0) {
            setSelectedVariantId(data.product.variants[0].id);
          }
        }
      } catch (e) {
        console.error('Failed to load product:', e);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading Product Details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">This item may have been unpublished or removed.</p>
        <Link
          href="/products"
          className="inline-flex px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
        >
          Return to Catalogue
        </Link>
      </div>
    );
  }

  const selectedVariant = product.variants?.find((v: any) => v.id === selectedVariantId);
  const currentPrice = selectedVariant?.price
    ? Number(selectedVariant.price)
    : Number(product.salePrice || product.price);
  const originalPrice = product.salePrice ? Number(product.price) : null;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isOutOfStock = currentStock <= 0;
  const primaryImage = product.images?.[selectedImageIndex]?.url || product.images?.[0]?.url;

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      variantName: selectedVariant?.name,
      price: currentPrice,
      quantity,
      imageUrl: primaryImage,
      shopId: product.shop.id,
      shopName: product.shop.name,
      shopSlug: product.shop.slug,
      shopDeliveryFee: Number(product.shop.baseDeliveryFee || 0),
    });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setReviewMessage({ type: 'error', text: 'Please sign in to submit a review' });
      return;
    }

    setReviewSubmitting(true);
    setReviewMessage(null);

    try {
      const res = await fetch('/api/public/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setReviewMessage({ type: 'success', text: 'Thank you! Your verified review has been posted.' });
        setReviewComment('');
        // Add review locally
        setProduct((prev: any) => ({
          ...prev,
          reviews: [
            {
              id: data.review.id,
              rating: reviewRating,
              comment: reviewComment,
              isVerifiedPurchase: true,
              createdAt: new Date().toISOString(),
              customer: { name: user.name },
            },
            ...(prev.reviews || []),
          ],
        }));
      } else {
        setReviewMessage({ type: 'error', text: data.error || 'Failed to submit review' });
      }
    } catch {
      setReviewMessage({ type: 'error', text: 'Error connecting to server' });
    } finally {
      setReviewSubmitting(false);
    }
  };

  const productUrl = typeof window !== 'undefined' ? window.location.href : '';
  const whatsAppLink = product.shop.whatsappNumber
    ? buildProductWhatsAppLink({
        whatsappNumber: product.shop.whatsappNumber,
        shopName: product.shop.name,
        productName: product.name,
        priceFormatted: formatGhs(currentPrice),
        productUrl,
      })
    : null;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8 flex-wrap">
          <Link href="/" className="hover:text-indigo-600 transition">
            Mall Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/products" className="hover:text-indigo-600 transition">
            Catalogue
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/shops/${product.shop.slug}`} className="hover:text-indigo-600 transition">
            {product.shop.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-semibold truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* Main Product Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm mb-12">
          {/* Images Section (Left 6 Cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="relative aspect-square w-full rounded-3xl bg-slate-100 overflow-hidden border border-slate-100">
              {primaryImage ? (
                <img
                  src={primaryImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <Store className="w-20 h-20" />
                </div>
              )}

              {product.salePrice && (
                <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-rose-600 text-white text-xs font-black uppercase tracking-wider shadow">
                  Sale Offer
                </span>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
                {product.images.map((img: any, idx: number) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition ${
                      selectedImageIndex === idx
                        ? 'border-indigo-600 ring-2 ring-indigo-600/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details (Right 6 Cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Shop Badge */}
              <div className="flex items-center justify-between mb-3">
                <Link
                  href={`/shops/${product.shop.slug}`}
                  className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:underline"
                >
                  <Store className="w-4 h-4" />
                  <span>{product.shop.name}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                </Link>
                {product.brand && (
                  <span className="text-xs font-semibold text-slate-400">
                    Brand: <span className="text-slate-700">{product.brand}</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
                {product.name}
              </h1>

              {/* Price Display */}
              <div className="flex items-baseline gap-3 mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-3xl font-black text-slate-900">
                  {formatGhs(currentPrice)}
                </span>
                {originalPrice && (
                  <span className="text-base text-slate-400 line-through">
                    {formatGhs(originalPrice)}
                  </span>
                )}
                {product.salePrice && (
                  <span className="ml-auto text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    Special Promotion
                  </span>
                )}
              </div>

              {/* Variants Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Available Options / Variants:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v: any) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                          selectedVariantId === v.id
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {v.name} ({formatGhs(v.price)})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Status & Quantity */}
              <div className="mb-6 flex items-center gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Quantity:
                  </label>
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={isOutOfStock}
                      className="px-3 py-2 text-slate-600 hover:text-slate-900 font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 text-xs font-extrabold text-slate-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                      disabled={isOutOfStock || quantity >= currentStock}
                      className="px-3 py-2 text-slate-600 hover:text-slate-900 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Availability:
                  </span>
                  {isOutOfStock ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                      Out of Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      In Stock ({currentStock} available)
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Product Description:
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition ${
                    isOutOfStock
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25 hover:shadow-indigo-600/40'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Sold Out' : 'Add to Multi-Seller Cart'}</span>
                </button>

                {whatsAppLink && (
                  <a
                    href={whatsAppLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition flex items-center justify-center"
                    title="Direct WhatsApp Order or Inquiry"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </a>
                )}
              </div>

              {/* Delivery and Shop summary box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-900">
                    <Truck className="w-4 h-4 text-indigo-600" />
                    Base Fulfilment Charge
                  </span>
                  <span className="font-extrabold text-slate-900">
                    {formatGhs(product.shop.baseDeliveryFee)}
                  </span>
                </div>
                {product.shop.deliveryPolicy && (
                  <p className="text-slate-500">{product.shop.deliveryPolicy}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Verified Reviews Section */}
        <div className="rounded-3xl bg-white p-6 sm:p-10 border border-slate-200/90 shadow-sm mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Verified Customer Reviews
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Only customers with confirmed, paid orders can submit product feedback.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900">
                {product.reviews?.length > 0
                  ? (
                      product.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) /
                      product.reviews.length
                    ).toFixed(1)
                  : '0.0'}
              </span>
              <div className="flex items-center text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <span className="text-xs text-slate-400">({product.reviews?.length || 0} reviews)</span>
            </div>
          </div>

          {/* Leave a review form */}
          <div className="mb-10 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <h4 className="text-sm font-bold text-slate-900 mb-2">Write a Verified Review</h4>
            <p className="text-xs text-slate-500 mb-4">
              Have you purchased this item? Share your real experience to help other shoppers in the mall.
            </p>

            {reviewMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold mb-4 ${
                  reviewMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {reviewMessage.text}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Rating:</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className={`p-1.5 rounded-lg transition ${
                        reviewRating >= star ? 'text-amber-500' : 'text-slate-300'
                      }`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{reviewRating} Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Feedback:</label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Detail your product quality, delivery experience, or customer support..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
              >
                {reviewSubmitting ? 'Verifying & Submitting...' : 'Post Verified Review'}
              </button>
            </form>
          </div>

          {/* Reviews List */}
          {(!product.reviews || product.reviews.length === 0) ? (
            <p className="text-xs text-slate-400 italic text-center py-6">
              No customer reviews yet. Be the first verified purchaser to leave feedback!
            </p>
          ) : (
            <div className="space-y-4">
              {product.reviews.map((rev: any) => (
                <div key={rev.id} className="p-4 rounded-2xl border border-slate-100 bg-white space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      {rev.customer?.name || 'Customer'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating ? 'fill-amber-500' : 'text-slate-200'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Verified Purchase
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 pt-1 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-6">
              More From This Store or Category
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((rel: any) => (
                <div
                  key={rel.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-md transition"
                >
                  <Link href={`/products/${rel.slug}`}>
                    <div className="aspect-square rounded-xl bg-slate-100 overflow-hidden mb-3">
                      {rel.images?.[0]?.url && (
                        <img src={rel.images[0].url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <h5 className="font-bold text-xs text-slate-900 truncate">{rel.name}</h5>
                    <p className="text-xs font-black text-indigo-600 mt-1">{formatGhs(rel.price)}</p>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
