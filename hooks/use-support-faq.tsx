'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { FaqService, Faq } from '@/services/faq.service';
import { useToast } from '@/hooks/use-toast';
import { HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

export function useSupportFaq() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const fetchFaqs = async () => {
    try {
      setIsLoading(true);
      const res = await FaqService.getAll(0, 100);
      const content = res.content || [];
      setFaqs(content.sort((a: any, b: any) => (a.id || 0) - (b.id || 0)));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch FAQs',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const columns: ColumnDef<Faq>[] = [
    {
      accessorKey: 'question',
      header: 'Question & Category',
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm border border-white/20 ${row.original.isActive ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
            <HelpCircle size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight italic line-clamp-1">{row.original.question}</span>
            <span className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">{row.original.category || 'General'}</span>
          </div>
        </div>
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
              aria-label="Toggle status FAQ"
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

  const handleAdd = () => router.push('/admin/support/faq/new');
  const handleEdit = (faq: Faq) => router.push(`/admin/support/faq/${faq.id}`);
  
  const handleDelete = async (faq: Faq) => {
    if (confirm(`Are you sure you want to delete this FAQ?`)) {
      try {
        await FaqService.delete(faq.id!);
        toast({ title: 'Success', description: 'FAQ deleted' });
        fetchFaqs();
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete FAQ', variant: 'destructive' });
      }
    }
  };

  const handleToggleStatus = async (faq: Faq) => {
    try {
      await FaqService.update(faq.id!, { ...faq, isActive: !faq.isActive });
      toast({ title: 'Success', description: 'Status updated' });
      fetchFaqs();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  return {
    faqs,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
    fetchFaqs,
  };
}
