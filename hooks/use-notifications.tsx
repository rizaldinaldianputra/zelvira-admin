'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, User, Globe } from 'lucide-react';
import { NotificationService, NotificationHistory } from '@/services/notification.service';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await NotificationService.getAll();
      setNotifications(response.data || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch notifications', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleClear = async () => {
    if (!confirm('Are you sure you want to clear your notification history?')) return;
    try {
      await NotificationService.clearAll();
      toast({ title: 'Success', description: 'Notification history cleared' });
      fetchNotifications();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to clear history', variant: 'destructive' });
    }
  };

  const columns: ColumnDef<NotificationHistory>[] = [
    {
      accessorKey: 'title',
      header: 'Notification',
      cell: ({ row }) => (
        <div className="flex flex-col max-w-[300px]">
          <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">{row.original.title}</span>
          <span className="text-xs text-slate-500 line-clamp-1">{row.original.body}</span>
        </div>
      )
    },
    {
      accessorKey: 'userId',
      header: 'Target',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.userId ? (
            <Badge variant="secondary" className="gap-1 rounded-full font-bold uppercase text-[10px]">
              <User className="h-3 w-3" />
              UID: {row.original.userId}
            </Badge>
          ) : (
            <Badge variant="pink" className="gap-1 rounded-full font-bold uppercase text-[10px]">
              <Globe className="h-3 w-3" />
              GLOBAL
            </Badge>
          )}
        </div>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Sent At',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(row.original.createdAt).toLocaleString()}
        </div>
      )
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline" className="rounded-full font-black uppercase text-[9px] tracking-widest px-2">
          {row.original.type || 'SYSTEM'}
        </Badge>
      )
    }
  ];

  const handleAdd = () => {
    router.push('/admin/notifications/new');
  };

  return {
    notifications,
    isLoading,
    columns,
    handleAdd,
    handleClear,
    fetchNotifications,
  };
}
