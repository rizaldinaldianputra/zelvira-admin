'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { useReviews } from '@/hooks/use-reviews';
import { Star } from 'lucide-react';

export default function ReviewsPage() {
  const {
    reviews,
    isLoading,
    columns,
    handleToggleStatus,
  } = useReviews();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Product Reviews</h1>
            <p className="text-slate-500 text-sm mt-0.5">Moderasi ulasan pembeli, penilaian rating produk, dan feedback kepuasan pelanggan.</p>
          </div>
        </div>
      </div>

      <CrudTable
        data={reviews}
        columns={columns}
        searchKey="reviews"
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
      />
    </div>
  );
}
