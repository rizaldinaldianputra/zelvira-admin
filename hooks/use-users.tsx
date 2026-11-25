'use client';

import React, { useEffect, useState, useRef } from 'react';
import { UserCircle, Mail } from 'lucide-react';
import { UserService, User } from '@/services/user.service';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const router = useRouter();
  const isMounted = useRef(false);

  // Edit State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [taskGroup, setTaskGroup] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await UserService.getAll(0, 50);
      setUsers(res.content || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch users', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted.current) return;
    fetchUsers();
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      await UserService.updateRolesAndGroups(selectedUser.id, {
        taskGroup,
        roleNames: selectedUser.roles.map((r: any) => r.name)
      });
      toast({ title: 'Success', description: 'User permissions updated' });
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update user', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = users.filter(u =>
    (u.fullName?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (u.email?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'fullName',
      header: 'User Profile',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800 shrink-0">
            <UserCircle size={20} className="text-slate-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[150px]">
              {row.original.fullName || 'Anonymous'}
            </span>
            <span className="text-[10px] text-slate-500 flex items-center gap-1 font-bold">
              <Mail className="h-3 w-3" /> {row.original.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'taskGroup',
      header: 'Assigned Role',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-xs uppercase px-2.5 py-1 rounded-full">
          {row.original.taskGroup || 'General Staff'}
        </Badge>
      )
    },
    {
      accessorKey: 'roles',
      header: 'System Roles',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles.map((role: any) => (
            <Badge key={role.id} variant="secondary" className="rounded-lg px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-slate-50 border-slate-100">
              {role.name}
            </Badge>
          ))}
        </div>
      )
    },
    {
      id: 'systemRole',
      header: 'Hak Akses Menu (RBAC)',
      cell: ({ row }) => (
        row.original.systemRole ? (
          <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 font-mono text-[10px] font-bold">
            {row.original.systemRole.name}
          </Badge>
        ) : (
          <span className="text-slate-400 text-xs italic">-</span>
        )
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          className={row.original.isActive
            ? 'bg-emerald-100 text-emerald-600 border-emerald-200 font-bold text-[9px] py-0.5 px-2.5 rounded-full uppercase'
            : 'bg-slate-100 text-slate-600 border-slate-200 font-bold text-[9px] py-0.5 px-2.5 rounded-full uppercase'
          }
        >
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    }
  ];

  const handleEdit = (user: User) => {
    router.push(`/admin/users/${user.id}`);
  };

  const handleAdd = () => {
    router.push('/admin/users/new');
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await UserService.update(user.id, { ...user, isActive: !user.isActive });
      toast({ title: 'Success', description: 'Status updated' });
      fetchUsers();
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const handleDelete = async (user: User) => {
    try {
      await UserService.delete(user.id);
      toast({ title: 'Success', description: 'User berhasil dihapus' });
      fetchUsers();
    } catch {
      toast({ title: 'Error', description: 'Gagal menghapus user', variant: 'destructive' });
    }
  };

  return {
    users,
    filteredUsers,
    isLoading,
    search,
    setSearch,
    columns,
    selectedUser,
    setSelectedUser,
    taskGroup,
    setTaskGroup,
    isSaving,
    handleUpdateUser,
    handleEdit,
    handleAdd,
    handleDelete,
    handleToggleStatus,
    fetchUsers,
  };
}
