'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Calendar } from 'lucide-react';
import { NewsService, News } from '@/services/news.service';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/services/api.client';

export function useNews() {
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const isMounted = useRef(false);

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      const response = await NewsService.getAll();
      setNews((response as any).content || response);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch news', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted.current) return;
    fetchNews();
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await NewsService.delete(id);
      toast({ title: 'Success', description: 'Article deleted' });
      fetchNews();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete article', variant: 'destructive' });
    }
  };

  const columns: ColumnDef<News>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 group-hover:text-pink-600 transition-colors uppercase">{row.original.title}</span>
          <span className="text-[10px] text-slate-400 font-mono tracking-tight">/{row.original.slug}</span>
        </div>
      )
    },

    {
      accessorKey: 'targetUserId',
      header: 'Audience',
      cell: ({ row }) => (
        <Badge variant={row.original.targetUserId ? 'outline' : 'secondary'} className="rounded-full uppercase text-[10px] px-3 font-bold tracking-widest">
          {row.original.targetUserId ? 'Personal' : 'Public'}
        </Badge>
      )
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'pink' : 'secondary'} className="rounded-full uppercase text-[10px] px-3 font-bold tracking-widest">
          {row.original.isActive ? 'Published' : 'Hidden'}
        </Badge>
      )
    }
  ];

  const handleToggleStatus = async (item: News) => {
    try {
      await NewsService.update(item.id!, { ...item, isActive: !item.isActive });
      toast({ title: 'Success', description: 'Article status updated' });
      fetchNews();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const handleTestNotify = async (item: News) => {
    try {
      await apiClient.post(`/news/notify/${item.id}`, {});
      toast({ title: 'Success', description: 'Notification sent successfully' });
    } catch {
      toast({ title: 'Error', description: 'Failed to send notification', variant: 'destructive' });
    }
  };

  const handleAdd = () => router.push('/admin/news/new');
  const handleEdit = (item: News) => router.push(`/admin/news/${item.id}`);

  return {
    news,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete: (item: News) => handleDelete(item.id!),
    handleToggleStatus,
    handleTestNotify,
    fetchNews,
  };
}
