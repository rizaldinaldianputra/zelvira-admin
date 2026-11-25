import React from 'react';

export default function AdminLoading() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-4 w-72 bg-slate-100 dark:bg-slate-800/60 rounded" />
        </div>
        <div className="h-9 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-slate-900/60 p-5 space-y-3 shadow-xs"
          >
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            </div>
            <div className="h-7 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-slate-900/60 p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-white/5">
          <div className="h-5 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-8 w-44 bg-slate-100 dark:bg-slate-800 rounded-lg" />
        </div>
        
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="flex items-center gap-4 py-2">
              <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
              </div>
              <div className="h-6 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" />
              <div className="h-8 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
