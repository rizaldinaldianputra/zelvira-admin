'use client';

import { use } from 'react';
import FlashSaleFormPage from '@/components/admin/FlashSaleFormPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function FlashSaleWebEditPage({ params }: PageProps) {
  const { id } = use(params);
  return <FlashSaleFormPage id={id} platform="WEB" backPath="/admin/flash-sales/web" />;
}
