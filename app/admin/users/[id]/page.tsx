'use client';

import { use } from 'react';
import { CrudForm } from '@/components/admin/crud-form';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useUserForm } from '@/hooks/use-user-form';

const TASK_GROUPS = [
  { value: 'CUSTOMER', label: 'Pelanggan / Customer' },
  { value: 'ORDER_PROCESSOR', label: 'Order Processor' },
  { value: 'SHIPPING', label: 'Shipping & Delivery' },
  { value: 'CUSTOMER_SERVICE', label: 'Customer Service' },
  { value: 'ADMIN', label: 'Super Admin' },
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function UserEditPage({ params }: PageProps) {
  const { id } = use(params);
  const {
    form,
    isLoading,
    isNew,
    availableRoles,
    systemRoles,
    toggleRole,
    onSubmit,
  } = useUserForm(id);

  return (
    <CrudForm
      title={isNew ? 'Tambah Pengguna Baru' : 'Edit Akun Pengguna'}
      subtitle={isNew ? 'Tambahkan pengguna baru (Admin, Staff, atau Pelanggan).' : 'Perbarui data profil & peran akses sistem pengguna.'}
      onSubmit={form.handleSubmit(onSubmit)}
      isLoading={isLoading}
    >
      <Form {...form}>
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" className="h-12 rounded-2xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" className="h-12 rounded-2xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400">
                    {isNew ? 'Password' : 'New Password (Optional)'}
                  </FormLabel>
                  <FormControl>
                    <Input type="password" placeholder={isNew ? '••••••••' : 'Leave empty to keep unchanged'} className="h-12 rounded-2xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="taskGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400">Operational Task Assignment</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-2xl">
                        <SelectValue placeholder="Select functional assignment" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TASK_GROUPS.map((group) => (
                        <SelectItem key={group.value} value={group.value}>
                          {group.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="systemRoleId"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Assign System Role (Hak Akses Menu &amp; Perizinan RBAC)
                  </FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(val ? Number(val) : 0)}
                    value={field.value ? field.value.toString() : '0'}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-2xl font-semibold">
                        <SelectValue placeholder="Pilih Role Akses Sistem" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">
                        -- Tanpa Custom Role (Akses Standar Berdasarkan Role Spring) --
                      </SelectItem>
                      {systemRoles.map((sr) => (
                        <SelectItem key={sr.id} value={sr.id.toString()}>
                          {sr.name} — {sr.description || 'Hak akses menu kustom'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Setiap user yang diberi role ini akan otomatis disesuaikan menu sidebar-nya (hanya menu yang dicentang VIEW yang tampil).
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Assigned Spring Security Roles</Label>
            <div className="flex flex-wrap gap-2 pt-2">
              {availableRoles.map((role) => {
                const isSelected = form.watch('roleNames')?.includes(role.name);
                return (
                  <Badge
                    key={role.id}
                    onClick={() => toggleRole(role.name)}
                    className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {role.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
      </Form>
    </CrudForm>
  );
}
