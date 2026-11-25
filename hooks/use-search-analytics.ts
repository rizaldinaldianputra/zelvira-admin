'use client';

import { useEffect, useState } from 'react';
import { ProductService } from '@/services/product.service';

export interface TrendingSearchItem {
  id: number;
  keyword: string;
  count: number;
  trend: 'up' | 'down' | 'steady';
}

export function useSearchAnalytics() {
  const [trending, setTrending] = useState<TrendingSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTrends() {
      try {
        const products = await ProductService.getAll();
        if (Array.isArray(products) && products.length > 0) {
          const items: TrendingSearchItem[] = products.slice(0, 8).map((p, idx) => ({
            id: p.id || idx + 1,
            keyword: p.name,
            count: (p.reviewCount || 0) * 12 + 15,
            trend: idx % 2 === 0 ? 'up' : 'steady'
          }));
          setTrending(items);
        } else {
          setTrending([]);
        }
      } catch {
        setTrending([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadTrends();
  }, []);

  return {
    trending,
    isLoading,
  };
}
