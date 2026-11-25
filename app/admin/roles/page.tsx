'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ShieldCheck, Plus, Edit2, Trash2, Users, Layers, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RoleService } from '@/services/role.service';
import { SystemRole } from '@/types/role';
import { useToast } from '@/hooks/use-toast';

export default function RolesListPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [roles, setRoles] = useState<SystemRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const data = await RoleService.getAllRoles();
      setRoles(data || []);
    } catch (err: any) {
      toast({
        title: 'Gagal Memuat Role',
        description: err?.message || 'Terjadi kesalahan saat memuat daftar role sistem.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDelete = async (role: SystemRole) => {
    if (role.isSystem) {
      toast({
        title: 'Akses Ditolak',
        description: 'Role sistem bawaan tidak dapat dihapus.',
        variant: 'destructive',
      });
      return;
    }

    if ((role.userCount || 0) > 0) {
      toast({
        title: 'Tidak Dapat Dihapus',
        description: `Role ini masih digunakan oleh ${role.userCount} pengguna. Harap pindahkan pengguna ke role lain terlebih dahulu.`,
        variant: 'destructive',
      });
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus role "${role.name}"?`)) return;

    try {
      await RoleService.delete(role.id);
      toast({
        title: 'Sukses',
        description: `Role "${role.name}" berhasil dihapus.`,
      });
      fetchRoles();
    } catch (err: any) {
      toast({
        title: 'Gagal Menghapus',
        description: err?.message || 'Terjadi kesalahan saat menghapus role.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-600 dark:text-pink-400 shadow-inner">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              Role &amp; Hak Akses Menu
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Atur hak akses menu (View, Read, Write) untuk setiap level pengguna sistem administrator.
            </p>
          </div>
        </div>

        <Button
          onClick={() => router.push('/admin/roles/new')}
          className="rounded-2xl bg-linear-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold gap-2 text-xs uppercase shadow-sm"
        >
          <Plus className="h-4 w-4" /> Tambah Role Baru
        </Button>
      </div>

      {/* Role Cards List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
          <p className="text-sm text-slate-500">Memuat daftar role &amp; perizinan...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => {
            const viewCount = role.permissions?.filter((p) => p.canView).length || 0;
            const writeCount = role.permissions?.filter((p) => p.canWrite).length || 0;

            return (
              <div
                key={role.id}
                className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-pink-600" />
                      <span className="font-mono font-bold text-base text-slate-900 dark:text-slate-100">
                        {role.name}
                      </span>
                    </div>
                    {role.isSystem ? (
                      <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        Sistem Bawaan
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-pink-600 border-pink-200">
                        Kustom
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mt-3 min-h-[36px]">
                    {role.description || 'Tidak ada deskripsi peran.'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" /> Pengguna Ditugaskan:
                      </span>
                      <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                        {role.userCount || 0} User
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-400" /> Akses Menu (View):
                      </span>
                      <span className="font-bold text-emerald-600 font-mono">
                        {viewCount} Menu Diizinkan
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Edit2 className="w-3.5 h-3.5 text-slate-400" /> Hak Modifikasi (Write):
                      </span>
                      <span className="font-bold text-indigo-600 font-mono">
                        {writeCount} Menu Dapat Diedit
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/roles/${role.id}`)}
                    className="rounded-xl text-xs gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-pink-600" />
                    Atur Hak Akses
                  </Button>
                  {!role.isSystem && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(role)}
                      className="rounded-xl text-slate-400 hover:text-rose-600 h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
