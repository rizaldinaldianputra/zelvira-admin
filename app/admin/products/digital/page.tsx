'use client';

import React, { useState, useRef } from 'react';
import { CrudTable } from '@/components/admin/crud-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Smartphone,
  RefreshCw,
  Layers,
  ListFilter,
  Zap,
  Gamepad,
  CreditCard,
  Shield,
  Droplets,
  Tv,
  Flame,
  Banknote,
  CheckCircle2,
  Pencil,
  Image as ImageIcon,
  Upload,
  Loader2,
  Trash2,
} from 'lucide-react';
import { useDigitalProducts } from '@/hooks/use-digital-products';
import { DigitalCategory } from '@/services/digital-product.service';
import { FileUploadService } from '@/services/file-upload.service';
import { useToast } from '@/hooks/use-toast';

export default function DigitalProductsPage() {
  const {
    products,
    categories,
    isLoading,
    isLoadingCategories,
    isSyncing,
    config,
    isLoadingConfig,
    isSavingConfig,
    columns,
    togglingCategoryId,
    handleSyncProducts,
    handleToggleCategory,
    handleUpdateCategory,
    handleUpdateConfig,
  } = useDigitalProducts();
  const { toast } = useToast();

  const masterFileRef = useRef<HTMLInputElement | null>(null);
  const catFileRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingMasterIcon, setIsUploadingMasterIcon] = useState(false);
  const [isUploadingCatIcon, setIsUploadingCatIcon] = useState(false);

  const handleMasterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingMasterIcon(true);
    try {
      const url = await FileUploadService.upload(file);
      setMasterForm((prev) => ({ ...prev, iconUrl: url }));
      toast({
        title: 'Gambar Berhasil Diupload',
        description: 'Icon master menu digital produk berhasil diperbarui.',
      });
    } catch (err: any) {
      toast({
        title: 'Gagal Upload Gambar',
        description: err.message || 'Terjadi kesalahan saat mengupload gambar.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingMasterIcon(false);
      if (masterFileRef.current) masterFileRef.current.value = '';
    }
  };

  const handleCatUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCatIcon(true);
    try {
      const url = await FileUploadService.upload(file);
      setEditForm((prev) => ({ ...prev, iconUrl: url }));
      toast({
        title: 'Gambar Berhasil Diupload',
        description: 'Gambar icon kategori berhasil diupload.',
      });
    } catch (err: any) {
      toast({
        title: 'Gagal Upload Gambar',
        description: err.message || 'Terjadi kesalahan saat mengupload gambar.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingCatIcon(false);
      if (catFileRef.current) catFileRef.current.value = '';
    }
  };

  const [masterForm, setMasterForm] = useState({
    enabled: true,
    title: 'Digital Produk',
    iconUrl: '',
  });

  React.useEffect(() => {
    if (config) {
      setMasterForm({
        enabled: config.enabled ?? true,
        title: config.title || 'Digital Produk',
        iconUrl: config.iconUrl || '',
      });
    }
  }, [config]);

  const handleSaveMasterConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleUpdateConfig(masterForm);
  };

  const [editingCategory, setEditingCategory] = useState<DigitalCategory | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    iconUrl: '',
    iconName: '',
    colorHex: '#2196F3',
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const openEditModal = (cat: DigitalCategory) => {
    setEditingCategory(cat);
    setEditForm({
      name: cat.name || '',
      iconUrl: cat.iconUrl || '',
      iconName: cat.iconName || '',
      colorHex: cat.colorHex || '#2196F3',
      isActive: cat.isActive !== false,
    });
  };

  const handleSaveCategory = async () => {
    if (!editingCategory) return;
    setIsSaving(true);
    try {
      const ok = await handleUpdateCategory(editingCategory.id, {
        name: editForm.name,
        iconUrl: editForm.iconUrl || undefined,
        iconName: editForm.iconName || undefined,
        colorHex: editForm.colorHex,
        isActive: editForm.isActive,
      });
      if (ok) {
        setEditingCategory(null);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const renderCategoryIcon = (cat: DigitalCategory) => {
    if (cat.iconUrl && cat.iconUrl.trim().length > 0) {
      return (
        <img
          src={cat.iconUrl}
          alt={cat.name}
          className="w-6 h-6 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }

    const code = cat.code?.toLowerCase() || '';
    if (code.includes('pulsa') || code.includes('data')) return <Smartphone className="h-5 w-5 text-blue-500" />;
    if (code.includes('pln') || code.includes('listrik')) return <Zap className="h-5 w-5 text-amber-500" />;
    if (code.includes('game') || code.includes('voucher')) return <Gamepad className="h-5 w-5 text-red-500" />;
    if (code.includes('bpjs')) return <Shield className="h-5 w-5 text-teal-500" />;
    if (code.includes('pdam') || code.includes('air')) return <Droplets className="h-5 w-5 text-sky-500" />;
    if (code.includes('tv') || code.includes('internet')) return <Tv className="h-5 w-5 text-indigo-500" />;
    if (code.includes('gas')) return <Flame className="h-5 w-5 text-orange-500" />;
    if (code.includes('finance')) return <Banknote className="h-5 w-5 text-stone-500" />;
    return <CreditCard className="h-5 w-5 text-purple-500" />;
  };

  const prepaidCategories = categories.filter((c) => !c.isPostpaid);
  const postpaidCategories = categories.filter((c) => c.isPostpaid);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              Digital Products (PPOB)
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Kelola status aktif/nonaktif kategori, ganti icon/gambar kategori, dan sinkronisasi produk PPOB.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSyncProducts('prepaid')}
            disabled={isSyncing !== null}
            className="flex items-center gap-2 border-slate-200 rounded-xl"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing === 'prepaid' ? 'animate-spin' : ''}`} />
            Sync Prabayar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSyncProducts('pasca')}
            disabled={isSyncing !== null}
            className="flex items-center gap-2 border-slate-200 rounded-xl"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing === 'pasca' ? 'animate-spin' : ''}`} />
            Sync Pascabayar
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => handleSyncProducts('all')}
            disabled={isSyncing !== null}
            className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-xl"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing === 'all' ? 'animate-spin' : ''}`} />
            Sync Semua (Clear & Refresh)
          </Button>
        </div>
      </div>

      {/* MASTER MENU MOBILE CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Master Icon & Visibilitas Mobile
              </h2>
              {config && (
                <Badge
                  variant={config.hasActiveProducts ? 'success' : 'secondary'}
                  className="text-xs"
                >
                  {config.hasActiveProducts
                    ? 'Tampil di Mobile'
                    : 'Disembunyikan di Mobile'}
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Jika tidak ada produk aktif atau dinonaktifkan, pilihan Digital Produk di aplikasi mobile akan otomatis disembunyikan.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium">
              Status Menu:
            </span>
            <div className="flex items-center gap-2">
              <Switch
                checked={masterForm.enabled}
                onCheckedChange={(val) => setMasterForm((prev) => ({ ...prev, enabled: val }))}
                id="master-switch"
              />
              <Label htmlFor="master-switch" className="text-sm font-medium cursor-pointer">
                {masterForm.enabled ? 'Aktif' : 'Nonaktif'}
              </Label>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveMasterConfig} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4 space-y-1.5">
            <Label htmlFor="master-title" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nama Menu di Mobile
            </Label>
            <Input
              id="master-title"
              value={masterForm.title}
              onChange={(e) => setMasterForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Digital Produk"
              className="rounded-xl h-10 text-sm"
            />
          </div>

          <div className="md:col-span-5 space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Upload Gambar Icon Menu Mobile
            </Label>
            <input
              type="file"
              ref={masterFileRef}
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleMasterUpload}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                {masterForm.iconUrl ? (
                  <img
                    src={masterForm.iconUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <Zap className="h-5 w-5 text-pink-500" />
                )}
              </div>
              <div className="flex-1 flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => masterFileRef.current?.click()}
                  disabled={isUploadingMasterIcon}
                  className="rounded-xl h-10 px-3.5 text-xs font-bold border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 flex-1"
                >
                  {isUploadingMasterIcon ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-500" />
                      <span>Mengupload...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>{masterForm.iconUrl ? 'Ganti Gambar' : 'Pilih / Upload Gambar'}</span>
                    </>
                  )}
                </Button>
                {masterForm.iconUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setMasterForm((prev) => ({ ...prev, iconUrl: '' }))}
                    className="rounded-xl h-10 px-2.5 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Hapus gambar (gunakan default icon)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-3 flex items-center gap-2">
            <Button
              type="submit"
              disabled={isSavingConfig || isLoadingConfig}
              className="w-full h-10 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-medium shadow-sm transition-all"
            >
              {isSavingConfig ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </Button>
          </div>
        </form>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-4">
          <TabsTrigger
            value="categories"
            className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-pink-600 font-medium"
          >
            <Layers className="h-4 w-4" />
            Kontrol Kategori ({categories.length})
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-pink-600 font-medium"
          >
            <ListFilter className="h-4 w-4" />
            Daftar Produk ({products.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: KATEGORI KONTROL */}
        <TabsContent value="categories" className="space-y-6">
          <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 rounded-xl p-4 flex items-center gap-3 text-sm text-blue-700 dark:text-blue-300">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
            <span>
              Kategori yang dinonaktifkan akan <strong>otomatis disembunyikan di aplikasi mobile</strong>. Jika seluruh kategori nonaktif atau kosong, menu Digital Produk di mobile tidak akan muncul.
            </span>
          </div>

          {/* PRABAYAR */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 text-xs font-semibold px-2.5 py-0.5">
                Prabayar (Isi Ulang)
              </Badge>
              <span className="text-xs text-slate-500">Pulsa, Data, PLN, E-Money, Game, dll.</span>
            </div>

            {isLoadingCategories ? (
              <div className="p-8 text-center text-slate-500">Memuat kategori...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {prepaidCategories.map((cat) => {
                  const isActive = cat.isActive !== false;
                  const isToggling = togglingCategoryId === cat.id;
                  return (
                    <div
                      key={cat.id}
                      className={`p-4 rounded-xl border transition-all ${isActive
                          ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950/50 border-dashed border-slate-300 dark:border-slate-800 opacity-70'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                            style={{
                              backgroundColor: cat.colorHex ? `${cat.colorHex}15` : '#f1f5f9',
                              borderColor: cat.colorHex ? `${cat.colorHex}30` : '#e2e8f0',
                            }}
                          >
                            {renderCategoryIcon(cat)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                              {cat.name}
                            </h3>
                            <span className="text-xs text-slate-500 font-mono">
                              code: {cat.code}
                            </span>
                          </div>
                        </div>

                        <Switch
                          checked={isActive}
                          disabled={isToggling}
                          onCheckedChange={() => handleToggleCategory(cat.id, isActive)}
                          aria-label={`Toggle status ${cat.name}`}
                        />
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">Status:</span>
                          <Badge variant={isActive ? 'success' : 'secondary'} className="text-[10px]">
                            {isActive ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(cat)}
                          className="h-7 px-2 text-xs text-slate-600 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/20"
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Edit Icon
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* PASCABAYAR */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-xs font-semibold px-2.5 py-0.5">
                Tagihan (Pascabayar)
              </Badge>
              <span className="text-xs text-slate-500">PLN Pasca, BPJS, PDAM, Internet, dll.</span>
            </div>

            {isLoadingCategories ? (
              <div className="p-8 text-center text-slate-500">Memuat kategori...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {postpaidCategories.map((cat) => {
                  const isActive = cat.isActive !== false;
                  const isToggling = togglingCategoryId === cat.id;
                  return (
                    <div
                      key={cat.id}
                      className={`p-4 rounded-xl border transition-all ${isActive
                          ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950/50 border-dashed border-slate-300 dark:border-slate-800 opacity-70'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                            style={{
                              backgroundColor: cat.colorHex ? `${cat.colorHex}15` : '#f1f5f9',
                              borderColor: cat.colorHex ? `${cat.colorHex}30` : '#e2e8f0',
                            }}
                          >
                            {renderCategoryIcon(cat)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                              {cat.name}
                            </h3>
                            <span className="text-xs text-slate-500 font-mono">
                              code: {cat.code}
                            </span>
                          </div>
                        </div>

                        <Switch
                          checked={isActive}
                          disabled={isToggling}
                          onCheckedChange={() => handleToggleCategory(cat.id, isActive)}
                          aria-label={`Toggle status ${cat.name}`}
                        />
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">Status:</span>
                          <Badge variant={isActive ? 'success' : 'secondary'} className="text-[10px]">
                            {isActive ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(cat)}
                          className="h-7 px-2 text-xs text-slate-600 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/20"
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Edit Icon
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 2: DAFTAR PRODUK ITEM */}
        <TabsContent value="products">
          <CrudTable
            data={products}
            columns={columns}
            searchKey="productName"
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      {/* MODAL EDIT KATEGORI & ICON */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Kategori Digital</DialogTitle>
            <DialogDescription>
              Ubah nama, status aktif, gambar icon kustom (URL), atau warna aksen kategori.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs text-slate-500">Kode & Tipe Kategori</Label>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {editingCategory?.code}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {editingCategory?.isPostpaid ? 'Pascabayar (Tagihan)' : 'Prabayar (Isi Ulang)'}
                </Badge>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="catName">Nama Tampilan Kategori</Label>
              <Input
                id="catName"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Contoh: Pulsa & Paket Data"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Upload Gambar Icon Kategori
              </Label>
              <input
                type="file"
                ref={catFileRef}
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleCatUpload}
                className="hidden"
              />
              <div className="p-3.5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                    {editForm.iconUrl ? (
                      <img
                        src={editForm.iconUrl}
                        alt="Preview Icon"
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {editForm.iconUrl ? 'Gambar Terpasang' : 'Belum Ada Gambar Icon'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Upload langsung file gambar (PNG, JPG, SVG, WebP)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => catFileRef.current?.click()}
                    disabled={isUploadingCatIcon}
                    className="rounded-xl text-xs font-bold h-9 px-3.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
                  >
                    {isUploadingCatIcon ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-500" />
                        <span>Mengupload...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                        <span>{editForm.iconUrl ? 'Ganti Gambar' : 'Pilih Gambar'}</span>
                      </>
                    )}
                  </Button>
                  {editForm.iconUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditForm((prev) => ({ ...prev, iconUrl: '' }))}
                      className="rounded-xl h-9 px-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Hapus icon gambar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="catIconName">Preset Material Icon (Fallback jika URL kosong)</Label>
              <Input
                id="catIconName"
                value={editForm.iconName}
                onChange={(e) => setEditForm({ ...editForm, iconName: e.target.value })}
                placeholder="phone_android, wifi, electric_bolt, sports_esports, water_drop..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="catColor">Warna Aksen Kategori</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="catColor"
                  value={editForm.colorHex.startsWith('#') ? editForm.colorHex : '#2196F3'}
                  onChange={(e) => setEditForm({ ...editForm, colorHex: e.target.value })}
                  className="w-10 h-10 p-0.5 rounded cursor-pointer border border-slate-200"
                />
                <Input
                  value={editForm.colorHex}
                  onChange={(e) => setEditForm({ ...editForm, colorHex: e.target.value })}
                  className="font-mono text-sm uppercase max-w-35"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <Label htmlFor="catActive">Status Tampilkan di Mobile</Label>
                <p className="text-[11px] text-slate-500">Aktifkan agar muncul di aplikasi mobile.</p>
              </div>
              <Switch
                id="catActive"
                checked={editForm.isActive}
                onCheckedChange={(checked) => setEditForm({ ...editForm, isActive: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)} disabled={isSaving}>
              Batal
            </Button>
            <Button
              variant="default"
              onClick={handleSaveCategory}
              disabled={isSaving}
              className="bg-pink-600 hover:bg-pink-700 text-white"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
