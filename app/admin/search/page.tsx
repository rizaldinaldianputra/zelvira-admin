'use client';

import { Search, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSearchAnalytics } from '@/hooks/use-search-analytics';

export default function SearchAnalyticsPage() {
  const { trending } = useSearchAnalytics();

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
             <Search className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Search Trends & Insights</h1>
            <p className="text-slate-500 text-sm mt-0.5">Analisis kata kunci pencarian populer dan produk yang diminati pelanggan secara real-time.</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-100/50 p-8">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-pink-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Trending Keywords</h3>
            </div>
            <Badge variant="outline" className="rounded-full px-3 py-1 text-[10px] uppercase font-black bg-slate-50 border-slate-200">Last 7 Days</Badge>
        </div>

        <div className="space-y-4">
           {trending.length === 0 ? (
             <div className="p-8 text-center text-xs text-slate-400">
               Belum ada data riwayat pencarian produk.
             </div>
           ) : (
             trending.map((item, index) => (
               <div key={item.id} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                 <div className="flex items-center gap-6">
                   <span className="text-2xl font-black text-slate-200 group-hover:text-pink-500 transition-colors w-8">#{index + 1}</span>
                   <div className="flex flex-col">
                     <span className="text-md font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight transition-all group-hover:translate-x-1">{item.keyword}</span>
                     <span className="text-xs text-slate-400 font-bold">{item.count.toLocaleString()} unique searches</span>
                   </div>
                 </div>
                 <div className="flex items-center gap-4">
                    {item.trend === 'up' && <Badge className="bg-emerald-500/10 text-emerald-600 border-none rounded-full h-8 w-8 p-0 flex items-center justify-center shadow-none"><TrendingUp className="h-4 w-4" /></Badge>}
                 </div>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
}
