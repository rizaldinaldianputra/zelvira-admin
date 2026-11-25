'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  ShoppingBag,
  Building2,
  Calendar,
  AlertCircle,
  ArrowRight,
  Loader2,
  BadgeAlert,
  Boxes
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CrudTable } from '@/components/admin/crud-table';
import { PurchaseOrderService } from '@/services/purchase-order.service';
import { PurchaseOrder } from '@/types/purchase-order';
import { useToast } from '@/hooks/use-toast';
import { formatRupiah } from '@/services/utils';

export default function PurchaseTasksPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchPendingPurchases = async () => {
    try {
      setIsLoading(true);
      const res = await PurchaseOrderService.getAll(0, 100);
      const list = res.content || [];
      // Filter for orders that require approval (status DRAFT or PENDING)
      const pendingApproval = list.filter(
        (po) => po.status?.toUpperCase() === 'DRAFT' || po.status?.toUpperCase() === 'PENDING'
      );
      setPurchaseOrders(pendingApproval);
    } catch (err: any) {
      toast({
        title: 'Gagal Memuat Task',
        description: err?.message || 'Gagal memuat daftar Purchase Order menunggu approval.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPurchases();
  }, []);

  const handleApprove = async (po: PurchaseOrder) => {
    if (!confirm(`Setujui Purchase Order ${po.poNumber}? Setelah di-approve, pesanan siap diproses untuk penerimaan barang (Goods Receipt).`)) {
      return;
    }

    try {
      setProcessingId(po.id);
      await PurchaseOrderService.approve(po.id);
      toast({
        title: 'PO Berhasil Disetujui',
        description: `Purchase Order ${po.poNumber} telah disetujui (APPROVED).`,
      });
      fetchPendingPurchases();
    } catch (err: any) {
      toast({
        title: 'Gagal Menyetujui PO',
        description: err?.message || 'Terjadi kesalahan saat memproses approval PO.',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const columns: ColumnDef<PurchaseOrder>[] = useMemo(
    () => [
      {
        accessorKey: 'poNumber',
        header: 'Nomor PO & Status',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 dark:text-slate-100 font-mono text-sm">
              {row.original.poNumber}
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
              <BadgeAlert size={12} /> Menunggu Persetujuan
            </span>
          </div>
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
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                {row.original.supplierName || '-'}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                {row.original.supplierPhone || row.original.supplierCode || ''}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'items',
        header: 'Jumlah Item',
        cell: ({ row }) => {
          const count = row.original.items?.length || 0;
          const totalPcs = row.original.items?.reduce((sum, it) => sum + (it.quantity || 0), 0) || 0;
          return (
            <span className="inline-flex items-center gap-1.5 font-bold text-xs bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
              <Boxes size={12} className="text-slate-400" />
              {count} Varian ({totalPcs} pcs)
            </span>
          );
        },
      },
      {
        accessorKey: 'totalAmount',
        header: 'Total Nilai PO',
        cell: ({ row }) => (
          <span className="font-black text-slate-900 dark:text-slate-100 text-sm font-mono">
            {formatRupiah(row.original.totalAmount || 0)}
          </span>
        ),
      },
      {
        accessorKey: 'orderDate',
        header: 'Tanggal Dibuat',
        cell: ({ row }) => (
          <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <Calendar size={13} className="text-slate-400" />
            {row.original.orderDate
              ? new Date(row.original.orderDate).toLocaleDateString('id-ID', {
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
          const po = row.original;
          const isBusy = processingId === po.id;
          return (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                disabled={isBusy}
                onClick={() => handleApprove(po)}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 h-8 shadow-xs"
              >
                {isBusy ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                Approve PO
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/admin/purchases/${po.id}`)}
                className="rounded-xl border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs h-8 px-2.5"
                title="Buka Rincian PO"
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
          <div className="h-12 w-12 rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-inner">
            <FileCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              Purchase Order Tasks (Approval)
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Antrean Purchase Order berstatus DRAFT yang menunggu persetujuan manajerial sebelum diteruskan ke supplier.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link href="/admin/purchases">
            <Button variant="outline" size="sm" className="rounded-2xl border-slate-200 dark:border-white/10 gap-2">
              <ShoppingBag className="h-4 w-4" /> All Purchase Orders
            </Button>
          </Link>
          <Button
            onClick={fetchPendingPurchases}
            variant="outline"
            size="sm"
            className="rounded-2xl border-slate-200 dark:border-white/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
          Purchase Order yang di-approve akan otomatis berubah status menjadi <strong>APPROVED</strong> dan siap diterima di modul <strong>Goods Receipts</strong> untuk penambahan stok fisik secara otomatis.
        </p>
      </div>

      <CrudTable
        data={purchaseOrders}
        columns={columns}
        searchKey="poNumber"
        onView={(po) => router.push(`/admin/purchases/${po.id}`)}
        hasActions={false}
        isLoading={isLoading}
      />
    </div>
  );
}
