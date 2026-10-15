import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatGhs } from '@/lib/commission';
import { buildShopWhatsAppLink } from '@/lib/whatsapp';
import {
  CheckCircle2,
  Clock,
  Store,
  MapPin,
  Truck,
  MessageCircle,
  Package,
  Phone,
  ShieldCheck,
} from 'lucide-react';

export default async function OrderDetailPage(props: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await props.params;

  const order = await prisma.parentOrder.findUnique({
    where: { orderNumber },
    include: {
      sellerOrders: {
        include: {
          shop: {
            select: {
              id: true,
              name: true,
              slug: true,
              phone: true,
              whatsappNumber: true,
              location: true,
            },
          },
          items: true,
        },
      },
      paymentTransactions: true,
    },
  });

  if (!order) {
    notFound();
  }

  const isPaid = order.paymentStatus === 'PAID';
  const address = order.deliveryAddress as any;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Status Header */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-8 shadow-sm mb-8 text-center sm:text-left sm:flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
              }`}
            >
              {isPaid ? <CheckCircle2 className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                Official Order Receipt
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Order #{order.orderNumber}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-1.5">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isPaid
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              Payment: {order.paymentStatus}
            </span>
            <span className="text-xl font-black text-slate-900">
              {formatGhs(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Delivery Address & Customer Details */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-6 shadow-sm mb-8">
          <h3 className="font-extrabold text-sm text-slate-900 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <span>Delivery Destination (Ghana)</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
            <div>
              <p className="font-bold text-slate-900">{address.fullName}</p>
              <p className="mt-1">{address.streetAddress}</p>
              <p>
                {address.city}, {address.region} Region
              </p>
              {address.digitalAddress && (
                <p className="font-semibold text-indigo-600 mt-1">
                  GPS: {address.digitalAddress}
                </p>
              )}
            </div>
            <div>
              <p>
                <span className="font-semibold text-slate-700">Phone:</span> {address.phone}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Email:</span>{' '}
                {order.guestEmail || 'Registered Account'}
              </p>
              {address.deliveryNotes && (
                <p className="mt-2 text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  Note: {address.deliveryNotes}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Separated Suborders per Merchant */}
        <div className="space-y-6 mb-12">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Independent Seller Fulfilment Details
          </h2>

          {order.sellerOrders.map((subOrder) => {
            const whatsAppLink = subOrder.shop.whatsappNumber
              ? buildShopWhatsAppLink({
                  whatsappNumber: subOrder.shop.whatsappNumber,
                  shopName: subOrder.shop.name,
                  shopUrl: `https://theultimatemall.com/shops/${subOrder.shop.slug}`,
                })
              : null;

            return (
              <div
                key={subOrder.id}
                className="rounded-3xl bg-white border border-slate-200/90 p-6 shadow-sm"
              >
                {/* Suborder Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-indigo-600" />
                      <Link
                        href={`/shops/${subOrder.shop.slug}`}
                        className="font-extrabold text-sm text-slate-900 hover:text-indigo-600 transition"
                      >
                        {subOrder.shop.name}
                      </Link>
                      <span className="text-[11px] text-slate-400">({subOrder.subOrderNumber})</span>
                    </div>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      Seller Location: {subOrder.shop.location}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Status: {subOrder.status}
                    </span>

                    {whatsAppLink && (
                      <a
                        href={whatsAppLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                        title="Chat with Merchant on WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Items in this suborder */}
                <div className="space-y-3 mb-4">
                  {subOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                          {item.productImage ? (
                            <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.productName}</p>
                          <p className="text-slate-400 text-[11px]">Qty: {item.quantity}</p>
                        </div>
                      </div>

                      <span className="font-black text-slate-900">{formatGhs(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                {/* Tracking & Courier Notes */}
                {(subOrder.courierName || subOrder.trackingNumber) && (
                  <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-slate-700 mb-3 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>
                      Courier: <strong>{subOrder.courierName || 'Assigned Courier'}</strong> • Tracking
                      Ref: <strong>{subOrder.trackingNumber}</strong>
                    </span>
                  </div>
                )}

                {/* Suborder Subtotal & Delivery Fee */}
                <div className="pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
                  <span>
                    Items: {formatGhs(subOrder.itemsTotal)} + Delivery:{' '}
                    {formatGhs(subOrder.deliveryFee)}
                  </span>
                  <span className="font-black text-slate-900">
                    Seller Subtotal:{' '}
                    {formatGhs(Number(subOrder.itemsTotal) + Number(subOrder.deliveryFee))}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Back to Mall Button */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
          >
            Continue Shopping at The Ultimate Mall
          </Link>
        </div>
      </div>
    </div>
  );
}
