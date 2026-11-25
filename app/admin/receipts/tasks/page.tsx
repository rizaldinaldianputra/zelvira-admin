'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import {
  PackageCheck,
  CheckCircle2,
  Eye,
  RefreshCw,
  Building2,
  Calendar,
  AlertCircle,
  Loader2,
  Boxes,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CrudTable } from '@/components/admin/crud-table';
import { GoodsReceiptService } from '@/services/goods-receipt.service';
import { GoodsReceipt } from '@/types/goods-receipt';
import { useToast } from '@/hooks/use-toast';

export default function GoodsReceivedTasksPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchPendingReceipts = async () => {
    try {
      setIsLoading(true);
      const res = await GoodsReceiptService.getGoodsReceipts(0, 100);
      const list = res.content || [];
      // Filter for Goods Receipts that need verification and approval (status DRAFT or PENDING)
      const pendingApproval = list.filter(
        (gr) => gr.status?.toUpperCase() === 'DRAFT' || gr.status?.toUpperCase() === 'PENDING'
      );
      setReceipts(pendingApproval);
    } catch (err: any) {
      toast({
        title: 'Gagal Memuat Task',
        description: err?.message || 'Gagal memuat daftar Goods Receipt menunggu verifikasi.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingReceipts();
  }, []);

  const handleApprove = async (gr: GoodsReceipt) => {
    if (
      !confirm(
        `Konfirmasi persetujuan Goods Receipt #${gr.receiptNumber}? Tindakan ini akan langsung MEMUTASI STOK (menambah stok fisik varian ke gudang) dan mengupdate status PO.`
      )
    ) {
      return;
    }

    try {
      setProcessingId(gr.id);
      await GoodsReceiptService.approve(gr.id);
      toast({
        title: 'Goods Receipt Disetujui',
        description: `Penerimaan #${gr.receiptNumber} berhasil di-approve & stok fisik telah bertambah di gudang.`,
      });
      fetchPendingReceipts();
    } catch (err: any) {
      toast({
        title: 'Gagal Menyetujui Goods Receipt',
        description: err?.message || 'Terjadi kesalahan saat memproses approval Goods Receipt.',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const columns: ColumnDef<GoodsReceipt>[] = useMemo(
    () => [
      {
        accessorKey: 'receiptNumber',
        header: 'Nomor Penerimaan (GR)',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 dark:text-slate-100 font-mono text-sm">
              {row.original.receiptNumber}
            </span>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider mt-0.5">
              Menunggu Approval Stok
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'poNumber',
        header: 'Referensi PO',
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
            {row.original.poNumber || (row.original.purchaseOrderId ? `#PO-${row.original.purchaseOrderId}` : '-')}
          </span>
        ),
      },
      {
        accessorKey: 'supplierName',
        header: 'Supplier',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
              <Building2 size={13} />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
              {row.original.supplierName || '-'}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'items',
        header: 'Jumlah Diterima',
        cell: ({ row }) => {
          const count = row.original.items?.length || 0;
          const totalQty = row.original.items?.reduce((sum, it) => sum + (it.quantityReceived || 0), 0) || 0;
          return (
            <span className="inline-flex items-center gap-1.5 font-bold text-xs bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
              <Boxes size={12} className="text-slate-400" />
              {count} Varian ({totalQty} pcs)
            </span>
          );
        },
      },
      {
        accessorKey: 'receiptDate',
        header: 'Tanggal Diterima',
        cell: ({ row }) => (
          <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <Calendar size={13} className="text-slate-400" />
            {row.original.receiptDate
              ? new Date(row.original.receiptDate).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : '-'}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Aksi Approval',
        cell: ({ row }) => {
          const gr = row.original;
          const isBusy = processingId === gr.id;
          return (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                disabled={isBusy}
                onClick={() => handleApprove(gr)}
                className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs gap-1.5 h-8 shadow-xs"
              >
                {isBusy ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                Approve &amp; Mutasi Stok
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/admin/receipts/${gr.id}`)}
                className="rounded-xl border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs h-8 px-2.5"
                title="Buka Rincian Penerimaan"
              >
                <Eye size={14} />
              </Button>
            </div>
          );
        },
      },
    ],
    [processingId, router]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-3xl bg-teal-500/10 flex items-center justify-center text-teal-600 shadow-inner">
            <PackageCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              Goods Received Tasks (Approval)
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Antrean verifikasi fisik barang masuk dari supplier yang siap disetujui untuk penambahan otomatis ke stok gudang.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link href="/admin/receipts">
            <Button variant="outline" size="sm" className="rounded-2xl border-slate-200 dark:border-white/10 gap-2">
              <FileText className="h-4 w-4" /> All Goods Receipts
            </Button>
          </Link>
          <Button
            onClick={fetchPendingReceipts}
            variant="outline"
            size="sm"
            className="rounded-2xl border-slate-200 dark:border-white/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-3xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/40 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <p className="text-xs text-teal-900 dark:text-teal-200 leading-relaxed font-medium">
          Ketika Anda mengeklik <strong>Approve &amp; Mutasi Stok</strong>, sistem akan mencatat transaksi penambahan stok otomatis (Stock Addition) untuk setiap varian produk yang diterima dan memperbarui status Purchase Order terkait.
        </p>
      </div>

      <CrudTable
        data={receipts}
        columns={columns}
        searchKey="receiptNumber"
        onView={(gr) => router.push(`/admin/receipts/${gr.id}`)}
        hasActions={false}
        isLoading={isLoading}
      />
    </div>
  );
}
