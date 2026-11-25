'use client';

import React, { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { ProductService } from '@/services/product.service';
import { Product } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { formatImageUrl } from '@/lib/url-utils';

export function useStock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await ProductService.getAll(0, 100);
      setProducts(res.content || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch stock data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'name',
      header: 'Master Product',
      cell: ({ row }) => {
        const product = row.original;
        const imageUrl = product.imageUrl || (product.images?.[0]);
        const fullImageUrl = formatImageUrl(imageUrl);
        
        return (
          <div className="flex items-center gap-4 py-1">
            <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-white/10 shrink-0">
              {fullImageUrl ? (
                <img src={fullImageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-300"><Package size={20} /></div>
              )}
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{product.name}</div>
              <div className="text-[10px] font-bold text-slate-400 mt-0.5">{product.category?.name || 'Category'}</div>
            </div>
          </div>
        );
      }
    },
    {
      id: 'variants_count',
      header: 'Variants',
      cell: ({ row }) => <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{row.original.variants?.length || 0} Variants</span>
    },
    {
      id: 'total_stock',
      header: 'Total Stock',
      cell: ({ row }) => {
        const totalStock = row.original.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
        return (
          <div className="flex flex-col">
            <span className={`text-lg font-bold ${totalStock < 10 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
              {totalStock}
            </span>
          </div>
        );
      }
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${row.original.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  const handleManage = (product: Product) => {
    router.push(`/admin/stock/${product.id}`);
  };

  return {
    products,
    isLoading,
    columns,
    handleManage,
    fetchProducts,
  };
}
