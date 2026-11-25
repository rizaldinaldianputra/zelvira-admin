'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Wallet,
  Zap,
  Key,
  ShieldCheck,
  ExternalLink,
  Layers,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useIntegrations } from '@/hooks/use-integrations';
import { useToast } from '@/hooks/use-toast';
import { formatRupiah } from '@/services/utils';

export default function DigiflazzIntegrationPage() {
  const { toast } = useToast();
  const {
    digiflazzBalance,
    isSyncing,
    checkDigiflazzBalance,
    handleSyncProducts,
  } = useIntegrations();

  const [username, setUsername] = useState('zelvira_official');
  const [apiKey, setApiKey] = useState('••••••••••••••••••••••••••••••••');

  const handleSaveApi = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Kredensial Disimpan',
      description: 'Pengaturan API Digiflazz berhasil diperbarui.',
    });
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
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                <Smartphone className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Digiflazz PPOB &amp; Digital Products
              </h1>
              <Badge variant="outline" className="border-blue-300 text-blue-600 bg-blue-50 text-[10px] font-bold">
                PPOB Gateway
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Penyedia layanan pulsa, paket data, token PLN, e-wallet, dan voucher game otomatis.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={checkDigiflazzBalance}
            variant="outline"
            className="rounded-xl border-slate-200 dark:border-white/10 text-xs font-bold gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Cek Saldo Real-Time
          </Button>

          <Button
            onClick={() => window.open('https://digiflazz.com/', '_blank')}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 shadow-sm shadow-blue-600/20"
          >
            Digiflazz Dashboard <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Saldo Deposit & Status Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="sm:col-span-2 p-6 rounded-3xl bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Saldo Deposit Digiflazz</span>
              <h3 className="text-3xl font-black font-mono mt-1">
                {digiflazzBalance !== null ? formatRupiah(digiflazzBalance) : 'Rp 0'}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-xs text-blue-100">
            Saldo deposit digunakan untuk pemrosesan instan transaksi pulsa dan token PLN pelanggan di web &amp; mobile app.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Status Koneksi API</span>
            <div className="flex items-center gap-2 pt-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Terhubung Aktif</span>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-white/5 text-xs text-slate-500">
            Endpoint: <code className="text-blue-600 font-mono">api.digiflazz.com/v1</code>
          </div>
        </div>
      </div>

      {/* Product Sync & Action Section */}
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
            <Database className="w-4 h-4 text-blue-600" /> Sinkronisasi Katalog Produk Digital
          </div>
          <Link href="/admin/products/digital">
            <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">
              Lihat Daftar Produk Digital &rarr;
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/20 space-y-3">
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Produk Prabayar (Prepaid)</h4>
              <p className="text-xs text-slate-400 mt-0.5">Pulsa reguler, paket kuota internet, token listrik PLN, voucher games.</p>
            </div>
            <Button
              onClick={() => handleSyncProducts('prepaid')}
              disabled={isSyncing !== null}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing === 'prepaid' ? 'animate-spin' : ''}`} />
              {isSyncing === 'prepaid' ? 'Sedang Sinkronisasi...' : 'Tarik Daftar Produk Prabayar'}
            </Button>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/20 space-y-3">
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Produk Pascabayar (Postpaid)</h4>
              <p className="text-xs text-slate-400 mt-0.5">Tagihan PLN bulanan, BPJS Kesehatan, PDAM, Indihome/Telkom.</p>
            </div>
            <Button
              onClick={() => handleSyncProducts('pasca')}
              disabled={isSyncing !== null}
              variant="outline"
              className="w-full rounded-xl border-slate-200 dark:border-white/10 font-bold text-xs gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing === 'pasca' ? 'animate-spin' : ''}`} />
              {isSyncing === 'pasca' ? 'Sedang Sinkronisasi...' : 'Tarik Daftar Produk Pascabayar'}
            </Button>
          </div>
        </div>
      </div>

      {/* API Credential Configuration */}
      <form onSubmit={handleSaveApi} className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/10 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
          <Key className="w-4 h-4 text-indigo-500" /> Kredensial Akun Digiflazz
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
              Username Digiflazz
            </Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-xl font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
              Production API Key
            </Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="rounded-xl font-mono"
            />
          </div>

          <div className="md:col-span-2 pt-2">
            <Button type="submit" className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6">
              Simpan Kredensial Digiflazz
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
