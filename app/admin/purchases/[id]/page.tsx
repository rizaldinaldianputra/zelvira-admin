'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PurchaseOrderService } from '@/services/purchase-order.service';
import { PurchaseOrder } from '@/types/purchase-order';
import { GoodsReceipt } from '@/types/goods-receipt';
import { useToast } from '@/hooks/use-toast';
import { formatRupiah } from '@/services/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  PackageCheck,
  Building2,
  Calendar,
  CreditCard,
  Layers,
  ShoppingBag,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PurchaseOrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const [po, setPo] = useState<PurchaseOrder | null>(null);
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);

  const loadPoData = async () => {
    try {
      setIsLoading(true);
      const [poData, receiptsData] = await Promise.all([
        PurchaseOrderService.getById(Number(id)),
        PurchaseOrderService.getReceipts(Number(id)),
      ]);
      setPo(poData);
      setReceipts(receiptsData || []);
    } catch (err: any) {
      toast({
        title: 'Gagal Memuat PO',
        description: err?.message || 'Data Purchase Order tidak ditemukan.',
        variant: 'destructive',
      });
      router.push('/admin/purchases');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPoData();
  }, [id]);

  const handleApprove = async () => {
    if (!po) return;
    if (!confirm(`Konfirmasi persetujuan Purchase Order ${po.poNumber}? Setelah di-approve, PO siap diproses untuk Goods Receipt (GR).`)) {
      return;
    }

    try {
      setIsApproving(true);
      const updated = await PurchaseOrderService.approve(po.id);
      setPo(updated);
      toast({
        title: 'PO Berhasil Disetujui!',
        description: `Workflow Camunda selesai. Status PO sekarang APPROVED.`,
      });
    } catch (err: any) {
      toast({
        title: 'Gagal Menyetujui PO',
        description: err?.message || 'Terjadi kesalahan saat memproses approval.',
        variant: 'destructive',
      });
    } finally {
      setIsApproving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
        <p className="text-sm text-slate-500">Memuat rincian Purchase Order...</p>
      </div>
    );
  }

  if (!po) return null;

  const isDraft = po.status === 'DRAFT';
  const isApproved = po.status === 'APPROVED';
  const isPartial = po.status === 'PARTIAL' || po.status === 'PARTIALLY_RECEIVED';
  const isCompleted = po.status === 'COMPLETED' || po.status === 'RECEIVED';
  const isCancelled = po.status === 'CANCELLED';

  const canReceiveGoods = isApproved || isPartial;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/purchases')}
            className="rounded-full bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/20 shadow-xs hover:bg-white/60 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {po.poNumber}
              </h1>
              {isDraft && <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">DRAFT</Badge>}
              {isApproved && <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold">APPROVED</Badge>}
              {isPartial && <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-bold">PARTIAL</Badge>}
              {isCompleted && <Badge variant="success" className="font-bold">COMPLETED</Badge>}
              {isCancelled && <Badge variant="destructive" className="font-bold">CANCELLED</Badge>}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Dibuat pada {po.createdAt ? new Date(po.createdAt).toLocaleDateString('id-ID', { dateStyle: 'full' }) : '-'} oleh {po.createdBy || 'Admin'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {canReceiveGoods && (
            <Button
              onClick={() => router.push(`/admin/receipts/new?poNumber=${encodeURIComponent(po.poNumber)}`)}
              className="rounded-full bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/20 gap-2"
            >
              <PackageCheck className="w-4 h-4" />
              Proses Penerimaan (GR)
            </Button>
          )}

          {isDraft && (
            <Button
              onClick={handleApprove}
              disabled={isApproving}
              className="rounded-full bg-linear-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-md shadow-pink-600/30 gap-2"
            >
              {isApproving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses Approval...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Purchase Order (Camunda)
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Camunda Workflow Banner */}
      {isDraft && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                Menunggu Persetujuan (Camunda BPM Task)
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                PO ini masih berstatus <strong>DRAFT</strong>. Silakan periksa rincian item di bawah, lalu klik tombol <strong>Approve Purchase Order</strong> untuk mengesahkan pengadaan.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleApprove}
            disabled={isApproving}
            className="rounded-full bg-amber-600 hover:bg-amber-700 text-white shrink-0"
          >
            Approve Sekarang
          </Button>
        </div>
      )}

      {isApproved && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-950 dark:text-blue-200">
              Purchase Order Telah Disetujui (APPROVED)
            </h4>
            <p className="text-xs text-blue-800 dark:text-blue-300 mt-0.5">
              Disetujui oleh <strong>{po.approvedBy || 'Admin'}</strong> pada{' '}
              {po.approvedAt ? new Date(po.approvedAt).toLocaleString('id-ID') : '-'}. Barang siap diterima di modul Goods Receipt.
            </p>
          </div>
        </div>
      )}

      {isPartial && (
        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shrink-0">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
              Penerimaan Barang Sebagian (PARTIAL)
            </h4>
            <p className="text-xs text-indigo-800 dark:text-indigo-300 mt-0.5">
              Sebagian item telah diterima di gudang ({po.totalReceivedQty} dari {po.totalOrderedQty} pcs). Sisa {po.totalOrderedQty - po.totalReceivedQty} pcs dapat diterima pada GR berikutnya.
            </p>
          </div>
        </div>
      )}

      {isCompleted && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
              Pengadaan Barang Selesai (COMPLETED)
            </h4>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
              Semua {po.totalOrderedQty} item pesanan telah lengkap diterima di gudang dan masuk ke inventaris stok.
            </p>
          </div>
        </div>
      )}

      {/* Grid: Profil Supplier & Metadata */}
      {/* Grid: Profil Supplier & Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/10">
            <Building2 className="w-4 h-4 text-pink-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
              Mitra Supplier
            </h3>
          </div>
          <div className="mt-4 space-y-2 text-xs">
            <div className="font-bold text-sm text-slate-900 dark:text-white">
              {po.supplierName}
            </div>
            <div className="text-slate-500 font-mono">Kode: {po.supplierCode || '-'}</div>
            {po.supplierPhone && (
              <div className="text-slate-600 dark:text-slate-400">Telp: {po.supplierPhone}</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/10">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
              Jadwal &amp; Pengiriman
            </h3>
          </div>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Tgl Order:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{po.orderDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Estimasi Tiba:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{po.expectedDeliveryDate || '-'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/10">
            <CreditCard className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
              Termin &amp; Pembayaran
            </h3>
          </div>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Termin:</span>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{po.paymentTerm}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status Bayar:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{po.paymentStatus}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/10">
            <Layers className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
              Ringkasan Nilai &amp; Progres
            </h3>
          </div>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Nilai PO:</span>
              <span className="font-mono font-bold text-pink-600">{formatRupiah(po.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Kemajuan Masuk:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {po.totalReceivedQty} / {po.totalOrderedQty} pcs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Tracking Item (Diterima vs Belum Diterima) */}
      <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden p-6 md:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-pink-600" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Status Penerimaan Fisik Barang ({po.items.length} Macam Produk)
            </h3>
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Total Masuk: <span className="text-pink-600 font-bold">{po.totalReceivedQty}</span> / {po.totalOrderedQty} pcs
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/10 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-8">#</th>
                <th className="py-3 px-4 min-w-[240px]">Produk / Varian</th>
                <th className="py-3 px-4 w-24 text-center">Dipesan</th>
                <th className="py-3 px-4 w-28 text-center text-emerald-600">Sudah Diterima</th>
                <th className="py-3 px-4 w-28 text-center text-amber-600">Belum Diterima</th>
                <th className="py-3 px-4 min-w-[160px]">Progress Penerimaan</th>
                <th className="py-3 px-4 w-32 text-right">Harga Satuan</th>
                <th className="py-3 px-4 w-36 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {po.items.map((item, idx) => {
                const received = item.receivedQuantity || 0;
                const remaining = Math.max(0, item.quantity - received);
                const percent = Math.min(100, Math.round((received / item.quantity) * 100));
                const isItemComplete = remaining === 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-400 font-bold">{idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{item.productName}</div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="font-mono">SKU: {item.sku}</span>
                        {item.color && <span>• {item.color}</span>}
                        {item.size && <span>• Size {item.size}</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-200">
                      {item.quantity} pcs
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                      {received} pcs
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-amber-600">
                      {remaining} pcs
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                          <span>{percent}%</span>
                          {isItemComplete ? (
                            <span className="text-emerald-600 font-bold">Lengkap</span>
                          ) : (
                            <span>Sisa {remaining}</span>
                          )}
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${isItemComplete ? 'bg-emerald-500' : percent > 0 ? 'bg-amber-500' : 'bg-slate-200'
                              }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                      {formatRupiah(item.unitCost)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      {formatRupiah(item.subtotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Ringkasan Nilai Total */}
        <div className="pt-6 border-t border-slate-100 dark:border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="text-xs text-slate-500 max-w-md">
            {po.notes && (
              <p>
                <strong>Catatan PO:</strong> {po.notes}
              </p>
            )}
          </div>

          <div className="w-full md:w-80 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatRupiah(po.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>PPN / Pajak:</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">{formatRupiah(po.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Biaya Ongkir:</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">{formatRupiah(po.shippingCost)}</span>
            </div>
            {po.discountAmount > 0 && (
              <div className="flex justify-between text-rose-500">
                <span>Diskon Supplier:</span>
                <span className="font-mono">- {formatRupiah(po.discountAmount)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between items-center text-sm">
              <span className="font-bold uppercase tracking-tight text-slate-900 dark:text-slate-100">Total PO:</span>
              <span className="text-lg font-black text-pink-600 font-mono">{formatRupiah(po.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Riwayat Goods Receipts (GR) */}
      <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm p-6 md:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Riwayat Penerimaan Barang Gudang (Goods Receipts - {receipts.length})
            </h3>
          </div>
          {canReceiveGoods && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/admin/receipts/new?poNumber=${encodeURIComponent(po.poNumber)}`)}
              className="rounded-full gap-1 text-xs"
            >
              <PackageCheck className="w-4 h-4 text-pink-600" /> Buat GR Baru
            </Button>
          )}
        </div>

        {receipts.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Belum ada surat penerimaan barang (GR) yang diterbitkan untuk Purchase Order ini.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {receipts.map((gr) => (
              <div
                key={gr.id}
                onClick={() => router.push(`/admin/receipts/${gr.id}`)}
                className="py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 px-3 rounded-xl cursor-pointer transition-colors"
              >
                <div>
                  <div className="font-mono font-bold text-sm text-pink-600 flex items-center gap-2">
                    {gr.receiptNumber}
                    <Badge variant={gr.status === 'APPROVED' ? 'success' : 'secondary'} className="text-[10px]">
                      {gr.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Tgl: {gr.receiptDate} {gr.doNumber && `• No Surat Jalan: ${gr.doNumber}`} • Diterima oleh {gr.receivedBy || 'Staff'}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{gr.totalReceivedQty} pcs</span>
                    <p className="text-[10px] text-slate-400">{gr.totalItems} baris item</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
