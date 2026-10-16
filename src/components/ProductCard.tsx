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
    <div className="group rounded-xl sm:rounded-3xl bg-white border border-slate-200/90 hover:border-indigo-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-200 flex flex-col overflow-hidden">
      {/* Product Image Area - 4/5 portrait aspect like Likem Perfumery */}
      <Link href={`/products/${product.slug}`} className="relative aspect-[4/5] w-full bg-slate-100 block overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-100 to-indigo-50/40 text-slate-300">
            <Store className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.2]" />
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-1.5 z-10">
          {product.salePrice && (
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-rose-600 text-white text-[8px] sm:text-[11px] font-extrabold uppercase tracking-wider shadow">
              Sale
            </span>
          )}
          {isOutOfStock ? (
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-slate-800 text-slate-300 text-[8px] sm:text-[11px] font-bold shadow">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-amber-500 text-white text-[8px] sm:text-[11px] font-bold shadow">
              Only {product.stock} left
            </span>
          ) : null}
        </div>
      </Link>

      {/* Product Info - p-3 on mobile (Likem spec), p-5 on desktop */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Shop Badge */}
          <Link
            href={`/shops/${product.shop.slug}`}
            className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-1 transition"
          >
            <Store className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate max-w-[120px] sm:max-w-[180px]">{product.shop.name}</span>
          </Link>

          {/* Product Name */}
          <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 sm:line-clamp-2 group-hover:text-indigo-600 transition mb-1 sm:mb-2">
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
          </h4>
        </div>

        <div>
          {/* Price */}
          <div className="flex items-baseline gap-1.5 sm:gap-2 mb-2 sm:mb-4">
            <span className="text-sm sm:text-base font-extrabold text-slate-900">
              {formatGhs(numPrice)}
            </span>
            {originalPrice && (
              <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                {formatGhs(originalPrice)}
              </span>
            )}
          </div>

          {/* Actions - compact touch-friendly targets */}
          <div className="flex items-center gap-1.5 sm:gap-2 pt-1.5 sm:pt-2 border-t border-slate-100">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold min-h-[36px] sm:min-h-[40px] flex items-center justify-center gap-1 sm:gap-1.5 shadow-sm transition ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-500/20 active:scale-95'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
            </button>

            {whatsAppLink && (
              <a
                href={whatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 transition shrink-0"
                title="Direct WhatsApp Inquiry to Seller"
              >
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
            )}

            <Link
              href={`/products/${product.slug}`}
              className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition shrink-0"
              title="View Details"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
