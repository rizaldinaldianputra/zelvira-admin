'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { MessageCircle } from 'lucide-react';
import { useSupportFaq } from '@/hooks/use-support-faq';

export default function FaqPage() {
  const {
    faqs,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
  } = useSupportFaq();

  return (
    <div className="space-y-10 max-w-7xl mx-auto py-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">FAQ Management</h1>
            <p className="text-slate-500 text-sm mt-0.5">Kelola daftar tanya-jawab umum untuk mempermudah bantuan kepada pelanggan secara mandiri.</p>
          </div>
        </div>
      </div>

      <div className="px-4">
        <CrudTable
          data={faqs}
          columns={columns}
          searchKey="faq"
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
