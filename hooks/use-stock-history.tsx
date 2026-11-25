'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { StockTransactionService, StockTransaction } from '@/services/stock-transaction.service';

export function useStockHistory() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [history, setHistory] = useState<StockTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const page = parseInt(searchParams.get('page') || '0');
  const query = searchParams.get('query') || '';

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const res = await StockTransactionService.getHistory(query, page, 10);
      setHistory(res.content);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages);
    } catch (error) {
      console.error('Failed to fetch history', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, query]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get('query') as string;
    const params = new URLSearchParams(searchParams);
    params.set('query', q);
    params.set('page', '0');
    router.push(`?${params.toString()}`);
  };

  const setPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  return {
    history,
    isLoading,
    totalElements,
    totalPages,
    page,
    query,
    handleSearch,
    setPage,
    fetchHistory,
  };
}
