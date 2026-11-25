'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { HelpService, HelpArticle } from '@/services/help.service';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Hash } from 'lucide-react';
import { formatImageUrl } from '@/lib/url-utils';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

export function useSupportHelp() {
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const res = await HelpService.getAll(0, 100);
      setArticles(res.content || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch help articles',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const columns: ColumnDef<HelpArticle>[] = [
    {
      accessorKey: 'title',
      header: 'Article Details',
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-900 overflow-hidden border border-white/10 shadow-sm shrink-0 group">
            {row.original.imageUrl ? (
              <img src={formatImageUrl(row.original.imageUrl)} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-400">
                <BookOpen size={20} />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight italic line-clamp-1">{row.original.title}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic line-clamp-1">{row.original.subtitle}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <Badge variant="outline" className="rounded-full px-3 py-0.5 font-bold text-[9px] uppercase tracking-widest border-blue-200 text-blue-600 bg-blue-50/50">
          {row.original.category || 'Support'}
        </Badge>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status (Draft / Publish)',
      cell: ({ row }) => {
        const isPublished = !!row.original.isActive;
        return (
          <div className="flex items-center gap-3">
            <Switch
              checked={isPublished}
              onCheckedChange={() => handleToggleStatus(row.original)}
              aria-label="Toggle status Help Article"
            />
            <Badge
              variant={isPublished ? 'success' : 'secondary'}
              className="rounded-full px-3 py-0.5 font-bold text-[10px] tracking-wider uppercase"
            >
              {isPublished ? 'PUBLISH' : 'DRAFT'}
            </Badge>
          </div>
        );
      },
    },
  ];

  const handleAdd = () => router.push('/admin/support/help/new');
  const handleEdit = (article: HelpArticle) => router.push(`/admin/support/help/${article.id}`);
  
  const handleDelete = async (article: HelpArticle) => {
    if (confirm(`Are you sure you want to delete "${article.title}"?`)) {
      try {
        await HelpService.delete(article.id!);
        toast({ title: 'Success', description: 'Article deleted' });
        fetchArticles();
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete article', variant: 'destructive' });
      }
    }
  };

  const handleToggleStatus = async (article: HelpArticle) => {
    try {
      await HelpService.update(article.id!, { ...article, isActive: !article.isActive });
      toast({ title: 'Success', description: 'Status updated' });
      fetchArticles();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  return {
    articles,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
    fetchArticles,
  };
}
