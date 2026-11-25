'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Truck,
  CreditCard,
  User,
  MapPin,
  Calendar,
  Package,
  Phone,
  ClipboardList,
  AlertCircle,
  Clock,
  Layers,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { OrderWorkflowService, WorkflowTask } from '@/services/order-workflow.service';
import { OrderService } from '@/services/order.service';
import { Order } from '@/types/order';
import { useToast } from '@/hooks/use-toast';
import { formatRupiah } from '@/services/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderTaskDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const [task, setTask] = useState<WorkflowTask | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Field states for shipment or complaint tasks
  const [trackingNumber, setTrackingNumber] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');

  useEffect(() => {
    const fetchTaskAndOrder = async () => {
      try {
        setIsLoading(true);
        const tasks = await OrderWorkflowService.getAdminTasks();
        const foundTask = tasks.find((t) => String(t.id) === String(id));

        if (!foundTask) {
          toast({
            title: 'Task Tidak Ditemukan',
            description: `Tugas ID #${id} sudah selesai atau tidak tersedia lagi.`,
            variant: 'destructive',
          });
          router.push('/admin/orders/tasks');
          return;
        }

        setTask(foundTask);
        setTrackingNumber(foundTask.variables?.trackingNumber || '');

        const orderId = foundTask.variables?.orderId;
        if (orderId) {
          try {
            const orderData = await OrderService.getOrderByIdUser(orderId);
            setOrder(orderData);
          } catch (err) {
            console.error('Failed to load full order for task', err);
          }
        }
      } catch (err: any) {
        toast({
          title: 'Gagal Memuat Task',
          description: err?.message || 'Terjadi kesalahan saat memuat antrean workflow.',
          variant: 'destructive',
        });
        router.push('/admin/orders/tasks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskAndOrder();
  }, [id, router]);

  const handleApprove = async () => {
    if (!task) return;
    try {
      setIsProcessing(true);
      await OrderWorkflowService.completeTask(task.id, { isApproved: true });
      toast({
        title: 'Order Disetujui (Approved)',
        description: `Order #${task.variables?.orderNumber || ''} berhasil diverifikasi dan disetujui.`,
      });
      router.push('/admin/orders/tasks');
    } catch (err: any) {
      toast({
        title: 'Gagal Approve',
        description: err?.message || 'Terjadi kesalahan saat menyetujui order.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!task) return;
    try {
      setIsProcessing(true);
      await OrderWorkflowService.completeTask(task.id, { isApproved: false });
      toast({
        title: 'Order Ditolak (Rejected)',
        description: `Order #${task.variables?.orderNumber || ''} telah ditolak dan dibatalkan.`,
      });
      router.push('/admin/orders/tasks');
    } catch (err: any) {
      toast({
        title: 'Gagal Reject',
        description: err?.message || 'Terjadi kesalahan saat menolak order.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteShipment = async () => {
    if (!task || !trackingNumber.trim()) {
      toast({
        title: 'Validasi Resi',
        description: 'Nomor resi pengiriman wajib diisi.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsProcessing(true);
      await OrderWorkflowService.completeTask(task.id, { trackingNumber: trackingNumber.trim() });
      toast({
        title: 'Pengiriman Berhasil',
        description: `Nomor resi ${trackingNumber} berhasil disimpan dan order berstatus DELIVERING.`,
      });
      router.push('/admin/orders/tasks');
    } catch (err: any) {
      toast({
        title: 'Gagal Memproses Resi',
        description: err?.message || 'Gagal menyimpan resi pengiriman.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolveComplaint = async () => {
    if (!task || !resolutionNote.trim()) {
      toast({
        title: 'Validasi Catatan',
        description: 'Catatan resolusi komplain wajib diisi.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsProcessing(true);
      await OrderWorkflowService.completeTask(task.id, { resolutionNote: resolutionNote.trim() });
      toast({
        title: 'Komplain Diselesaikan',
        description: 'Tugas resolusi komplain telah berhasil diselesaikan.',
      });
      router.push('/admin/orders/tasks');
    } catch (err: any) {
      toast({
        title: 'Gagal Menyelesaikan',
        description: err?.message || 'Gagal menyelesaikan komplain.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-112.5 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
        <p className="text-sm font-semibold text-slate-500">Memuat rincian task workflow...</p>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  const taskName = task.name || 'Workflow Task';
  const isReviewTask = taskName.toLowerCase().includes('review');
  const isDeliveryTask = taskName.toLowerCase().includes('tracking') || taskName.toLowerCase().includes('delivery');
  const isComplaintTask = taskName.toLowerCase().includes('complaint');

  const orderNumber = task.variables?.orderNumber || order?.orderNumber || `#${task.variables?.orderId}`;
  const totalAmount = Number(order?.totalAmount || task.variables?.totalAmount || 0);
  const items = order?.items || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/admin/orders/tasks')}
            className="rounded-2xl border-slate-200 dark:border-white/10 shrink-0 h-10 w-10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Order Task Detail
              </h1>
              <Badge variant="pink" className="rounded-full text-xs font-bold uppercase px-3 py-1">
                {taskName}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Task ID: {task.id} &bull; Order Ref: <strong className="font-mono text-slate-700 dark:text-slate-300">{orderNumber}</strong>
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/admin/orders/tasks')}
          className="rounded-xl border-slate-200 dark:border-white/10 text-xs font-semibold"
        >
          Lihat Semua Antrean Task
        </Button>
      </div>

     

      {/* Decision / Action Card (APPROVE & REJECT) */}
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/90 p-6 md:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/10">
          <ShieldCheck className="w-5 h-5 text-pink-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Keputusan Workflow &amp; Tindakan Admin
          </h3>
        </div>

        {/* 1. Review Task (Approve & Reject) */}
        {isReviewTask && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Apakah pembayaran dan stok fisik pesanan <strong>{orderNumber}</strong> sudah valid? Klik <strong>Approve Order</strong> untuk melanjutkan ke pengemasan atau <strong>Reject Order</strong> untuk membatalkan transaksi.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <Button
                onClick={handleApprove}
                disabled={isProcessing}
                className="h-12 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 gap-2"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
                Approve Order (Lanjutkan Proses)
              </Button>

              <Button
                onClick={handleReject}
                disabled={isProcessing}
                variant="outline"
                className="h-12 rounded-2xl border-rose-200 dark:border-rose-900/50 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold text-sm gap-2"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                Reject Order (Tolak &amp; Batalkan)
              </Button>
            </div>
          </div>
        )}

        {/* 2. Delivery / Tracking Number Task */}
        {isDeliveryTask && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300">
                Nomor Resi Pengiriman (Waybill / Tracking Code) <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. JNE882910291 / SICEPAT009182"
                className="rounded-2xl font-mono text-sm uppercase"
              />
            </div>
            <div className="flex gap-4">
              <Button
                onClick={handleCompleteShipment}
                disabled={isProcessing || !trackingNumber.trim()}
                className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase gap-2 shadow-md shadow-blue-600/20"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                Simpan Resi &amp; Kirim Pesanan
              </Button>
              <Button
                onClick={handleReject}
                disabled={isProcessing}
                variant="outline"
                className="h-12 rounded-2xl border-rose-200 text-rose-600 hover:bg-rose-50 px-6 font-bold text-xs uppercase"
              >
                Batalkan Pengiriman
              </Button>
            </div>
          </div>
        )}

        {/* 3. Complaint Task */}
        {isComplaintTask && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300">
                Catatan Solusi / Penyelesaian Komplain <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Contoh: Refund telah disetujui / Barang pengganti telah dikirim"
                className="rounded-2xl text-sm"
              />
            </div>
            <div className="flex gap-4">
              <Button
                onClick={handleResolveComplaint}
                disabled={isProcessing || !resolutionNote.trim()}
                className="flex-1 h-12 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase shadow-md shadow-amber-600/20"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Selesaikan Komplain
              </Button>
              <Button
                onClick={handleReject}
                disabled={isProcessing}
                variant="outline"
                className="h-12 rounded-2xl border-rose-200 text-rose-600 hover:bg-rose-50 px-6 font-bold text-xs uppercase"
              >
                Tolak Komplain
              </Button>
            </div>
          </div>
        )}

        {/* 4. Default / Generic Task fallback */}
        {!isReviewTask && !isDeliveryTask && !isComplaintTask && (
          <div className="flex gap-4">
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Selesaikan Task (Approve)
            </Button>
            <Button
              onClick={handleReject}
              disabled={isProcessing}
              variant="outline"
              className="flex-1 h-12 rounded-2xl border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-sm gap-2"
            >
              <XCircle className="w-5 h-5" />
              Tolak Task (Reject)
            </Button>
          </div>
        )}
      </div>

      {/* 2-Column Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Buyer & Delivery */}
        <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/10 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
            <User className="w-4 h-4 text-pink-600" /> Profil Pembeli &amp; Alamat
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Nama Pembeli:</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {order?.shippingRecipient || task.variables?.customerName || task.variables?.customerUsername || 'Pembeli'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-medium">Nomor Telepon:</span>
              <p className="font-mono text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {order?.shippingPhone || task.variables?.shippingPhone || '-'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-medium">Alamat Pengiriman:</span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                {typeof order?.shippingAddress === 'string'
                  ? order.shippingAddress
                  : (order?.shippingAddress?.fullAddress || task.variables?.shippingAddress || 'Alamat tidak tersedia')}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-medium">Layanan Pengiriman:</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 uppercase">
                {order?.shippingService || 'Reguler'}
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Summary */}
        <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/10 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
            <CreditCard className="w-4 h-4 text-emerald-600" /> Status &amp; Nilai Transaksi
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Metode Pembayaran:</span>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-200 uppercase">
                {order?.paymentMethod || task.variables?.paymentMethod || 'Online'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Status Order Saat Ini:</span>
              <Badge variant="outline" className="font-bold text-[10px] uppercase">
                {order?.status || task.variables?.status || 'PENDING'}
              </Badge>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Jumlah Produk:</span>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                {task.variables?.totalQty ?? items.length} pcs
              </span>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex justify-between items-center">
              <span className="text-sm font-bold uppercase text-slate-800 dark:text-slate-200">
                Total Nilai Order:
              </span>
              <span className="text-2xl font-black text-pink-600 font-mono">
                {formatRupiah(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table (if full order data available) */}
      {items.length > 0 && (
        <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-pink-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Daftar Produk Pesanan ({items.length} Item)
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-semibold border-b border-slate-100 dark:border-white/5">
                <tr>
                  <th className="py-2.5 px-6">Nama Produk</th>
                  <th className="py-2.5 px-4">Varian</th>
                  <th className="py-2.5 px-4 text-right">Harga</th>
                  <th className="py-2.5 px-4 text-center">Qty</th>
                  <th className="py-2.5 px-6 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {items.map((it: any, i: number) => {
                  const qty = it.quantity || it.qty || 1;
                  const price = Number(it.price || 0);
                  return (
                    <tr key={i}>
                      <td className="py-3 px-6 font-bold text-slate-800 dark:text-slate-200">
                        {it.productName || it.name}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {it.size ? `Size: ${it.size}` : ''} {it.color ? `| ${it.color}` : ''}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                        {formatRupiah(price)}
                      </td>
                      <td className="py-3 px-4 text-center font-bold">{qty}</td>
                      <td className="py-3 px-6 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatRupiah(qty * price)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
