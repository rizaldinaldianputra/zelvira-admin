'use client';

import { use, useMemo } from 'react';
import { CrudForm } from '@/components/admin/crud-form';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from '@/components/ui/image-upload';
import { Combobox } from '@/components/ui/combobox';
import { Search } from 'lucide-react';
import { useMobileContentItemForm } from '@/hooks/use-mobile-content-item-form';

interface PageProps {
  params: Promise<{ type: string; id: string }>;
}

export default function MobileContentItemEditPage({ params }: PageProps) {
  const { type, id } = use(params);
  const { form, isLoading, isNew, products, onSubmit } = useMobileContentItemForm(type, id);
  const isTrending = type.includes('TRENDING') || type === 'TRENDING_LIST' || type === 'TRENDING_NOW';
  const showProductPicker = isTrending || type.includes('PRODUCT') || type.includes('FEATURED');

  // Parse productIds (comma-separated string e.g. "1,2,3")
  const productIdsString = form.watch('productIds') || '';
  const selectedProductIds: number[] = useMemo(() => {
    if (!productIdsString) return [];
    return productIdsString
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && n > 0);
  }, [productIdsString]);

  const toggleSelectProduct = (productId: number) => {
    let nextIds: number[];
    if (selectedProductIds.includes(productId)) {
      nextIds = selectedProductIds.filter((id) => id !== productId);
    } else {
      nextIds = [...selectedProductIds, productId];
    }
    const newStr = nextIds.join(',');
    form.setValue('productIds', newStr);

    // Auto set primary productId & details if not yet set
    if (nextIds.length > 0 && !form.getValues('productId')) {
      const firstProduct = products.find((p) => p.id === nextIds[0]);
      if (firstProduct) {
        form.setValue('productId', firstProduct.id);
        if (!form.getValues('title')) form.setValue('title', firstProduct.name);
        if (!form.getValues('subtitle') && firstProduct.category?.name) {
          form.setValue('subtitle', firstProduct.category.name);
        }
        if (!form.getValues('imageUrl')) {
          const img = (firstProduct.images && firstProduct.images.length > 0)
            ? firstProduct.images[0]
            : (firstProduct.imageUrl || (firstProduct as any).img);
          if (img) form.setValue('imageUrl', img);
        }
      }
    } else if (nextIds.length === 0) {
      form.setValue('productId', null);
    }
  };

  const selectedProductsList = useMemo(() => {
    return selectedProductIds
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean) as typeof products;
  }, [selectedProductIds, products]);

  return (
    <CrudForm
      title={isNew ? 'Tambah Item Mobile' : 'Edit Item Mobile'}
      subtitle={`Kelola konten ${type} untuk aplikasi mobile`}
      onSubmit={form.handleSubmit(onSubmit)}
      isLoading={isLoading}
    >
      <Form {...form}>
        <div className="space-y-6">
          {/* Multi-Product Selection Table for Trending / Collections */}
          {showProductPicker && (
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    Daftar Produk Trending ({selectedProductIds.length} Produk Dipilih)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pilih satu atau beberapa produk yang akan masuk dalam daftar trending saat user membuka detail trending di mobile.
                  </p>
                </div>
                {selectedProductIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => form.setValue('productIds', '')}
                    className="text-xs font-bold text-rose-500 hover:text-rose-600"
                  >
                    Reset Pilihan
                  </button>
                )}
              </div>

              {/* Searchable Product Combobox */}
              <div className="w-full">
                <Combobox
                  options={products
                    .filter((p) => !selectedProductIds.includes(p.id))
                    .map((p) => ({
                      label: `${p.name} ${p.category?.name ? `(${p.category.name})` : ''} - Rp ${Number(p.price || 0).toLocaleString('id-ID')}`,
                      value: p.id,
                    }))}
                  value=""
                  onChange={(val) => {
                    if (val) {
                      toggleSelectProduct(Number(val));
                    }
                  }}
                  placeholder="Cari dan pilih produk untuk ditambahkan..."
                  emptyText="Produk tidak ditemukan atau sudah dipilih."
                />
              </div>

              {/* Table of Selected Products */}
              {selectedProductsList.length > 0 ? (
                <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-white/5 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-white/10">
                      <tr>
                        <th className="px-4 py-2.5">Produk</th>
                        <th className="px-4 py-2.5">Kategori</th>
                        <th className="px-4 py-2.5 text-right">Harga</th>
                        <th className="px-4 py-2.5 text-center w-16">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {selectedProductsList.map((product) => {
                        const img = (product.images && product.images.length > 0)
                          ? product.images[0]
                          : (product.imageUrl || (product as any).img);

                        return (
                          <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                            <td className="px-4 py-2.5 font-bold flex items-center gap-2.5">
                              {img ? (
                                <img src={img} alt="" className="w-8 h-8 rounded-lg object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[10px] text-slate-400">
                                  No Img
                                </div>
                              )}
                              <span>{product.name}</span>
                            </td>
                            <td className="px-4 py-2.5 text-slate-500">{product.category?.name || '-'}</td>
                            <td className="px-4 py-2.5 text-right font-bold text-slate-800 dark:text-slate-200">
                              Rp {Number(product.price || 0).toLocaleString('id-ID')}
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => toggleSelectProduct(product.id)}
                                className="text-rose-500 hover:text-rose-700 font-bold px-2 py-1 rounded"
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-6 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl text-slate-400 text-xs">
                  Belum ada produk yang dipilih. Silakan pilih produk dari dropdown di atas.
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Judul</FormLabel>
                  <FormControl>
                    <Input placeholder="Judul item..." {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Subtitle</FormLabel>
                  <FormControl>
                    <Input placeholder="Subtitle / deskripsi singkat..." {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Tag / Badge</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. HOT, NEW, 50% OFF" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Deep Link URL</FormLabel>
                  <FormControl>
                    <Input placeholder="zelvira://..." {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Gambar Banner</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value || ''}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-xl border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="font-bold">Status Aktif</FormLabel>
                  <p className="text-xs text-slate-500">Tampilkan item ini di aplikasi mobile</p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </Form>
    </CrudForm>
  );
}
