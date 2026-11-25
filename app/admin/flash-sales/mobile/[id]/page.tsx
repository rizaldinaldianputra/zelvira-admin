'use client';

import { use } from 'react';
import FlashSaleFormPage from '@/components/admin/FlashSaleFormPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function FlashSaleMobileEditPage({ params }: PageProps) {
  const { id } = use(params);
  return <FlashSaleFormPage id={id} platform="MOBILE" backPath="/admin/flash-sales/mobile" />;
}
