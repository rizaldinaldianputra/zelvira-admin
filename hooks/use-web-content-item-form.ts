'use client';

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
  displayOrder: z.number().nullable().optional(),
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
  contentBody: z.string().optional().nullable(),
  productIds: z.string().optional().nullable(),
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
      displayOrder: null,
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
      contentBody: '',
      productIds: '',
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const prodData = await ProductService.getAll(0, 500);
        setProducts(prodData.content || []);

        if (!isNew) {
          const item = await ContentService.getById(Number(id));
          form.reset({
            ...item,
            platform: 'WEB',
            type,
          });
        } else if (typeof window !== 'undefined') {
          const searchParams = new URLSearchParams(window.location.search);
          const tagParam = searchParams.get('tag');
          if (tagParam) {
            form.setValue('tag', tagParam);
          }
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
      router.push(`/admin/content/web/${type}`);
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
