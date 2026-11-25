'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { PrivacyPolicyService, PrivacyPolicy } from '@/services/privacy.service';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

export function useSupportPrivacy() {
  const [policies, setPolicies] = useState<PrivacyPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const fetchPolicies = async () => {
    try {
      setIsLoading(true);
      const res = await PrivacyPolicyService.getAll(0, 100);
      setPolicies(res.content || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch privacy policies',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const columns: ColumnDef<PrivacyPolicy>[] = [
    {
      accessorKey: 'title',
      header: 'Policy Title',
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm border border-white/20 ${row.original.isActive ? 'bg-pink-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
            <ShieldCheck size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight italic">{row.original.title}</span>
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">Version: {row.original.id}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last Updated',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-widest">
          <Calendar size={12} className="text-pink-500" />
          {row.original.updatedAt ? new Date(row.original.updatedAt).toLocaleDateString() : 'N/A'}
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
              aria-label="Toggle status Privacy Policy"
            />
            <Badge
              variant={isPublished ? 'pink' : 'secondary'}
              className="rounded-full px-3 py-0.5 font-bold text-[10px] tracking-wider uppercase"
            >
              {isPublished ? 'PUBLISH' : 'DRAFT'}
            </Badge>
          </div>
        );
      },
    },
  ];

  const handleAdd = () => router.push('/admin/support/privacy/new');
  const handleEdit = (policy: PrivacyPolicy) => router.push(`/admin/support/privacy/${policy.id}`);
  
  const handleDelete = async (policy: PrivacyPolicy) => {
    if (confirm(`Are you sure you want to delete "${policy.title}"?`)) {
      try {
        await PrivacyPolicyService.delete(policy.id!);
        toast({ title: 'Success', description: 'Policy deleted' });
        fetchPolicies();
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete policy', variant: 'destructive' });
      }
    }
  };

  const handleToggleStatus = async (policy: PrivacyPolicy) => {
    try {
      await PrivacyPolicyService.update(policy.id!, { ...policy, isActive: !policy.isActive });
      toast({ title: 'Success', description: 'Status updated' });
      fetchPolicies();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  return {
    policies,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
    fetchPolicies,
  };
}
