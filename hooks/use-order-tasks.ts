'use client';

import { useEffect, useState, useRef } from 'react';
import { OrderWorkflowService } from '@/services/order-workflow.service';
import { OrderService } from '@/services/order.service';
import { WorkflowTask } from '@/types/order-workflow';
import { Order } from '@/types/order';
import { authService } from '@/services/auth.service';
import { useToast } from '@/hooks/use-toast';

export function useOrderTasks() {
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const isMounted = useRef(false);

  // Task & Order Detail Action State
  const [selectedTask, setSelectedTask] = useState<WorkflowTask | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const res = await OrderWorkflowService.getAdminTasks();
      setTasks(res || []);
      setUser(authService.getUser());
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch workflow tasks', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted.current) return;
    fetchTasks();
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const openTaskDetail = async (task: WorkflowTask) => {
    setSelectedTask(task);
    setTrackingNumber(task.variables?.trackingNumber || '');
    setResolutionNote('');
    setSelectedOrder(null);

    const orderId = task.variables?.orderId;
    if (orderId) {
      try {
        setIsLoadingOrder(true);
        const orderData = await OrderService.getOrderByIdUser(orderId);
        setSelectedOrder(orderData);
      } catch (e) {
        console.error('Failed to load full order detail', e);
      } finally {
        setIsLoadingOrder(false);
      }
    }
  };

  const closeTaskDetail = () => {
    setSelectedTask(null);
    setSelectedOrder(null);
    setTrackingNumber('');
    setResolutionNote('');
  };

  const handleApprove = async () => {
    if (!selectedTask) return;
    setIsProcessing(true);
    try {
      await OrderWorkflowService.completeTask(selectedTask.id, { isApproved: true });
      toast({ title: 'Berhasil', description: `Order #${selectedTask.variables?.orderNumber || ''} berhasil di-approve` });
      closeTaskDetail();
      fetchTasks();
    } catch (error: any) {
      toast({ title: 'Gagal', description: error?.message || 'Gagal approve order', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedTask) return;
    setIsProcessing(true);
    try {
      await OrderWorkflowService.completeTask(selectedTask.id, { isApproved: false });
      toast({ title: 'Berhasil', description: `Order #${selectedTask.variables?.orderNumber || ''} berhasil di-reject` });
      closeTaskDetail();
      fetchTasks();
    } catch (error: any) {
      toast({ title: 'Gagal', description: error?.message || 'Gagal reject order', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteShipment = async () => {
    if (!selectedTask || !trackingNumber.trim()) return;
    setIsProcessing(true);
    try {
      await OrderWorkflowService.completeTask(selectedTask.id, { trackingNumber: trackingNumber.trim() });
      toast({ title: 'Berhasil', description: 'Nomor resi pengiriman berhasil disimpan' });
      closeTaskDetail();
      fetchTasks();
    } catch (error: any) {
      toast({ title: 'Gagal', description: error?.message || 'Gagal memproses pengiriman', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolveComplaint = async () => {
    if (!selectedTask || !resolutionNote.trim()) return;
    setIsProcessing(true);
    try {
      await OrderWorkflowService.completeTask(selectedTask.id, { resolutionNote: resolutionNote.trim() });
      toast({ title: 'Berhasil', description: 'Komplain order berhasil diselesaikan' });
      closeTaskDetail();
      fetchTasks();
    } catch (error: any) {
      toast({ title: 'Gagal', description: error?.message || 'Gagal menyelesaikan komplain', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const q = search.toLowerCase();
    const taskName = (t.name || '').toLowerCase();
    const orderNumber = String(t.variables?.orderNumber || '').toLowerCase();
    const customer = String(t.variables?.customerName || t.variables?.customerUsername || '').toLowerCase();
    return taskName.includes(q) || orderNumber.includes(q) || customer.includes(q);
  });

  return {
    tasks,
    isLoading,
    search,
    setSearch,
    filteredTasks,
    selectedTask,
    selectedOrder,
    isLoadingOrder,
    trackingNumber,
    setTrackingNumber,
    resolutionNote,
    setResolutionNote,
    isProcessing,
    user,
    openTaskDetail,
    closeTaskDetail,
    handleApprove,
    handleReject,
    handleCompleteShipment,
    handleResolveComplaint,
    fetchTasks,
  };
}
