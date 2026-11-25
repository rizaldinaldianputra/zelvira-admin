'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { OrderService } from '@/services/order.service';
import { MarketplaceService } from '@/services/marketplace.service';
import { Order, OrderStatus } from '@/types/order';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle2, Truck, XCircle, Package, AlertCircle, RefreshCcw } from 'lucide-react';

const STATUS_CONFIG: Partial<Record<OrderStatus, { label: string, color: string, icon: any }>> = {
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  PAID: { label: 'Paid', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
  PROCESSING: { label: 'Processing', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: Clock },
  DELIVERING: { label: 'Delivering', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Truck },
  COMPLETED: { label: 'Completed', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400', icon: Package },
  CANCELLED: { label: 'Cancelled', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: XCircle },
  COMPLAINT: { label: 'Complaint', color: 'bg-amber-50 text-amber-600', icon: AlertCircle },
  RETURNED: { label: 'Returned', color: 'bg-slate-100 text-slate-600', icon: RefreshCcw },
};

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const isMounted = useRef(false);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const [internalRes, tiktokRes] = await Promise.allSettled([
        OrderService.getAll(),
        MarketplaceService.getRemoteOrders('tiktok', 50),
      ]);

      let allOrders: any[] = [];

      if (internalRes.status === 'fulfilled') {
        const internalList = (internalRes.value?.content || []).map((o: any) => ({
          ...o,
          source: 'ZELVIRA',
        }));
        allOrders = [...allOrders, ...internalList];
      }

      if (tiktokRes.status === 'fulfilled' && tiktokRes.value?.orders) {
        const tiktokList = (tiktokRes.value.orders || []).map((o: any) => {
          const rawStatus = (o.orderStatus || o.status || 'PENDING').toUpperCase();
          let mappedStatus = 'PENDING';
          if (rawStatus === 'AWAITING_SHIPMENT') mappedStatus = 'PROCESSING';
          else if (rawStatus === 'COMPLETED') mappedStatus = 'COMPLETED';
          else if (rawStatus === 'IN_TRANSIT') mappedStatus = 'DELIVERING';
          else if (rawStatus === 'CANCELLED') mappedStatus = 'CANCELLED';

          return {
            id: o.id || o.marketplaceOrderId,
            orderNumber: o.marketplaceOrderId || o.id,
            createdAt: o.orderCreatedAt || (o.create_time ? new Date(o.create_time * 1000).toISOString() : new Date().toISOString()),
            totalAmount: o.totalAmount || o.total_amount || 0,
            status: mappedStatus,
            source: 'TIKTOK',
            rawTiktok: o,
          };
        });
        allOrders = [...allOrders, ...tiktokList];
      }

      // Sort by createdAt descending
      allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setOrders(allOrders);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch orders', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted.current) return;
    fetchOrders();
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'orderNumber',
      header: 'Order #',
      cell: ({ row }) => <span className="font-bold text-slate-900 dark:text-slate-100">{row.original.orderNumber}</span>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => <span>{row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : '-'}</span>,
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total',
      cell: ({ row }) => <span className="font-bold">Rp {(row.original.totalAmount || row.original.total || 0).toLocaleString()}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const config = STATUS_CONFIG[row.original.status] || STATUS_CONFIG.PENDING || { 
          label: 'Pending', 
          color: 'bg-amber-100 text-amber-700', 
          icon: Clock 
        };
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${config.color}`}>
            <config.icon className="h-3.5 w-3.5" />
            {config.label}
          </span>
        );
      },
    },
    {
      accessorKey: 'source',
      header: 'Platform',
      cell: ({ row }) => {
        const orderNum = String(row.original.orderNumber || '');
        const isInternal = orderNum.startsWith('ORD-') || (row.original as any).source === 'ZELVIRA';
        const isTiktok = !isInternal && ((row.original as any).source === 'TIKTOK' || (!orderNum.startsWith('ORD-') && /^\d{10,}$/.test(orderNum)));
        if (isTiktok) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900 text-white shadow-sm">
              TikTok Shop
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-100 text-pink-700">
            Zelvira Store
          </span>
        );
      },
    },
  ];

  const handleView = (order: Order) => {
    const orderNum = String(order.orderNumber || '');
    const isInternal = orderNum.startsWith('ORD-') || (order as any).source === 'ZELVIRA';
    if (!isInternal && (order as any).source === 'TIKTOK') {
      router.push('/admin/integrations/tiktok');
    } else {
      router.push(`/admin/orders/${order.id}`);
    }
  };

  return {
    orders,
    isLoading,
    columns,
    handleView,
    fetchOrders,
  };
}
