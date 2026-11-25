'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import {
  ShieldCheck,
  Save,
  RotateCcw,
  ExternalLink,
  Globe,
  Smartphone,
  Sparkles,
  Calendar,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useSupportPrivacyForm } from '@/hooks/use-support-privacy-form';

const RichTextEditor = dynamic(() => import('@/components/ui/rich-text-editor'), {
  ssr: false,
  loading: () => <div className="h-72 w-full bg-slate-100 dark:bg-white/5 animate-pulse rounded-2xl" />,
});

export default function PrivacyPolicyPage() {
  const { form, currentPolicy, isLoading, isFetching, onSubmit, loadPolicy, resetToTemplate } =
    useSupportPrivacyForm();

  const isPublished = form.watch('isActive');

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Baru / Belum pernah disimpan';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (isFetching) {
    return (
      <div className="max-w-5xl mx-auto py-16 px-4 flex flex-col items-center justify-center min-h-100 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          Memuat Dokumen Kebijakan Privasi...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-linear-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-lg shadow-pink-500/25">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Kebijakan Privasi (Privacy Policy)
              </h1>
              <Badge
                variant={isPublished ? 'pink' : 'secondary'}
                className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
              >
                {isPublished ? 'PUBLISHED' : 'DRAFT'}
              </Badge>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              Kelola satu dokumen kebijakan privasi resmi yang terintegrasi langsung ke Web Storefront dan Aplikasi Mobile.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.open('/privacy', '_blank')}
            className="rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 gap-2"
          >
            <ExternalLink className="h-4 w-4 text-slate-500" />
            <span className="hidden sm:inline">Lihat di Web</span>
          </Button>

          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
            className="bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl shadow-lg shadow-pink-500/25 gap-2 px-5"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Integration Notice Card */}
      <div className="rounded-2xl border border-pink-100 bg-linear-to-r from-pink-50/70 via-rose-50/40 to-white dark:border-pink-950/40 dark:from-pink-950/20 dark:to-transparent p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-pink-100 dark:bg-pink-950/50 flex items-center justify-center text-pink-600 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Sistem Satu Halaman Terintegrasi (Single Source of Truth)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Admin hanya perlu membuat dan mengedit satu halaman kebijakan ini. Seluruh perubahan langsung tersinkronkan real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400 self-stretch sm:self-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-pink-100 dark:border-pink-900/30">
          <div className="flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-pink-500" />
            <span>Storefront Web</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Smartphone className="h-4 w-4 text-pink-500" />
            <span>Aplikasi Mobile</span>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Card 1: Document Settings */}
          <Card className="rounded-3xl border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Pengaturan Dokumen
              </CardTitle>
              <CardDescription>
                Tentukan judul resmi dokumen kebijakan dan atur status aksesibilitas publik.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Judul Dokumen Kebijakan
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: Kebijakan Privasi Zelvira"
                        className="rounded-xl h-11 bg-white dark:bg-slate-900"
                        {...field}
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
                  <FormItem className="flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/40">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <FormLabel className="text-sm font-bold text-slate-900 dark:text-white cursor-pointer">
                          Status Publikasi
                        </FormLabel>
                        <Badge
                          variant={field.value ? 'pink' : 'secondary'}
                          className="text-[10px] font-bold"
                        >
                          {field.value ? 'AKTIF / TERBIT' : 'DRAFT / DISEMBUNYIKAN'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        {field.value
                          ? 'Dokumen kebijakan privasi aktif dan dapat dibaca oleh pengguna di Web & Mobile.'
                          : 'Dokumen berstatus draf (pengguna akan melihat halaman informasi sementara).'}
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Card 2: Document Body Rich Text Editor */}
          <Card className="rounded-3xl border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Isi Dokumen Kebijakan Privasi
                </CardTitle>
                <CardDescription>
                  Susun pasal-pasal perlindungan data, ketentuan privasi, dan kepatuhan hukum.
                </CardDescription>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetToTemplate}
                className="text-xs text-pink-600 hover:text-pink-700 hover:bg-pink-50 rounded-xl gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Gunakan Template Standar</span>
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Tuliskan isi lengkap kebijakan privasi di sini..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Footer Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Calendar className="h-4 w-4 text-pink-500" />
              <span>Terakhir diperbarui: {formatDate(currentPolicy?.updatedAt)}</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={loadPolicy}
                disabled={isLoading}
                className="rounded-xl border-slate-200 dark:border-slate-800 gap-1.5 text-slate-600 dark:text-slate-300"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Batal / Reset</span>
              </Button>

              <Button
                type="submit"
                disabled={isLoading}
                className="bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl shadow-md shadow-pink-500/20 gap-2 px-5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Simpan Kebijakan Privasi</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
