'use client';

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
