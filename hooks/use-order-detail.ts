'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { OrderService } from '@/services/order.service';
import { Order, OrderStatus } from '@/types/order';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle2, Package, Truck, XCircle, AlertCircle, RefreshCcw } from 'lucide-react';

export const ORDER_STATUS_CONFIG: Partial<Record<OrderStatus, { label: string, color: string, icon: any }>> = {
  PENDING: { label: 'Pending Payment', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  PAID: { label: 'Payment Received', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
  PROCESSING: { label: 'Processing', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: Clock },
  DELIVERING: { label: 'Delivering', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Truck },
  COMPLETED: { label: 'Completed', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400', icon: Package },
  CANCELLED: { label: 'Cancelled', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: XCircle },
  COMPLAINT: { label: 'Complaint', color: 'bg-amber-50 text-amber-600', icon: AlertCircle },
  RETURNED: { label: 'Returned', color: 'bg-slate-100 text-slate-600', icon: RefreshCcw },
};

export function useOrderDetail() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    if (params.id) {
      const fetchOrder = async () => {
        try {
          const data = await OrderService.getById(Number(params.id));
          setOrder(data);
        } catch {
          toast({ title: 'Error', description: 'Failed to fetch order details', variant: 'destructive' });
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrder();
    }
  }, [params.id]);

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!order) return;
    try {
      await OrderService.updateStatus(order.id, newStatus);
      setOrder({ ...order, status: newStatus });
      toast({ title: 'Success', description: `Order status updated to ${newStatus}` });
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const handleShipOrder = async () => {
    if (!order) return;
    if (!trackingNumber.trim()) {
      toast({ title: 'Error', description: 'Tracking number is required to ship the order', variant: 'destructive' });
      return;
    }
    
    try {
      await OrderService.addTrackingNumber(order.id, trackingNumber);
      await OrderService.updateStatus(order.id, 'DELIVERING');
      setOrder({ ...order, trackingNumber, status: 'DELIVERING' });
      toast({ title: 'Success', description: `Order shipped with tracking number ${trackingNumber}` });
      setTrackingNumber('');
    } catch {
      toast({ title: 'Error', description: 'Failed to ship order', variant: 'destructive' });
    }
  };

  const currentStatus = (order && ORDER_STATUS_CONFIG[order.status]) || { 
    label: 'Unknown', 
    color: 'bg-slate-100 text-slate-700', 
    icon: Package 
  };

  return {
    order,
    isLoading,
    trackingNumber,
    setTrackingNumber,
    currentStatus,
    handleUpdateStatus,
    handleShipOrder,
    router,
  };
}
