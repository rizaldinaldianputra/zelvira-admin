'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { PurchaseOrderService } from '@/services/purchase-order.service';
import { PurchaseOrder, PurchaseOrderStats, PurchaseOrderStatus } from '@/types/purchase-order';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, Building2, PackageCheck } from 'lucide-react';

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val || 0);
};

export function usePurchases() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [stats, setStats] = useState<PurchaseOrderStats>({
    total: 0,
    draft: 0,
    ordered: 0,
    partiallyReceived: 0,
    received: 0,
    cancelled: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  const router = useRouter();
  const { toast } = useToast();
  const isMounted = useRef(false);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const [res, statsRes] = await Promise.all([
        PurchaseOrderService.getPurchaseOrders(0, 100),
        PurchaseOrderService.getStats(),
      ]);
      setOrders(res.content || []);
      if (statsRes) setStats(statsRes);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Gagal memuat Purchase Orders',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted.current) return;
    fetchOrders();
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const getStatusBadge = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="secondary">DRAF</Badge>;
      case 'ORDERED':
        return <Badge className="bg-blue-500/10 text-blue-600 border border-blue-200">MENUNGGU KIRIM</Badge>;
      case 'PARTIALLY_RECEIVED':
        return <Badge className="bg-amber-500/10 text-amber-600 border border-amber-200">SEBAGIAN DITERIMA</Badge>;
      case 'RECEIVED':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-200">LENGKAP</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">BATAL</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns: ColumnDef<PurchaseOrder>[] = [
    {
      accessorKey: 'poNumber',
      header: 'No. PO',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-pink-600 dark:text-pink-400 flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            {row.original.poNumber}
          </span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
            <Calendar className="h-3 w-3" /> {row.original.orderDate}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'supplierName',
      header: 'Supplier',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 dark:text-slate-100">{row.original.supplierName}</span>
          <span className="text-[11px] font-mono text-slate-400">{row.original.supplierCode || '-'}</span>
        </div>
      ),
    },
    {
      id: 'items_progress',
      header: 'Progres Penerimaan',
      cell: ({ row }) => {
        const po = row.original;
        const percent = po.totalOrderedQty > 0 ? Math.min(100, Math.round((po.totalReceivedQty / po.totalOrderedQty) * 100)) : 0;
        return (
          <div className="flex flex-col text-xs max-w-[140px]">
            <div className="flex justify-between text-[11px] text-slate-500 font-semibold mb-1">
              <span>{po.totalReceivedQty} / {po.totalOrderedQty} Pcs</span>
              <span>{percent}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  percent >= 100 ? 'bg-emerald-500' : percent > 0 ? 'bg-amber-500' : 'bg-slate-300'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total Nilai',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 dark:text-white">
            {formatRupiah(row.original.totalAmount)}
          </span>
          <span className="text-[10px] text-slate-400">
            Term: {row.original.paymentTerm || 'CASH'}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status PO',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Bayar',
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={`text-[10px] font-bold ${
            row.original.paymentStatus === 'PAID'
              ? 'border-emerald-300 text-emerald-600 bg-emerald-50/50'
              : row.original.paymentStatus === 'PARTIAL'
              ? 'border-amber-300 text-amber-600 bg-amber-50/50'
              : 'border-slate-300 text-slate-500'
          }`}
        >
          {row.original.paymentStatus === 'PAID'
            ? 'LUNAS'
            : row.original.paymentStatus === 'PARTIAL'
            ? 'SEBAGIAN'
            : 'BELUM'}
        </Badge>
      ),
    },
  ];

  const handleAdd = () => router.push('/admin/purchases/new');
  const handleView = (po: PurchaseOrder) => router.push(`/admin/purchases/${po.id}`);

  const handleDelete = async (po: PurchaseOrder) => {
    if (!confirm(`Hapus Purchase Order "${po.poNumber}"?`)) return;
    try {
      await PurchaseOrderService.delete(po.id);
      toast({ title: 'Sukses', description: `PO ${po.poNumber} berhasil dihapus.` });
      fetchOrders();
    } catch (error: any) {
      toast({
        title: 'Gagal Menghapus',
        description: error?.message || 'PO tidak dapat dihapus karena sudah ada penerimaan barang.',
        variant: 'destructive',
      });
    }
  };

  const handleOpenReceipt = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsReceiptOpen(true);
  };

  return {
    orders,
    stats,
    isLoading,
    columns,
    isCreateOpen,
    setIsCreateOpen,
    isReceiptOpen,
    setIsReceiptOpen,
    selectedPO,
    handleAdd,
    handleView,
    handleDelete,
    handleOpenReceipt,
    fetchOrders,
  };
}
