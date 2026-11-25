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
      router.push(`/admin/content/mobile/${type}`);
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
