'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductService } from '@/services/product.service';
import { FlashSaleService } from '@/services/flash-sale.service';
import { Product } from '@/types/product';
import { FlashSale } from '@/types/flash-sale';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  Trash2,
  Zap,
  Calendar,
  Tag,
  ArrowLeft,
  Save,
  Loader2,
  Monitor,
  Smartphone,
  ImageIcon,
  ShoppingBag,
  Percent,
  CheckCircle2,
  Boxes,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Badge } from '@/components/ui/badge';
import { BannerImageUpload } from '@/components/ui/banner-image-upload';
import { formatImageUrl } from '@/lib/url-utils';

const flashSaleItemSchema = z.object({
  id: z.number().optional(),
  productId: z.coerce.number().min(1, 'Produk wajib diisi'),
  variantId: z.coerce.number().min(1, 'Varian wajib dipilih'),
  discountPrice: z.coerce.number().min(1, 'Harga flash sale harus lebih dari 0'),
  stockLimit: z.coerce.number().min(1, 'Stok minimal 1'),
  maxPurchasePerUser: z.coerce.number().optional(),
});

const flashSaleSchema = z.object({
  name: z.string().min(2, 'Nama kampanye wajib diisi (min 2 karakter)'),
  bannerUrl: z.string().optional(),
  startTime: z.string().min(1, 'Waktu mulai wajib diisi'),
  endTime: z.string().min(1, 'Waktu selesai wajib diisi'),
  isActive: z.boolean().default(true),
  maxPurchasePerUser: z.coerce.number().optional(),
  items: z.array(flashSaleItemSchema).min(1, 'Minimal 1 produk dalam flash sale'),
});

type FlashSaleFormValues = z.infer<typeof flashSaleSchema>;

interface FlashSaleFormPageProps {
  id: string;
  platform: 'WEB' | 'MOBILE';
  backPath: string;
}

