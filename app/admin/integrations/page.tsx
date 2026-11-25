'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, CheckCircle2, AlertCircle, RefreshCw, Wallet, Store, ShoppingBag, ArrowRight, Instagram } from 'lucide-react';
import { useIntegrations } from '@/hooks/use-integrations';
import { MarketplaceService } from '@/services/marketplace.service';
import { TikTokShop } from '@/types/marketplace';

export default function IntegrationsPage() {
  const {
    digiflazzBalance,
    isSyncing,
    checkDigiflazzBalance,
    handleSyncProducts,
  } = useIntegrations();

  const [tiktokShops, setTiktokShops] = useState<TikTokShop[]>([]);
  const [isLoadingTiktok, setIsLoadingTiktok] = useState(true);
  const [instagramShops, setInstagramShops] = useState<any[]>([]);
  const [isLoadingIg, setIsLoadingIg] = useState(true);

  useEffect(() => {
    MarketplaceService.getAuthorizedShops('tiktok')
      .then((data) => setTiktokShops(data || []))
      .catch(() => setTiktokShops([]))
      .finally(() => setIsLoadingTiktok(false));

    MarketplaceService.getAuthorizedShops('instagram')
      .then((data) => setInstagramShops(data || []))
      .catch(() => setInstagramShops([]))
      .finally(() => setIsLoadingIg(false));
  }, []);

  const hasTiktokConnected = tiktokShops.length > 0;
  const hasIgConnected = instagramShops.some((s) => s.isActive && s.hasToken);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Marketplace & Service Integrations</h1>
            <p className="text-slate-500 text-sm mt-0.5">Kelola sinkronisasi toko ke marketplace eksternal (TikTok Shop) dan supplier produk digital.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* TikTok Shop Integration Card */}
        <Card className="border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-pink-300 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-pink-500 via-rose-500 to-black" />
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="bg-black text-white p-3 rounded-2xl shadow-sm">
                <Store className="h-6 w-6 text-pink-500" />
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                {isLoadingTiktok ? (
                  <RefreshCw className="h-3 w-3 animate-spin text-pink-500" />
                ) : hasTiktokConnected ? (
                  <span className="text-emerald-600 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="h-3 w-3" /> {tiktokShops.length} Toko Terhubung
                  </span>
                ) : (
                  <span className="text-amber-600 flex items-center gap-1 font-bold">
                    <AlertCircle className="h-3 w-3" /> Belum Terhubung
                  </span>
                )}
              </div>
            </div>
            <CardTitle>TikTok Shop</CardTitle>
            <CardDescription>
              Otorisasi API Partner, kelola Toko Saya, dan sinkronisasi produk langsung ke TikTok Shop.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg flex items-center justify-between border border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-500 font-medium">Toko Aktif:</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">
                {hasTiktokConnected ? tiktokShops[0].shopName : 'Koneksi Siap Diotorisasi'}
              </span>
            </div>

            <Link href="/admin/integrations/tiktok" className="block">
              <Button className="w-full rounded-xl bg-black hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider">
                Kelola Toko TikTok <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-pink-500" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Instagram Integration Card */}
        <Card className="border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-purple-300 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-amber-500 via-pink-500 to-purple-600" />
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white p-3 rounded-2xl shadow-sm">
                <Instagram className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                {isLoadingIg ? (
                  <RefreshCw className="h-3 w-3 animate-spin text-purple-500" />
                ) : hasIgConnected ? (
                  <span className="text-emerald-600 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="h-3 w-3" /> Terhubung
                  </span>
                ) : (
                  <span className="text-amber-600 flex items-center gap-1 font-bold">
                    <AlertCircle className="h-3 w-3" /> Siap Dikonfigurasi
                  </span>
                )}
              </div>
            </div>
            <CardTitle>Instagram API & Webhook</CardTitle>
            <CardDescription>
              Otorisasi Unified Login, Webhook event (DM & komentar), serta penerbitan konten feed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg flex items-center justify-between border border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-500 font-medium">Akun:</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">
                @zelviraofficialstore
              </span>
            </div>

            <Link href="/admin/integrations/instagram" className="block">
              <Button className="w-full rounded-xl bg-linear-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider">
                Kelola Instagram API <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Digiflazz Card */}
        <Card className="border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="bg-blue-600 text-white p-3 rounded-2xl">
                <Smartphone className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500">
                {digiflazzBalance !== null ? (
                  <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Connected</span>
                ) : (
                  <><AlertCircle className="h-3 w-3" /> Verify Connection</>
                )}
              </div>
            </div>
            <CardTitle>Digiflazz PPOB</CardTitle>
            <CardDescription>Jual pulsa, paket data, dan token PLN secara otomatis.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg flex items-center justify-between border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Saldo Deposit</span>
              </div>
              <span className="font-bold text-blue-600">
                {digiflazzBalance !== null ? `Rp ${digiflazzBalance.toLocaleString()}` : '???'}
              </span>
            </div>

            <div className="flex gap-2">
              <Button onClick={checkDigiflazzBalance} variant="outline" size="sm" className="flex-1 rounded-xl">
                Check Balance
              </Button>
              <Button onClick={() => handleSyncProducts('prepaid')} disabled={isSyncing !== null} size="sm" className="flex-1 rounded-xl bg-blue-600">
                <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isSyncing === 'prepaid' ? 'animate-spin' : ''}`} /> Sync Products
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Shopee Integration Card */}
        <Card className="border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group opacity-80">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="bg-orange-500 text-white p-3 rounded-2xl">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500">
                Standby
              </div>
            </div>
            <CardTitle>Shopee Open Platform</CardTitle>
            <CardDescription>Sinkronisasi katalog dan manajemen pesanan Shopee.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg flex items-center justify-between border border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-500">Status:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">Siap Dikonfigurasi</span>
            </div>

            <Button variant="outline" disabled size="sm" className="w-full rounded-xl text-xs">
              Segera Hadir
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
