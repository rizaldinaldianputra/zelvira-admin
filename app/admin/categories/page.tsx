'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { useCategories } from '@/hooks/use-categories';
import { Tag } from 'lucide-react';

export default function CategoriesPage() {
  const {
    categories,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
  } = useCategories();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <Tag className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Product Categories</h1>
            <p className="text-slate-500 text-sm mt-0.5">Kelola struktur kategori produk, subkategori, dan filter etalase toko.</p>
          </div>
        </div>
      </div>

      <CrudTable
        data={categories}
        columns={columns}
        searchKey="categories"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
      />
    </div>
  );
}
