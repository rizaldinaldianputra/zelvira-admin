'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { VoucherService } from '@/services/voucher.service';
import { Voucher } from '@/types/voucher';
import { useToast } from '@/hooks/use-toast';

export function useVouchers() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const isMounted = useRef(false);

  const fetchVouchers = async () => {
    try {
      setIsLoading(true);
      const res = await VoucherService.getAll();
      setVouchers(res.content || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch vouchers', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted.current) return;
    fetchVouchers();
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const columns: ColumnDef<Voucher>[] = [
    {
      accessorKey: 'code',
      header: 'Voucher Code',
      cell: ({ row }) => <span className="font-bold tracking-wider text-pink-600 dark:text-pink-400">{row.original.code}</span>,
    },
    {
      accessorKey: 'discountAmount',
      header: 'Discount',
      cell: ({ row }) => <span>Rp {row.original.discountAmount.toLocaleString()}</span>,
    },
    {
      accessorKey: 'minPurchase',
      header: 'Min. Purchase',
      cell: ({ row }) => <span>Rp {row.original.minPurchase.toLocaleString()}</span>,
    },
    {
      accessorKey: 'validUntil',
      header: 'Expiry Date',
      cell: ({ row }) => <span>{row.original.validUntil ? new Date(row.original.validUntil).toLocaleDateString() : '-'}</span>,
    },
    {
      accessorKey: 'targetMembership',
      header: 'Target Membership',
      cell: ({ row }) => {
        const tier = row.original.targetMembership || 'ALL';
        let bg = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
        if (tier === 'GOLD') {
          bg = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        } else if (tier === 'PLATINUM') {
          bg = 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
        } else if (tier === 'BRONZE') {
          bg = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
        }
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${bg}`}>
            {tier}
          </span>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
          row.original.isActive 
            ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' 
            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
        }`}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const handleAdd = () => router.push('/admin/vouchers/new');
  const handleEdit = (voucher: Voucher) => router.push(`/admin/vouchers/${voucher.id}`);
  
  const handleDelete = async (voucher: Voucher) => {
    if (confirm(`Are you sure you want to delete voucher ${voucher.code}?`)) {
      try {
        await VoucherService.delete(voucher.id);
        toast({ title: 'Success', description: 'Voucher deleted' });
        fetchVouchers();
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete voucher', variant: 'destructive' });
      }
    }
  };

  const handleToggleStatus = async (voucher: Voucher) => {
    try {
      await VoucherService.update(voucher.id, { ...voucher, isActive: !voucher.isActive });
      toast({ title: 'Success', description: 'Status updated' });
      fetchVouchers();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  return {
    vouchers,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
    fetchVouchers,
  };
}
