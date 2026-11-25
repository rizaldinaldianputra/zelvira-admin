'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { useVouchers } from '@/hooks/use-vouchers';
import { Gift } from 'lucide-react';

export default function VouchersPage() {
  const {
    vouchers,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
  } = useVouchers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <Gift className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Vouchers & Discounts</h1>
            <p className="text-slate-500 text-sm mt-0.5">Kelola kupon diskon belanja, potongan harga promosi, dan cashback pelanggan.</p>
          </div>
        </div>
      </div>

      <CrudTable
        data={vouchers}
        columns={columns}
        searchKey="vouchers"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
      />
    </div>
  );
}
