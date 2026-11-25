'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw, CheckCircle2, AlertCircle, ArrowLeft, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketplaceService } from '@/services/marketplace.service';
import { toast } from 'sonner';
import Link from 'next/link';

function TikTokCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const shopId = searchParams.get('shop_id') || searchParams.get('shopId');

    if (!code) {
      setStatus('error');
      setErrorMessage('Authorization code tidak ditemukan di URL callback TikTok.');
      return;
    }

    const processAuth = async () => {
      try {
        const res = await MarketplaceService.processCallback('tiktok', code, shopId || undefined);
        setStatus('success');
        toast.success(res?.message || 'Toko TikTok Shop berhasil dihubungkan!');
        setTimeout(() => {
          router.push('/admin/integrations/tiktok');
        }, 1500);
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message || 'Gagal memproses otorisasi toko TikTok');
        toast.error('Gagal menghubungkan toko TikTok');
      }
    };

    processAuth();
  }, [searchParams, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center mx-auto shadow-md">
          <Store className="w-8 h-8 text-pink-500" />
        </div>

        {status === 'processing' && (
          <div className="space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-pink-500 mx-auto" />
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              Menghubungkan Toko TikTok...
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sedang memverifikasi kode otorisasi dan mengambil data Toko Saya dari TikTok Shop Partner Center.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              Otorisasi Berhasil!
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Toko TikTok Shop Anda telah terhubung. Mengalihkan ke halaman manajemen toko...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight text-rose-600">
              Koneksi Gagal
            </h2>
            <p className="text-xs text-slate-600 bg-rose-50 p-3 rounded-xl border border-rose-100 font-mono">
              {errorMessage}
            </p>
            <Link href="/admin/integrations/tiktok">
              <Button className="w-full rounded-xl bg-black text-white font-bold text-xs uppercase tracking-wider">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Kembali ke Manajemen TikTok
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TikTokCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-pink-500" />
      </div>
    }>
      <TikTokCallbackContent />
    </Suspense>
  );
}
