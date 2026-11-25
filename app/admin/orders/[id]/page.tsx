'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Printer,
  Truck,
  CreditCard,
  User,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Package,
  XCircle,
  AlertCircle,
  RefreshCcw,
  Phone,
  FileText,
  Building2,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOrderDetail, ORDER_STATUS_CONFIG } from '@/hooks/use-order-detail';
import { formatRupiah } from '@/services/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { order, isLoading, currentStatus } = useOrderDetail();

  // Print mode: null | 'invoice' | 'shipping-label'
  const [printMode, setPrintMode] = useState<'invoice' | 'shipping-label' | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-3">
        <div className="w-8 h-8 border-3 border-pink-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Memuat rincian pesanan...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-24 space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Pesanan Tidak Ditemukan</h2>
        <p className="text-xs text-slate-400">Order ID #{resolvedParams.id} tidak ditemukan di sistem.</p>
        <Button onClick={() => router.push('/admin/orders')} variant="outline" className="rounded-xl">
          Kembali ke Semua Pesanan
        </Button>
      </div>
    );
  }

  const items = order.items || [];
  const subtotalItems = items.reduce((sum, item: any) => sum + (Number(item.price || 0) * Number(item.quantity || item.qty || 1)), 0);
  const shippingCost = Number(order.shippingAmount || 0);
  const discountAmount = Number((order as any).voucherDiscountAmount || (order as any).pointsDiscountAmount || (order as any).discountAmount || 0);
  const totalAmount = Number(order.totalAmount || order.total || (subtotalItems + shippingCost - discountAmount));

  const handlePrint = (mode: 'invoice' | 'shipping-label') => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    : '-';

  return (
    <>
      {/* ============================================================== */}
      {/* SCREEN UI VIEW (Hidden during print) */}
      {/* ============================================================== */}
      <div className="max-w-6xl mx-auto space-y-6 pb-20 print:hidden animate-in fade-in duration-500">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push('/admin/orders')}
              className="rounded-2xl border-slate-200 dark:border-white/10 shrink-0 h-10 w-10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                  Order #{order.orderNumber || order.id}
                </h1>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs shadow-xs ${currentStatus.color}`}>
                  <currentStatus.icon className="h-3.5 w-3.5" />
                  {currentStatus.label}
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Dipesan pada {formattedDate}
              </p>
            </div>
          </div>

          {/* Action Buttons: ONLY Print Invoice & Print Label Kurir */}
          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => handlePrint('shipping-label')}
              variant="outline"
              className="rounded-2xl border-slate-200 dark:border-white/10 gap-2 font-bold text-xs h-10 px-4 hover:border-slate-300"
            >
              <Truck className="h-4 w-4 text-indigo-500" />
              Print Label Kurir
            </Button>

            <Button
              onClick={() => handlePrint('invoice')}
              className="rounded-2xl bg-linear-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-md shadow-pink-600/20 gap-2 font-bold text-xs h-10 px-4"
            >
              <Printer className="h-4 w-4" />
              Print Invoice
            </Button>
          </div>
        </div>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Penerima & Pengiriman */}
          <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                <MapPin className="w-4 h-4 text-pink-600" /> Informasi Pengiriman
              </div>
              <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                Logistik
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Nama Penerima:</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {order.shippingRecipient || (order.shippingAddress?.recipientName) || 'Pembeli Zelvira'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Nomor Telepon:</span>
                <p className="font-mono text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {order.shippingPhone || (order.shippingAddress?.phone) || '-'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Alamat Lengkap:</span>
                <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                  {typeof order.shippingAddress === 'string'
                    ? order.shippingAddress
                    : (order.shippingAddress?.fullAddress || order.shippingAddress?.addressLine || 'Alamat tidak tersedia')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-slate-400 font-medium">Ekspedisi:</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 uppercase">
                    {order.shippingService || order.courier || 'Kurir Reguler'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Nomor Resi / AWB:</span>
                  <p className="font-mono font-bold text-pink-600 mt-0.5">
                    {order.trackingNumber || 'Belum Ada Resi'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Pembayaran & Biaya */}
          <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                <CreditCard className="w-4 h-4 text-emerald-600" /> Rincian Pembayaran
              </div>
              <Badge variant="outline" className="text-[10px] uppercase font-mono border-emerald-300 text-emerald-600">
                {order.paymentMethod || 'Online'}
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Metode Pembayaran:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase font-mono">
                  {order.paymentMethod || 'Payment Gateway'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Subtotal Item ({items.length} macam produk):</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {formatRupiah(subtotalItems)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Biaya Pengiriman (Ongkir):</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {formatRupiah(shippingCost)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between items-center py-1 text-rose-500">
                  <span>Diskon / Potongan Voucher:</span>
                  <span className="font-mono font-bold">- {formatRupiah(discountAmount)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-between items-center">
                <span className="text-sm font-bold uppercase tracking-tight text-slate-800 dark:text-slate-200">
                  Total Nilai Transaksi:
                </span>
                <span className="text-2xl font-black text-pink-600 font-mono">
                  {formatRupiah(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Table of Items */}
        <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xs overflow-hidden">
          <div className="p-6 pb-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-pink-600" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                Daftar Produk Pesanan ({items.length} Item)
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Total Kuantitas: <strong>{items.reduce((s, it: any) => s + (it.quantity || it.qty || 1), 0)} pcs</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-slate-400 font-semibold border-b border-slate-100 dark:border-white/5">
                <tr>
                  <th className="py-3 px-6 min-w-[280px]">Nama Produk</th>
                  <th className="py-3 px-4 w-32">Varian</th>
                  <th className="py-3 px-4 w-32 text-right">Harga Satuan</th>
                  <th className="py-3 px-4 w-24 text-center">Jumlah</th>
                  <th className="py-3 px-6 w-36 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {items.map((item: any, idx: number) => {
                  const qty = item.quantity || item.qty || 1;
                  const price = Number(item.price || 0);
                  const subtotal = qty * price;

                  return (
                    <tr key={item.id || idx} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                            {item.imageUrl || item.img ? (
                              <img
                                src={item.imageUrl || item.img}
                                alt={item.productName || item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-slate-300" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                              {item.productName || item.name || 'Produk Zelvira'}
                            </p>
                            {item.groupName && (
                              <p className="text-[11px] text-slate-400">{item.groupName}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {item.size && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              Size: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-pink-50 dark:bg-pink-950/40 text-pink-600 border border-pink-200 dark:border-pink-900/40">
                              {item.color}
                            </span>
                          )}
                          {!item.size && !item.color && (
                            <span className="text-slate-400 italic text-[11px]">Standar</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right font-mono text-slate-700 dark:text-slate-300 font-semibold">
                        {formatRupiah(price)}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200">
                          {qty}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatRupiah(subtotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* PRINT-ONLY INVOICE TEMPLATE (A4 format) */}
      {/* ============================================================== */}
      {printMode === 'invoice' && (
        <div className="hidden print:block text-black bg-white p-8 max-w-[210mm] mx-auto text-xs leading-normal">
          {/* Invoice Header */}
          <div className="flex justify-between items-start pb-6 border-b-2 border-slate-900">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">ZELVIRA FASHION</h1>
              <p className="text-[11px] text-slate-600 mt-1">Official E-Commerce Store &amp; Apparel</p>
              <p className="text-[11px] text-slate-500">Website: https://zelvira.my.id | CS: +62 812-3456-7890</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold uppercase tracking-wider text-pink-600 font-mono">FAKTUR / INVOICE</h2>
              <p className="text-sm font-mono font-bold text-slate-800 mt-1">No: {order.orderNumber || order.id}</p>
              <p className="text-slate-500 text-[11px] mt-0.5">Tanggal: {formattedDate}</p>
              <p className="text-slate-500 text-[11px]">Status: <strong>{order.status}</strong></p>
            </div>
          </div>

          {/* Customer & Shipping Summary */}
          <div className="grid grid-cols-2 gap-8 my-6">
            <div className="p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Ditujukan Kepada (Penerima):</span>
              <p className="font-bold text-sm text-slate-900">{order.shippingRecipient || (order.shippingAddress?.recipientName) || 'Pembeli'}</p>
              <p className="text-slate-600 mt-0.5">Telp: {order.shippingPhone || (order.shippingAddress?.phone) || '-'}</p>
              <p className="text-slate-700 mt-1 leading-relaxed">
                {typeof order.shippingAddress === 'string'
                  ? order.shippingAddress
                  : (order.shippingAddress?.fullAddress || order.shippingAddress?.addressLine || '-')}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Pengiriman &amp; Pembayaran:</span>
              <p className="text-slate-700">Kurir / Layanan: <strong>{order.shippingService || order.courier || 'Reguler'}</strong></p>
              <p className="text-slate-700 mt-0.5">No. Resi: <strong className="font-mono">{order.trackingNumber || 'Dalam Proses'}</strong></p>
              <p className="text-slate-700 mt-0.5">Metode Bayar: <strong className="uppercase">{order.paymentMethod || 'Online'}</strong></p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left my-4 border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 bg-slate-50 text-slate-700 font-bold">
                <th className="py-2.5 px-3">No</th>
                <th className="py-2.5 px-3">Deskripsi Produk</th>
                <th className="py-2.5 px-3">Varian</th>
                <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item: any, idx: number) => {
                const qty = item.quantity || item.qty || 1;
                const price = Number(item.price || 0);
                return (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{item.productName || item.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{item.size ? `Size: ${item.size}` : ''} {item.color ? `| ${item.color}` : ''}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{formatRupiah(price)}</td>
                    <td className="py-2.5 px-3 text-center font-bold">{qty}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">{formatRupiah(qty * price)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Financial Breakdown */}
          <div className="flex justify-end mt-6">
            <div className="w-72 space-y-2 border-t border-slate-200 pt-3">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Produk:</span>
                <span className="font-mono">{formatRupiah(subtotalItems)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Ongkos Kirim:</span>
                <span className="font-mono">{formatRupiah(shippingCost)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Diskon:</span>
                  <span className="font-mono">- {formatRupiah(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-slate-900 border-t-2 border-slate-900 pt-2">
                <span>Total Bayar:</span>
                <span className="font-mono">{formatRupiah(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-12 pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400">
            <p>Terima kasih telah berbelanja di Zelvira Fashion. Bukti pembayaran ini sah dan diterbitkan secara elektronik oleh sistem.</p>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PRINT-ONLY COURIER SHIPPING LABEL (Thermal 100x150mm format) */}
      {/* ============================================================== */}
      {printMode === 'shipping-label' && (
        <div className="hidden print:block text-black bg-white p-6 max-w-[100mm] mx-auto border-2 border-dashed border-black font-sans text-xs">
          {/* Header Courier */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-600">JASA PENGIRIMAN:</span>
              <h2 className="text-xl font-black tracking-wider uppercase font-mono">
                {order.shippingService || order.courier || 'STANDARD'}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase px-2 py-1 bg-black text-white rounded">
                NON-COD
              </span>
            </div>
          </div>

          {/* Barcode Simulation & Tracking Number */}
          <div className="py-4 text-center border-b-2 border-black space-y-1">
            <div className="h-10 w-full flex items-center justify-center gap-1 overflow-hidden">
              {Array.from({ length: 45 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-full inline-block bg-black ${i % 3 === 0 ? 'w-1' : i % 2 === 0 ? 'w-0.5' : 'w-1.5'}`}
                />
              ))}
            </div>
            <p className="font-mono font-black text-sm tracking-widest uppercase">
              {order.trackingNumber || order.orderNumber || order.id}
            </p>
            <p className="text-[10px] text-slate-600 font-mono">Order ID: #{order.orderNumber || order.id}</p>
          </div>

          {/* Recipient Details */}
          <div className="py-3 border-b-2 border-black space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-600 block">PENERIMA (TO):</span>
            <p className="font-bold text-sm uppercase text-black">
              {order.shippingRecipient || (order.shippingAddress?.recipientName) || 'Pembeli'}
            </p>
            <p className="font-bold text-xs">{order.shippingPhone || (order.shippingAddress?.phone) || '-'}</p>
            <p className="text-xs leading-snug text-slate-900 mt-1 font-medium">
              {typeof order.shippingAddress === 'string'
                ? order.shippingAddress
                : (order.shippingAddress?.fullAddress || order.shippingAddress?.addressLine || '-')}
            </p>
          </div>

          {/* Sender Details */}
          <div className="py-2.5 border-b-2 border-black text-[11px] space-y-0.5">
            <span className="text-[9px] font-bold uppercase text-slate-600 block">PENGIRIM (FROM):</span>
            <p className="font-bold uppercase">Zelvira Fashion Store</p>
            <p>Telp: +62 812-3456-7890 | Kota Bandung, Jawa Barat</p>
          </div>

          {/* Items Manifest */}
          <div className="pt-2 text-[10px]">
            <span className="font-bold uppercase text-slate-600 block mb-1">DAFTAR ISI PAKET ({items.length} ITEM):</span>
            <ul className="space-y-1 list-disc pl-3">
              {items.map((it: any, i: number) => (
                <li key={i}>
                  <strong>{it.productName || it.name}</strong> ({it.size ? `${it.size}, ` : ''}{it.color ? `${it.color}, ` : ''}Qty: {it.quantity || it.qty || 1} pcs)
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
