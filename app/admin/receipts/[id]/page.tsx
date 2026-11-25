'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoodsReceiptService } from '@/services/goods-receipt.service';
import { GoodsReceipt } from '@/types/goods-receipt';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  PackageCheck,
  Building2,
  Calendar,
  FileText,
  Boxes,
  ExternalLink,
  Loader2,
  ShieldAlert
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function GoodsReceiptDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const [receipt, setReceipt] = useState<GoodsReceipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await GoodsReceiptService.getById(Number(id));
      setReceipt(data);
    } catch (err: any) {
      toast({
        title: 'Gagal Memuat GR',
        description: err?.message || 'Data Goods Receipt tidak ditemukan.',
        variant: 'destructive',
      });
      router.push('/admin/receipts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleApprove = async () => {
    if (!receipt) return;
    if (
      !confirm(
        `Konfirmasi persetujuan Goods Receipt ${receipt.receiptNumber}? Setelah di-approve, ${receipt.totalReceivedQty} pcs stok fisik akan resmi ditambahkan ke master produk dan status PO akan diperbarui.`
      )
    ) {
      return;
    }

    try {
      setIsApproving(true);
      const updated = await GoodsReceiptService.approve(receipt.id);
      setReceipt(updated);
      toast({
        title: 'Goods Receipt APPROVED!',
        description: `Stok gudang berhasil ditambahkan ke inventaris dan status Purchase Order diperbarui.`,
      });
    } catch (err: any) {
      toast({
        title: 'Gagal Menyetujui GR',
        description: err?.message || 'Terjadi kesalahan saat memproses approval penerimaan barang.',
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
        <p className="text-sm text-slate-500">Memuat rincian Goods Receipt...</p>
      </div>
    );
  }

  if (!receipt) return null;

  const isDraft = receipt.status === 'DRAFT';
  const isApproved = receipt.status === 'APPROVED';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/receipts')}
            className="rounded-full bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/20 shadow-xs hover:bg-white/60 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {receipt.receiptNumber}
              </h1>
              {isDraft && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                  DRAFT
                </Badge>
              )}
              {isApproved && (
                <Badge variant="success" className="font-bold">
                  APPROVED (STOK AKTIF)
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Diterima pada {receipt.receiptDate} oleh {receipt.receivedBy || 'Staff Gudang'}
            </p>
          </div>
        </div>

        {/* Action Button */}
        {isDraft && (
          <Button
            onClick={handleApprove}
            disabled={isApproving}
            className="rounded-full bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/20 gap-2"
          >
            {isApproving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memproses Mutasi Stok...
              </>
            ) : (
              <>
                <Boxes className="w-4 h-4" />
                Approve &amp; Tambah Stok Gudang
              </>
            )}
          </Button>
        )}
      </div>

      {/* Approval Status Banner */}
      {isDraft && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                Penerimaan Barang Berstatus DRAFT (Stok Belum Bertambah)
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                Pastikan kuantitas fisik telah dihitung dan diverifikasi sesuai Surat Jalan. Klik tombol <strong>Approve &amp; Tambah Stok Gudang</strong> untuk memasukkan {receipt.totalReceivedQty} pcs ke persediaan master produk.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleApprove}
            disabled={isApproving}
            className="rounded-full bg-amber-600 hover:bg-amber-700 text-white shrink-0 font-semibold"
          >
            Approve Sekarang
          </Button>
        </div>
      )}

      {isApproved && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
              Barang Telah Resmi Diterima &amp; Stok Gudang Telah Bertambah (APPROVED)
            </h4>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
              Disetujui oleh <strong>{receipt.approvedBy || 'Admin'}</strong> pada{' '}
              {receipt.approvedAt ? new Date(receipt.approvedAt).toLocaleString('id-ID') : '-'}. Mutasi stok telah dicatat pada riwayat kartu stok inventaris.
            </p>
          </div>
        </div>
      )}

      {/* Metadata Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/10">
            <Building2 className="w-4 h-4 text-pink-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
              Mitra Supplier
            </h3>
          </div>
          <div className="mt-4 space-y-1 text-xs">
            <div className="font-bold text-sm text-slate-900 dark:text-white">
              {receipt.supplierName}
            </div>
            <div className="text-slate-500 font-mono">Kode: {receipt.supplierCode || '-'}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/10">
            <FileText className="w-4 h-4 text-indigo-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
              Dokumen Pengadaan
            </h3>
          </div>
          <div className="mt-4 space-y-2 text-xs">
            {receipt.poNumber ? (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Nomor PO:</span>
                <span
                  onClick={() => router.push(`/admin/purchases/${receipt.purchaseOrderId}`)}
                  className="font-mono font-bold text-pink-600 hover:underline cursor-pointer flex items-center gap-1"
                >
                  {receipt.poNumber} <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            ) : (
              <div className="flex justify-between">
                <span className="text-slate-400">PO:</span>
                <span className="text-slate-400 italic">Penerimaan Langsung (Tanpa PO)</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Surat Jalan (DO):</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{receipt.doNumber || '-'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/10">
            <Calendar className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
              Waktu Penerimaan
            </h3>
          </div>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Tgl Penerimaan:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{receipt.receiptDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Diverifikasi Oleh:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{receipt.approvedBy || 'Menunggu Approval'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/10">
            <Boxes className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
              Total Barang Masuk
            </h3>
          </div>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Diterima Fisik:</span>
              <span className="font-black text-emerald-600 font-mono text-sm">{receipt.totalReceivedQty} pcs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ditolak / Retur:</span>
              <span className="font-bold text-rose-500 font-mono">{receipt.totalRejectedQty || 0} pcs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table of Items */}
      <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden p-6 md:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Daftar Barang Diterima ({receipt.items.length} Baris Produk)
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/10 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-8">#</th>
                <th className="py-3 px-4 min-w-[240px]">Produk &amp; Varian</th>
                <th className="py-3 px-4 w-32 text-center text-emerald-600">Qty Diterima</th>
                <th className="py-3 px-4 w-28 text-center text-rose-500">Qty Ditolak</th>
                <th className="py-3 px-4 min-w-[200px]">Catatan / Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {receipt.items.map((item, idx) => (
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
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-600 font-mono text-sm">
                    {item.quantityReceived} pcs
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-rose-500 font-mono">
                    {item.quantityRejected || 0} pcs
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    {item.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {receipt.notes && (
          <div className="pt-4 border-t border-slate-100 dark:border-white/10 text-xs text-slate-500">
            <strong>Catatan Dokumen:</strong> {receipt.notes}
          </div>
        )}
      </div>
    </div>
  );
}
