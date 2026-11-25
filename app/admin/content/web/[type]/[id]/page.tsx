'use client';

import { use, useMemo } from 'react';
import { CrudForm } from '@/components/admin/crud-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from '@/components/ui/image-upload';
import { Combobox } from '@/components/ui/combobox';
import { Badge } from '@/components/ui/badge';
import { useWebContentItemForm } from '@/hooks/use-web-content-item-form';
import {
  Sparkles,
  ShoppingBag,
  Star,
  Heart,
  LayoutTemplate,
  Zap,
  Tag,
  Clock,
  Shirt,
  Image as ImageIcon,
  Bell,
  Trash2,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ type: string; id: string }>;
}

const FEATURED_TABS = [
  { value: 'BEST_SELLER', label: '🌟 Koleksi Produk Unggulan', desc: 'Section 1: Produk terlaris & unggulan utama' },
  { value: 'NEW_ARRIVAL', label: '✨ New Arrivals - Rilisan Terbaru', desc: 'Section 2: Runway Atelier SS 2026' },
  { value: 'SALE', label: '🔥 Promo Sale & Special Offers', desc: 'Section 3: Bento Grid Diskon & Flash Promo' },
  { value: 'TRENDING', label: '👑 Produk Terbaru & Populer', desc: 'Section 4: Leaderboard Hall of Fame Podium' },
];

const GRADIENT_PRESETS = [
  { label: 'Pink Rose (Default)', value: 'from-pink-50,to-rose-100,from-pink-400 to-rose-600', preview: 'from-pink-100 to-rose-200' },
  { label: 'Ocean Indigo', value: 'from-blue-50,to-indigo-100,from-blue-500 to-indigo-600', preview: 'from-blue-100 to-indigo-200' },
  { label: 'Sunset Amber', value: 'from-amber-50,to-orange-100,from-amber-500 to-orange-600', preview: 'from-amber-100 to-orange-200' },
  { label: 'Violet Luxury', value: 'from-purple-50,to-violet-100,from-purple-500 to-indigo-600', preview: 'from-purple-100 to-violet-200' },
  { label: 'Emerald Mint', value: 'from-emerald-50,to-teal-100,from-emerald-500 to-teal-600', preview: 'from-emerald-100 to-teal-200' },
];

