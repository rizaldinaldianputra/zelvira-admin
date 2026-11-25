'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { SupplierService } from '@/services/supplier.service';
import { Supplier, SupplierStats } from '@/types/supplier';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin, CreditCard } from 'lucide-react';

export function useSuppliers() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stats, setStats] = useState<SupplierStats>({ total: 0, active: 0, inactive: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const { toast } = useToast();
  const isMounted = useRef(false);

  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      const [res, statsRes] = await Promise.all([
        SupplierService.getSuppliers(0, 100),
        SupplierService.getStats(),
      ]);
      setSuppliers(res.content || []);
      if (statsRes) setStats(statsRes);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Gagal memuat data supplier',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted.current) return;
    fetchSuppliers();
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: 'code',
      header: 'Kode',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 px-2.5 py-1 rounded-md">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Supplier & PIC',
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-slate-100">{s.name}</span>
            {s.picName && (
              <span className="text-xs text-slate-500">PIC: {s.picName}</span>
            )}
          </div>
        );
      },
    },
    {
      id: 'contact',
      header: 'Kontak',
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="flex flex-col gap-0.5 text-xs text-slate-600 dark:text-slate-400">
            {s.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3 w-3 text-slate-400" /> {s.phone}
              </span>
            )}
            {s.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-3 w-3 text-slate-400" /> {s.email}
              </span>
            )}
            {!s.phone && !s.email && <span className="text-slate-400">-</span>}
          </div>
        );
      },
    },
    {
      accessorKey: 'city',
      header: 'Kota & Alamat',
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="flex flex-col text-xs max-w-[200px]">
            {s.city && (
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-rose-500" /> {s.city}
              </span>
            )}
            <span className="text-slate-500 truncate">{s.address || '-'}</span>
          </div>
        );
      },
    },
    {
      id: 'bank',
      header: 'Rekening Bank',
      cell: ({ row }) => {
        const s = row.original;
        return s.bankAccountNumber ? (
          <div className="flex flex-col text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <CreditCard className="h-3 w-3 text-slate-400" /> {s.bankName || 'Bank'}
            </span>
            <span className="font-mono text-slate-600 dark:text-slate-400">{s.bankAccountNumber}</span>
            {s.bankAccountHolder && (
              <span className="text-[11px] text-slate-400 truncate">a.n {s.bankAccountHolder}</span>
            )}
          </div>
        ) : (
          <span className="text-slate-400 text-xs italic">-</span>
        );
      },
    },
    {
      accessorKey: 'paymentTerm',
      header: 'Termin Bayar',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-[10px] border-slate-200">
          {row.original.paymentTerm || 'CASH'}
        </Badge>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'success' : 'secondary'}>
          {row.original.isActive ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ),
    },
  ];

  const handleAdd = () => {
    router.push('/admin/suppliers/new');
  };

  const handleEdit = (supplier: Supplier) => {
    router.push(`/admin/suppliers/${supplier.id}`);
  };

  const handleDelete = async (supplier: Supplier) => {
    if (confirm(`Apakah Anda yakin ingin menghapus supplier "${supplier.name}"?`)) {
      try {
        await SupplierService.delete(supplier.id);
        toast({ title: 'Sukses', description: `Supplier ${supplier.name} berhasil dihapus.` });
        fetchSuppliers();
      } catch (error: any) {
        toast({
          title: 'Gagal Menghapus',
          description: error?.message || 'Supplier tidak dapat dihapus karena masih terkait transaksi.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleToggleStatus = async (supplier: Supplier) => {
    try {
      await SupplierService.toggleStatus(supplier.id);
      toast({ title: 'Sukses', description: `Status ${supplier.name} diperbarui.` });
      fetchSuppliers();
    } catch (error: any) {
      toast({ title: 'Gagal', description: 'Gagal mengubah status supplier.', variant: 'destructive' });
    }
  };

  return {
    suppliers,
    stats,
    isLoading,
    columns,
    isDialogOpen,
    setIsDialogOpen,
    editingSupplier,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
    fetchSuppliers,
  };
}
