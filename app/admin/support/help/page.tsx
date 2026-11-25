'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { BookOpen } from 'lucide-react';
import { useSupportHelp } from '@/hooks/use-support-help';

export default function HelpCenterPage() {
  const {
    articles,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
  } = useSupportHelp();

  return (
    <div className="space-y-10 max-w-7xl mx-auto py-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Help Center & Guides</h1>
            <p className="text-slate-500 text-sm mt-0.5">Panduan lengkap, tutorial berbelanja, dan dokumentasi bantuan pelanggan.</p>
          </div>
        </div>
      </div>

      <div className="px-4">
        <CrudTable
          data={articles}
          columns={columns}
          searchKey="help"
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