export default function WebContentItemEditPage({ params }: PageProps) {
  const { type, id } = use(params);
  const { form, isLoading, isNew, onSubmit, products } = useWebContentItemForm(type, id);

  // Multi-product selection parsing for Flash Sale Web
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
    form.setValue('productIds', nextIds.join(','));
  };

  const selectedProductsList = useMemo(() => {
    return selectedProductIds
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean) as typeof products;
  }, [selectedProductIds, products]);

  // Selected single product for Featured / Recommendation / Lookbook
  const selectedProductId = form.watch('productId');
  const selectedSingleProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return products.find((p) => p.id === Number(selectedProductId)) || null;
  }, [selectedProductId, products]);

  const getSectionTitle = () => {
    switch (type) {
      case 'HERO_CAROUSEL': return 'Hero Carousel Banner';
      case 'FLASH_SALE_WEB': return 'Flash Sale Website';
      case 'FEATURED_PRODUCTS': return 'Featured Product';
      case 'SHOP_THE_LOOK': return 'Shop the Look';
      case 'BRANDS_SECTION': return 'Brand Partner';
      case 'RECOMMENDED_PRODUCTS': return 'Rekomendasi Produk';
      case 'TESTIMONIALS': return 'Testimonial Pelanggan';
      case 'DEALS': return 'Exclusive Deal';
      case 'NEWSLETTER': return 'Newsletter Section';
      default: return type;
    }
  };

  return (
    <CrudForm
      title={isNew ? `Tambah ${getSectionTitle()}` : `Edit ${getSectionTitle()}`}
      subtitle={`Kelola konten spesifik untuk seksi ${type} pada storefront website`}
      onSubmit={form.handleSubmit(onSubmit)}
      isLoading={isLoading}
    >
      <Form {...form}>
        <div className="space-y-8">

          {/* ═════════════════════════════════════════════════════════════════════
              1. HERO CAROUSEL
             ═════════════════════════════════════════════════════════════════════ */}
          {type === 'HERO_CAROUSEL' && (
            <div className="space-y-6">
              <div className="p-4 bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-900/30 rounded-2xl flex items-center gap-3">
                <LayoutTemplate className="text-pink-600 flex-shrink-0" size={24} />
                <div className="text-xs">
                  <p className="font-bold text-pink-900 dark:text-pink-300">Banner Slideshow Utama</p>
                  <p className="text-pink-700 dark:text-pink-400">Tampil fullscreen di bagian atas homepage dengan judul, CTA, dan gambar menarik.</p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Gambar Banner Desktop (Rasio 16:9 / Widescreen)</FormLabel>
                    <FormControl>
                      <ImageUpload value={field.value || ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Judul Banner Utama</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Summer Aesthetic 2026" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="badgeText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Badge / Tag Promo</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: NEW ARRIVAL atau 50% OFF" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Subjudul / Deskripsi Banner</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Jelajahi koleksi busana kurasi terbaik untuk gaya santai dan elegan." {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="ctaText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Teks Tombol CTA</FormLabel>
                      <FormControl>
                        <Input placeholder="Belanja Sekarang" {...field} value={field.value || ''} />
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
                      <FormLabel className="font-bold">Link Tujuan Tombol CTA</FormLabel>
                      <FormControl>
                        <Input placeholder="/products atau /categories/fashion" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="styleConfig"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Tema Gradient Background Slide</FormLabel>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {GRADIENT_PRESETS.map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => field.onChange(preset.value)}
                          className={`p-3 rounded-xl border text-left flex flex-col gap-2 transition-all ${field.value === preset.value
                              ? 'border-pink-500 ring-2 ring-pink-500/20 bg-pink-50/20'
                              : 'border-slate-200 dark:border-white/10 hover:border-slate-300'
                            }`}
                        >
                          <div className={`h-6 w-full rounded-lg bg-linear-to-r ${preset.preview}`} />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{preset.label}</span>
                        </button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════
              2. FLASH SALE WEB
             ═════════════════════════════════════════════════════════════════════ */}
          {type === 'FLASH_SALE_WEB' && (
            <div className="space-y-6">
              <div className="p-4 bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 rounded-2xl flex items-center gap-3">
                <Zap className="text-orange-600 flex-shrink-0" size={24} />
                <div className="text-xs">
                  <p className="font-bold text-orange-900 dark:text-orange-300">Flash Sale Homepage Website</p>
                  <p className="text-orange-700 dark:text-orange-400">Atur banner promo, periode countdown timer, dan pilih produk-produk yang ikut serta dalam sesi flash sale.</p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-orange-500" /> Upload Gambar Banner Flash Sale
                    </FormLabel>
                    <FormControl>
                      <ImageUpload value={field.value || ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Judul Sesi Flash Sale</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Midnight Flash Sale 10.10" {...field} value={field.value || ''} />
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
                      <FormLabel className="font-bold">Subjudul / Teaser</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Diskon gila-gilaan hingga 70% hanya hari ini!" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/10">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold flex items-center gap-1.5">
                        <Clock size={14} className="text-orange-500" /> Waktu Mulai (Countdown)
                      </FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold flex items-center gap-1.5">
                        <Clock size={14} className="text-red-500" /> Waktu Berakhir (Countdown Selesai)
                      </FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Multi Product Selector for Flash Sale */}
              <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      Pilih Produk Flash Sale ({selectedProductIds.length} Produk Dipilih)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Cari dan tambahkan produk yang akan tampil di kartu promo Flash Sale pada website.
                    </p>
                  </div>
                  {selectedProductIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => form.setValue('productIds', '')}
                      className="text-xs font-bold text-rose-500 hover:text-rose-600"
                    >
                      Reset Semua Produk
                    </button>
                  )}
                </div>

                <Combobox
                  options={products
                    .filter((p) => !selectedProductIds.includes(p.id))
                    .map((p) => ({
                      label: `${p.name} - Rp ${Number(p.price || 0).toLocaleString('id-ID')}`,
                      value: p.id,
                    }))}
                  value=""
                  onChange={(val) => {
                    if (val) toggleSelectProduct(Number(val));
                  }}
                  placeholder="Ketik nama produk untuk ditambahkan ke Flash Sale..."
                  emptyText="Semua produk sudah dipilih atau tidak ditemukan."
                />

                {selectedProductsList.length > 0 && (
                  <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 dark:bg-white/5 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-white/10">
                        <tr>
                          <th className="px-4 py-2.5">Produk</th>
                          <th className="px-4 py-2.5">Kategori</th>
                          <th className="px-4 py-2.5 text-right">Harga Normal</th>
                          <th className="px-4 py-2.5 text-center w-16">Hapus</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {selectedProductsList.map((product) => (
                          <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                            <td className="px-4 py-2.5 font-bold flex items-center gap-2.5">
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px]">No Img</div>
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
                                className="text-rose-500 hover:text-rose-700 p-1 rounded"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Banner Header Flash Sale (Opsional)</FormLabel>
                    <FormControl>
                      <ImageUpload value={field.value || ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════
              3. FEATURED PRODUCTS
             ═════════════════════════════════════════════════════════════════════ */}
          {type === 'FEATURED_PRODUCTS' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-2xl flex items-center gap-3">
                <ShoppingBag className="text-blue-600 flex-shrink-0" size={24} />
                <div className="text-xs">
                  <p className="font-bold text-blue-900 dark:text-blue-300">Produk Unggulan (Featured Products)</p>
                  <p className="text-blue-700 dark:text-blue-400">Pilih produk dari master dan tentukan tab tampilannya (Best Seller, New Arrival, Sale, Trending).</p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="tag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Tab Kategori Tampilan</FormLabel>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {FEATURED_TABS.map((tab) => (
                        <button
                          key={tab.value}
                          type="button"
                          onClick={() => field.onChange(tab.value)}
                          className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${field.value === tab.value
                              ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/30'
                              : 'border-slate-200 dark:border-white/10 hover:border-slate-300'
                            }`}
                        >
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{tab.label}</span>
                          <span className="text-[10px] text-slate-400">{tab.desc}</span>
                        </button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Pilih Produk Dari Master</FormLabel>
                    <Combobox
                      options={products.map((p) => ({
                        label: `${p.name} (${p.category?.name || 'No Cat'}) - Rp ${Number(p.price || 0).toLocaleString('id-ID')}`,
                        value: p.id,
                      }))}
                      value={field.value ?? ''}
                      onChange={(val) => {
                        field.onChange(val ? Number(val) : null);
                        const prod = products.find((p) => p.id === Number(val));
                        if (prod && !form.getValues('title')) {
                          form.setValue('title', prod.name);
                        }
                      }}
                      placeholder="Cari produk dari database..."
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedSingleProduct && (
                <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center gap-4">
                  {selectedSingleProduct.imageUrl ? (
                    <img src={selectedSingleProduct.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-200 flex items-center justify-center text-xs">No Img</div>
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{selectedSingleProduct.name}</h4>
                    <p className="text-xs text-slate-500">Kategori: {selectedSingleProduct.category?.name || '-'}</p>
                    <p className="text-xs font-bold text-pink-600 mt-0.5">
                      Rp {Number(selectedSingleProduct.price || 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="badgeText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Badge Corner / Label Pojok (Opsional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: Editor's Pick, 50% OFF, Hot Deal"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════
              4. SHOP THE LOOK
             ═════════════════════════════════════════════════════════════════════ */}
          {type === 'SHOP_THE_LOOK' && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl flex items-center gap-3">
                <Shirt className="text-amber-600 flex-shrink-0" size={24} />
                <div className="text-xs">
                  <p className="font-bold text-amber-900 dark:text-amber-300">Shop the Look (Social Feed)</p>
                  <p className="text-amber-700 dark:text-amber-400">Post foto outfit bergaya Instagram/social media dengan tag produk dan jumlah likes.</p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Foto Outfit / Lookbook (Rasio 1:1 atau 4:5)</FormLabel>
                    <FormControl>
                      <ImageUpload value={field.value || ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Nama Outfit / Produk</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Minimalist Linen Co-ord" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="badgeText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Jumlah Likes (Badge Sosial)</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: 1.2k likes atau 850" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Hubungkan Ke Produk Master (Opsional)</FormLabel>
                      <Combobox
                        options={products.map((p) => ({
                          label: p.name,
                          value: p.id,
                        }))}
                        value={field.value ?? ''}
                        onChange={(val) => {
                          field.onChange(val ? Number(val) : null);
                          const prod = products.find((p) => p.id === Number(val));
                          if (prod) {
                            if (!form.getValues('title')) form.setValue('title', prod.name);
                            if (!form.getValues('linkUrl')) form.setValue('linkUrl', `/products/${prod.slug || prod.id}`);
                          }
                        }}
                        placeholder="Pilih produk..."
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linkUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Link URL Tujuan</FormLabel>
                      <FormControl>
                        <Input placeholder="/products/linen-shirt" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════
              5. BRANDS
             ═════════════════════════════════════════════════════════════════════ */}
          {type === 'BRANDS_SECTION' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center gap-3">
                <ImageIcon className="text-slate-600 flex-shrink-0" size={24} />
                <div className="text-xs">
                  <p className="font-bold text-slate-900 dark:text-slate-100">Brand Partner Showcase</p>
                  <p className="text-slate-500">Tampilkan logo brand partner resmi di homepage website.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Nama Brand</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Zara, Uniqlo, Nike, H&M" {...field} value={field.value || ''} />
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
                      <FormLabel className="font-bold">Link Halaman / Filter Brand</FormLabel>
                      <FormControl>
                        <Input placeholder="/products?brand=Zara" {...field} value={field.value || ''} />
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
                    <FormLabel className="font-bold">Logo Brand (PNG Transparan Disarankan)</FormLabel>
                    <FormControl>
                      <ImageUpload value={field.value || ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════
              6. RECOMMENDATIONS
             ═════════════════════════════════════════════════════════════════════ */}
          {type === 'RECOMMENDED_PRODUCTS' && (
            <div className="space-y-6">
              <div className="p-4 bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/30 rounded-2xl flex items-center gap-3">
                <Sparkles className="text-teal-600 flex-shrink-0" size={24} />
                <div className="text-xs">
                  <p className="font-bold text-teal-900 dark:text-teal-300">Rekomendasi Produk (Recommendations)</p>
                  <p className="text-teal-700 dark:text-teal-400">Carousel produk yang direkomendasikan dengan badge tag seperti Editor's Pick atau Best Seller.</p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Pilih Produk Dari Master</FormLabel>
                    <Combobox
                      options={products.map((p) => ({
                        label: `${p.name} - Rp ${Number(p.price || 0).toLocaleString('id-ID')}`,
                        value: p.id,
                      }))}
                      value={field.value ?? ''}
                      onChange={(val) => field.onChange(val ? Number(val) : null)}
                      placeholder="Cari dan pilih produk rekomendasi..."
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="tag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Badge / Label Rekomendasi</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Editor's Choice, Paling Laris, Trending" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Override Judul (Opsional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Biarkan kosong untuk memakai nama asli produk" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {selectedSingleProduct && (
                <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center gap-4">
                  {selectedSingleProduct.imageUrl ? (
                    <img src={selectedSingleProduct.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-200 flex items-center justify-center text-xs">No Img</div>
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{selectedSingleProduct.name}</h4>
                    <p className="text-xs text-slate-500">Kategori: {selectedSingleProduct.category?.name || '-'}</p>
                    <p className="text-xs font-bold text-teal-600 mt-0.5">
                      Rp {Number(selectedSingleProduct.price || 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════
              7. TESTIMONIALS
             ═════════════════════════════════════════════════════════════════════ */}
          {type === 'TESTIMONIALS' && (
            <div className="space-y-6">
              <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-2xl flex items-center gap-3">
                <Heart className="text-rose-600 flex-shrink-0" size={24} />
                <div className="text-xs">
                  <p className="font-bold text-rose-900 dark:text-rose-300">Testimonial & Review Pelanggan</p>
                  <p className="text-rose-700 dark:text-rose-400">Tampilkan ulasan nyata pembeli untuk meningkatkan kepercayaan pengunjung website.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Nama Pelanggan</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Anindya Putri" {...field} value={field.value || ''} />
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
                      <FormLabel className="font-bold">Peran / Lokasi Pelanggan</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Verified Buyer • Jakarta" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="iconName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Rating Bintang</FormLabel>
                      <select
                        {...field}
                        value={field.value || '5'}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 font-semibold"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ (5 Bintang - Sempurna)</option>
                        <option value="4">⭐⭐⭐⭐ (4 Bintang - Sangat Baik)</option>
                        <option value="3">⭐⭐⭐ (3 Bintang - Cukup)</option>
                      </select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="contentBody"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Isi Testimoni / Ulasan</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Tulis ulasan pelanggan di sini..."
                        {...field}
                        value={field.value || form.watch('subtitle') || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Foto Avatar Pelanggan (Opsional)</FormLabel>
                    <FormControl>
                      <ImageUpload value={field.value || ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════
              8. EXCLUSIVE DEALS
             ═════════════════════════════════════════════════════════════════════ */}
          {type === 'DEALS' && (
            <div className="space-y-6">
              <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/30 rounded-2xl flex items-center gap-3">
                <Tag className="text-purple-600 flex-shrink-0" size={24} />
                <div className="text-xs">
                  <p className="font-bold text-purple-900 dark:text-purple-300">Banner Exclusive Deals</p>
                  <p className="text-purple-700 dark:text-purple-400">Banner penawaran diskon musiman atau promo voucher eksklusif dengan tombol CTA.</p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Banner Gambar Promo (Rasio 16:9 atau 2:1)</FormLabel>
                    <FormControl>
                      <ImageUpload value={field.value || ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Judul Promo Deal</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Exclusive Member Discount" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="badgeText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Badge Diskon / Kupon</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: 20% OFF atau BUY 1 GET 1" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Deskripsi Promo</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Dapatkan diskon 20% untuk semua kategori dengan kode voucher MEMBER20." {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="ctaText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Teks Tombol CTA</FormLabel>
                      <FormControl>
                        <Input placeholder="Klaim Sekarang" {...field} value={field.value || ''} />
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
                      <FormLabel className="font-bold">Tujuan Link CTA</FormLabel>
                      <FormControl>
                        <Input placeholder="/vouchers atau /categories/sale" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Daftar Produk Exclusive Deals */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <FormLabel className="font-bold text-slate-900 dark:text-white">
                      Daftar Produk Exclusive Deals ({selectedProductIds.length} Produk Dipilih)
                    </FormLabel>
                    <p className="text-xs text-slate-500">
                      Pilih produk-produk yang akan ditampilkan di bawah promo Exclusive Deals storefront.
                    </p>
                  </div>
                  {selectedProductIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => form.setValue('productIds', '')}
                      className="text-xs font-bold text-rose-500 hover:text-rose-600 underline"
                    >
                      Reset Semua Produk
                    </button>
                  )}
                </div>

                <Combobox
                  options={products
                    .filter((p) => !selectedProductIds.includes(p.id))
                    .map((p) => ({
                      label: `${p.name} - Rp ${Number(p.price || 0).toLocaleString('id-ID')}`,
                      value: p.id,
                    }))}
                  value=""
                  onChange={(val) => {
                    if (val) toggleSelectProduct(Number(val));
                  }}
                  placeholder="Ketik nama produk untuk ditambahkan ke Deals..."
                  emptyText="Semua produk sudah dipilih atau tidak ditemukan."
                />

                {selectedProductsList.length > 0 && (
                  <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 dark:bg-white/5 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-white/10">
                        <tr>
                          <th className="px-4 py-2.5">Produk</th>
                          <th className="px-4 py-2.5">Kategori</th>
                          <th className="px-4 py-2.5 text-right">Harga Normal</th>
                          <th className="px-4 py-2.5 text-center w-16">Hapus</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {selectedProductsList.map((product) => (
                          <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                            <td className="px-4 py-2.5 font-bold flex items-center gap-2.5">
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px]">No Img</div>
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
                                className="text-rose-500 hover:text-rose-700 p-1 rounded"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════
              9. NEWSLETTER
             ═════════════════════════════════════════════════════════════════════ */}
          {type === 'NEWSLETTER' && (
            <div className="space-y-6">
              <div className="p-4 bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900/30 rounded-2xl flex items-center gap-3">
                <Bell className="text-cyan-600 flex-shrink-0" size={24} />
                <div className="text-xs">
                  <p className="font-bold text-cyan-900 dark:text-cyan-300">Newsletter Subscription Section</p>
                  <p className="text-cyan-700 dark:text-cyan-400">Atur headline dan ajakan berlangganan email newsletter di bagian bawah website.</p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Headline Ajakan Berlangganan</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Subscribe & Dapatkan Diskon 10%" {...field} value={field.value || ''} />
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
                    <FormLabel className="font-bold">Deskripsi Ajakan</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Contoh: Daftarkan email Anda sekarang untuk mendapatkan penawaran eksklusif dan update tren fashion terkini."
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════
              GLOBAL CONTROLS (Status Aktif)
             ═════════════════════════════════════════════════════════════════════ */}
          <div className="border-t border-slate-200 dark:border-white/10 pt-6">
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-white/10 p-4 bg-slate-50 dark:bg-white/5">
                  <div className="space-y-0.5">
                    <FormLabel className="font-bold text-slate-900 dark:text-white">Status Aktif</FormLabel>
                    <p className="text-xs text-slate-500">Tampilkan item ini di homepage website (item terbaru otomatis tampil terdepan)</p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

        </div>
      </Form>
    </CrudForm>
  );
}
