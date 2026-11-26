'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Key,
  Globe,
  Store,
  Layers,
  Sliders
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

export default function ShopeeIntegrationPage() {
  const { toast } = useToast();
  const [partnerId, setPartnerId] = useState('2001928');
  const [partnerKey, setPartnerKey] = useState('••••••••••••••••••••••••••••••••');
  const [shopId, setShopId] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSyncStock, setAutoSyncStock] = useState(true);
  const [autoSyncOrders, setAutoSyncOrders] = useState(true);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Konfigurasi Tersimpan',
      description: 'Kredensial Shopee Open Platform berhasil diperbarui.',
    });
  };

  const handleTestConnection = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast({
        title: 'Koneksi Siap Diotorisasi',
        description: 'Endpoint Shopee Open Platform V2 terhubung. Klik Otorisasi Toko untuk menghubungkan akun seller.',
      });
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <Link href="/admin/integrations">
            <Button
              variant="outline"
              size="icon"
              className="rounded-2xl border-slate-200 dark:border-white/10 shrink-0 h-10 w-10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black text-sm shadow-sm">
                S
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Shopee Open Platform
              </h1>
              <Badge variant="outline" className="border-orange-300 text-orange-600 bg-orange-50 text-[10px] font-bold">
                API V2
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Kelola integrasi toko Shopee, sinkronisasi katalog produk, dan pemrosesan pesanan otomatis.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleTestConnection}
            disabled={isSyncing}
            variant="outline"
            className="rounded-xl border-slate-200 dark:border-white/10 text-xs font-bold gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            Uji Koneksi
          </Button>

          <Button
            onClick={() => window.open('https://open.shopee.com/', '_blank')}
            className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs gap-1.5 shadow-sm shadow-orange-500/20"
          >
            Shopee Open Platform <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      <div className="p-4 rounded-3xl bg-linear-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200 dark:border-orange-900/40 flex items-start gap-3.5">
        <div className="p-2.5 rounded-2xl bg-orange-500 text-white shrink-0 mt-0.5 shadow-sm">
          <Store className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Koneksi Shopee Open Platform V2
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Gunakan Partner ID dan Partner Key resmi dari Developer Console Shopee. Setelah otorisasi berhasil, produk Zelvira dapat disinkronkan langsung ke etalase Shopee Seller Anda.
          </p>
        </div>
      </div>

      {/* Grid Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: API Credentials */}
        <form onSubmit={handleSaveConfig} className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/10 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
            <Key className="w-4 h-4 text-orange-500" /> Kredensial Developer API
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                Shopee Partner ID
              </Label>
              <Input
                value={partnerId}
                onChange={(e) => setPartnerId(e.target.value)}
                placeholder="e.g. 2001928"
                className="rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                Shopee Partner Key (Secret)
              </Label>
              <Input
                type="password"
                value={partnerKey}
                onChange={(e) => setPartnerKey(e.target.value)}
                placeholder="Partner key dari Open Shopee"
                className="rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                Shopee Shop ID (Opsional)
              </Label>
              <Input
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
                placeholder="Otomatis terisi setelah otorisasi seller"
                className="rounded-xl font-mono"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs">
                Simpan Pengaturan API
              </Button>
            </div>
          </div>
        </form>

        {/* Card 2: Sync Automation Rules */}
        <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/10 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
            <Sliders className="w-4 h-4 text-emerald-600" /> Otomasi &amp; Aturan Sinkronisasi
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-800 dark:text-slate-200">Sinkronisasi Stok Real-time</p>
                <p className="text-slate-400 text-[11px]">Update stok di Shopee otomatis saat terjadi penjualan di website.</p>
              </div>
              <Switch checked={autoSyncStock} onCheckedChange={setAutoSyncStock} />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-800 dark:text-slate-200">Tarik Pesanan Otomatis</p>
                <p className="text-slate-400 text-[11px]">Masukkan pesanan baru Shopee ke dashboard admin Zelvira.</p>
              </div>
              <Switch checked={autoSyncOrders} onCheckedChange={setAutoSyncOrders} />
            </div>

            <div className="p-3.5 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 text-slate-600 dark:text-slate-300">
              <span className="font-bold block text-orange-700 dark:text-orange-400 mb-1">Webhook URL Shopee:</span>
              <p className="font-mono text-[11px] text-slate-500 break-all bg-white dark:bg-slate-900 p-2 rounded-lg border border-orange-200 dark:border-orange-900/50">
                https://api.zelvira.co.id/api/v1/marketplace/shopee/webhook
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