export default function FlashSaleFormPage({ id, platform, backPath }: FlashSaleFormPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const isNew = id === 'new';

  const form = useForm<FlashSaleFormValues>({
    resolver: zodResolver(flashSaleSchema) as any,
    defaultValues: {
      name: '',
      bannerUrl: '',
      startTime: '',
      endTime: '',
      isActive: true,
      maxPurchasePerUser: 0,
      items: [{ productId: 0, variantId: 0, discountPrice: 0, stockLimit: 10, maxPurchasePerUser: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const prodData = await ProductService.getAll(0, 250);
        setProducts(prodData.content || []);

        if (!isNew) {
          const data = await FlashSaleService.getById(id);
          form.reset({
            name: data.name,
            bannerUrl: data.bannerUrl || '',
            startTime: data.startTime ? data.startTime.substring(0, 16) : '',
            endTime: data.endTime ? data.endTime.substring(0, 16) : '',
            isActive: data.isActive,
            maxPurchasePerUser: data.maxPurchasePerUser || 0,
            items: data.items?.map(item => ({
              id: item.id,
              productId: item.productId,
              variantId: item.variantId,
              discountPrice: item.discountPrice,
              stockLimit: item.stockLimit || 10,
              maxPurchasePerUser: item.maxPurchasePerUser || 0,
            })) || [],
          });
        }
      } catch (error) {
        toast({ title: 'Error', description: 'Gagal memuat data', variant: 'destructive' });
      }
    };
    loadData();
  }, [id, isNew]);

  const onSubmit = async (values: FlashSaleFormValues) => {
    setIsLoading(true);
    try {
      const payload = { ...values, platform };
      if (isNew) {
        await FlashSaleService.create(payload as any);
        toast({ title: 'Berhasil', description: 'Flash sale berhasil dibuat' });
      } else {
        await FlashSaleService.update(id, payload as any);
        toast({ title: 'Berhasil', description: 'Flash sale berhasil diupdate' });
      }
      router.push(backPath);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Gagal menyimpan flash sale', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const platformColor = platform === 'WEB' ? 'text-violet-600 bg-violet-50 dark:bg-violet-950/30' : 'text-sky-600 bg-sky-50 dark:bg-sky-950/30';
  const PlatformIcon = platform === 'WEB' ? Monitor : Smartphone;

  // Format product combobox options with category and price
  const productComboboxOptions = products.map(p => ({
    label: `${p.name} — Rp ${Number(p.price || 0).toLocaleString('id-ID')}`,
    value: p.id
  }));

  // Calculate live summary
  const watchedItems = form.watch('items') || [];
  const validProductsCount = watchedItems.filter(it => it.productId > 0).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-16">
      {/* Header — Standardized with News & Fashion Articles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(backPath)}
            className="h-10 w-10 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner flex-shrink-0">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Badge className={`${platformColor} text-[10px] font-bold uppercase tracking-widest border-none px-2 py-0.5 rounded-full flex items-center gap-1`}>
                <PlatformIcon size={11} />
                {platform === 'WEB' ? 'Storefront Website' : 'Aplikasi Mobile'}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              {isNew ? 'Buat Flash Sale Baru' : 'Edit Flash Sale'}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Atur banner promosi, durasi countdown timer, dan tentukan kuota diskon tiap produk.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push(backPath)} className="rounded-xl font-bold text-xs uppercase">
            Batal
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
            className="rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold px-8 shadow-lg shadow-pink-500/20"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Simpan Flash Sale
          </Button>
        </div>
      </div>

      <Form {...form}>
        <div className="space-y-8">
          {/* Section 1: Informasi Sesi & Banner Flash Sale */}
          <div className="bg-white/80 dark:bg-slate-900/80 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-xl space-y-6 relative z-20">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-white/5">
              <div className="h-10 w-10 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-600">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold uppercase tracking-tight text-slate-900 dark:text-white">
                  Informasi Sesi Flash Sale
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Pengaturan nama kampanye, banner visual, dan durasi countdown timer.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Nama Kampanye */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Nama Kampanye Flash Sale
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Contoh: MIDNIGHT FLASH SALE 10.10"
                        className="h-12 rounded-2xl border-slate-200 dark:border-white/10 font-bold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Upload Gambar Banner (Bukan Link URL) */}
              <FormField
                control={form.control}
                name="bannerUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
                      <ImageIcon size={14} className="text-pink-500" />
                      Gambar Banner Flash Sale Website
                    </FormLabel>
                    <FormControl>
                      <BannerImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        label="Upload Banner Flash Sale Website"
                        description="Format file JPG, PNG, atau WEBP. Rekomendasi rasio lanskap widescreen (16:9 atau 21:9)."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Countdown Schedule (Start & End Time) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
                        <Calendar size={13} className="text-orange-500" /> Waktu Mulai (Countdown)
                      </FormLabel>
                      <FormControl>
                        <DateTimePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Pilih tanggal & waktu mulai"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
                        <Calendar size={13} className="text-red-500" /> Waktu Berakhir
                      </FormLabel>
                      <FormControl>
                        <DateTimePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Pilih tanggal & waktu berakhir"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Global Limit & Status Switch */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <FormField
                  control={form.control}
                  name="maxPurchasePerUser"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Batas Maks Pembelian / User (Global)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          placeholder="0 = Tanpa batas per akun"
                          className="h-12 rounded-2xl border-slate-200 dark:border-white/10 font-bold"
                        />
                      </FormControl>
                      <p className="text-[11px] text-slate-400">Isi 0 jika tidak ada batasan kuota per pelanggan.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-white/[0.02] p-4 border border-slate-200/80 dark:border-white/5 mt-auto">
                      <div>
                        <FormLabel className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                          Status Flash Sale Aktif
                        </FormLabel>
                        <p className="text-xs text-slate-400 mt-0.5">Tampilkan sesi promo ini di storefront</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Flash Sale Details (Daftar Produk) — Clean Card-based List */}
          <div className="bg-white/80 dark:bg-slate-900/80 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-xl space-y-6 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Tag size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold uppercase tracking-tight text-slate-900 dark:text-white">
                    Flash Sale Details (Daftar Produk)
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Atur produk, varian, harga diskon kilat, serta kuota stok untuk tiap produk.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => append({ productId: 0, variantId: 0, discountPrice: 0, stockLimit: 10, maxPurchasePerUser: 0 })}
                className="rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs gap-2 shadow-md shadow-pink-500/20"
              >
                <Plus size={16} /> Tambah Produk
              </Button>
            </div>

            {fields.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl space-y-3">
                <Tag className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-500">Belum ada produk yang dimasukkan ke Flash Sale</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Klik tombol di bawah untuk menambahkan produk diskon kilat ke dalam sesi ini.
                </p>
                <Button
                  type="button"
                  onClick={() => append({ productId: 0, variantId: 0, discountPrice: 0, stockLimit: 10, maxPurchasePerUser: 0 })}
                  className="rounded-xl bg-pink-500 text-white font-bold text-xs gap-1.5 mt-2"
                >
                  <Plus size={14} /> Tambah Produk Pertama
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((fieldItem, index) => {
                  const selectedProductId = form.watch(`items.${index}.productId`);
                  const selectedVariantId = form.watch(`items.${index}.variantId`);
                  const discountPrice = Number(form.watch(`items.${index}.discountPrice`)) || 0;

                  const selectedProduct = products.find(p => p.id === Number(selectedProductId));
                  const selectedVariant = selectedProduct?.variants?.find(v => v.id === Number(selectedVariantId));

                  // Determine normal price
                  const normalPrice = selectedVariant?.price || selectedProduct?.price || 0;

                  // Calculate discount percentage and saving
                  let discountPercent = 0;
                  let savings = 0;
                  if (normalPrice > 0 && discountPrice > 0) {
                    savings = normalPrice - discountPrice;
                    discountPercent = Math.round((savings / normalPrice) * 100);
                  }

                  const variantOptions = selectedProduct?.variants?.map(v => ({
                    label: `${v.sku} ${v.color ? `• ${v.color}` : ''} ${v.size ? `(${v.size})` : ''} — Normal: Rp ${Number(v.price || selectedProduct.price || 0).toLocaleString('id-ID')} (Stok: ${v.stock ?? '-'})`,
                    value: v.id
                  })) || [];

                  const productImg = selectedProduct?.imageUrl;

                  return (
                    <div
                      key={fieldItem.id}
                      className="p-5 md:p-6 rounded-3xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-5 transition-all hover:border-pink-500/40 hover:shadow-sm"
                    >
                      {/* Product Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-white/5">
                        <div className="flex items-center gap-3">
                          <span className="h-7 w-7 rounded-full bg-pink-500/10 text-pink-600 font-bold text-xs flex items-center justify-center flex-shrink-0">
                            #{index + 1}
                          </span>
                          {selectedProduct ? (
                            <div className="flex items-center gap-3">
                              {productImg ? (
                                <img
                                  src={formatImageUrl(productImg)}
                                  alt={selectedProduct.name}
                                  className="h-10 w-10 rounded-xl object-cover border border-slate-200 dark:border-white/10 flex-shrink-0"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-400 flex-shrink-0">
                                  <ShoppingBag size={16} />
                                </div>
                              )}
                              <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                                  {selectedProduct.name}
                                </h4>
                                <p className="text-xs text-slate-400">
                                  Harga Normal: <span className="font-semibold text-slate-700 dark:text-slate-200">Rp {Number(normalPrice).toLocaleString('id-ID')}</span>
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs font-semibold text-slate-400">
                              Pilih produk untuk diikutsertakan ke dalam Flash Sale
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {discountPrice > 0 && normalPrice > 0 && (
                            discountPrice < normalPrice ? (
                              <Badge className="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-500/20 font-bold text-xs px-2.5 py-1">
                                Hemat Rp {savings.toLocaleString('id-ID')} (-{discountPercent}%)
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500/10 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-500/20 font-bold text-xs px-2.5 py-1 flex items-center gap-1">
                                <AlertCircle size={12} /> Diskon belum berlaku
                              </Badge>
                            )
                          )}

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                            className="h-8 rounded-xl text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-2.5 gap-1.5"
                          >
                            <Trash2 size={14} /> Hapus
                          </Button>
                        </div>
                      </div>

                      {/* Row 1: Pilih Produk & Pilih Varian */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
                        <FormField
                          control={form.control}
                          name={`items.${index}.productId`}
                          render={({ field }) => (
                            <FormItem className="min-w-0">
                              <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                <ShoppingBag size={12} className="text-pink-500 shrink-0" /> Pilih Produk
                              </FormLabel>
                              <FormControl>
                                <Combobox
                                  options={productComboboxOptions}
                                  value={field.value}
                                  onChange={(val) => {
                                    field.onChange(val);
                                    // Auto select first variant if available
                                    const prod = products.find(p => p.id === Number(val));
                                    if (prod && prod.variants && prod.variants.length > 0) {
                                      form.setValue(`items.${index}.variantId`, prod.variants[0].id);
                                    } else {
                                      form.setValue(`items.${index}.variantId`, 0);
                                    }
                                  }}
                                  placeholder="Cari nama produk..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.variantId`}
                          render={({ field }) => (
                            <FormItem className="min-w-0">
                              <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                <Tag size={12} className="text-amber-500 shrink-0" /> Pilih Varian Produk
                              </FormLabel>
                              <FormControl>
                                <Combobox
                                  options={variantOptions}
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder={selectedProductId ? 'Pilih varian...' : 'Pilih produk terlebih dahulu'}
                                  disabled={!selectedProductId}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Row 2: Diskon, Kuota Stok, & Limit User */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                        <FormField
                          control={form.control}
                          name={`items.${index}.discountPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                <Percent size={12} className="text-emerald-500" /> Harga Flash Sale (Rp)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  placeholder="Contoh: 75000"
                                  className="h-11 rounded-2xl border-slate-200 dark:border-white/10 font-bold bg-white dark:bg-white/5 text-emerald-600 dark:text-emerald-400"
                                />
                              </FormControl>
                              {normalPrice > 0 && discountPrice > 0 && discountPrice < normalPrice && (
                                <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                                  Hemat Rp {savings.toLocaleString('id-ID')} ({discountPercent}% OFF)
                                </p>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.stockLimit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                <Boxes size={12} className="text-blue-500" /> Kuota Stok Flash Sale
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  placeholder="10"
                                  className="h-11 rounded-2xl border-slate-200 dark:border-white/10 font-bold bg-white dark:bg-white/5"
                                />
                              </FormControl>
                              <p className="text-[11px] text-slate-400 mt-1">Stok promo yang dialokasikan</p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.maxPurchasePerUser`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                <UserCheck size={12} className="text-violet-500" /> Limit Pembelian / User
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  placeholder="0 = Bebas"
                                  className="h-11 rounded-2xl border-slate-200 dark:border-white/10 font-bold bg-white dark:bg-white/5"
                                />
                              </FormControl>
                              <p className="text-[11px] text-slate-400 mt-1">0 = Bebas / tanpa limit akun</p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Actions & Summary Bar */}
            {fields.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
                <p className="text-xs text-slate-500 font-semibold">
                  Total <span className="text-pink-600 font-bold">{validProductsCount}</span> produk siap dipromosikan dalam sesi ini.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ productId: 0, variantId: 0, discountPrice: 0, stockLimit: 10, maxPurchasePerUser: 0 })}
                  className="rounded-2xl border-slate-200 dark:border-white/10 font-bold text-xs gap-1.5 hover:bg-pink-50 hover:text-pink-600"
                >
                  <Plus size={14} /> Tambah Produk Lainnya
                </Button>
              </div>
            )}
          </div>
        </div>
      </Form>
    </div>
  );
}
