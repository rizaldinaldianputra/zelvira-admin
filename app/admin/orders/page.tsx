'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, ShoppingCart } from 'lucide-react';
import { CrudTable } from '@/components/admin/crud-table';
import { useOrders } from '@/hooks/use-orders';

export default function OrdersPage() {
  const {
    orders,
    isLoading,
    columns,
    handleView,
  } = useOrders();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Order Management (All Orders)</h1>
            <p className="text-slate-500 text-sm mt-0.5">Kelola seluruh riwayat transaksi pesanan, status pembayaran, dan resi pengiriman.</p>
          </div>
        </div>
        <Link href="/admin/orders/tasks">
          <Button className="rounded-2xl bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs uppercase shadow-lg shadow-pink-500/20 gap-2">
            <ClipboardCheck size={16} /> View Order Tasks
          </Button>
        </Link>
      </div>

      <CrudTable
        data={orders}
        columns={columns}
        searchKey="orders"
        onView={handleView}
        hasActions={true}
        isLoading={isLoading}
      />
    </div>
  );
}
