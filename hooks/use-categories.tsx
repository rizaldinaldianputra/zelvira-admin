'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { CategoryService } from '@/services/category.service';
import { Category } from '@/types/category';
import { useToast } from '@/hooks/use-toast';
import { formatImageUrl } from '@/lib/url-utils';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await CategoryService.getAll();
      setCategories(res.content || (Array.isArray(res) ? res : []));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch categories',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: 'name',
      header: 'Category',
      cell: ({ row }) => {
        const imageUrl = row.original.imageUrl;
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 group">
              {imageUrl ? (
                <img 
                  src={formatImageUrl(imageUrl)} 
                  alt="" 
                  className="h-full w-full object-cover transition-transform group-hover:scale-110" 
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs font-bold uppercase">No Img</div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">{row.original.name}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Name',
      cell: ({ row }) => <span className="font-bold">{row.original.name}</span>,
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'pointsReward',
      header: 'Reward Poin',
      cell: ({ row }) => {
        const pts = row.original.pointsReward ?? 0;
        return (
          <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 px-2.5 py-1 rounded-full text-xs">
            ⭐ {pts} Pts / item
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

  const handleAdd = () => router.push('/admin/categories/new');
  const handleEdit = (category: Category) => router.push(`/admin/categories/${category.id}`);
  
  const handleDelete = async (category: Category) => {
    if (confirm(`Are you sure you want to delete ${category.name}?`)) {
      try {
        await CategoryService.delete(category.id);
        toast({ title: 'Success', description: 'Category deleted' });
        fetchCategories();
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete category', variant: 'destructive' });
      }
    }
  };

  const handleToggleStatus = async (category: Category) => {
    try {
      await CategoryService.update(category.id, { ...category, isActive: !category.isActive });
      toast({ title: 'Success', description: 'Status updated' });
      fetchCategories();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  return {
    categories,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
    fetchCategories,
  };
}
