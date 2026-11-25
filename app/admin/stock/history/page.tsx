'use client';

import { Suspense } from 'react';
import { History, Search, ArrowLeft, Calendar, User, Tag, FileText, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useStockHistory } from '@/hooks/use-stock-history';

function StockHistoryContent() {
  const {
    history,
    isLoading,
    totalElements,
    totalPages,
    page,
    query,
    handleSearch,
    setPage,
  } = useStockHistory();

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/stock">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl border border-slate-200 dark:border-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner flex-shrink-0">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Stock Transaction Logs</h1>
            <p className="text-slate-500 text-sm mt-0.5">Audit trail seluruh riwayat mutasi stok, penambahan, dan penyesuaian inventaris.</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              name="query"
              defaultValue={query}
              placeholder="Search by SKU or Product..." 
              className="pl-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-pink-500"
            />
          </div>
          <Button type="submit" className="h-12 px-6 rounded-2xl bg-pink-500 text-white hover:bg-pink-600 font-bold shadow-lg shadow-pink-500/20">
            Search
          </Button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-400">Date & Time</th>
                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-400">SKU / Product</th>
                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-400">Type</th>
                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-400">Change</th>
                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-400">Balance</th>
                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-400">Notes & Operator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">No stock movement recorded yet.</td>
                    </tr>
                  ) : (
                    history.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.01] transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium text-xs">
                            <Calendar size={14} className="text-slate-400" />
                            {new Date(tx.createdAt).toLocaleString()}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{tx.variant?.product?.name || 'Product'}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Tag size={12} className="text-pink-500" />
                              <span className="text-xs font-mono font-semibold text-slate-500">{tx.variant?.sku}</span>
                              <span className="text-xs text-slate-400">• {tx.variant?.size || '-'} / {tx.variant?.color || '-'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant="outline" className="font-black text-[10px] tracking-wider uppercase rounded-lg px-2.5 py-1">
                            {tx.type}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`font-black flex items-center gap-1 ${tx.quantityChange > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {tx.quantityChange > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {tx.quantityChange > 0 ? `+${tx.quantityChange}` : tx.quantityChange}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-700 dark:text-slate-300">
                          {tx.finalStock}
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            {tx.notes && <div className="flex items-center gap-1 italic mb-0.5"><FileText size={12} /> {tx.notes}</div>}
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                              <User size={10} /> Operator ID: {tx.operatorId || 'System'}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between px-4">
            <span className="text-xs text-slate-500 font-medium">Total {totalElements} movements logged</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page <= 0}
                className="h-9 rounded-xl border-slate-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs font-bold text-slate-600">Page {page + 1} of {Math.max(totalPages, 1)}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="h-9 rounded-xl border-slate-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StockHistoryPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading history...</div>}>
      <StockHistoryContent />
    </Suspense>
  );
}
