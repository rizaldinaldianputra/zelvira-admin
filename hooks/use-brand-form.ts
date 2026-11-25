'use client';

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
