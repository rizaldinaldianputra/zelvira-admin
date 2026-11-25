'use client';

import { use } from 'react';
import {
  Package,
  ArrowLeft,
  History,
  PlusCircle,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { formatImageUrl } from '@/lib/url-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useStockDetail } from '@/hooks/use-stock-detail';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductStockDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const productId = parseInt(resolvedParams.id);

  const {
    product,
    isLoading,
    summaries,
    history,
    historyPage,
    setHistoryPage,
    historyTotalPages,
    activeTab,
    setActiveTab,
    selectedVariant,
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
  } = useStockDetail(productId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Product not found.</p>
        <Link href="/admin/stock">
          <Button variant="link" className="text-pink-500 mt-2">Back to Inventory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/stock">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl border border-slate-200 dark:border-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner flex-shrink-0">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{product.name}</h1>
            <p className="text-slate-500 text-sm mt-0.5">{product.category?.name || 'Katalog'} • Total Stok: {totalStock} unit</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={activeTab === 'variants' ? 'default' : 'outline'}
            onClick={() => setActiveTab('variants')}
            className="rounded-2xl font-bold"
          >
            Variants
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'outline'}
            onClick={() => setActiveTab('history')}
            className="rounded-2xl font-bold"
          >
            History Log
          </Button>
        </div>
      </div>

      {activeTab === 'variants' ? (
        <div className="flex flex-col gap-4">
          {product.variants?.map((v) => (
            <div key={v.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center text-pink-500">
                  <Package size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white uppercase text-lg">{v.sku}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Size: {v.size} • Color: {v.color}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center md:text-right">
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">Current Stock</p>
                  <Badge variant="outline" className="text-lg font-bold font-mono px-3 py-1 bg-slate-50 dark:bg-slate-800 dark:border-white/10 dark:text-white">
                    {v.stock || 0}
                  </Badge>
                </div>

                <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 hidden md:block"></div>

                <div className="flex gap-2 w-full md:w-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenAction(v, 'ADD')}
                    className="flex-1 md:flex-none rounded-xl gap-2 font-semibold hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-600 hover:border-pink-200 dark:border-white/10"
                  >
                    <PlusCircle size={16} /> Add
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenAction(v, 'ADJUST')}
                    className="flex-1 md:flex-none rounded-xl gap-2 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 hover:border-blue-200 dark:border-white/10"
                  >
                    <ArrowRightLeft size={16} /> Adjust
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenLog(v)}
                    className="rounded-xl px-3 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="History Log"
                  >
                    <History size={18} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/10 p-6 space-y-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Product Transaction Log</h3>
          <div className="divide-y divide-slate-100">
            {history.map((tx) => (
              <div key={tx.id} className="py-3 flex justify-between items-center text-sm">
                <div>
                  <p className="font-bold">{tx.type} ({tx.quantityChange > 0 ? `+${tx.quantityChange}` : tx.quantityChange})</p>
                  <p className="text-xs text-slate-400">{new Date(tx.createdAt).toLocaleString()} • {tx.notes || 'No notes'}</p>
                </div>
                <span className="font-mono font-bold text-slate-700">Balance: {tx.finalStock}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={!!modalType} onOpenChange={() => setModalType(null)}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle>
              {modalType === 'ADD' ? 'Add Stock' : modalType === 'ADJUST' ? 'Adjust Stock' : 'Variant History'}
            </DialogTitle>
            <DialogDescription>{selectedVariant?.sku}</DialogDescription>
          </DialogHeader>

          {modalType !== 'LOG' ? (
            <div className="space-y-4 py-4">
              <div>
                <Label>{modalType === 'ADD' ? 'Quantity to Add' : 'New Exact Stock Total'}</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="rounded-2xl mt-1"
                />
              </div>
              <div>
                <Label>Audit Notes</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reason for stock movement..."
                  className="rounded-2xl mt-1"
                />
              </div>
              <DialogFooter>
                <Button onClick={handleAction} disabled={isActionLoading} className="w-full rounded-2xl bg-pink-500 font-bold">
                  Submit
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 py-4">
              {variantHistory.map((h) => (
                <div key={h.id} className="text-xs border-b pb-2 flex justify-between">
                  <span>{new Date(h.createdAt).toLocaleDateString()} - {h.type}</span>
                  <span className="font-bold font-mono">{h.quantityChange} (Bal: {h.finalStock})</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
