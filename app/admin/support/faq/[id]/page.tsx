'use client';

import { use } from 'react';
import { CrudForm } from '@/components/admin/crud-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';
import { useSupportFaqForm } from '@/hooks/use-support-faq-form';

const RichTextEditor = dynamic(() => import('@/components/ui/rich-text-editor'), { ssr: false });

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function FaqFormPage({ params }: PageProps) {
  const { id } = use(params);
  const { form, isLoading, isFetching, isNew, onSubmit } = useSupportFaqForm(id);

  if (isFetching) {
    return <div className="p-8 text-center text-slate-500">Loading FAQ data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <CrudForm
        title={isNew ? 'Create FAQ' : 'Edit FAQ'}
        subtitle="Manage frequently asked question and answer."
        onSubmit={form.handleSubmit(onSubmit)}
        isLoading={isLoading}
      >
        <Form {...form}>
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black uppercase tracking-wider text-slate-500">Category</FormLabel>
                  <FormControl>
                    <Input placeholder="General, Payment, Shipping, etc." className="rounded-xl h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black uppercase tracking-wider text-slate-500">Question</FormLabel>
                  <FormControl>
                    <Input placeholder="How do I track my order?" className="rounded-xl h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black uppercase tracking-wider text-slate-500">Answer</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Write comprehensive answer..."
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
                        ? 'PUBLISH: Tampil ke pengguna di aplikasi mobile dan website'
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
