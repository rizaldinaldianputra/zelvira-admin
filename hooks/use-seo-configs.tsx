'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SeoService, SeoConfig } from '@/services/seo.service';
import { useToast } from '@/hooks/use-toast';
import { ColumnDef } from '@tanstack/react-table';

export function useSeoConfigs() {
  const [configs, setConfigs] = useState<SeoConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const loadConfigs = async () => {
    setIsLoading(true);
    try {
      const data = await SeoService.getAll();
      const allConfigs = Array.isArray(data) ? data : (data as any)?.content || [];
      setConfigs(allConfigs);
    } catch {
      toast({ title: 'Error', description: 'Failed to load SEO configs', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const handleAdd = () => {
    router.push('/admin/settings/seo/new');
  };

  const handleEdit = (config: SeoConfig) => {
    if (config.id) {
      router.push(`/admin/settings/seo/${config.id}`);
    }
  };

  const handleDelete = async (config: SeoConfig) => {
    if (!config.id) return;
    if (!confirm('Are you sure you want to delete this SEO config?')) return;
    try {
      await SeoService.delete(config.id);
      toast({ title: 'Success', description: 'SEO config deleted' });
      loadConfigs();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete config', variant: 'destructive' });
    }
  };

  const columns: ColumnDef<SeoConfig>[] = [
    {
      accessorKey: 'pageName',
      header: 'Page Identifier',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-black uppercase tracking-widest text-pink-700 bg-pink-100 dark:bg-pink-900/30 dark:text-pink-400 px-2.5 py-1 rounded-md w-fit">
            {row.original.pageName}
          </span>
          {row.original.metaTitle && (
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[280px]">
              {row.original.metaTitle}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'targetType',
      header: 'Placement',
      cell: ({ row }) => {
        const isHead = (row.original.targetType || 'HEAD') === 'HEAD';
        return (
          <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
            isHead 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' 
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
          }`}>
            {isHead ? 'HEAD (<head>)' : 'BODY (<body>)'}
          </span>
        );
      },
    },
    {
      accessorKey: 'scriptCode',
      header: 'Tracking Script / Meta Snippet',
      cell: ({ row }) => (
        <span className="text-xs text-slate-500 font-mono italic truncate max-w-[320px] block">
          {row.original.scriptCode ? `${row.original.scriptCode.substring(0, 60)}...` : <span className="text-slate-400">Tidak ada script code</span>}
        </span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.original.isActive !== false;
        return (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            isActive
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
              : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}>
            {isActive ? 'Aktif' : 'Nonaktif'}
          </span>
        );
      },
    },
  ];

  return {
    configs,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    loadConfigs,
  };
}
