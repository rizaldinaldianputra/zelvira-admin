'use client';

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
  displayOrder: z.number().optional(),
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
      displayOrder: undefined,
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
      const payload = {
        ...data,
        isActive: Boolean(data.isActive),
        active: Boolean(data.isActive),
      };
      if (isNew) {
        await HelpService.create(payload);
        toast({ title: 'Success', description: 'Article created successfully' });
      } else {
        await HelpService.update(id, payload);
        toast({ title: 'Success', description: 'Article updated successfully' });
      }
      router.push('/admin/support/help');
      router.refresh();
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
