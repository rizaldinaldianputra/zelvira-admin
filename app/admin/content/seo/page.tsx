'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { useSeoConfigs } from '@/hooks/use-seo-configs';
import { Search } from 'lucide-react';

export default function ContentSeoSettingsPage() {
  const {
    configs,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
  } = useSeoConfigs();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <Search className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Content SEO & Tracking Management</h1>
            <p className="text-slate-500 text-sm mt-0.5">Konfigurasi meta tag, OpenGraph, script header Google Analytics, dan pixel pelacakan untuk storefront.</p>
          </div>
        </div>
      </div>

      <CrudTable
        data={configs}
        columns={columns}
        searchKey="seo"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

