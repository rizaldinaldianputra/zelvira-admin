'use client';

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
  pointsReward: z.coerce.number().min(0, { message: 'Points reward must be at least 0' }).default(0),
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
      pointsReward: 0,
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
            pointsReward: data.pointsReward ?? 0,
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
