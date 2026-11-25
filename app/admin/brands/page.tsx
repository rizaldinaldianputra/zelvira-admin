'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { useBrands } from '@/hooks/use-brands';
import { Award } from 'lucide-react';

export default function BrandsPage() {
  const {
    brands,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
  } = useBrands();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Official Brands</h1>
            <p className="text-slate-500 text-sm mt-0.5">Kelola daftar merek resmi mitra, logo, dan sertifikasi toko.</p>
          </div>
        </div>
      </div>

      <CrudTable
        data={brands}
        columns={columns}
        searchKey="brands"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
      />
    </div>
  );
}
