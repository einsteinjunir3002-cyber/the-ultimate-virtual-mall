'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatGhs } from '@/lib/commission';
import { buildProductWhatsAppLink } from '@/lib/whatsapp';
import { ShoppingCart, MessageCircle, Store, Eye } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number | string;
    salePrice?: number | string | null;
    stock: number;
    lowStockThreshold?: number;
    images?: Array<{ url: string; altText?: string }>;
    shop: {
      id: string;
      name: string;
      slug: string;
      baseDeliveryFee?: number | string | null;
      whatsappNumber?: string | null;
      location?: string | null;
    };
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const numPrice = Number(product.salePrice || product.price);
  const originalPrice = product.salePrice ? Number(product.price) : null;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= (product.lowStockThreshold || 5);
  const primaryImage = product.images?.[0]?.url;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;

    addItem({
      productId: product.id,
      name: product.name,
      price: numPrice,
      quantity: 1,
      imageUrl: primaryImage,
      shopId: product.shop.id,
      shopName: product.shop.name,
      shopSlug: product.shop.slug,
      shopDeliveryFee: Number(product.shop.baseDeliveryFee || 0),
    });
  };

  const productUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/products/${product.slug}`
    : `/products/${product.slug}`;

  const whatsAppLink = product.shop.whatsappNumber
    ? buildProductWhatsAppLink({
        whatsappNumber: product.shop.whatsappNumber,
        shopName: product.shop.name,
        productName: product.name,
        priceFormatted: formatGhs(numPrice),
        productUrl,
      })
    : null;

  return (
    <div className="group rounded-3xl bg-white border border-slate-200/90 hover:border-indigo-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-200 flex flex-col overflow-hidden">
      {/* Product Image Area */}
      <Link href={`/products/${product.slug}`} className="relative aspect-square w-full bg-slate-100 block overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-100 to-indigo-50/40 text-slate-300">
            <Store className="w-12 h-12 stroke-[1.2]" />
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.salePrice && (
            <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow">
              Sale
            </span>
          )}
          {isOutOfStock ? (
            <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold shadow">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[11px] font-bold shadow">
              Only {product.stock} left
            </span>
          ) : null}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Shop Badge */}
          <Link
            href={`/shops/${product.shop.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-1.5 transition"
          >
            <Store className="w-3.5 h-3.5 text-indigo-500" />
            <span className="truncate max-w-[180px]">{product.shop.name}</span>
          </Link>

          {/* Product Name */}
          <h4 className="font-bold text-slate-900 text-sm line-clamp-2 group-hover:text-indigo-600 transition mb-2">
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
          </h4>
        </div>

        <div>
          {/* Price */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-base font-extrabold text-slate-900">
              {formatGhs(numPrice)}
            </span>
            {originalPrice && (
              <span className="text-xs text-slate-400 line-through">
                {formatGhs(originalPrice)}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-500/20'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
            </button>

            {whatsAppLink && (
              <a
                href={whatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 transition"
                title="Direct WhatsApp Inquiry to Seller"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}

            <Link
              href={`/products/${product.slug}`}
              className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
