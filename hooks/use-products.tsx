'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { ProductService } from '@/services/product.service';
import { Product } from '@/types/product';
import { Category } from '@/types/category';
import { useToast } from '@/hooks/use-toast';
import { formatImageUrl } from '@/lib/url-utils';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pushModalOpen, setPushModalOpen] = useState(false);
  const [selectedProductToPush, setSelectedProductToPush] = useState<Product | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const isMounted = useRef(false);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await ProductService.getAll();
      setProducts(res.content || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch products', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted.current) return;
    fetchProducts();
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const handleToggleStatus = async (product: Product) => {
    try {
      const updatedProduct = { 
        ...product, 
        isActive: !product.isActive 
      };
      
      await ProductService.update(product.id, updatedProduct as any);
      
      toast({ 
        title: 'Status Updated', 
        description: `${product.name} is now ${!product.isActive ? 'Active' : 'Inactive'}` 
      });
      fetchProducts();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'name',
      header: 'Product',
      cell: ({ row }) => {
        const imageUrl = row.original.imageUrl || (row.original.images && row.original.images.length > 0 ? row.original.images[0] : null);
        const uniqueGroups = Array.from(new Set(row.original.variants?.map(v => v.groupName).filter(Boolean)));
        const variantCount = row.original.variants?.length || 0;
        
        return (
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 group">
              {imageUrl ? (
                <img src={formatImageUrl(imageUrl)} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-400 text-[10px] font-bold">No Img</div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-slate-100">{row.original.name}</span>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {(row.original.sku || (row.original.variants && row.original.variants.length > 0 && row.original.variants[0].sku)) && (
                  <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-bold border border-slate-200 dark:border-slate-700">
                    SKU: {row.original.sku || row.original.variants[0].sku}
                  </span>
                )}
                <span className="text-xs text-slate-500">{row.original.category?.name || 'Uncategorized'}</span>
                {uniqueGroups.length > 0 && (
                  <span className="text-[10px] bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400 font-bold px-1.5 py-0.5 rounded-md">
                    {uniqueGroups.join(', ')} ({variantCount} varian)
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => {
        const variants = row.original.variants || [];
        const prices = variants.map(v => Number(v.price) || 0).filter(p => p > 0);
        
        if (prices.length > 1) {
          const minP = Math.min(...prices);
          const maxP = Math.max(...prices);
          if (minP !== maxP) {
            return (
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  Rp {minP.toLocaleString()} - {maxP.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Rentang Varian</span>
              </div>
            );
          }
        }

        const price = prices[0] || row.original.price || 0;
        return <span className="font-bold text-slate-900 dark:text-slate-100">Rp {price.toLocaleString()}</span>;
      },
    },
    {
      accessorKey: 'qty',
      header: 'Stock',
      cell: ({ row }) => {
        const variants = row.original.variants || [];
        const stock = variants.length > 0
          ? variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)
          : (row.original.qty || 0);

        return (
          <div className="flex flex-col">
            <span className={`font-bold ${stock === 0 ? 'text-red-500' : stock < 10 ? 'text-amber-500' : 'text-slate-700 dark:text-slate-300'}`}>
              {stock} units
            </span>
            {variants.length > 0 && (
              <span className="text-[10px] text-slate-400">
                dari {variants.length} kombinasi
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${row.original.isActive
            ? 'bg-pink-100 text-pink-700'
            : 'bg-slate-100 text-slate-700'
          }`}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const handleAdd = () => router.push('/admin/products/new');
  const handleEdit = (product: Product) => router.push(`/admin/products/${product.id}`);

  const handleDelete = async (product: Product) => {
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      try {
        await ProductService.delete(product.id);
        toast({ title: 'Success', description: 'Product deleted' });
        fetchProducts();
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete product', variant: 'destructive' });
      }
    }
  };

  const handlePushToMarketplace = (product: Product) => {
    setSelectedProductToPush(product);
    setPushModalOpen(true);
  };

  const handleHistory = (product: Product) => {
    router.push(`/admin/stock?search=${encodeURIComponent(product.name)}`);
  };

  return {
    products,
    categories,
    isLoading,
    columns,
    pushModalOpen,
    setPushModalOpen,
    selectedProductToPush,
    handleAdd,
    handleEdit,
    handleToggleStatus,
    handleDelete,
    handlePushToMarketplace,
    handleHistory,
    fetchProducts,
  };
}
