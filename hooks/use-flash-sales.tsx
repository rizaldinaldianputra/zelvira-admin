'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Calendar } from 'lucide-react';
import { FlashSaleService, FlashSale } from '@/services/flash-sale.service';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';

export function useFlashSales() {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const isMounted = useRef(false);

  const fetchFlashSales = async () => {
    try {
      setIsLoading(true);
      const response = await FlashSaleService.getAll();
      setFlashSales((response as any).content || response);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch flash sales', variant: 'destructive' });
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
    if (!confirm('Are you sure you want to delete this flash sale?')) return;
    try {
      await FlashSaleService.delete(id);
      toast({ title: 'Success', description: 'Flash sale deleted' });
      fetchFlashSales();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete flash sale', variant: 'destructive' });
    }
  };

  const columns: ColumnDef<FlashSale>[] = [
    {
      accessorKey: 'name',
      header: 'Campaign Name',
      cell: ({ row }) => <span className="font-bold text-slate-900 group-hover:text-pink-600 transition-colors uppercase">{row.original.name}</span>
    },
    {
      accessorKey: 'startTime',
      header: 'Start Time',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500 font-bold">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(row.original.startTime).toLocaleString()}
        </div>
      )
    },
    {
      accessorKey: 'endTime',
      header: 'End Time',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500 font-bold">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(row.original.endTime).toLocaleString()}
        </div>
      )
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'pink' : 'secondary'} className="rounded-full uppercase text-[10px] px-3 font-bold tracking-widest">
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    }
  ];

  const handleToggleStatus = async (flashSale: FlashSale) => {
    try {
      await FlashSaleService.update(flashSale.id!, { ...flashSale, isActive: !flashSale.isActive });
      toast({ title: 'Success', description: 'Flash sale status updated' });
      fetchFlashSales();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const handleAdd = () => router.push('/admin/flash-sales/new');
  const handleEdit = (item: FlashSale) => router.push(`/admin/flash-sales/${item.id}`);

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
