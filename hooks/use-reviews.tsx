'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ReviewService } from '@/services/review.service';
import { Review } from '@/types/review';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const isMounted = useRef(false);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await ReviewService.getAll();
      setReviews(res.content || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch reviews', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted.current) return;
    fetchReviews();
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const handleToggleStatus = async (review: Review) => {
    try {
      await ReviewService.updateStatus(review.id, !review.isActive);
      toast({ title: 'Success', description: `Review ${!review.isActive ? 'approved' : 'hidden'}` });
      fetchReviews();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update review status', variant: 'destructive' });
    }
  };

  const columns: ColumnDef<Review>[] = [
    {
      header: 'Product',
      accessorKey: 'productName',
      cell: ({ row }) => (
        <span className="font-bold text-slate-900 dark:text-slate-100">{row.original.productName || `ID: ${row.original.productId}`}</span>
      ),
    },
    {
      header: 'User',
      accessorKey: 'userName',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-700">{row.original.userName || 'Anonymous'}</span>
          <span className="text-xs text-slate-500">ID: {row.original.userId}</span>
        </div>
      ),
    },
    {
      header: 'Rating',
      accessorKey: 'rating',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < row.original.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}
            />
          ))}
        </div>
      ),
    },
    {
      header: 'Comment',
      accessorKey: 'comment',
      cell: ({ row }) => (
        <p className="max-w-[300px] truncate text-sm text-slate-600 italic">"{row.original.comment}"</p>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'success' : 'secondary'} className="rounded-full uppercase text-[10px] px-3 font-bold tracking-widest">
          {row.original.isActive ? 'Public' : 'Hidden'}
        </Badge>
      ),
    },
    {
      header: 'Date',
      accessorKey: 'createdAt',
      cell: ({ row }) => (
        <span className="text-slate-500 text-xs">
          {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : '-'}
        </span>
      ),
    },
  ];

  return {
    reviews,
    isLoading,
    columns,
    handleToggleStatus,
    fetchReviews,
  };
}
