'use client';

import { CrudForm } from '@/components/admin/crud-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Globe2, Sparkles, Code2 } from 'lucide-react';
import { useSeoConfigForm } from '@/hooks/use-seo-config-form';

const PRESET_PAGES = [
  { value: 'GLOBAL', label: 'GLOBAL (Semua Halaman Website)' },
  { value: 'HOME', label: 'HOME (Beranda / Landing Page)' },
  { value: 'PRODUCT_LIST', label: 'PRODUCT_LIST (Katalog & Kategori)' },
  { value: 'PRODUCT_DETAIL', label: 'PRODUCT_DETAIL (Halaman Detail Produk)' },
  { value: 'CART', label: 'CART (Keranjang Belanja)' },
  { value: 'CHECKOUT', label: 'CHECKOUT (Pembayaran)' },
  { value: 'ARTICLE', label: 'ARTICLE (Blog & Artikel)' },
];

export default function EditSeoConfigPage() {
  const { form, isLoading, isFetching, onSubmit } = useSeoConfigForm();
  const selectedPage = form.watch('pageName');
  const targetType = form.watch('targetType');

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">Memuat Konfigurasi SEO...</p>
      </div>
    );
  }

  return (
    <CrudForm
      title="Edit Konfigurasi SEO"
      subtitle="Perbarui target halaman, meta tags, dan skrip tracking pada storefront."
      onSubmit={form.handleSubmit(onSubmit)}
      isLoading={isLoading}
    >
      <Form {...form}>
        <div className="space-y-8">
          {/* Target & Placement */}
          <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-white/10">
              <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">Target Halaman & Lokasi Penempatan</h3>
                <p className="text-xs text-slate-500">Pilih halaman mana yang menerima konfigurasi ini dan lokasi injeksi script.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="pageName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Target Halaman (Identifier)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: GLOBAL, HOME, PRODUCT_DETAIL"
                        {...field}
                        className="h-12 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 uppercase font-mono tracking-wider font-semibold"
                      />
                    </FormControl>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {PRESET_PAGES.map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => form.setValue('pageName', preset.value)}
                          className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                            selectedPage === preset.value
                              ? 'bg-pink-600 text-white border-pink-600 shadow-sm shadow-pink-500/20'
                              : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-pink-300'
                          }`}
                        >
                          {preset.value}
                        </button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Posisi Penempatan Injeksi
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 font-medium">
                          <SelectValue placeholder="Pilih posisi target" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="HEAD">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-blue-600 dark:text-blue-400">&lt;HEAD&gt;</span>
                            <span className="text-xs text-slate-500">(Meta Tag, Google Tag Manager Head, Facebook Pixel, Google Analytics)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="BODY">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-600 dark:text-amber-400">&lt;BODY&gt;</span>
                            <span className="text-xs text-slate-500">(Chat Widget, Live Support, GTM NoScript, Footer Script)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs text-slate-500">
                      {targetType === 'HEAD' 
                        ? 'Ditempatkan di bagian atas HTML <head> untuk meta data dan skrip pelacakan utama.' 
                        : 'Ditempatkan di akhir dokumen <body> sebelum penutup tag untuk skrip widget dan pelengkap.'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-white/5 p-4 border border-slate-200 dark:border-white/10">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Status Aktif Konfigurasi
                    </FormLabel>
                    <FormDescription className="text-xs text-slate-500">
                      Jika dinonaktifkan, script dan meta tags tidak akan dimuat pada storefront website.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Meta Tags Details */}
          <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-white/10">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">Meta Data Search Engine (SEO)</h3>
                <p className="text-xs text-slate-500">Judul, deskripsi, dan kata kunci yang tampil di Google Search & Social Media preview.</p>
              </div>
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="metaTitle"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Meta Title
                      </FormLabel>
                      <span className="text-[11px] text-slate-400">{(field.value || '').length}/60 karakter</span>
                    </div>
                    <FormControl>
                      <Input
                        placeholder="Zelvira Official Store - Fashion Muslim, Gamis & Hijab Premium"
                        {...field}
                        className="h-12 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 font-medium"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metaDescription"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Meta Description
                      </FormLabel>
                      <span className="text-[11px] text-slate-400">{(field.value || '').length}/160 karakter</span>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Belanja koleksi busana muslim, gamis modern, hijab premium berkualitas dengan pengiriman cepat dan garansi original di Zelvira."
                        {...field}
                        className="min-h-[85px] rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-sm leading-relaxed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metaKeywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Meta Keywords (Pisahkan dengan koma)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="zelvira, fashion muslim, gamis, hijab, dress muslimah, baju gamis modern"
                        {...field}
                        className="h-12 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 font-medium"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Script Snippet */}
          <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-white/10">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">Custom Script / Snippet Code</h3>
                <p className="text-xs text-slate-500">Tempelkan Google Tag Manager, Meta Pixel, TikTok Pixel, atau HTML tracking tag di sini.</p>
              </div>
            </div>

            <FormField
              control={form.control}
              name="scriptCode"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="<!-- Contoh Script Google Tag / Pixel -->&#10;<script>&#10;  console.log('Zelvira Tracking Initialized');&#10;</script>" 
                      {...field} 
                      className="min-h-[220px] font-mono text-xs rounded-2xl bg-slate-900 text-pink-400 dark:bg-black/60 dark:text-pink-300 border-none p-5 leading-relaxed" 
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-slate-500">
                    Format diperbolehkan: tag &lt;script&gt;...&lt;/script&gt;, &lt;meta ... /&gt;, atau JavaScript murni.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </Form>
    </CrudForm>
  );
}
