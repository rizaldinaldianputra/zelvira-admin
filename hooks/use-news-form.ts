'use client';

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
  targetUserId: z.coerce.number().optional(),
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
      targetUserId: undefined,
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
            targetUserId: data.targetUserId,
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
