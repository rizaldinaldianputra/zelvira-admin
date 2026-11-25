'use client';

import React, { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { UserService, User } from '@/services/user.service';
import { useToast } from '@/hooks/use-toast';
import { UserCircle, Mail, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export function useCustomers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await UserService.getAll(0, 100);
      setUsers(res.content || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch customers', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const customers = users.filter(u => 
    (u.fullName?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())) &&
    u.roles.some((r: any) => r.name === 'ROLE_USER')
  );

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'fullName',
      header: 'Customer Profile',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold shrink-0">
            {row.original.fullName?.charAt(0) || <UserCircle className="h-5 w-5" />}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-slate-100">{row.original.fullName || 'Anonymous'}</span>
            <span className="text-[10px] text-slate-500 flex items-center gap-1 font-bold">
              <Mail className="h-3 w-3" /> {row.original.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined Date',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-tight">
          <Calendar size={14} className="text-slate-400" />
          {row.original.createdAt ? format(new Date(row.original.createdAt), 'dd MMM yyyy') : '-'}
        </div>
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
    },
    {
      accessorKey: 'roles',
      header: 'Access Level',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles.map((role: any) => (
            <Badge key={role.id} variant="secondary" className="rounded-lg px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-slate-50 border-slate-100">
               {role.name}
            </Badge>
          ))}
        </div>
      )
    }
  ];

  return {
    users,
    customers,
    isLoading,
    search,
    setSearch,
    columns,
    fetchUsers,
  };
}
