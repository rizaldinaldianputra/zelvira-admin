'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CrudForm } from '@/components/admin/crud-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RoleService } from '@/services/role.service';
import { MenuDefinition, RoleMenuPermission } from '@/types/role';
import { useToast } from '@/hooks/use-toast';
import { Shield, CheckSquare, Square, Eye, BookOpen, Edit3, Layers, Loader2, Check } from 'lucide-react';

function RoleCheckbox({
  checked,
  onChange,
  colorClass = 'bg-pink-600 border-pink-600 text-white',
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  colorClass?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shadow-xs ${
        checked
          ? colorClass
          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-400'
      }`}
    >
      {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
    </button>
  );
}

export default function NewRolePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMenus, setIsFetchingMenus] = useState(true);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [menus, setMenus] = useState<MenuDefinition[]>([]);
  const [permissions, setPermissions] = useState<Record<string, { canView: boolean; canRead: boolean; canWrite: boolean }>>({});

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setIsFetchingMenus(true);
        const menuList = await RoleService.getMenus();
        setMenus(menuList || []);

        const initialPerms: Record<string, { canView: boolean; canRead: boolean; canWrite: boolean }> = {};
        menuList.forEach((m) => {
          initialPerms[m.menuKey] = {
            canView: false,
            canRead: false,
            canWrite: false,
          };
        });
        setPermissions(initialPerms);
      } catch (err: any) {
        toast({
          title: 'Gagal Memuat Menu',
          description: err?.message || 'Tidak dapat memuat definisi menu sistem.',
          variant: 'destructive',
        });
      } finally {
        setIsFetchingMenus(false);
      }
    };
    fetchMenus();
  }, []);

  const handleToggle = (menuKey: string, type: 'canView' | 'canRead' | 'canWrite', checked: boolean) => {
    setPermissions((prev) => {
      const cur = prev[menuKey] || { canView: false, canRead: false, canWrite: false };
      const updated = { ...cur, [type]: checked };

      // If user checks write, auto-check read and view
      if (type === 'canWrite' && checked) {
        updated.canRead = true;
        updated.canView = true;
      }
      // If user checks read, auto-check view
      if (type === 'canRead' && checked) {
        updated.canView = true;
      }
      // If user unchecks view, auto-uncheck read and write
      if (type === 'canView' && !checked) {
        updated.canRead = false;
        updated.canWrite = false;
      }

      return { ...prev, [menuKey]: updated };
    });
  };

  const toggleGroupAll = (groupMenus: MenuDefinition[], type: 'canView' | 'canRead' | 'canWrite', state: boolean) => {
    setPermissions((prev) => {
      const next = { ...prev };
      groupMenus.forEach((m) => {
        const cur = next[m.menuKey] || { canView: false, canRead: false, canWrite: false };
        const updated = { ...cur, [type]: state };

        if (type === 'canWrite' && state) {
          updated.canRead = true;
          updated.canView = true;
        }
        if (type === 'canRead' && state) {
          updated.canView = true;
        }
        if (type === 'canView' && !state) {
          updated.canRead = false;
          updated.canWrite = false;
        }

        next[m.menuKey] = updated;
      });
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: 'Validasi Gagal',
        description: 'Nama role wajib diisi (e.g. WAREHOUSE_STAFF).',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      const permArray = menus.map((m) => {
        const p = permissions[m.menuKey] || { canView: false, canRead: false, canWrite: false };
        return {
          menuKey: m.menuKey,
          menuTitle: m.menuTitle,
          canView: p.canView,
          canRead: p.canRead,
          canWrite: p.canWrite,
        };
      });

      const payload = {
        name: name.trim().toUpperCase(),
        description: description.trim(),
        permissions: permArray,
      };

      await RoleService.create(payload);
      toast({
        title: 'Role Berhasil Dibuat!',
        description: `Role "${payload.name}" beserta matriks hak akses berhasil disimpan.`,
      });
      router.push('/admin/roles');
    } catch (err: any) {
      toast({
        title: 'Gagal Membuat Role',
        description: err?.message || 'Terjadi kesalahan saat menyimpan role.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Group menus by section
  const groupedMenus: Record<string, MenuDefinition[]> = {};
  menus.forEach((m) => {
    if (!groupedMenus[m.group]) {
      groupedMenus[m.group] = [];
    }
    groupedMenus[m.group].push(m);
  });

  return (
    <CrudForm
      title="Tambah Role & Hak Akses Baru"
      subtitle="Definisikan nama role dan centang hak akses (View, Read, Write) untuk setiap halaman pada menu navigasi."
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitLabel="Simpan Role & Perizinan"
      maxWidth="max-w-5xl"
    >
      <div className="space-y-8">
        {/* Section 1: Identitas Role */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-white/10">
            <Shield className="w-5 h-5 text-pink-600" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Identitas Role Akses
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300 block mb-2">
                Nama Role <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. STAFF_GUDANG / PROCUREMENT_ADMIN"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border-slate-200 uppercase font-mono font-bold"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">Gunakan huruf kapital tanpa spasi atau dengan underscore.</p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300 block mb-2">
                Keterangan / Deskripsi Tanggung Jawab
              </label>
              <Input
                placeholder="e.g. Akses penerimaan barang (GR) dan stok gudang"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Matriks Perizinan Menu */}
        <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                  Matriks Hak Akses Halaman &amp; Menu
                </h3>
                <p className="text-xs text-slate-400">
                  Centang kolom untuk memberikan izin akses: <strong>View</strong> (Tampil di Sidebar), <strong>Read</strong> (Buka Detail), <strong>Write</strong> (Tambah/Edit/Hapus).
                </p>
              </div>
            </div>
          </div>

          {isFetchingMenus ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-pink-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Memuat modul menu sistem...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedMenus).map(([groupTitle, groupItems]) => (
                <div
                  key={groupTitle}
                  className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs bg-white dark:bg-slate-900/60"
                >
                  {/* Group Header with Quick Toggles */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 px-5 py-3 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-pink-500" />
                      {groupTitle} ({groupItems.length} Halaman)
                    </span>

                    <div className="flex items-center gap-2 text-[11px]">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleGroupAll(groupItems, 'canView', true)}
                        className="h-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 rounded-lg"
                      >
                        + Semua View
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleGroupAll(groupItems, 'canWrite', true)}
                        className="h-7 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 rounded-lg"
                      >
                        + Full Akses (Write)
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleGroupAll(groupItems, 'canView', false)}
                        className="h-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-2 rounded-lg"
                      >
                        Reset Grup
                      </Button>
                    </div>
                  </div>

                  {/* Menu Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 font-semibold border-b border-slate-100 dark:border-white/5">
                        <tr>
                          <th className="py-2.5 px-5 min-w-[200px]">Nama Menu &amp; Halaman</th>
                          <th className="py-2.5 px-4 min-w-[140px]">Path Rute</th>
                          <th className="py-2.5 px-4 w-28 text-center">
                            <span className="flex items-center justify-center gap-1 text-emerald-600">
                              <Eye className="w-3.5 h-3.5" /> View
                            </span>
                          </th>
                          <th className="py-2.5 px-4 w-28 text-center">
                            <span className="flex items-center justify-center gap-1 text-blue-600">
                              <BookOpen className="w-3.5 h-3.5" /> Read
                            </span>
                          </th>
                          <th className="py-2.5 px-4 w-28 text-center">
                            <span className="flex items-center justify-center gap-1 text-indigo-600">
                              <Edit3 className="w-3.5 h-3.5" /> Write
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {groupItems.map((menu) => {
                          const p = permissions[menu.menuKey] || { canView: false, canRead: false, canWrite: false };

                          return (
                            <tr key={menu.menuKey} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors">
                              <td className="py-3 px-5 font-bold text-slate-800 dark:text-slate-200">
                                {menu.menuTitle}
                              </td>
                              <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                                {menu.defaultPath}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex justify-center">
                                  <RoleCheckbox
                                    checked={p.canView}
                                    onChange={(checked) => handleToggle(menu.menuKey, 'canView', checked)}
                                    colorClass="bg-emerald-600 border-emerald-600 text-white"
                                  />
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex justify-center">
                                  <RoleCheckbox
                                    checked={p.canRead}
                                    onChange={(checked) => handleToggle(menu.menuKey, 'canRead', checked)}
                                    colorClass="bg-blue-600 border-blue-600 text-white"
                                  />
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex justify-center">
                                  <RoleCheckbox
                                    checked={p.canWrite}
                                    onChange={(checked) => handleToggle(menu.menuKey, 'canWrite', checked)}
                                    colorClass="bg-indigo-600 border-indigo-600 text-white"
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CrudForm>
  );
}
