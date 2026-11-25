'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SeoService } from '@/services/seo.service';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const seoConfigSchema = z.object({
  pageName: z.string().min(2, 'Page Identifier wajib diisi'),
  targetType: z.enum(['HEAD', 'BODY']).default('HEAD'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  scriptCode: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type SeoConfigFormValues = z.infer<typeof seoConfigSchema>;

export function useSeoConfigForm() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<SeoConfigFormValues>({
    resolver: zodResolver(seoConfigSchema) as any,
    defaultValues: {
      pageName: '',
      targetType: 'HEAD',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      scriptCode: '',
      isActive: true,
    },
  });

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsFetching(true);
        const data = await SeoService.getById(Number(params.id));
        if (data) {
          form.reset({
            pageName: data.pageName || '',
            targetType: (data.targetType as 'HEAD' | 'BODY') || 'HEAD',
            metaTitle: data.metaTitle || '',
            metaDescription: data.metaDescription || '',
            metaKeywords: data.metaKeywords || '',
            scriptCode: data.scriptCode || '',
            isActive: data.isActive ?? true,
          });
        }
      } catch {
        toast({ title: 'Error', description: 'Failed to load SEO configuration', variant: 'destructive' });
        router.push('/admin/settings/seo');
      } finally {
        setIsFetching(false);
      }
    };
    if (params.id) {
      loadConfig();
    }
  }, [params.id, form, router]);

  const onSubmit = async (values: SeoConfigFormValues) => {
    setIsLoading(true);
    try {
      await SeoService.update(Number(params.id), {
        pageName: values.pageName.trim().toUpperCase(),
        targetType: values.targetType,
        metaTitle: values.metaTitle?.trim() || undefined,
        metaDescription: values.metaDescription?.trim() || undefined,
        metaKeywords: values.metaKeywords?.trim() || undefined,
        scriptCode: values.scriptCode?.trim() || undefined,
        isActive: values.isActive,
      });
      toast({ title: 'Berhasil', description: 'Konfigurasi SEO berhasil diperbarui' });
      router.push('/admin/settings/seo');
    } catch {
      toast({ title: 'Error', description: 'Gagal memperbarui konfigurasi SEO', variant: 'destructive' });
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
