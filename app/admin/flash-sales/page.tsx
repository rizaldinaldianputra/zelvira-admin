'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { Zap } from 'lucide-react';
import { useFlashSales } from '@/hooks/use-flash-sales';

export default function FlashSalesPage() {
  const {
    flashSales,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
  } = useFlashSales();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Flash Sale Campaigns</h1>
            <p className="text-slate-500 text-sm mt-0.5">Kelola kampanye promo diskon kilat, batas waktu countdown timer, dan kuota produk flash sale.</p>
          </div>
        </div>
      </div>

      <CrudTable
        data={flashSales}
        columns={columns}
        searchKey="flash-sales"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
      />
    </div>
  );
}
