'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContentService } from '@/services/content.service';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm, SubmitHandler } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Switch } from '@/components/ui/switch';
import {
  ArrowLeft, Save, Loader2, LayoutGrid,
  Monitor, Smartphone, Package, Plus, Trash2, Tag, Percent, DollarSign
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { ProductService } from '@/services/product.service';
import { Combobox } from '@/components/ui/combobox';
import { ContentItem } from '@/types/content';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const sectionSchema = z.object({
  id: z.number().optional(),
  platform: z.enum(['WEB', 'MOBILE', 'ALL']),
  type: z.string().min(1, 'Type is required'),
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  displayOrder: z.number().optional().nullable(),
  isActive: z.boolean(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

type SectionFormValues = z.infer<typeof sectionSchema>;

interface ContentSectionFormProps {
  id?: string;
}

export default function ContentSectionForm({ id }: ContentSectionFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedType = searchParams.get('type');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const isNew = !id || id === 'new';

  const form = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema) as any,
    defaultValues: {
      platform: 'WEB',
      type: preSelectedType || '',
      title: '',
      subtitle: '',
      displayOrder: 0,
      isActive: true,
      startDate: '',
      endDate: '',
    },
  });

  useEffect(() => {
    const loadData = async () => {
      if (!isNew && id) {
        setIsLoading(true);
        try {
          const data = await ContentService.getSectionById(id);
          form.reset(data);
          if (data.items) {
            setItems(data.items);
          }
        } catch {
          toast({ title: 'Error', description: 'Gagal memuat data section', variant: 'destructive' });
        } finally {
          setIsLoading(false);
        }
      }
    };

    const loadProducts = async () => {
      try {
        const resp = await ProductService.getAll(0, 100);
        setProducts(resp.content || []);
      } catch (e) {
        console.error('Failed to load products', e);
      }
    };

    loadData();
    loadProducts();
  }, [id, isNew]);

  const handleAddItem = async (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newItem: Partial<ContentItem> = {
      sectionId: Number(id),
      type: 'FLASH_SALE_WEB',
      platform: form.getValues('platform'),
      productId: productId,
      title: product.name,
      isActive: true,
      discountType: 'PERCENT',
      discountValue: 10,
      price: product.price ? product.price * 0.9 : 0,
      quantity: 50,
      maxPurchase: 1,
      soldQty: 0,
      displayOrder: items.length
    };

    try {
      const saved = await ContentService.createItem(newItem as any);
      setItems([...items, saved]);
      toast({ title: 'Berhasil', description: 'Produk ditambahkan ke Flash Sale' });
    } catch (e) {
      toast({ title: 'Error', description: 'Gagal menambahkan produk', variant: 'destructive' });
    }
  };

  const handleUpdateItem = async (itemId: number, updates: Partial<ContentItem>) => {
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) return;

      const updated = await ContentService.updateItem(itemId, { ...item, ...updates } as any);
      setItems(items.map(i => i.id === itemId ? updated : i));
    } catch (e) {
      toast({ title: 'Error', description: 'Gagal update item', variant: 'destructive' });
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      await ContentService.deleteItem(itemId);
      setItems(items.filter(i => i.id !== itemId));
      toast({ title: 'Berhasil', description: 'Produk dihapus dari Flash Sale' });
    } catch (e) {
      toast({ title: 'Error', description: 'Gagal menghapus produk', variant: 'destructive' });
    }
  };

  const onSubmit: SubmitHandler<SectionFormValues> = async (values) => {
    setIsLoading(true);
    try {
      if (isNew) {
        await ContentService.createSection(values);
        toast({ title: 'Berhasil', description: 'Section berhasil dibuat' });
      } else {
        await ContentService.updateSection(Number(id), values);
        toast({ title: 'Berhasil', description: 'Section berhasil diupdate' });
      }
      router.push('/admin/content-sections');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Gagal menyimpan section', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full hover:bg-white dark:hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {isNew ? 'Tambah Section Baru' : 'Edit Section'}
            </h1>
            <p className="text-slate-400 text-xs font-semibold">
              {isNew ? 'Buat grup konten baru untuk storefront.' : `Mengedit section ID: ${id}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/content-sections')}
            className="rounded-full font-bold text-xs uppercase"
          >
            Batal
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
            className="rounded-full bg-pink-500 hover:bg-pink-600 text-white font-black uppercase tracking-widest px-8 shadow-lg shadow-pink-500/20"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Simpan Section
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl space-y-6">
          <div className="bg-white/60 dark:bg-slate-900/60 p-8 rounded-[3rem] border border-white/20 shadow-sm backdrop-blur-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Platform Selection */}
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Platform</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-2xl h-12 border-none bg-slate-100 dark:bg-white/5 font-bold">
                          <SelectValue placeholder="Pilih Platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl border-white/20 backdrop-blur-xl">
                        <SelectItem value="WEB" className="rounded-xl font-bold">WEB (Desktop/Browser)</SelectItem>
                        <SelectItem value="MOBILE" className="rounded-xl font-bold">MOBILE (App/Flutter)</SelectItem>
                        <SelectItem value="ALL" className="rounded-xl font-bold">ALL PLATFORMS</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type / Identifier */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type (Identifier)</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-12 rounded-2xl border-none bg-slate-100 dark:bg-white/5 font-semibold" placeholder="CONTOH: HERO_CAROUSEL, NEW_ARRIVALS" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Judul Section</FormLabel>
                    <FormControl>
                      <Input {...field as any} className="h-12 rounded-2xl border-none bg-slate-100 dark:bg-white/5 font-semibold" placeholder="Judul yang tampil di UI" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Subtitle / Banner URL */}
              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {form.watch('type') === 'FLASH_SALE_WEB' ? 'Banner Image URL' : 'Subtitle'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field as any}
                        className="h-12 rounded-2xl border-none bg-slate-100 dark:bg-white/5 font-semibold"
                        placeholder={form.watch('type') === 'FLASH_SALE_WEB' ? 'URL Gambar Banner Flash Sale (Opsional)' : 'Keterangan tambahan'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Active Status */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-white/5 p-4 mt-2">
                    <div>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Active Status</FormLabel>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Tampilkan section ini?</p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Start Date */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Start Date (Flash Sale)</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field as any} className="h-12 rounded-2xl border-none bg-slate-100 dark:bg-white/5 font-semibold" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Date */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">End Date (Flash Sale)</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field as any} className="h-12 rounded-2xl border-none bg-slate-100 dark:bg-white/5 font-semibold" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Flash Sale Product Manager */}
          {form.watch('type') === 'FLASH_SALE_WEB' && !isNew && (
            <div className="bg-white/60 dark:bg-slate-900/60 p-8 rounded-[3rem] border border-white/20 shadow-sm backdrop-blur-xl mt-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                    <Package size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Atur Produk Flash Sale</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Satu sesi flash sale bisa banyak produk langsung.</p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => setIsAddingProduct(!isAddingProduct)}
                  className="rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-[10px] uppercase tracking-widest px-6"
                >
                  <Plus size={14} className="mr-2" /> {isAddingProduct ? 'Batal' : 'Tambah Produk'}
                </Button>
              </div>

              {isAddingProduct && (
                <div className="mb-8 p-6 bg-slate-100 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in-95 duration-300">
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Pilih Produk dari Inventory</FormLabel>
                  <Combobox
                    options={products.map(p => ({ label: p.name, value: p.id }))}
                    onChange={(val) => {
                      handleAddItem(val as number);
                      setIsAddingProduct(false);
                    }}
                    placeholder="Cari nama produk..."
                  />
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="text-left px-6 py-2">Produk</th>
                      <th className="text-left px-4 py-2">Harga Asli</th>
                      <th className="text-left px-4 py-2">Potongan / Diskon</th>
                      <th className="text-left px-4 py-2 w-32">Flash Price</th>
                      <th className="text-left px-4 py-2 w-24">Stok</th>
                      <th className="text-left px-4 py-2 w-24">Limit</th>
                      <th className="text-left px-4 py-2 w-24">Terjual</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[2.5rem]">
                          <Package className="h-10 w-10 text-slate-200 mx-auto mb-3 opacity-30" />
                          <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Belum ada produk di sesi ini</p>
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => (
                        <tr key={item.id} className="group bg-white dark:bg-slate-800/40 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all duration-300">
                          {/* PRODUCT NAME */}
                          <td className="px-6 py-4 rounded-l-[1.5rem] border-y border-l border-slate-50 dark:border-white/5">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-0.5">ID: {item.productId}</span>
                              <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{item.title}</span>
                            </div>
                          </td>

                          {/* ORIGINAL PRICE */}
                          <td className="px-4 py-4 border-y border-slate-50 dark:border-white/5">
                            <span className="text-xs font-bold text-slate-500">
                              Rp {item.product?.price?.toLocaleString('id-ID') || '0'}
                            </span>
                          </td>

                          {/* DISCOUNT LOGIC */}
                          <td className="px-4 py-4 border-y border-slate-50 dark:border-white/5">
                            <div className="flex items-center gap-2">
                              <select
                                value={item.discountType || 'PERCENT'}
                                onChange={(e) => handleUpdateItem(item.id!, { discountType: e.target.value })}
                                className="h-9 rounded-xl bg-slate-100 dark:bg-white/5 border-none text-[10px] font-black uppercase px-2 focus:ring-1 focus:ring-amber-500"
                              >
                                <option value="PERCENT">%</option>
                                <option value="FIXED_PRICE">Rp Fix</option>
                                <option value="FIXED_AMOUNT">Rp Off</option>
                              </select>
                              <div className="relative">
                                <Input
                                  type="number"
                                  value={item.discountValue || 0}
                                  onChange={(e) => handleUpdateItem(item.id!, { discountValue: parseFloat(e.target.value) || 0 })}
                                  className="h-9 w-24 rounded-xl bg-slate-100 dark:bg-white/5 border-none text-xs font-black"
                                />
                              </div>
                            </div>
                          </td>

                          {/* FLASH PRICE */}
                          <td className="px-4 py-4 border-y border-slate-50 dark:border-white/5">
                            <Input
                              type="number"
                              value={item.price || 0}
                              onChange={(e) => handleUpdateItem(item.id!, { price: parseFloat(e.target.value) || 0 })}
                              className="h-9 w-28 rounded-xl bg-amber-50 dark:bg-amber-900/10 border-none text-xs font-black text-amber-600"
                            />
                          </td>

                          {/* STOCK */}
                          <td className="px-4 py-4 border-y border-slate-50 dark:border-white/5">
                            <Input
                              type="number"
                              value={item.quantity || 0}
                              onChange={(e) => handleUpdateItem(item.id!, { quantity: parseInt(e.target.value) || 0 })}
                              className="h-9 w-20 rounded-xl bg-slate-100 dark:bg-white/5 border-none text-xs font-black"
                            />
                          </td>

                          {/* MAX PURCHASE */}
                          <td className="px-4 py-4 border-y border-slate-50 dark:border-white/5">
                            <Input
                              type="number"
                              value={item.maxPurchase || 0}
                              onChange={(e) => handleUpdateItem(item.id!, { maxPurchase: parseInt(e.target.value) || 0 })}
                              className="h-9 w-20 rounded-xl bg-slate-100 dark:bg-white/5 border-none text-xs font-black text-blue-500"
                            />
                          </td>

                          {/* SOLD QTY */}
                          <td className="px-4 py-4 border-y border-slate-50 dark:border-white/5">
                            <div className="h-9 w-20 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-xs font-black text-slate-400">
                              {item.soldQty || 0}
                            </div>
                          </td>

                          {/* ACTIONS */}
                          <td className="px-4 py-4 rounded-r-[1.5rem] border-y border-r border-slate-50 dark:border-white/5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteItem(item.id!)}
                              className="h-8 w-8 rounded-full hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/20 transition-colors"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
