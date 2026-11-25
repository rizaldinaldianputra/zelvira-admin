'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SeoService } from '@/services/seo.service';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const seoNewSchema = z.object({
  pageName: z.string().min(2, 'Page Identifier wajib diisi'),
  targetType: z.enum(['HEAD', 'BODY']).default('HEAD'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  scriptCode: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type SeoNewFormValues = z.infer<typeof seoNewSchema>;

export function useSeoNewForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SeoNewFormValues>({
    resolver: zodResolver(seoNewSchema) as any,
    defaultValues: {
      pageName: 'GLOBAL',
      targetType: 'HEAD',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      scriptCode: '',
      isActive: true,
    },
  });

  const onSubmit = async (values: SeoNewFormValues) => {
    setIsLoading(true);
    try {
      await SeoService.save({
        pageName: values.pageName.trim().toUpperCase(),
        targetType: values.targetType,
        metaTitle: values.metaTitle?.trim() || undefined,
        metaDescription: values.metaDescription?.trim() || undefined,
        metaKeywords: values.metaKeywords?.trim() || undefined,
        scriptCode: values.scriptCode?.trim() || undefined,
        isActive: values.isActive,
      });
      toast({ title: 'Berhasil', description: 'Konfigurasi SEO berhasil disimpan' });
      router.push('/admin/settings/seo');
    } catch (error: any) {
      toast({ title: 'Gagal Menyimpan', description: error?.message || 'Gagal membuat konfigurasi SEO', variant: 'destructive' });
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
