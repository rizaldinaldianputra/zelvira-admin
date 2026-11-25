'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Truck,
  ShoppingCart,
  RefreshCw,
  Eye,
  CreditCard,
  User,
  Package,
  Calendar,
  Phone,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CrudTable } from '@/components/admin/crud-table';
import { useOrderTasks } from '@/hooks/use-order-tasks';
import { WorkflowTask } from '@/types/order-workflow';

export default function OrderTasksPage() {
  const router = useRouter();
  const {
    isLoading,
    filteredTasks,
    fetchTasks,
  } = useOrderTasks();

  const columns: ColumnDef<WorkflowTask>[] = useMemo(() => [
    {
      accessorKey: 'orderNumber',
      header: 'Nomor Order & Tugas',
      cell: ({ row }) => {
        const orderNumber = row.original.variables?.orderNumber || '-';
        return (
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-slate-100 font-mono text-sm">{orderNumber}</span>
            <span className="text-[10px] text-pink-600 font-bold uppercase tracking-wider mt-0.5">
              {row.original.name}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'customerName',
      header: 'Customer',
      cell: ({ row }) => {
        const name = row.original.variables?.customerName || row.original.variables?.customerUsername || '-';
        return (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
              <User size={13} />
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-200 text-xs">{name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'totalQty',
      header: 'Kuantitas',
      cell: ({ row }) => {
        const qty = row.original.variables?.totalQty ?? '-';
        return (
          <span className="inline-flex items-center gap-1 font-bold text-xs bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
            <Package size={12} className="text-slate-400" />
            {qty} pcs
          </span>
        );
      },
    },
    {
      accessorKey: 'transaction',
      header: 'Metode & Status',
      cell: ({ row }) => {
        const method = row.original.variables?.paymentMethod || 'ONLINE';
        const status = row.original.variables?.status || 'PENDING';
        return (
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-200">
              <CreditCard size={11} className="text-slate-400" />
              {method}
            </span>
            <Badge
              variant="outline"
              className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full w-fit ${
                status === 'PAID' || status === 'PROCESSING'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : status === 'CANCELLED'
                  ? 'border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                  : 'border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
              }`}
            >
              {status}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total Nilai',
      cell: ({ row }) => {
        const total = Number(row.original.variables?.totalAmount || 0);
        return (
          <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm font-mono">
            Rp {total.toLocaleString('id-ID')}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Aksi Workflow',
      cell: ({ row }) => (
        <Button
          size="sm"
          onClick={() => router.push(`/admin/orders/tasks/${row.original.id}`)}
          className="rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs gap-1.5 h-8 shadow-xs"
        >
          Buka Task <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      ),
    },
  ], [router]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              Order Workflow Tasks
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Antrean tugas verifikasi dan workflow order yang memerlukan tindakan admin (Approve / Reject).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link href="/admin/orders">
            <Button variant="outline" size="sm" className="rounded-2xl border-slate-200 dark:border-white/10 gap-2">
              <ShoppingCart className="h-4 w-4" /> All Orders
            </Button>
          </Link>
          <Button onClick={fetchTasks} variant="outline" size="sm" className="rounded-2xl border-slate-200 dark:border-white/10">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* CrudTable Tasks: Opens dedicated task page on row click */}
      <CrudTable
        data={filteredTasks}
        columns={columns}
        searchKey="tasks"
        onView={(task) => router.push(`/admin/orders/tasks/${task.id}`)}
        hasActions={false}
        isLoading={isLoading}
      />
    </div>
  );
}
