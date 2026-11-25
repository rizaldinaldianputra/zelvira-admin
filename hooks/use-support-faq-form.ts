'use client';

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
      const payload = {
        ...data,
        isActive: Boolean(data.isActive),
        active: Boolean(data.isActive),
      };
      if (isNew) {
        await FaqService.create(payload);
        toast({ title: 'Success', description: 'FAQ created successfully' });
      } else {
        await FaqService.update(id, payload);
        toast({ title: 'Success', description: 'FAQ updated successfully' });
      }
      router.push('/admin/support/faq');
      router.refresh();
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
