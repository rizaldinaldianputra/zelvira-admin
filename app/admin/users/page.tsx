'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { Users } from 'lucide-react';
import { useUsers } from '@/hooks/use-users';

export default function UserManagementPage() {
  const {
    filteredUsers,
    isLoading,
    columns,
    handleEdit,
    handleAdd,
    handleDelete,
    handleToggleStatus,
  } = useUsers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">User Management (All Users)</h1>
            <p className="text-slate-500 text-sm mt-0.5">Kelola seluruh pengguna sistem, baik Administrator, Staff, maupun Pelanggan (Customer).</p>
          </div>
        </div>
      </div>

      <CrudTable
        data={filteredUsers}
        columns={columns}
        searchKey="users"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
      />
    </div>
  );
}
