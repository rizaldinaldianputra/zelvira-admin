'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NotificationService, PushNotificationRequest } from '@/services/notification.service';
import { useToast } from '@/hooks/use-toast';

export function useNotificationNew() {
  const [formData, setFormData] = useState<PushNotificationRequest>({
    title: '',
    body: '',
    type: 'PROMOTION',
    topic: 'all',
    userId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handlePush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.body) {
      toast({ title: 'Validation Error', description: 'Title and Body are required', variant: 'destructive' });
      return;
    }

    try {
      setIsSubmitting(true);
      await NotificationService.push(formData);
      toast({ title: 'Success', description: 'Notification pushed successfully' });
      router.push('/admin/notifications');
    } catch {
      toast({ title: 'Error', description: 'Failed to push notification', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    isSubmitting,
    handlePush,
    router,
  };
}
