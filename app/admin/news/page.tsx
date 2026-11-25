'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { Newspaper } from 'lucide-react';
import { useNews } from '@/hooks/use-news';

export default function NewsManagementPage() {
  const {
    news,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
    handleTestNotify
  } = useNews();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <Newspaper className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">News & Fashion Articles</h1>
            <p className="text-slate-500 text-sm mt-0.5">Kelola publikasi artikel tren fashion, panduan outfit, dan berita resmi Zelvira.</p>
          </div>
        </div>
      </div>

      <CrudTable
        data={news}
        columns={columns}
        searchKey="news"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onTestNotify={handleTestNotify}
        isLoading={isLoading}
      />
    </div>
  );
}
