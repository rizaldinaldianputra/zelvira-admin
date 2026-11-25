'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Calendar } from 'lucide-react';
import { FlashSaleService } from '@/services/flash-sale.service';
import { FlashSale } from '@/types/flash-sale';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';

export function useMobileFlashSales() {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const isMounted = useRef(false);

  const fetchFlashSales = async () => {
    try {
      setIsLoading(true);
      const response = await FlashSaleService.getByPlatform('MOBILE');
      setFlashSales(Array.isArray(response) ? response : (response as any).content || []);
    } catch {
      toast({ title: 'Error', description: 'Gagal memuat data flash sale', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted.current) return;
    fetchFlashSales();
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus flash sale ini?')) return;
    try {
      await FlashSaleService.delete(id);
      toast({ title: 'Berhasil', description: 'Flash sale dihapus' });
      fetchFlashSales();
    } catch {
      toast({ title: 'Error', description: 'Gagal menghapus', variant: 'destructive' });
    }
  };

  const handleToggleStatus = async (flashSale: FlashSale) => {
    try {
      await FlashSaleService.update(flashSale.id!, { ...flashSale, isActive: !flashSale.isActive });
      toast({ title: 'Berhasil', description: 'Status diupdate' });
      fetchFlashSales();
    } catch {
      toast({ title: 'Error', description: 'Gagal update status', variant: 'destructive' });
    }
  };

  const columns: ColumnDef<FlashSale>[] = [
    {
      accessorKey: 'name',
      header: 'Campaign Name',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 dark:text-white uppercase">{row.original.name}</span>
          <span className="text-[10px] text-slate-400">{row.original.items?.length || 0} produk terdaftar</span>
        </div>
      )
    },
    {
      accessorKey: 'startTime',
      header: 'Periode Mulai',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
          <Calendar className="h-3.5 w-3.5 text-pink-500" />
          {row.original.startTime ? new Date(row.original.startTime).toLocaleString('id-ID') : '-'}
        </div>
      )
    },
    {
      accessorKey: 'endTime',
      header: 'Periode Berakhir',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
          <Calendar className="h-3.5 w-3.5 text-rose-500" />
          {row.original.endTime ? new Date(row.original.endTime).toLocaleString('id-ID') : '-'}
        </div>
      )
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'pink' : 'secondary'} className="rounded-full uppercase text-[10px] px-3 font-bold tracking-widest">
          {row.original.isActive ? 'Aktif' : 'Nonaktif'}
        </Badge>
      )
    }
  ];

  const handleAdd = () => router.push('/admin/flash-sales/mobile/new');
  const handleEdit = (item: FlashSale) => router.push(`/admin/flash-sales/mobile/${item.id}`);

  return {
    flashSales,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete: (item: FlashSale) => handleDelete(item.id!),
    handleToggleStatus,
    fetchFlashSales,
  };
}
