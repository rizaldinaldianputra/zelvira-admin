'use client';

import { CrudForm } from '@/components/admin/crud-form';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { useCategoryForm } from '@/hooks/use-category-form';

export default function CategoryEditPage() {
  const { form, isLoading, isNew, onSubmit } = useCategoryForm();

  return (
    <CrudForm
      title={isNew ? 'New Category' : 'Edit Category'}
      subtitle={isNew ? 'Add a new product category' : 'Update category details'}
      onSubmit={form.handleSubmit(onSubmit)}
      isLoading={isLoading}
    >
      <Form {...form}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold uppercase tracking-tight">Category Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Shoes" className="rounded-xl border-slate-200" {...field} />
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
                <FormLabel className="font-bold uppercase tracking-tight">Slug</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. shoes" className="rounded-xl border-slate-200" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="font-bold uppercase tracking-tight">Category Image</FormLabel>
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
            name="pointsReward"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="font-bold uppercase tracking-tight flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                  <span>⭐ Reward Poin (Per Item)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Contoh: 2"
                    className="rounded-xl border-slate-200"
                    {...field}
                  />
                </FormControl>
                <p className="text-xs text-slate-500">
                  Jumlah poin yang diperoleh pelanggan untuk setiap item produk dari kategori ini saat checkout.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="font-bold uppercase tracking-tight">Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter category description..."
                    className="min-h-[100px] rounded-xl border-slate-200"
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
              <FormItem className="flex items-center justify-between rounded-xl border border-slate-200 p-4 md:col-span-2">
                <div className="space-y-0.5">
                  <FormLabel className="font-bold uppercase tracking-tight">Active Status</FormLabel>
                  <p className="text-xs text-slate-500">Enable or disable this category globally</p>
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
