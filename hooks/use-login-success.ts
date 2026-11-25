'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth.service';

export function useLoginSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      authService.handleOAuthSuccess(token).then((user) => {
        if (user?.roles?.includes('ROLE_ADMIN')) {
          router.push('/admin');
        } else {
          router.push('/');
        }
        router.refresh();
      });
    } else {
      router.push('/login');
    }
  }, [router, searchParams]);
}
