'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { digitalProductService, DigitalProduct, DigitalCategory, DigitalProductConfig } from '@/services/digital-product.service';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Smartphone, Zap, Gamepad, CreditCard, Radio, Shield, Droplets, Tv, PhoneCall, Flame, Banknote } from 'lucide-react';

export function useDigitalProducts() {
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [categories, setCategories] = useState<DigitalCategory[]>([]);
  const [config, setConfig] = useState<DigitalProductConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [togglingProductId, setTogglingProductId] = useState<number | null>(null);
  const [togglingCategoryId, setTogglingCategoryId] = useState<number | null>(null);
  const { toast } = useToast();
  const isMounted = useRef(false);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await digitalProductService.getAllProducts(undefined, true);
      setProducts(res);
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal mengambil data produk digital', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const res = await digitalProductService.getCategoriesList();
      setCategories(res);
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal mengambil daftar kategori digital', variant: 'destructive' });
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchConfig = async () => {
    try {
      setIsLoadingConfig(true);
      const res = await digitalProductService.getConfig();
      setConfig(res);
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal mengambil konfigurasi master produk digital', variant: 'destructive' });
    } finally {
      setIsLoadingConfig(false);
    }
  };

  useEffect(() => {
    if (isMounted.current) return;
    fetchProducts();
    fetchCategories();
    fetchConfig();
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const handleUpdateConfig = async (data: Partial<DigitalProductConfig>) => {
    try {
      setIsSavingConfig(true);
      const updated = await digitalProductService.updateConfig(data);
      setConfig(updated);
      toast({
        title: 'Pengaturan Disimpan',
        description: 'Pengaturan master produk digital mobile berhasil diperbarui.',
      });
      return true;
    } catch (error) {
      toast({
        title: 'Gagal',
        description: 'Gagal memperbarui pengaturan master produk digital.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleToggleProduct = async (id: number, currentStatus: boolean) => {
    setTogglingProductId(id);
    const newStatus = !currentStatus;
    try {
      await digitalProductService.toggleProductStatus(id, newStatus);
      setProducts(prev =>
        prev.map(p => (p.id === id ? { ...p, isActive: newStatus } : p))
      );
      toast({
        title: 'Status Diperbarui',
        description: `Produk berhasil di-${newStatus ? 'aktifkan' : 'nonaktifkan'}.`,
      });
    } catch (error) {
      toast({
        title: 'Gagal',
        description: 'Gagal memperbarui status produk.',
        variant: 'destructive',
      });
    } finally {
      setTogglingProductId(null);
    }
  };

  const handleToggleCategory = async (id: number, currentStatus: boolean) => {
    setTogglingCategoryId(id);
    const newStatus = !currentStatus;
    try {
      const updatedCat = await digitalCategoryServiceToggle(id, newStatus);
      setCategories(prev =>
        prev.map(c => (c.id === id ? { ...c, isActive: newStatus } : c))
      );
      // Refresh products to reflect changed category products
      await fetchProducts();
      await fetchConfig();
      toast({
        title: 'Kategori Diperbarui',
        description: `Kategori ${updatedCat.name || ''} berhasil di-${newStatus ? 'aktifkan' : 'nonaktifkan'}.`,
      });
    } catch (error) {
      toast({
        title: 'Gagal',
        description: 'Gagal memperbarui status kategori.',
        variant: 'destructive',
      });
    } finally {
      setTogglingCategoryId(null);
    }
  };

  const digitalCategoryServiceToggle = async (id: number, active: boolean) => {
    return await digitalProductService.toggleCategoryStatus(id, active);
  };

  const handleUpdateCategory = async (id: number, data: Partial<DigitalCategory>) => {
    try {
      const updatedCat = await digitalProductService.updateCategory(id, data);
      setCategories(prev =>
        prev.map(c => (c.id === id ? { ...c, ...updatedCat } : c))
      );
      if (data.isActive !== undefined) {
        await fetchProducts();
        await fetchConfig();
      }
      toast({
        title: 'Kategori Disimpan',
        description: `Pengaturan kategori ${updatedCat.name || ''} berhasil diperbarui.`,
      });
      return true;
    } catch (error) {
      toast({
        title: 'Gagal',
        description: 'Gagal memperbarui kategori digital.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleSyncProducts = async (type: 'prepaid' | 'pasca' | 'all') => {
    setIsSyncing(type);
    toast({ title: 'Syncing...', description: `Sedang membersihkan data lama & mengambil data ${type} dari Digiflazz...` });
    try {
      const res = await digitalProductService.syncProducts(type);
      toast({ title: 'Berhasil', description: res.message || `Data ${type} berhasil disinkronisasi!` });
      await fetchProducts();
      await fetchCategories();
      await fetchConfig();
    } catch (error) {
      toast({ title: 'Error', description: `Gagal sinkronisasi produk ${type}`, variant: 'destructive' });
    } finally {
      setIsSyncing(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('pulsa') || cat.includes('data')) return <Smartphone className="h-4 w-4" />;
    if (cat.includes('pln') || cat.includes('listrik')) return <Zap className="h-4 w-4" />;
    if (cat.includes('game') || cat.includes('voucher')) return <Gamepad className="h-4 w-4" />;
    if (cat.includes('bpjs')) return <Shield className="h-4 w-4" />;
    if (cat.includes('pdam') || cat.includes('air')) return <Droplets className="h-4 w-4" />;
    if (cat.includes('tv') || cat.includes('internet')) return <Tv className="h-4 w-4" />;
    if (cat.includes('gas')) return <Flame className="h-4 w-4" />;
    if (cat.includes('finance')) return <Banknote className="h-4 w-4" />;
    return <CreditCard className="h-4 w-4" />;
  };

  const columns: ColumnDef<DigitalProduct>[] = [
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
          {row.original.buyerSkuCode || row.original.sku}
        </span>
      ),
    },
    {
      accessorKey: 'productName',
      header: 'Product Name',
      cell: ({ row }) => (
        <div className="font-medium max-w-xs truncate" title={row.original.productName}>
          {row.original.productName}
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          {getCategoryIcon(row.original.category)}
          <span>{row.original.category}</span>
        </div>
      ),
    },
    {
      accessorKey: 'brand',
      header: 'Brand',
      cell: ({ row }) => <span>{row.original.brand}</span>,
    },
    {
      accessorKey: 'price',
      header: 'Price / Fee',
      cell: ({ row }) => (
        <div className="font-medium text-emerald-600 dark:text-emerald-400">
          Rp {row.original.price?.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status & Aksi',
      cell: ({ row }) => {
        const isActive = row.original.isActive !== false;
        const isToggling = togglingProductId === row.original.id;
        return (
          <div className="flex items-center gap-3">
            <Switch
              checked={isActive}
              disabled={isToggling}
              onCheckedChange={() => handleToggleProduct(row.original.id, isActive)}
              aria-label="Toggle status produk"
            />
            <Badge variant={isActive ? 'success' : 'secondary'} className="text-[11px] font-medium">
              {isActive ? 'Aktif' : 'Nonaktif'}
            </Badge>
          </div>
        );
      },
    },
  ];

  return {
    products,
    categories,
    config,
    isLoading,
    isLoadingCategories,
    isLoadingConfig,
    isSavingConfig,
    isSyncing,
    columns,
    togglingCategoryId,
    handleSyncProducts,
    handleToggleCategory,
    handleUpdateCategory,
    handleToggleProduct,
    handleUpdateConfig,
    fetchProducts,
    fetchCategories,
    fetchConfig,
  };
}
