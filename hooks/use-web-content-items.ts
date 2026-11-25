'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContentService } from '@/services/content.service';
import { ContentItem } from '@/types/content';
import { useToast } from '@/hooks/use-toast';

const TYPE_LABELS: Record<string, { label: string; description: string }> = {
  HERO_CAROUSEL:       { label: 'Hero Carousel',         description: 'Banner slideshow utama homepage web' },
  FLASH_SALE_WEB:      { label: 'Flash Sale Web',         description: 'Promo kilat dengan countdown timer di web' },
  FEATURED_PRODUCTS:   { label: 'Featured Products Web',  description: 'Grid produk unggulan dengan tab filter' },
  NEWS:                { label: 'News & Articles',        description: 'Berita dan artikel fashion di web' },
};

export function useWebContentItems(type: string) {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const typeInfo = TYPE_LABELS[type] || { label: type, description: 'Web storefront items' };

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await ContentService.getItemsByType(type, 'WEB', false);
      const sorted = [...(data || [])].sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return (b.id ?? 0) - (a.id ?? 0);
      });
      setItems(sorted);
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
    router.push(`/admin/content/web/${type}/new`);
  };

  const handleEdit = (item: ContentItem) => {
    router.push(`/admin/content/web/${type}/${item.id}`);
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
