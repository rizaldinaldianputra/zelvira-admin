'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContentService } from '@/services/content.service';
import { ContentItem } from '@/types/content';
import { useToast } from '@/hooks/use-toast';
import { ColumnDef } from '@tanstack/react-table';

const TYPE_LABELS: Record<string, { label: string; description: string }> = {
  MOBILE_PROMO:     { label: 'Promo Carousel',       description: 'Banner slideshow gradient di home app mobile' },
  FLASH_SALE_MOBILE:{ label: 'Flash Sale Mobile',     description: 'Strip ProductCard diskon di home mobile' },
  TRENDING_LIST:    { label: 'Trending Now',          description: 'Kartu trending horizontal dengan foto & kategori' },
  FEATURED_MOBILE:  { label: 'Featured Products',     description: '2-column grid produk unggulan di mobile' },
};

export function useMobileContentItems(type: string) {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const typeInfo = TYPE_LABELS[type] || { label: type, description: 'Mobile storefront items' };

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await ContentService.getItemsByType(type, 'MOBILE', false);
      setItems(data);
    } catch {
      toast({ title: 'Error', description: 'Gagal memuat data item', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [type]);

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus item ini?')) return;
    try {
      await ContentService.deleteItem(id);
      toast({ title: 'Berhasil', description: 'Item dihapus' });
      fetchItems();
    } catch {
      toast({ title: 'Error', description: 'Gagal menghapus item', variant: 'destructive' });
    }
  };

  const handleAdd = () => {
    router.push(`/admin/content/mobile/${type}/new`);
  };

  const handleEdit = (item: ContentItem) => {
    router.push(`/admin/content/mobile/${type}/${item.id}`);
  };

  return {
    items,
    isLoading,
    typeInfo,
    handleAdd,
    handleEdit,
    handleDelete,
    fetchItems,
  };
}
