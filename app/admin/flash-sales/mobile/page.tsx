'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { Smartphone } from 'lucide-react';
import { useMobileFlashSales } from '@/hooks/use-mobile-flash-sales';

export default function FlashSaleMobilePage() {
  const {
    flashSales,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
  } = useMobileFlashSales();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Flash Sale — Aplikasi Mobile</h1>
            <p className="text-slate-500 text-sm mt-0.5">Kelola kampanye flash sale yang tampil di strip horizontal home aplikasi mobile.</p>
          </div>
        </div>
      </div>

      <CrudTable
        data={flashSales}
        columns={columns}
        searchKey="flash-sales-mobile"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
      />
    </div>
  );
}
