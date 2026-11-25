'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { Monitor } from 'lucide-react';
import { useWebFlashSales } from '@/hooks/use-web-flash-sales';

export default function FlashSaleWebPage() {
  const {
    flashSales,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
  } = useWebFlashSales();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <Monitor className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Flash Sale — Website Storefront</h1>
            <p className="text-slate-500 text-sm mt-0.5">Kelola kampanye flash sale yang tampil di homepage website lengkap dengan countdown timer.</p>
          </div>
        </div>
      </div>

      <CrudTable
        data={flashSales}
        columns={columns}
        searchKey="flash-sales-web"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
      />
    </div>
  );
}
