'use client';

import { use } from 'react';
import { CrudForm } from '@/components/admin/crud-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';
import { ImageUpload } from '@/components/ui/image-upload';
import { useSupportHelpForm } from '@/hooks/use-support-help-form';

const RichTextEditor = dynamic(() => import('@/components/ui/rich-text-editor'), { ssr: false });

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function HelpArticleFormPage({ params }: PageProps) {
  const { id } = use(params);
  const { form, isLoading, isFetching, isNew, onSubmit } = useSupportHelpForm(id);

  if (isFetching) {
    return <div className="p-8 text-center text-slate-500">Loading article data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <CrudForm
        title={isNew ? 'Create Help Article' : 'Edit Help Article'}
        subtitle="Manage complete guides and documentation for customers."
        onSubmit={form.handleSubmit(onSubmit)}
        isLoading={isLoading}
      >
        <Form {...form}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase tracking-wider text-slate-500">Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Account, Orders, Returns..." className="rounded-xl h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black uppercase tracking-wider text-slate-500">Article Title</FormLabel>
                  <FormControl>
                    <Input placeholder="How to request a return or refund" className="rounded-xl h-11" {...field} />
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
                  <FormLabel className="text-xs font-black uppercase tracking-wider text-slate-500">Short Subtitle</FormLabel>
                  <FormControl>
                    <Input placeholder="Step-by-step procedure for processing product returns" className="rounded-xl h-11" {...field} />
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
                  <FormLabel className="text-xs font-black uppercase tracking-wider text-slate-500">Cover Banner</FormLabel>
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
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black uppercase tracking-wider text-slate-500">Detailed Content</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Write complete article details..."
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
                <FormItem className="flex items-center justify-between rounded-2xl border p-4 bg-slate-50/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <FormLabel className="text-sm font-bold text-slate-800">Status Publikasi</FormLabel>
                      <Badge variant={field.value ? 'success' : 'secondary'} className="text-[10px] font-bold">
                        {field.value ? 'PUBLISH' : 'DRAFT'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {field.value
                        ? 'PUBLISH: Tampil ke pengguna di Help Center aplikasi mobile dan website'
                        : 'DRAFT: Disembunyikan / Tidak akan muncul ke pengguna'}
                    </p>
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
    </div>
  );
}
