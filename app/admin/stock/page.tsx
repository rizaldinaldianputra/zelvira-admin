'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { Button } from '@/components/ui/button';
import { Boxes, History } from 'lucide-react';
import Link from 'next/link';
import { useStock } from '@/hooks/use-stock';

export default function StockManagementPage() {
  const {
    products,
    isLoading,
    columns,
    handleManage,
  } = useStock();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <Boxes className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Inventory & Stock</h1>
            <p className="text-slate-500 text-sm mt-0.5">Monitoring stok produk gudang, penyesuaian kuantitas, dan mutasi inventaris.</p>
          </div>
        </div>

        <Link href="/admin/stock/history">
          <Button variant="outline" className="rounded-2xl border-slate-200 font-bold gap-2">
            <History className="h-4 w-4" /> View Transaction Logs
          </Button>
        </Link>
      </div>

      <CrudTable
        data={products}
        columns={columns}
        searchKey="name"
        onEdit={handleManage}
        isLoading={isLoading}
      />
    </div>
  );
}
