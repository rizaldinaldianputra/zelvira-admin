'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { GoodsReceiptService } from '@/services/goods-receipt.service';
import { GoodsReceipt } from '@/types/goods-receipt';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, Building2, PackageCheck } from 'lucide-react';

export function useReceipts() {
  const router = useRouter();
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<GoodsReceipt | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { toast } = useToast();
  const isMounted = useRef(false);

  const fetchReceipts = async () => {
    try {
      setIsLoading(true);
      const res = await GoodsReceiptService.getGoodsReceipts(0, 100);
      setReceipts(res.content || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Gagal memuat data penerimaan barang',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted.current) return;
    fetchReceipts();
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const columns: ColumnDef<GoodsReceipt>[] = [
    {
      accessorKey: 'receiptNumber',
      header: 'No. Penerimaan',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
            {row.original.receiptNumber}
          </span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
            <Calendar className="h-3 w-3" /> {row.original.receiptDate}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'poNumber',
      header: 'Referensi PO',
      cell: ({ row }) => {
        const poNum = row.original.poNumber;
        return poNum ? (
          <span className="font-bold text-xs text-pink-600 dark:text-pink-400 flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" /> {poNum}
          </span>
        ) : (
          <span className="text-xs text-slate-400 italic">Langsung</span>
        );
      },
    },
    {
      accessorKey: 'supplierName',
      header: 'Supplier',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
            {row.original.supplierName}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {row.original.supplierCode || '-'}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'doNumber',
      header: 'Surat Jalan (DO)',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
          {row.original.doNumber || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'receivedBy',
      header: 'Petugas',
      cell: ({ row }) => (
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {row.original.receivedBy || 'Staff Gudang'}
        </span>
      ),
    },
    {
      id: 'quantities',
      header: 'Kuantitas Masuk',
      cell: ({ row }) => {
        const gr = row.original;
        return (
          <div className="flex flex-col text-xs">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              +{gr.totalReceivedQty} Pcs
            </span>
            {gr.totalRejectedQty > 0 && (
              <span className="text-[11px] text-rose-500 font-semibold">
                {gr.totalRejectedQty} Ditolak
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant="outline" className="border-emerald-200 text-emerald-600 bg-emerald-50/50 text-[10px]">
          {row.original.status || 'COMPLETED'}
        </Badge>
      ),
    },
  ];

  const handleAdd = () => {
    router.push('/admin/receipts/new');
  };

  const handleView = (receipt: GoodsReceipt) => {
    router.push(`/admin/receipts/${receipt.id}`);
  };

  return {
    receipts,
    isLoading,
    columns,
    selectedReceipt,
    isDetailOpen,
    setIsDetailOpen,
    handleAdd,
    handleView,
    fetchReceipts,
  };
}
