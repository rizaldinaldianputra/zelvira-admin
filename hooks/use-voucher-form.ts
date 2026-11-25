'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { VoucherService } from '@/services/voucher.service';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const voucherSchema = z.object({
  code: z.string().min(3, { message: 'Code must be at least 3 characters' }),
  discountAmount: z.coerce.number().min(0),
  minPurchase: z.coerce.number().min(0),
  validUntil: z.string(),
  isActive: z.boolean().default(true),
  targetMembership: z.string().default('ALL'),
});

export type VoucherFormValues = z.infer<typeof voucherSchema>;

export function useVoucherForm() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isNew = params.id === 'new';

  const form = useForm<VoucherFormValues>({
    resolver: zodResolver(voucherSchema) as any,
    defaultValues: {
      code: '',
      discountAmount: 0,
      minPurchase: 0,
      validUntil: new Date().toISOString().split('T')[0],
      isActive: true,
      targetMembership: 'ALL',
    },
  });

  useEffect(() => {
    if (!isNew && params.id) {
      const fetchVoucher = async () => {
        try {
          const data = await VoucherService.getById(Number(params.id));
          form.reset({
            code: data.code,
            discountAmount: data.discountAmount,
            minPurchase: data.minPurchase,
            validUntil: data.validUntil ? new Date(data.validUntil).toISOString().split('T')[0] : '',
            isActive: data.isActive,
            targetMembership: data.targetMembership || 'ALL',
          });
        } catch (error) {
          toast({ title: 'Error', description: 'Failed to fetch voucher', variant: 'destructive' });
        }
      };
      fetchVoucher();
    }
  }, [isNew, params.id, form]);

  const onSubmit = async (values: VoucherFormValues) => {
    setIsLoading(true);
    try {
      if (isNew) {
        await VoucherService.create(values as any);
        toast({ title: 'Success', description: 'Voucher created successfully' });
      } else {
        await VoucherService.update(Number(params.id), values as any);
        toast({ title: 'Success', description: 'Voucher updated successfully' });
      }
      router.push('/admin/vouchers');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save voucher', variant: 'destructive' });
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
