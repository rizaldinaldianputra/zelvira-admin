'use client';

import React, { useEffect, useState } from 'react';
import { ProductService } from '@/services/product.service';
import { Product, ProductVariant } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { ColumnDef } from '@tanstack/react-table';
import { StockTransactionService } from '@/services/stock-transaction.service';
import { StockSummary, StockTransaction } from '@/types/stock';

export function useStockDetail(productId: number) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [summaries, setSummaries] = useState<Record<number, StockSummary>>({});
  const [history, setHistory] = useState<StockTransaction[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(0);

  const [activeTab, setActiveTab] = useState<'variants' | 'history'>('variants');
  const { toast } = useToast();

  // Modal State
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [modalType, setModalType] = useState<'ADD' | 'ADJUST' | 'LOG' | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Per-Variant History State
  const [variantHistory, setVariantHistory] = useState<StockTransaction[]>([]);
  const [isVariantHistoryLoading, setIsVariantHistoryLoading] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await ProductService.getById(productId);
      setProduct(data);

      const variantIds = data.variants.map((v: any) => v.id);
      if (variantIds.length > 0) {
        const summaryResults = await StockTransactionService.getSummaries(variantIds);
        const summaryMap: Record<number, StockSummary> = {};
        summaryResults.forEach((s: any) => {
          summaryMap[s.variantId] = s;
        });
        setSummaries(summaryMap);
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch product data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setIsHistoryLoading(true);
      const res = await StockTransactionService.getHistoryByProduct(productId, historyPage, 10);
      setHistory(res.content);
      setHistoryTotalPages(res.totalPages);
    } catch (error) {
      console.error('Failed to fetch history', error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [productId]);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [productId, activeTab, historyPage]);

  const handleOpenAction = (variant: ProductVariant, type: 'ADD' | 'ADJUST') => {
    setSelectedVariant(variant);
    setModalType(type);
    setAmount(0);
    setNotes('');
  };

  const handleOpenLog = async (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setModalType('LOG');
    setVariantHistory([]);
    try {
      setIsVariantHistoryLoading(true);
      const res = await StockTransactionService.getHistoryByVariant(variant.id, 0, 50);
      setVariantHistory(res.content || []);
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch variant history', variant: 'destructive' });
    } finally {
      setIsVariantHistoryLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedVariant) return;
    setIsActionLoading(true);
    try {
      if (modalType === 'ADD') {
        await StockTransactionService.addStock({
          variantId: selectedVariant.id,
          quantity: amount,
          notes
        });
        toast({ title: 'Success', description: `Added ${amount} to ${selectedVariant.sku}` });
      } else if (modalType === 'ADJUST') {
        await StockTransactionService.adjustStock({
          variantId: selectedVariant.id,
          quantity: amount,
          notes
        });
        toast({ title: 'Success', description: `Adjusted ${selectedVariant.sku} to ${amount}` });
      }
      setModalType(null);
      fetchData();
      if (activeTab === 'history') fetchHistory();
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Action failed', variant: 'destructive' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const totalStock = product?.variants?.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) || 0;

  return {
    product,
    isLoading,
    summaries,
    history,
    isHistoryLoading,
    historyPage,
    setHistoryPage,
    historyTotalPages,
    activeTab,
    setActiveTab,
    selectedVariant,
    setSelectedVariant,
    modalType,
    setModalType,
    amount,
    setAmount,
    notes,
    setNotes,
    isActionLoading,
    variantHistory,
    isVariantHistoryLoading,
    handleOpenAction,
    handleOpenLog,
    handleAction,
    totalStock,
  };
}
