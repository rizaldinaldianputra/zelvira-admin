'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { UserCircle, Users } from 'lucide-react';
import { useCustomers } from '@/hooks/use-customers';

export default function CustomersPage() {
  const {
    customers,
    isLoading,
    columns,
  } = useCustomers();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Customer Database</h1>
          <p className="text-slate-500 text-sm mt-0.5">Explore active users and buyer profiles registered on your platform.</p>
        </div>
      </div>

      <CrudTable
        data={customers}
        columns={columns}
        searchKey="customers"
        isLoading={isLoading}
      />
    </div>
  );
}
