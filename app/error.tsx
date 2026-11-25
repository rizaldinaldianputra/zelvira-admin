'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AlertCircle, RefreshCw, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled Admin Error:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md mx-auto w-full flex flex-col items-center">
        {/* Logo */}
        <Link href="/admin" className="inline-block mb-8 transition-transform hover:scale-105">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
            <Image
              src="/logo.png"
              alt="Zelvira Admin"
              width={160}
              height={50}
              className="h-9 w-auto object-contain"
              priority
            />
          </div>
        </Link>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-widest mb-4">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Error 500 • Gangguan Panel Admin</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-3 text-slate-900 dark:text-white">
          Terjadi Kesalahan Sistem
        </h1>

        {/* Description */}
        <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto mb-8 leading-relaxed">
          Panel admin mengalami kendala saat merender komponen ini. Silakan coba muat ulang atau kembali ke dashboard.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <Button
            onClick={() => reset()}
            className="rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs uppercase tracking-wider h-11 px-6 shadow-md shadow-pink-500/20 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Coba Lagi</span>
          </Button>
          <Link href="/admin">
            <Button variant="outline" className="rounded-2xl border-slate-200 dark:border-white/10 text-xs font-bold h-11 px-5 flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Button>
          </Link>
        </div>

        {error.digest && (
          <p className="text-[11px] font-mono text-slate-400 mt-6 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-md">
            Digest: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}

