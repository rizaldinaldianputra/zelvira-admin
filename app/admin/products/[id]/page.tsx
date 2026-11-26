'use client';

import { use } from 'react';
import { CrudForm } from '@/components/admin/crud-form';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Combobox } from '@/components/ui/combobox';
import { MultiImageUpload } from '@/components/ui/multi-image-upload';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductVariantGroups } from '@/components/admin/ProductVariantGroups';
import { useProductForm } from '@/hooks/use-product-form';
import { Barcode, Wand2, RefreshCw } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductEditPage({ params }: PageProps) {
  const { id } = use(params);
  const {
    form,
    groupFields,
    appendGroup,
    removeGroup,
    categories,
    brands,
    isLoading,
    isNew,
    onSubmit,
    applyMasterSkuToVariants,
  } = useProductForm(id);

  const categoryOptions = categories.map((c) => ({ value: c.id.toString(), label: c.name }));
  const brandOptions = brands.map((b) => ({ value: b.id.toString(), label: b.name }));

  return (
    <CrudForm
      title={isNew ? 'Tambah Produk Baru' : 'Edit Master Produk'}
      subtitle={
        isNew
          ? 'Tambahkan master produk lengkap dengan variasi model, warna, ukuran, dan stok'
          : 'Kelola informasi produk, model style, dan stok masing-masing varian'
      }
      onSubmit={form.handleSubmit(onSubmit, (errors) => {
        const findFirstError = (obj: any, path = ''): { path: string; message: string } | null => {
          if (!obj || typeof obj !== 'object') return null;
          if (typeof obj.message === 'string' && obj.message) {
            return { path, message: obj.message };
          }
          for (const key of Object.keys(obj)) {
            const nextPath = path ? `${path}.${key}` : key;
            const res = findFirstError(obj[key], nextPath);
            if (res) return res;
          }
          return null;
        };
        const err = findFirstError(errors);
        const msg = err
          ? `${err.path ? `[${err.path}] ` : ''}${err.message}`
          : 'Mohon periksa kembali field yang bertanda merah.';
        import('sonner').then(({ toast }) => toast.error(msg));
      })}
      isLoading={isLoading}
      maxWidth="max-w-6xl"
    >
      <Form {...form}>
        <div className="space-y-8">
          {/* Section: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-xs">
              Informasi Utama Produk
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-xs uppercase tracking-tight">Nama Produk</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Tunic Floral Elegan / Jaket Denim Casual" className="rounded-xl border-slate-200" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="font-bold text-xs uppercase tracking-tight flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
                        <Barcode className="h-3.5 w-3.5 text-pink-500" />
                        Master SKU / Kode Produk
                      </FormLabel>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const nameVal = form.getValues('name') || '';
                            const cleanCode = nameVal
                              .toUpperCase()
                              .replace(/[^A-Z0-9]+/g, '-')
                              .replace(/(^-|-$)+/g, '')
                              .substring(0, 15);
                            form.setValue('sku', `SKU-${cleanCode || 'PRD'}`, { shouldValidate: true });
                          }}
                          className="text-[11px] text-pink-600 hover:text-pink-700 dark:text-pink-400 font-semibold flex items-center gap-1 cursor-pointer"
                          title="Generate SKU dari Nama"
                        >
                          <Wand2 size={12} /> Auto
                        </button>
                        <button
                          type="button"
                          onClick={applyMasterSkuToVariants}
                          className="text-[11px] text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold flex items-center gap-1 cursor-pointer"
                          title="Terapkan prefix SKU ini ke semua varian di bawah"
                        >
                          <RefreshCw size={11} /> Terapkan ke Varian
                        </button>
                      </div>
                    </div>
                    <FormControl>
                      <Input
                        placeholder="e.g. ZLV-KMJ-01 (Kunci sinkronisasi TikTok)"
                        className="rounded-xl border-slate-200 font-mono text-xs tracking-wide uppercase bg-slate-50/50 dark:bg-slate-900/50 font-bold"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                  
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-xs uppercase tracking-tight">Slug URL</FormLabel>
                    <FormControl>
                      <Input placeholder="tunic-floral-elegan" className="rounded-xl border-slate-200" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel className="font-bold text-xs uppercase tracking-tight block mb-2">Kategori</FormLabel>
                <Combobox
                  options={categoryOptions}
                  value={form.watch('categoryId')?.toString()}
                  onChange={(val) => form.setValue('categoryId', Number(val), { shouldValidate: true })}
                  placeholder="Pilih Kategori"
                />
              </div>

              <div>
                <FormLabel className="font-bold text-xs uppercase tracking-tight block mb-2">Brand</FormLabel>
                <Combobox
                  options={brandOptions}
                  value={form.watch('brandId')?.toString()}
                  onChange={(val) => form.setValue('brandId', Number(val), { shouldValidate: true })}
                  placeholder="Pilih Brand"
                />
              </div>

              <div>
                <FormLabel className="font-bold text-xs uppercase tracking-tight block mb-2">Target Gender</FormLabel>
                <Select
                  value={form.watch('gender')}
                  onValueChange={(val: any) => form.setValue('gender', val)}
                >
                  <SelectTrigger className="rounded-xl border-slate-200">
                    <SelectValue placeholder="Pilih Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNISEX">Unisex</SelectItem>
                    <SelectItem value="WOMEN">Wanita (Women)</SelectItem>
                    <SelectItem value="MEN">Pria (Men)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-xs uppercase tracking-tight">
                      Berat Paket (Gram)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="500 (untuk 0.5 kg)"
                        className="rounded-xl border-slate-200"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-[11px] text-slate-400">
                      Wajib untuk kalkulasi ongkir kurir &amp; TikTok Shop / Marketplace.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="font-bold text-sm">Status Publikasi</FormLabel>
                      <FormDescription className="text-xs">
                        Aktifkan agar produk dapat dilihat dan dibeli oleh pelanggan di web & mobile.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-xs uppercase tracking-tight">Deskripsi Produk</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Jelaskan detail material, kenyamanan, instruksi perawatan, dll."
                      rows={4}
                      className="rounded-2xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Section: Main Media - Thumbnail & Banners */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/10">
            <MultiImageUpload
              thumbnailImage={form.watch('thumbnailUrl') || form.watch('imageUrl') || ''}
              onThumbnailChange={(url: string) => {
                form.setValue('thumbnailUrl', url, { shouldValidate: true, shouldDirty: true });
                form.setValue('imageUrl', url, { shouldValidate: true, shouldDirty: true });
              }}
              bannerImages={form.watch('banners') || form.watch('images') || []}
              onBannersChange={(urls: string[]) => {
                form.setValue('banners', urls, { shouldValidate: true, shouldDirty: true });
                form.setValue('images', urls, { shouldValidate: true, shouldDirty: true });
              }}
            />
          </div>

          {/* Section: Variant Groups & Individual Stock */}
          <ProductVariantGroups
            form={form}
            control={form.control}
            groupFields={groupFields}
            appendGroup={appendGroup}
            removeGroup={removeGroup}
          />

          {/* Promotion badges now live in the Web CMS (Featured Products with
              tab categories + Recommendations) — not on the Master Product. */}
        </div>
      </Form>
    </CrudForm>
  );
}
