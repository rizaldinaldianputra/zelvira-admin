// scripts/generators/crud-form-hooks.js
const path = require('path');

const crudFormGenerators = [
  // 1. BRAND FORM
  {
    name: 'useBrandForm',
    hookFile: 'hooks/use-brand-form.ts',
    pageFile: 'app/admin/brands/[id]/page.tsx',
    hookCode: `'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { BrandService } from '@/services/brand.service';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const brandSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type BrandFormValues = z.infer<typeof brandSchema>;

export function useBrandForm() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isNew = params.id === 'new';

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema) as any,
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      logoUrl: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (!isNew && params.id) {
      const loadBrand = async () => {
        try {
          const data = await BrandService.getById(Number(params.id));
          form.reset({
            name: data.name,
            slug: data.slug,
            description: data.description || '',
            logoUrl: data.logoUrl || '',
            isActive: data.isActive,
          });
        } catch (error) {
          toast({ title: 'Error', description: 'Failed to load brand data', variant: 'destructive' });
        }
      };
      loadBrand();
    }
  }, [isNew, params.id, form]);

  const name = form.watch('name');
  useEffect(() => {
    if (isNew || !form.getValues('slug')) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      form.setValue('slug', slug, { shouldValidate: true });
    }
  }, [name, form, isNew]);

  const onSubmit = async (values: BrandFormValues) => {
    setIsLoading(true);
    try {
      if (isNew) {
        await BrandService.create(values as any);
        toast({ title: 'Success', description: 'Brand created' });
      } else {
        await BrandService.update(Number(params.id), values as any);
        toast({ title: 'Success', description: 'Brand updated' });
      }
      router.push('/admin/brands');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save brand', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    isNew,
    onSubmit,
  };
}
`,
    pageCode: `'use client';

import { CrudForm } from '@/components/admin/crud-form';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from '@/components/ui/image-upload';
import { useBrandForm } from '@/hooks/use-brand-form';

export default function BrandEditPage() {
  const { form, isLoading, isNew, onSubmit } = useBrandForm();

  return (
    <CrudForm
      title={isNew ? 'New Brand' : 'Edit Brand'}
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
                <FormLabel>Brand Name</FormLabel>
                <FormControl>
                  <Input placeholder="Nike" {...field} />
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
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="nike" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="logoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo</FormLabel>
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
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Official brand store description..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Active Status</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </Form>
    </CrudForm>
  );
}
`
  },

  // 2. CATEGORY FORM
  {
    name: 'useCategoryForm',
    hookFile: 'hooks/use-category-form.ts',
    pageFile: 'app/admin/categories/[id]/page.tsx',
    hookCode: `'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CategoryService } from '@/services/category.service';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const categorySchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  slug: z.string().min(2, { message: 'Slug must be at least 2 characters' }),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export function useCategoryForm() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isNew = params.id === 'new';

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (!isNew && params.id) {
      const fetchCategory = async () => {
        try {
          const data = await CategoryService.getById(Number(params.id));
          form.reset({
            name: data.name,
            slug: data.slug,
            description: data.description || '',
            imageUrl: data.imageUrl || '',
            isActive: !!data.isActive,
          });
        } catch (error) {
          toast({ title: 'Error', description: 'Failed to fetch category', variant: 'destructive' });
        }
      };
      fetchCategory();
    }
  }, [isNew, params.id, form]);

  const name = form.watch('name');
  useEffect(() => {
    if (isNew || !form.getValues('slug')) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      form.setValue('slug', slug, { shouldValidate: true });
    }
  }, [name, form, isNew]);

  const onSubmit = async (values: CategoryFormValues) => {
    setIsLoading(true);
    try {
      if (isNew) {
        await CategoryService.create(values as any);
        toast({ title: 'Success', description: 'Category created successfully' });
      } else {
        await CategoryService.update(Number(params.id), values as any);
        toast({ title: 'Success', description: 'Category updated successfully' });
      }
      router.push('/admin/categories');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save category', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    isNew,
    onSubmit,
  };
}
`,
    pageCode: `'use client';

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
`
  },

  // 3. VOUCHER FORM
  {
    name: 'useVoucherForm',
    hookFile: 'hooks/use-voucher-form.ts',
    pageFile: 'app/admin/vouchers/[id]/page.tsx',
    hookCode: `'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { VoucherService } from '@/services/voucher.service';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const voucherSchema = z.object({
  code: z.string().min(3, { message: 'Code must be at least 3 characters' }),
  discountAmount: z.coerce.number().min(0),
  minPurchase: z.coerce.number().min(0),
  validUntil: z.string(),
  isActive: z.boolean().default(true),
  targetMembership: z.string().default('ALL'),
});

export type VoucherFormValues = z.infer<typeof voucherSchema>;

export function useVoucherForm() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isNew = params.id === 'new';

  const form = useForm<VoucherFormValues>({
    resolver: zodResolver(voucherSchema) as any,
    defaultValues: {
      code: '',
      discountAmount: 0,
      minPurchase: 0,
      validUntil: new Date().toISOString().split('T')[0],
      isActive: true,
      targetMembership: 'ALL',
    },
  });

  useEffect(() => {
    if (!isNew && params.id) {
      const fetchVoucher = async () => {
        try {
          const data = await VoucherService.getById(Number(params.id));
          form.reset({
            code: data.code,
            discountAmount: data.discountAmount,
            minPurchase: data.minPurchase,
            validUntil: data.validUntil ? new Date(data.validUntil).toISOString().split('T')[0] : '',
            isActive: data.isActive,
            targetMembership: data.targetMembership || 'ALL',
          });
        } catch (error) {
          toast({ title: 'Error', description: 'Failed to fetch voucher', variant: 'destructive' });
        }
      };
      fetchVoucher();
    }
  }, [isNew, params.id, form]);

  const onSubmit = async (values: VoucherFormValues) => {
    setIsLoading(true);
    try {
      if (isNew) {
        await VoucherService.create(values as any);
        toast({ title: 'Success', description: 'Voucher created successfully' });
      } else {
        await VoucherService.update(Number(params.id), values as any);
        toast({ title: 'Success', description: 'Voucher updated successfully' });
      }
      router.push('/admin/vouchers');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save voucher', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    isNew,
    onSubmit,
  };
}
`,
    pageCode: `'use client';

import { CrudForm } from '@/components/admin/crud-form';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useVoucherForm } from '@/hooks/use-voucher-form';

export default function VoucherEditPage() {
  const { form, isLoading, isNew, onSubmit } = useVoucherForm();

  return (
    <CrudForm
      title={isNew ? 'New Voucher' : 'Edit Voucher'}
      subtitle={isNew ? 'Create a new discount code' : 'Update voucher details'}
      onSubmit={form.handleSubmit(onSubmit)}
      isLoading={isLoading}
    >
      <Form {...form}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold uppercase tracking-tight">Voucher Code</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. DISCOUNT50" className="rounded-xl border-slate-200 uppercase font-bold text-pink-600" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discountAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold uppercase tracking-tight">Discount Amount (Rp)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="50000" className="rounded-xl border-slate-200" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minPurchase"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold uppercase tracking-tight">Min. Purchase Amount (Rp)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="100000" className="rounded-xl border-slate-200" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="validUntil"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold uppercase tracking-tight">Valid Until</FormLabel>
                <FormControl>
                  <Input type="date" className="rounded-xl border-slate-200" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetMembership"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold uppercase tracking-tight">Target Membership</FormLabel>
                <FormControl>
                  <select 
                    {...field}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 text-sm font-bold uppercase tracking-wider"
                  >
                    <option value="ALL">All Members</option>
                    <option value="BRONZE">Bronze Only</option>
                    <option value="SILVER">Silver Only</option>
                    <option value="GOLD">Gold Only</option>
                    <option value="PLATINUM">Platinum Only</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div className="space-y-0.5">
                  <FormLabel className="font-bold uppercase tracking-tight">Active Status</FormLabel>
                  <p className="text-xs text-slate-500">Allow customers to claim this voucher</p>
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
`
  },

  // 4. NEWS FORM
  {
    name: 'useNewsForm',
    hookFile: 'hooks/use-news-form.ts',
    pageFile: 'app/admin/news/[id]/page.tsx',
    hookCode: `'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NewsService } from '@/services/news.service';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const newsSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  slug: z.string().min(3, 'Slug is required'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type NewsFormValues = z.infer<typeof newsSchema>;

export function useNewsForm(id: string) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isNew = id === 'new';

  const form = useForm<any>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      imageUrl: '',
      isActive: true,
    },
  });

  useEffect(() => {
    const loadData = async () => {
      if (!isNew) {
        try {
          const data = await NewsService.getById(id);
          form.reset({
            title: data.title,
            slug: data.slug,
            content: data.content,
            imageUrl: data.imageUrl || '',
            isActive: data.isActive,
          });
        } catch {
          toast({ title: 'Error', description: 'Failed to load article details', variant: 'destructive' });
        }
      }
    };
    loadData();
  }, [id, isNew, form]);

  const title = form.watch('title');
  useEffect(() => {
    if (isNew && title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      form.setValue('slug', generatedSlug);
    }
  }, [title, isNew, form]);

  const onSubmit = async (values: NewsFormValues) => {
    setIsLoading(true);
    try {
      if (isNew) {
        await NewsService.create(values);
        toast({ title: 'Success', description: 'Article created successfully' });
      } else {
        await NewsService.update(Number(id), values);
        toast({ title: 'Success', description: 'Article updated successfully' });
      }
      router.push('/admin/news');
    } catch {
      toast({ title: 'Error', description: 'Failed to save article', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    isNew,
    onSubmit,
  };
}
`,
    pageCode: `'use client';

import { use } from 'react';
import { CrudForm } from '@/components/admin/crud-form';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from '@/components/ui/image-upload';
import { useNewsForm } from '@/hooks/use-news-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function NewsEditPage({ params }: PageProps) {
  const { id } = use(params);
  const { form, isLoading, isNew, onSubmit } = useNewsForm(id);

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
`
  },

  // 5. SUPPORT FAQ FORM
  {
    name: 'useSupportFaqForm',
    hookFile: 'hooks/use-support-faq-form.ts',
    pageFile: 'app/admin/support/faq/[id]/page.tsx',
    hookCode: `'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaqService } from '@/services/faq.service';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const faqSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters'),
  answer: z.string().min(10, 'Answer must be at least 10 characters'),
  category: z.string().min(2, 'Category is required'),
  isActive: z.boolean().default(true),
});

export type FaqFormValues = z.infer<typeof faqSchema>;

export function useSupportFaqForm(id: string) {
  const router = useRouter();
  const { toast } = useToast();
  const isNew = id === 'new';

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!isNew);

  const form = useForm<FaqFormValues>({
    resolver: zodResolver(faqSchema) as any,
    defaultValues: {
      question: '',
      answer: '',
      category: 'General',
      isActive: true,
    },
  });

  useEffect(() => {
    if (!isNew && id) {
      const loadFaq = async () => {
        try {
          setIsFetching(true);
          const data = await FaqService.getById(id);
          if (data) {
            form.reset({
              question: data.question,
              answer: data.answer || '',
              category: data.category || 'General',
              isActive: !!data.isActive,
            });
          }
        } catch {
          toast({ title: 'Error', description: 'Failed to load FAQ', variant: 'destructive' });
        } finally {
          setIsFetching(false);
        }
      };
      loadFaq();
    }
  }, [id, isNew, form]);

  const onSubmit = async (data: FaqFormValues) => {
    setIsLoading(true);
    try {
      if (isNew) {
        await FaqService.create(data);
        toast({ title: 'Success', description: 'FAQ created successfully' });
      } else {
        await FaqService.update(id, data);
        toast({ title: 'Success', description: 'FAQ updated successfully' });
      }
      router.push('/admin/support/faq');
    } catch {
      toast({ title: 'Error', description: 'Failed to save FAQ', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    isFetching,
    isNew,
    onSubmit,
  };
}
`,
    pageCode: `'use client';

import { use } from 'react';
import { CrudForm } from '@/components/admin/crud-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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
                    <FormLabel className="text-sm font-bold text-slate-800">Publish FAQ</FormLabel>
                    <p className="text-xs text-slate-400">Make this FAQ visible to customers</p>
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
`
  },

  // 6. SUPPORT HELP FORM
  {
    name: 'useSupportHelpForm',
    hookFile: 'hooks/use-support-help-form.ts',
    pageFile: 'app/admin/support/help/[id]/page.tsx',
    hookCode: `'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HelpService } from '@/services/help.service';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const helpSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  subtitle: z.string().min(5, 'Subtitle must be at least 5 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  category: z.string().min(2, 'Category is required'),
  imageUrl: z.string(),
  displayOrder: z.number(),
  isActive: z.boolean(),
});

export type HelpFormValues = z.infer<typeof helpSchema>;

export function useSupportHelpForm(id: string) {
  const router = useRouter();
  const { toast } = useToast();
  const isNew = id === 'new';

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!isNew);

  const form = useForm<HelpFormValues>({
    resolver: zodResolver(helpSchema) as any,
    defaultValues: {
      title: '',
      subtitle: '',
      content: '',
      category: 'General',
      imageUrl: '',
      displayOrder: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (!isNew && id) {
      const loadArticle = async () => {
        try {
          setIsFetching(true);
          const data = await HelpService.getById(id);
          if (data) {
            form.reset({
              title: data.title,
              subtitle: data.subtitle,
              content: data.content,
              category: data.category || 'General',
              imageUrl: data.imageUrl || '',
              displayOrder: data.displayOrder || 0,
              isActive: !!data.isActive,
            });
          }
        } catch {
          toast({ title: 'Error', description: 'Failed to load article', variant: 'destructive' });
        } finally {
          setIsFetching(false);
        }
      };
      loadArticle();
    }
  }, [id, isNew, form]);

  const onSubmit = async (data: HelpFormValues) => {
    setIsLoading(true);
    try {
      if (isNew) {
        await HelpService.create(data);
        toast({ title: 'Success', description: 'Article created successfully' });
      } else {
        await HelpService.update(id, data);
        toast({ title: 'Success', description: 'Article updated successfully' });
      }
      router.push('/admin/support/help');
    } catch {
      toast({ title: 'Error', description: 'Failed to save article', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    isFetching,
    isNew,
    onSubmit,
  };
}
`,
    pageCode: `'use client';

import { use } from 'react';
import { CrudForm } from '@/components/admin/crud-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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

              <FormField
                control={form.control}
                name="displayOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase tracking-wider text-slate-500">Display Order</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        className="rounded-xl h-11" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                      />
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
                    <FormLabel className="text-sm font-bold text-slate-800">Publish Article</FormLabel>
                    <p className="text-xs text-slate-400">Make this guide visible in the Help Center</p>
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
`
  },

  // 7. SUPPORT PRIVACY FORM
  {
    name: 'useSupportPrivacyForm',
    hookFile: 'hooks/use-support-privacy-form.ts',
    pageFile: 'app/admin/support/privacy/[id]/page.tsx',
    hookCode: `'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PrivacyPolicyService } from '@/services/privacy.service';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const privacySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  isActive: z.boolean().default(true),
});

export type PrivacyFormValues = z.infer<typeof privacySchema>;

export function useSupportPrivacyForm(id: string) {
  const router = useRouter();
  const { toast } = useToast();
  const isNew = id === 'new';

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!isNew);

  const form = useForm<PrivacyFormValues>({
    resolver: zodResolver(privacySchema) as any,
    defaultValues: {
      title: '',
      content: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (!isNew && id) {
      const loadPolicy = async () => {
        try {
          setIsFetching(true);
          const data = await PrivacyPolicyService.getById(id);
          if (data) {
            form.reset({
              title: data.title,
              content: data.content || '',
              isActive: !!data.isActive,
            });
          }
        } catch {
          toast({ title: 'Error', description: 'Failed to load policy', variant: 'destructive' });
        } finally {
          setIsFetching(false);
        }
      };
      loadPolicy();
    }
  }, [id, isNew, form]);

  const onSubmit = async (data: PrivacyFormValues) => {
    setIsLoading(true);
    try {
      if (isNew) {
        await PrivacyPolicyService.create(data);
        toast({ title: 'Success', description: 'Privacy policy created' });
      } else {
        await PrivacyPolicyService.update(id, data);
        toast({ title: 'Success', description: 'Privacy policy updated' });
      }
      router.push('/admin/support/privacy');
    } catch {
      toast({ title: 'Error', description: 'Failed to save policy', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    isFetching,
    isNew,
    onSubmit,
  };
}
`,
    pageCode: `'use client';

import { use } from 'react';
import { CrudForm } from '@/components/admin/crud-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import dynamic from 'next/dynamic';
import { useSupportPrivacyForm } from '@/hooks/use-support-privacy-form';

const RichTextEditor = dynamic(() => import('@/components/ui/rich-text-editor'), { ssr: false });

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PrivacyPolicyFormPage({ params }: PageProps) {
  const { id } = use(params);
  const { form, isLoading, isFetching, isNew, onSubmit } = useSupportPrivacyForm(id);

  if (isFetching) {
    return <div className="p-8 text-center text-slate-500">Loading policy data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <CrudForm
        title={isNew ? 'Create Privacy Policy' : 'Edit Privacy Policy'}
        subtitle="Manage legal disclosures and privacy policy terms."
        onSubmit={form.handleSubmit(onSubmit)}
        isLoading={isLoading}
      >
        <Form {...form}>
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black uppercase tracking-wider text-slate-500">Document Title</FormLabel>
                  <FormControl>
                    <Input placeholder="General Privacy Policy v2.0" className="rounded-xl h-11" {...field} />
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
                  <FormLabel className="text-xs font-black uppercase tracking-wider text-slate-500">Policy Body</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Write full legal disclosure text..."
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
                    <FormLabel className="text-sm font-bold text-slate-800">Active Document</FormLabel>
                    <p className="text-xs text-slate-400">Set as current effective privacy policy</p>
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
`
  },

  // 8. SEO EDIT FORM
  {
    name: 'useSeoConfigForm',
    hookFile: 'hooks/use-seo-config-form.ts',
    pageFile: 'app/admin/settings/seo/[id]/page.tsx',
    hookCode: `'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SeoService } from '@/services/seo.service';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const seoConfigSchema = z.object({
  pageName: z.string().min(2, 'Page Name is required'),
  scriptCode: z.string().optional(),
});

export type SeoConfigFormValues = z.infer<typeof seoConfigSchema>;

export function useSeoConfigForm() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<SeoConfigFormValues>({
    resolver: zodResolver(seoConfigSchema),
    defaultValues: {
      pageName: '',
      scriptCode: '',
    },
  });

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsFetching(true);
        const data = await SeoService.getById(Number(params.id));
        form.reset({
          pageName: data.pageName,
          scriptCode: data.scriptCode || '',
        });
      } catch {
        toast({ title: 'Error', description: 'Failed to load SEO configuration', variant: 'destructive' });
        router.push('/admin/settings/seo');
      } finally {
        setIsFetching(false);
      }
    };
    loadConfig();
  }, [params.id, form, router, toast]);

  const onSubmit = async (values: SeoConfigFormValues) => {
    setIsLoading(true);
    try {
      await SeoService.update(Number(params.id), values);
      toast({ title: 'Success', description: 'SEO Configuration updated' });
      router.push('/admin/settings/seo');
    } catch {
      toast({ title: 'Error', description: 'Failed to update config', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    isFetching,
    onSubmit,
  };
}
`,
    pageCode: `'use client';

import { CrudForm } from '@/components/admin/crud-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useSeoConfigForm } from '@/hooks/use-seo-config-form';

export default function EditSeoConfigPage() {
  const { form, isLoading, isFetching, onSubmit } = useSeoConfigForm();

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">Loading SEO Configuration...</p>
      </div>
    );
  }

  return (
    <CrudForm
      title="Edit SEO Configuration"
      subtitle="Modify page mapping and active tracking scripts."
      onSubmit={form.handleSubmit(onSubmit)}
      isLoading={isLoading}
    >
      <Form {...form}>
        <div className="space-y-10">
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-pink-500/80 mb-6">Target Configuration</h3>
            <FormField
              control={form.control}
              name="pageName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Target Page Identifier</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. HOME, CHECKOUT, PRODUCT_DETAIL" {...field} className="h-12 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 uppercase font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-pink-500/80 mb-6">Script Code</h3>
            <FormField
              control={form.control}
              name="scriptCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Raw HTML / JavaScript Snippet</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="<!-- Paste Google Tag, Meta Pixel, or any header script here -->" 
                      {...field} 
                      className="min-h-[250px] font-mono text-xs rounded-2xl bg-slate-900 text-pink-400 border-none p-6 leading-relaxed" 
                    />
                  </FormControl>
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
`
  },

  // 9. SEO NEW FORM
  {
    name: 'useSeoNewForm',
    hookFile: 'hooks/use-seo-new-form.ts',
    pageFile: 'app/admin/settings/seo/new/page.tsx',
    hookCode: `'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SeoService } from '@/services/seo.service';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const seoNewSchema = z.object({
  pageName: z.string().min(2, 'Page Name is required'),
  scriptCode: z.string().optional(),
});

export type SeoNewFormValues = z.infer<typeof seoNewSchema>;

export function useSeoNewForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SeoNewFormValues>({
    resolver: zodResolver(seoNewSchema),
    defaultValues: {
      pageName: '',
      scriptCode: '',
    },
  });

  const onSubmit = async (values: SeoNewFormValues) => {
    setIsLoading(true);
    try {
      await SeoService.save(values);
      toast({ title: 'Success', description: 'SEO Configuration created' });
      router.push('/admin/settings/seo');
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to create config', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    onSubmit,
  };
}
`,
    pageCode: `'use client';

import { CrudForm } from '@/components/admin/crud-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSeoNewForm } from '@/hooks/use-seo-new-form';

export default function NewSeoConfigPage() {
  const { form, isLoading, onSubmit } = useSeoNewForm();

  return (
    <CrudForm
      title="Create SEO Configuration"
      subtitle="Define a new page mapping and header script block."
      onSubmit={form.handleSubmit(onSubmit)}
      isLoading={isLoading}
    >
      <Form {...form}>
        <div className="space-y-10">
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-pink-500/80 mb-6">Target Configuration</h3>
            <FormField
              control={form.control}
              name="pageName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Target Page Identifier</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. HOME, CHECKOUT, PRODUCT_DETAIL" {...field} className="h-12 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 uppercase font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-pink-500/80 mb-6">Script Code</h3>
            <FormField
              control={form.control}
              name="scriptCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Raw HTML / JavaScript Snippet</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="<!-- Paste Google Tag, Meta Pixel, or any header script here -->" 
                      {...field} 
                      className="min-h-[250px] font-mono text-xs rounded-2xl bg-slate-900 text-pink-400 border-none p-6 leading-relaxed" 
                    />
                  </FormControl>
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
`
  },

  // 10. USER EDIT FORM
  {
    name: 'useUserForm',
    hookFile: 'hooks/use-user-form.ts',
    pageFile: 'app/admin/users/[id]/page.tsx',
    hookCode: `'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserService } from '@/services/user.service';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const userSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  taskGroup: z.string().optional(),
  roleNames: z.array(z.string()).default(['ROLE_USER']),
});

export type UserFormValues = z.infer<typeof userSchema>;

export function useUserForm(id: string) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<{ id: number; name: string }[]>([]);
  const isNew = id === 'new';

  const form = useForm<any>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      taskGroup: '',
      roleNames: ['ROLE_USER'],
    },
  });

  useEffect(() => {
    const init = async () => {
      try {
        const roles = await UserService.getAllRoles();
        setAvailableRoles(roles);

        if (!isNew) {
          const user = await UserService.getById(Number(id));
          form.reset({
            fullName: user.fullName || '',
            email: user.email || '',
            password: '',
            taskGroup: user.taskGroup || '',
            roleNames: user.roles?.map((r: any) => r.name) || ['ROLE_USER'],
          });
        }
      } catch {
        toast({ title: 'Error', description: 'Failed to load user permissions', variant: 'destructive' });
      }
    };
    init();
  }, [id, isNew, form]);

  const toggleRole = (roleName: string) => {
    const currentRoles: string[] = form.getValues('roleNames') || [];
    if (currentRoles.includes(roleName)) {
      form.setValue('roleNames', currentRoles.filter((r) => r !== roleName));
    } else {
      form.setValue('roleNames', [...currentRoles, roleName]);
    }
  };

  const onSubmit = async (values: UserFormValues) => {
    setIsLoading(true);
    try {
      if (isNew) {
        await UserService.create({
          ...values,
          password: values.password || 'Default123!',
        });
        toast({ title: 'Success', description: 'User account created successfully' });
      } else {
        await UserService.update(Number(id), values);
        await UserService.updateRolesAndGroups(Number(id), {
          taskGroup: values.taskGroup || '',
          roleNames: values.roleNames,
        });
        toast({ title: 'Success', description: 'User permissions saved' });
      }
      router.push('/admin/users');
    } catch {
      toast({ title: 'Error', description: 'Failed to save user account', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    isNew,
    availableRoles,
    toggleRole,
    onSubmit,
  };
}
`,
    pageCode: `'use client';

import { use } from 'react';
import { CrudForm } from '@/components/admin/crud-form';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useUserForm } from '@/hooks/use-user-form';

const TASK_GROUPS = [
  { value: 'ORDER_PROCESSOR', label: 'Order Processor' },
  { value: 'SHIPPING', label: 'Shipping & Delivery' },
  { value: 'CUSTOMER_SERVICE', label: 'Customer Service' },
  { value: 'ADMIN', label: 'Super Admin' },
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function UserEditPage({ params }: PageProps) {
  const { id } = use(params);
  const {
    form,
    isLoading,
    isNew,
    availableRoles,
    toggleRole,
    onSubmit,
  } = useUserForm(id);

  return (
    <CrudForm
      title={isNew ? 'Create Staff / User' : 'Edit Staff Account'}
      subtitle={isNew ? 'Grant backoffice permissions to a new team member.' : 'Update user profile & assign administrative roles.'}
      onSubmit={form.handleSubmit(onSubmit)}
      isLoading={isLoading}
    >
      <Form {...form}>
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" className="h-12 rounded-2xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" className="h-12 rounded-2xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400">
                    {isNew ? 'Password' : 'New Password (Optional)'}
                  </FormLabel>
                  <FormControl>
                    <Input type="password" placeholder={isNew ? '••••••••' : 'Leave empty to keep unchanged'} className="h-12 rounded-2xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="taskGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400">Operational Task Assignment</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-2xl">
                        <SelectValue placeholder="Select functional assignment" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TASK_GROUPS.map((group) => (
                        <SelectItem key={group.value} value={group.value}>
                          {group.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Assigned System Roles</Label>
            <div className="flex flex-wrap gap-2 pt-2">
              {availableRoles.map((role) => {
                const isSelected = form.watch('roleNames')?.includes(role.name);
                return (
                  <Badge
                    key={role.id}
                    onClick={() => toggleRole(role.name)}
                    className={\`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition-all \${
                      isSelected
                        ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }\`}
                  >
                    {role.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
      </Form>
    </CrudForm>
  );
}
`
  },

  // 11. NOTIFICATIONS NEW FORM
  {
    name: 'useNotificationNew',
    hookFile: 'hooks/use-notification-new.ts',
    pageFile: 'app/admin/notifications/new/page.tsx',
    hookCode: `'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NotificationService, PushNotificationRequest } from '@/services/notification.service';
import { useToast } from '@/hooks/use-toast';

export function useNotificationNew() {
  const [formData, setFormData] = useState<PushNotificationRequest>({
    title: '',
    body: '',
    type: 'PROMOTION',
    topic: 'all',
    userId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handlePush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.body) {
      toast({ title: 'Validation Error', description: 'Title and Body are required', variant: 'destructive' });
      return;
    }

    try {
      setIsSubmitting(true);
      await NotificationService.push(formData);
      toast({ title: 'Success', description: 'Notification pushed successfully' });
      router.push('/admin/notifications');
    } catch {
      toast({ title: 'Error', description: 'Failed to push notification', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    isSubmitting,
    handlePush,
    router,
  };
}
`,
    pageCode: `'use client';

import { Bell, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotificationNew } from '@/hooks/use-notification-new';

export default function NewNotificationPage() {
  const {
    formData,
    setFormData,
    isSubmitting,
    handlePush,
    router,
  } = useNotificationNew();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Button 
          onClick={() => router.back()} 
          variant="ghost" 
          className="rounded-2xl font-bold uppercase text-[10px] tracking-widest gap-2 text-slate-500 hover:text-pink-500 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        <div className="p-8 md:p-12 space-y-10">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-[2rem] bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
              <Bell className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Create Alert</h1>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Compose a new broadcast message</p>
            </div>
          </div>

          <form onSubmit={handlePush} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Target Audience</label>
              <Select 
                value={formData.topic} 
                onValueChange={(val) => setFormData({ ...formData, topic: val })}
              >
                <SelectTrigger className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold">
                  <SelectValue placeholder="Select Target" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100">
                  <SelectItem value="all">All Devices (Broadcast / Global)</SelectItem>
                  <SelectItem value="promo">Promo Subscribers Only</SelectItem>
                  <SelectItem value="single">Specific User ID</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.topic === 'single' && (
              <div className="space-y-2 animate-in fade-in">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">User Identification (UID)</label>
                <Input 
                  value={formData.userId || ''} 
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  placeholder="Enter User Database ID..." 
                  className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-mono"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Notification Category</label>
              <Select 
                value={formData.type} 
                onValueChange={(val) => setFormData({ ...formData, type: val })}
              >
                <SelectTrigger className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold">
                  <SelectValue placeholder="Notification Type" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100">
                  <SelectItem value="PROMOTION">PROMOTION</SelectItem>
                  <SelectItem value="TRANSACTION">TRANSACTION</SelectItem>
                  <SelectItem value="SYSTEM">SYSTEM ALERT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Alert Title</label>
              <Input 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Flash Sale Alert! ⚡ 50% Off Today" 
                className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Notification Body Message</label>
              <Textarea 
                value={formData.body} 
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                rows={4}
                placeholder="Write the message content displayed on customer mobile locks..." 
                className="rounded-2xl bg-slate-50 dark:bg-slate-800 border-none p-4 font-medium"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold uppercase tracking-wider text-xs shadow-xl shadow-pink-500/20 gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Sending Alert...' : 'Dispatch Notification Now'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
`
  },

  // 12. FLASH SALE FORM
  {
    name: 'useFlashSaleForm',
    hookFile: 'hooks/use-flash-sale-form.ts',
    pageFile: 'app/admin/flash-sales/[id]/page.tsx',
    hookCode: `'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductService } from '@/services/product.service';
import { FlashSaleService } from '@/services/flash-sale.service';
import { Product } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const flashSaleItemSchema = z.object({
  id: z.number().optional(),
  productId: z.coerce.number().min(1, 'Product is required'),
  variantId: z.coerce.number().min(1, 'Variant is required'),
  discountPrice: z.coerce.number().min(0.01, 'Discount price must be greater than 0'),
  stockLimit: z.coerce.number().min(1, 'Stock limit must be at least 1'),
});

export const flashSaleSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  isActive: z.boolean().default(true),
  items: z.array(flashSaleItemSchema).min(1, 'At least one product is required'),
});

export type FlashSaleFormValues = z.infer<typeof flashSaleSchema>;

export function useFlashSaleForm(id: string) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const isNew = id === 'new';

  const form = useForm<any>({
    resolver: zodResolver(flashSaleSchema),
    defaultValues: {
      name: '',
      startTime: '',
      endTime: '',
      isActive: true,
      items: [{ productId: 0, variantId: 0, discountPrice: 0, stockLimit: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const prodData = await ProductService.getAll(0, 100);
        setProducts(prodData.content || []);

        if (!isNew) {
          const data = await FlashSaleService.getById(id);
          form.reset({
            name: data.name,
            startTime: data.startTime.substring(0, 16),
            endTime: data.endTime.substring(0, 16),
            isActive: data.isActive,
            items: data.items.map((item: any) => ({
              id: item.id,
              productId: item.productId,
              variantId: item.variantId,
              discountPrice: item.discountPrice,
              stockLimit: item.stockLimit || 1,
            })),
          });
        }
      } catch {
        toast({ title: 'Error', description: 'Failed to load flash sale data', variant: 'destructive' });
      }
    };
    loadData();
  }, [id, isNew, form]);

  const onSubmit = async (values: FlashSaleFormValues) => {
    setIsLoading(true);
    try {
      if (isNew) {
        await FlashSaleService.create(values as any);
        toast({ title: 'Success', description: 'Flash sale created successfully' });
      } else {
        await FlashSaleService.update(Number(id), values as any);
        toast({ title: 'Success', description: 'Flash sale updated successfully' });
      }
      router.push('/admin/flash-sales');
    } catch {
      toast({ title: 'Error', description: 'Failed to save flash sale', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    fields,
    append,
    remove,
    products,
    isLoading,
    isNew,
    onSubmit,
  };
}
`,
    pageCode: `'use client';

import { use } from 'react';
import { CrudForm } from '@/components/admin/crud-form';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { useFlashSaleForm } from '@/hooks/use-flash-sale-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function FlashSaleEditPage({ params }: PageProps) {
  const { id } = use(params);
  const {
    form,
    fields,
    append,
    remove,
    products,
    isLoading,
    isNew,
    onSubmit,
  } = useFlashSaleForm(id);

  const productOptions = products.map((p) => ({
    value: p.id.toString(),
    label: \`\${p.name} (\${p.variants?.length || 0} variants)\`,
  }));

  return (
    <CrudForm
      title={isNew ? 'New Flash Sale' : 'Edit Flash Sale'}
      subtitle={isNew ? 'Configure flash sale campaign' : 'Update campaign settings and discounts'}
      onSubmit={form.handleSubmit(onSubmit)}
      isLoading={isLoading}
    >
      <Form {...form}>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold uppercase tracking-tight">Campaign Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Midnight Cyber Sale" className="rounded-xl border-slate-200" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="font-bold uppercase tracking-tight">Active Status</FormLabel>
                    <p className="text-xs text-slate-500">Enable this campaign</p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold uppercase tracking-tight">Start Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" className="rounded-xl border-slate-200" {...field} />
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
                  <FormLabel className="font-bold uppercase tracking-tight">End Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" className="rounded-xl border-slate-200" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Campaign Products</h3>
                <p className="text-xs text-slate-500">Add discounted variants to this campaign</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ productId: 0, variantId: 0, discountPrice: 0, stockLimit: 1 })}
                className="gap-2 rounded-xl border-slate-200"
              >
                <Plus size={16} /> Add Product
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((fieldItem, index) => {
                const selectedProdId = form.watch(\`items.\${index}.productId\`);
                const currentProduct = products.find((p) => p.id === Number(selectedProdId));
                const variantOptions = currentProduct?.variants?.map((v) => ({
                  value: v.id.toString(),
                  label: \`\${v.sku} - \${v.size || ''} \${v.color || ''} (Normal: Rp \${v.price})\`,
                })) || [];

                return (
                  <div key={fieldItem.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Item #{index + 1}</span>
                      {fields.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="text-red-500 hover:text-red-600">
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs font-bold uppercase tracking-tight">Product</Label>
                        <Combobox
                          options={productOptions}
                          value={selectedProdId?.toString()}
                          onChange={(val) => {
                            form.setValue(\`items.\${index}.productId\`, Number(val));
                            form.setValue(\`items.\${index}.variantId\`, 0);
                          }}
                          placeholder="Select Product"
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-bold uppercase tracking-tight">Variant</Label>
                        <Combobox
                          options={variantOptions}
                          value={form.watch(\`items.\${index}.variantId\`)?.toString()}
                          onChange={(val) => form.setValue(\`items.\${index}.variantId\`, Number(val))}
                          placeholder="Select Variant"
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={\`items.\${index}.discountPrice\`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-tight">Flash Price (Rp)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="50000" className="rounded-xl border-slate-200" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={\`items.\${index}.stockLimit\`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-tight">Quota Limit</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="10" className="rounded-xl border-slate-200" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Form>
    </CrudForm>
  );
}
`
  },

  // 13. PRODUCT FORM
  {
    name: 'useProductForm',
    hookFile: 'hooks/use-product-form.ts',
    pageFile: 'app/admin/products/[id]/page.tsx',
    hookCode: `'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductService } from '@/services/product.service';
import { CategoryService } from '@/services/category.service';
import { BrandService } from '@/services/brand.service';
import { Category } from '@/types/category';
import { Brand } from '@/types/brand';
import { useToast } from '@/hooks/use-toast';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const variantDetailSchema = z.object({
  id: z.number().optional(),
  sku: z.string().min(3),
  size: z.string().optional(),
  color: z.string().optional(),
  hexColor: z.string().optional(),
  price: z.coerce.number().min(0.01),
  discountPrice: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().min(0),
  isActive: z.boolean().default(true),
  imageUrl: z.string().optional(),
});

export const variantGroupSchema = z.object({
  groupName: z.string().min(1, 'Group Name is required'),
  details: z.array(variantDetailSchema).min(1),
});

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  categoryId: z.coerce.number().min(1),
  brandId: z.coerce.number().min(1),
  gender: z.enum(['MEN', 'WOMEN', 'UNISEX']).default('UNISEX'),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isTopProduct: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isRecommended: z.boolean().default(false),
  imageUrl: z.string().optional(),
  images: z.array(z.string()).default([]),
  variantGroups: z.array(variantGroupSchema).min(1),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export function useProductForm(id: string) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const isNew = id === 'new';

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      categoryId: 1,
      brandId: 1,
      gender: 'UNISEX',
      isActive: true,
      isFeatured: false,
      isTopProduct: false,
      isBestSeller: false,
      isRecommended: false,
      imageUrl: '',
      images: [],
      variantGroups: [{ groupName: 'Default Style', details: [{ sku: '', size: '', color: '', hexColor: '', price: 0.01, discountPrice: 0, stock: 0, isActive: true, imageUrl: '' }] }],
    },
  });

  const { fields: groupFields, append: appendGroup, remove: removeGroup } = useFieldArray({
    control: form.control,
    name: 'variantGroups',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, brs] = await Promise.all([
          CategoryService.getAll(),
          BrandService.getAll(),
        ]);
        setCategories(cats.content || []);
        setBrands(brs.content || []);

        if (!isNew) {
          const product = await ProductService.getById(Number(id));
          form.reset({
            name: product.name,
            slug: product.slug,
            description: product.description || '',
            categoryId: product.categoryId || product.category?.id || 1,
            brandId: product.brandId || product.brand?.id || 1,
            gender: (product.gender as any) || 'UNISEX',
            isActive: product.isActive,
            isFeatured: !!product.isFeatured,
            isTopProduct: !!product.isTopProduct,
            isBestSeller: !!product.isBestSeller,
            isRecommended: !!product.isRecommended,
            imageUrl: product.imageUrl || '',
            images: product.images || [],
            variantGroups: (product as any).variantGroups && (product as any).variantGroups.length > 0
              ? (product as any).variantGroups
              : [{ groupName: 'Default Style', details: product.variants || [] }],
          });
        }
      } catch {
        toast({ title: 'Error', description: 'Failed to load product form details', variant: 'destructive' });
      }
    };
    loadData();
  }, [id, isNew, form]);

  const name = form.watch('name');
  useEffect(() => {
    if (isNew || !form.getValues('slug')) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      form.setValue('slug', slug, { shouldValidate: true });
    }
  }, [name, form, isNew]);

  const onSubmit = async (values: ProductFormValues) => {
    setIsLoading(true);
    try {
      if (isNew) {
        await ProductService.create(values as any);
        toast({ title: 'Success', description: 'Product created successfully' });
      } else {
        await ProductService.update(Number(id), values as any);
        toast({ title: 'Success', description: 'Product updated successfully' });
      }
      router.push('/admin/products');
    } catch {
      toast({ title: 'Error', description: 'Failed to save product', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    groupFields,
    appendGroup,
    removeGroup,
    categories,
    brands,
    isLoading,
    isNew,
    onSubmit,
  };
}
`,
    pageCode: `'use client';

import { use } from 'react';
import { CrudForm } from '@/components/admin/crud-form';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Folders, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { ImageUpload } from '@/components/ui/image-upload';
import { useProductForm } from '@/hooks/use-product-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductEditPage({ params }: PageProps) {
  const { id } = use(params);
  const {
    form,
    groupFields,
    appendGroup,
    removeGroup,
    categories,
    brands,
    isLoading,
    isNew,
    onSubmit,
  } = useProductForm(id);

  const categoryOptions = categories.map((c) => ({ value: c.id.toString(), label: c.name }));
  const brandOptions = brands.map((b) => ({ value: b.id.toString(), label: b.name }));

  return (
    <CrudForm
      title={isNew ? 'New Product' : 'Edit Product'}
      subtitle={isNew ? 'Add a new product with multiple variants' : 'Update product details and stock'}
      onSubmit={form.handleSubmit(onSubmit)}
      isLoading={isLoading}
    >
      <Form {...form}>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold uppercase tracking-tight">Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Classic Runner" className="rounded-xl border-slate-200" {...field} />
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
                    <Input placeholder="classic-runner" className="rounded-xl border-slate-200" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel className="font-bold uppercase tracking-tight">Category</FormLabel>
              <Combobox
                options={categoryOptions}
                value={form.watch('categoryId')?.toString()}
                onChange={(val) => form.setValue('categoryId', Number(val))}
                placeholder="Select Category"
              />
            </div>

            <div>
              <FormLabel className="font-bold uppercase tracking-tight">Brand</FormLabel>
              <Combobox
                options={brandOptions}
                value={form.watch('brandId')?.toString()}
                onChange={(val) => form.setValue('brandId', Number(val))}
                placeholder="Select Brand"
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold uppercase tracking-tight">Product Main Image</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value || ''}
                    onChange={(url: string) => {
                      field.onChange(url);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Variant Groups</h3>
                <p className="text-xs text-slate-500">Group variations by styles, sizes, or models</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendGroup({
                    groupName: \`Style \${groupFields.length + 1}\`,
                    details: [{ sku: '', size: '', color: '', hexColor: '', price: 0.01, discountPrice: 0, stock: 0, isActive: true, imageUrl: '' }],
                  })
                }
                className="gap-2 rounded-xl"
              >
                <Plus size={16} /> Add Style Group
              </Button>
            </div>

            <div className="space-y-6">
              {groupFields.map((group, groupIdx) => (
                <div key={group.id} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <FormField
                      control={form.control}
                      name={\`variantGroups.\${groupIdx}.groupName\`}
                      render={({ field }) => (
                        <FormItem className="flex-1 max-w-xs">
                          <FormControl>
                            <Input placeholder="Group Name (e.g. Red Edition)" className="rounded-xl font-bold bg-white" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {groupFields.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeGroup(groupIdx)} className="text-red-500">
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Form>
    </CrudForm>
  );
}
`
  },

  // 14. MOBILE CONTENT ITEM FORM
  {
    name: 'useMobileContentItemForm',
    hookFile: 'hooks/use-mobile-content-item-form.ts',
    pageFile: 'app/admin/content/mobile/[type]/[id]/page.tsx',
    hookCode: `'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContentService } from '@/services/content.service';
import { ProductService } from '@/services/product.service';
import { Product } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const mobileContentItemSchema = z.object({
  id: z.number().optional(),
  type: z.string().min(1, 'Type is required'),
  platform: z.enum(['WEB', 'MOBILE', 'ALL']),
  isActive: z.boolean(),
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  linkUrl: z.string().optional().nullable(),
  productId: z.number().nullable().optional(),
  tag: z.string().optional().nullable(),
  ctaText: z.string().optional().nullable(),
  badgeText: z.string().optional().nullable(),
  iconName: z.string().optional().nullable(),
  emoji: z.string().optional().nullable(),
  styleConfig: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  contentBody: z.string().optional().nullable(),
  bannerUrl: z.string().optional().nullable(),
  productIds: z.string().optional().nullable(),
});

export type MobileContentItemFormValues = z.infer<typeof mobileContentItemSchema>;

export function useMobileContentItemForm(type: string, id: string) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const isNew = id === 'new';

  const form = useForm<MobileContentItemFormValues>({
    resolver: zodResolver(mobileContentItemSchema) as any,
    defaultValues: {
      type,
      platform: 'MOBILE',
      isActive: true,
      title: '',
      subtitle: '',
      imageUrl: '',
      linkUrl: '',
      productId: null,
      tag: '',
      ctaText: '',
      badgeText: '',
      iconName: '',
      emoji: '',
      styleConfig: '',
      startDate: '',
      endDate: '',
      contentBody: '',
      bannerUrl: '',
      productIds: '',
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const prodData = await ProductService.getAll(0, 100);
        setProducts(prodData.content || []);

        if (!isNew) {
          const item = await ContentService.getById(Number(id));
          form.reset({
            ...item,
            platform: 'MOBILE',
            type,
          });
        }
      } catch {
        toast({ title: 'Error', description: 'Gagal memuat data item', variant: 'destructive' });
      }
    };
    loadData();
  }, [id, isNew, type, form]);

  const onSubmit = async (values: MobileContentItemFormValues) => {
    setIsLoading(true);
    try {
      if (isNew) {
        await ContentService.createItem({ ...values, platform: 'MOBILE', type } as any);
        toast({ title: 'Berhasil', description: 'Item berhasil ditambahkan' });
      } else {
        await ContentService.updateItem(Number(id), { ...values, platform: 'MOBILE', type } as any);
        toast({ title: 'Berhasil', description: 'Item berhasil diperbarui' });
      }
      router.push(\`/admin/content/mobile/\${type}\`);
    } catch {
      toast({ title: 'Error', description: 'Gagal menyimpan item', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    isNew,
    products,
    onSubmit,
  };
}
`,
    pageCode: `'use client';

import { use } from 'react';
import { CrudForm } from '@/components/admin/crud-form';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from '@/components/ui/image-upload';
import { useMobileContentItemForm } from '@/hooks/use-mobile-content-item-form';

interface PageProps {
  params: Promise<{ type: string; id: string }>;
}

export default function MobileContentItemEditPage({ params }: PageProps) {
  const { type, id } = use(params);
  const { form, isLoading, isNew, onSubmit } = useMobileContentItemForm(type, id);

  return (
    <CrudForm
      title={isNew ? 'Tambah Item Mobile' : 'Edit Item Mobile'}
      subtitle={\`Kelola konten \${type} untuk aplikasi mobile\`}
      onSubmit={form.handleSubmit(onSubmit)}
      isLoading={isLoading}
    >
      <Form {...form}>
        <div className="space-y-6">
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
`
  },

  // 15. WEB CONTENT ITEM FORM
  {
    name: 'useWebContentItemForm',
    hookFile: 'hooks/use-web-content-item-form.ts',
    pageFile: 'app/admin/content/web/[type]/[id]/page.tsx',
    hookCode: `'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContentService } from '@/services/content.service';
import { ProductService } from '@/services/product.service';
import { Product } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const webContentItemSchema = z.object({
  id: z.number().optional(),
  type: z.string().min(1, 'Type is required'),
  platform: z.enum(['WEB', 'MOBILE', 'ALL']),
  isActive: z.boolean(),
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  linkUrl: z.string().optional().nullable(),
  productId: z.number().nullable().optional(),
  tag: z.string().optional().nullable(),
  ctaText: z.string().optional().nullable(),
  badgeText: z.string().optional().nullable(),
  iconName: z.string().optional().nullable(),
  emoji: z.string().optional().nullable(),
  styleConfig: z.string().optional().nullable(),
  price: z.number().optional().nullable(),
  quantity: z.number().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  discountType: z.string().optional().nullable(),
  discountValue: z.number().optional().nullable(),
});

export type WebContentItemFormValues = z.infer<typeof webContentItemSchema>;

export function useWebContentItemForm(type: string, id: string) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const isNew = id === 'new';

  const form = useForm<WebContentItemFormValues>({
    resolver: zodResolver(webContentItemSchema) as any,
    defaultValues: {
      type,
      platform: 'WEB',
      isActive: true,
      title: '',
      subtitle: '',
      imageUrl: '',
      linkUrl: '',
      productId: null,
      tag: '',
      ctaText: '',
      badgeText: '',
      iconName: '',
      emoji: '',
      styleConfig: '',
      price: null,
      quantity: null,
      startDate: '',
      endDate: '',
      discountType: '',
      discountValue: null,
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const prodData = await ProductService.getAll(0, 100);
        setProducts(prodData.content || []);

        if (!isNew) {
          const item = await ContentService.getById(Number(id));
          form.reset({
            ...item,
            platform: 'WEB',
            type,
          });
        }
      } catch {
        toast({ title: 'Error', description: 'Gagal memuat data item web', variant: 'destructive' });
      }
    };
    loadData();
  }, [id, isNew, type, form]);

  const onSubmit = async (values: WebContentItemFormValues) => {
    setIsLoading(true);
    try {
      if (isNew) {
        await ContentService.createItem({ ...values, platform: 'WEB', type } as any);
        toast({ title: 'Berhasil', description: 'Item storefront web berhasil dibuat' });
      } else {
        await ContentService.updateItem(Number(id), { ...values, platform: 'WEB', type } as any);
        toast({ title: 'Berhasil', description: 'Item storefront web berhasil diperbarui' });
      }
      router.push(\`/admin/content/web/\${type}\`);
    } catch {
      toast({ title: 'Error', description: 'Gagal menyimpan item', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    isNew,
    products,
    onSubmit,
  };
}
`,
    pageCode: `'use client';

import { use } from 'react';
import { CrudForm } from '@/components/admin/crud-form';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from '@/components/ui/image-upload';
import { useWebContentItemForm } from '@/hooks/use-web-content-item-form';

interface PageProps {
  params: Promise<{ type: string; id: string }>;
}

export default function WebContentItemEditPage({ params }: PageProps) {
  const { type, id } = use(params);
  const { form, isLoading, isNew, onSubmit } = useWebContentItemForm(type, id);

  return (
    <CrudForm
      title={isNew ? 'Tambah Item Web' : 'Edit Item Web'}
      subtitle={\`Kelola tampilan \${type} untuk storefront website\`}
      onSubmit={form.handleSubmit(onSubmit)}
      isLoading={isLoading}
    >
      <Form {...form}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Judul</FormLabel>
                  <FormControl>
                    <Input placeholder="Judul banner / promo..." {...field} value={field.value || ''} />
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
                    <Input placeholder="Subtitle / teaser..." {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ctaText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Teks Tombol (CTA)</FormLabel>
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
                  <FormLabel className="font-bold">Tujuan Link (URL)</FormLabel>
                  <FormControl>
                    <Input placeholder="/categories/shoes" {...field} value={field.value || ''} />
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
                <FormLabel className="font-bold">Gambar Desktop / Banner</FormLabel>
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
                  <p className="text-xs text-slate-500">Tampilkan item ini di homepage website</p>
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
`
  }
];

module.exports = { crudFormGenerators };
