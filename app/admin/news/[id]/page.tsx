'use client';

import { use, useEffect, useState } from 'react';
import { CrudForm } from '@/components/admin/crud-form';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from '@/components/ui/image-upload';
import { useNewsForm } from '@/hooks/use-news-form';
import { useUsers } from '@/hooks/use-users';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function NewsEditPage({ params }: PageProps) {
  const { id } = use(params);
  const { form, isLoading, isNew, onSubmit } = useNewsForm(id);
  const { users } = useUsers();
  const [isPersonal, setIsPersonal] = useState(false);

  useEffect(() => {
    if (!isNew && form.getValues('targetUserId')) {
      setIsPersonal(true);
    } else if (!isNew) {
      setIsPersonal(false);
    }
  }, [isNew, form]);

  return (
    <CrudForm
      title={isNew ? 'New Article' : 'Edit Article'}
      subtitle={isNew ? 'Publish a new fashion or brand story.' : 'Update article contents.'}
      onSubmit={form.handleSubmit(onSubmit)}
      isLoading={isLoading}
    >
      <Form {...form}>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400">Headline Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Summer Style Trends 2026" className="h-12 rounded-2xl" {...field} />
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
                  <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400">URL Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="summer-style-trends-2026" className="h-12 rounded-2xl font-mono text-xs" {...field} />
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
                <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400">Cover Image</FormLabel>
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
                <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400">Article Content</FormLabel>
                <FormControl>
                  <textarea
                    rows={12}
                    className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium focus:ring-2 focus:ring-pink-500 outline-none"
                    placeholder="Write the full story here..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-6 rounded-2xl border border-slate-100 p-6 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-bold text-slate-900">Public Broadcast</FormLabel>
                <p className="text-xs text-slate-500">Send this notification to all users.</p>
              </div>
              <Switch checked={!isPersonal} onCheckedChange={(val) => {
                if (val) {
                  setIsPersonal(false);
                  form.setValue('targetUserId', undefined);
                }
              }} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-bold text-slate-900">Personal Message</FormLabel>
                <p className="text-xs text-slate-500">Send this notification to a specific user only.</p>
              </div>
              <Switch checked={isPersonal} onCheckedChange={(val) => {
                if (val) {
                  setIsPersonal(true);
                } else {
                  setIsPersonal(false);
                  form.setValue('targetUserId', undefined);
                }
              }} />
            </div>

            {isPersonal && (
              <FormField
                control={form.control}
                name="targetUserId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400">Target User</FormLabel>
                    <Select onValueChange={(val) => field.onChange(val === 'none' ? undefined : Number(val))} value={field.value?.toString() || 'none'}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-2xl bg-white">
                          <SelectValue placeholder="Select a user..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">-- Select a user --</SelectItem>
                        {users.map(u => (
                          <SelectItem key={u.id} value={u.id.toString()}>{u.fullName} ({u.email})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-2xl border border-slate-100 p-6 bg-slate-50/50">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-bold text-slate-900">Publish Immediately</FormLabel>
                  <p className="text-xs text-slate-500">Toggle whether this story appears in the customer feed.</p>
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
