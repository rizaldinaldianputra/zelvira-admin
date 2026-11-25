'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Instagram,
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
  Copy,
  Check,
  Send,
  MessageCircle,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MarketplaceService } from '@/services/marketplace.service';
import { apiClient } from '@/services/api.client';

export default function InstagramIntegrationPage() {
  const { toast } = useToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shops, setShops] = useState<any[]>([]);
  const [manualToken, setManualToken] = useState('');

  // Values aligned with Meta Developer Configuration
  const appId = '1178932708147074';
  const configId = '1482133923808500';
  const defaultAccountId = '17841415885981301';
  const defaultUsername = 'zelviraofficialstore';
  const redirectUri = 'https://api.zelvira.my.id/api/v1/callbacks/instagram/oauth';
  const webhookCallbackUrl = 'https://api.zelvira.my.id/api/v1/callbacks/instagram/webhook';
  const webhookVerifyToken = 'zelvira_ig_verify_token_2026';

  const fetchShops = async () => {
    setIsLoading(true);
    try {
      const data = await MarketplaceService.getAuthorizedShops('instagram');
      setShops(data || []);
    } catch (err: any) {
      console.error('Failed to load instagram config', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast({
      title: 'Disalin!',
      description: `${key} berhasil disalin ke clipboard.`,
    });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleConnectOAuth = async () => {
    try {
      const res = await MarketplaceService.getAuthUrl('instagram');
      if (res?.url) {
        window.location.href = res.url;
      } else {
        toast({
          title: 'Gagal Membuka Otorisasi',
          description: 'URL otorisasi Instagram tidak ditemukan.',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Gagal memuat URL otorisasi',
        variant: 'destructive',
      });
    }
  };

  const handleSaveManualToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) {
      toast({
        title: 'Token Kosong',
        description: 'Silakan tempel Access Token yang Anda buat di Meta Developer.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/v1/callbacks/instagram/manual-token', {
        accessToken: manualToken.trim(),
        accountId: defaultAccountId,
        accountUsername: defaultUsername,
      });

      toast({
        title: 'Berhasil!',
        description: `Token untuk @${defaultUsername} berhasil disimpan.`,
      });
      setManualToken('');
      fetchShops();
    } catch (err: any) {
      toast({
        title: 'Gagal Menyimpan Token',
        description: err.message || 'Terjadi kesalahan saat menyimpan token',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisconnect = async (shopId: string) => {
    try {
      await MarketplaceService.disconnectShop('instagram', shopId);
      toast({
        title: 'Koneksi Diputuskan',
        description: 'Akun Instagram berhasil diputuskan.',
      });
      fetchShops();
    } catch (err: any) {
      toast({
        title: 'Gagal Memutuskan Koneksi',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const activeShop = shops.find((s) => s.isActive && s.hasToken);

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
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
                <Instagram className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Instagram API & Webhook
              </h1>
              <Badge variant="outline" className="border-pink-300 text-pink-600 bg-pink-50 text-[10px] font-bold">
                Unified Login
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Konfigurasi Callback OAuth, Webhook, dan token Meta Graph API untuk akun Instagram Bisnis Anda.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={fetchShops}
            disabled={isLoading}
            variant="outline"
            className="rounded-xl border-slate-200 dark:border-white/10 text-xs font-bold gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Perbarui
          </Button>

          <Button
            onClick={() => window.open('https://developers.facebook.com/apps/1178932708147074/', '_blank')}
            className="rounded-xl bg-linear-to-r from-purple-600 via-pink-600 to-rose-600 hover:opacity-95 text-white font-bold text-xs gap-1.5 shadow-sm"
          >
            Meta Developer Portal <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Account Status Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${activeShop
          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
          : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
        }`}>
        <div className="flex items-center gap-3">
          {activeShop ? (
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <AlertCircle className="w-6 h-6" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm uppercase tracking-wide">
                {activeShop ? 'Terhubung dengan Instagram' : 'Belum Terhubung'}
              </span>
              <Badge className={activeShop ? 'bg-emerald-600' : 'bg-amber-600'}>
                @{defaultUsername}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              ID Akun Instagram: <span className="font-mono font-bold">{defaultAccountId}</span>
              {activeShop?.tokenExpiry && (
                <span> • Masa Aktif Token: {new Date(activeShop.tokenExpiry).toLocaleDateString('id-ID')}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeShop ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDisconnect(activeShop.shopId)}
              className="rounded-xl text-xs font-bold"
            >
              Putuskan Koneksi
            </Button>
          ) : (
            <Button
              onClick={handleConnectOAuth}
              className="rounded-xl bg-linear-to-r from-purple-600 to-pink-600 text-white text-xs font-bold shadow-md gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" /> Login dengan Instagram
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1 & 3: Configuration to copy into Meta Portal */}
        <Card className="border-slate-200 dark:border-white/10 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-600">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Data untuk Meta for Developers</CardTitle>
                <CardDescription className="text-xs">
                  Salin nilai di bawah ini ke form dashboard Meta Developers Anda
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 1. URL Pengalihan (Redirect URI) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  1. URL Pengalihan (Redirect URI)
                </Label>
                <span className="text-[10px] text-slate-400">Langkah 1 di Meta</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={redirectUri}
                  className="font-mono text-xs bg-slate-50 dark:bg-slate-900"
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => copyToClipboard(redirectUri, 'URL Pengalihan')}
                >
                  {copiedKey === 'URL Pengalihan' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* 3. URL Callback Webhook */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  3. URL Callback Webhook
                </Label>
                <span className="text-[10px] text-slate-400">Langkah 3 di Meta</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={webhookCallbackUrl}
                  className="font-mono text-xs bg-slate-50 dark:bg-slate-900"
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => copyToClipboard(webhookCallbackUrl, 'URL Callback')}
                >
                  {copiedKey === 'URL Callback' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* 3b. Verify Token */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  3b. Verifikasi Token (Verify Token)
                </Label>
                <span className="text-[10px] text-slate-400">Token verifikasi rahasia</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={webhookVerifyToken}
                  className="font-mono text-xs bg-slate-50 dark:bg-slate-900 font-bold text-purple-600"
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => copyToClipboard(webhookVerifyToken, 'Verifikasi Token')}
                >
                  {copiedKey === 'Verifikasi Token' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* App Credentials Info */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-white/5 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">ID Konfigurasi:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{configId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">App ID:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{appId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Akun Instagram:</span>
                <span className="font-bold text-pink-600">@{defaultUsername}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Manual Token Form (If user clicked "Buat Token" in Meta) */}
        <Card className="border-slate-200 dark:border-white/10 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Input Token Manual (Langkah 2)</CardTitle>
                <CardDescription className="text-xs">
                  Jika Anda menekan tombol <strong>[Buat token]</strong> di portal Meta, tempel token di sini
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveManualToken} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Instagram Access Token
                </Label>
                <textarea
                  rows={4}
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="EAAQ... (Tempel Access Token dari Meta di sini)"
                  className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Target: <strong>@{defaultUsername}</strong> ({defaultAccountId})</span>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !manualToken.trim()}
                className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> Menyimpan...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-1.5" /> Simpan Token Instagram
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Feature Capabilities */}
      <Card className="border-slate-200 dark:border-white/10">
        <CardHeader>
          <CardTitle className="text-base font-bold">Fitur Instagram yang Siap Dipakai</CardTitle>
          <CardDescription className="text-xs">
            Setelah webhook dan token terverifikasi, backend Zelvira siap menangani event berikut
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500 shrink-0">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Feed & Reel Publishing</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Posting foto dan konten promosi katalog Zelvira secara otomatis.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Direct Messages (DM)</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Menerima pesan DM pelanggan ke Webhook backend untuk integrasi chat.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Komentar & Moderasi</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Menangkap event komentar masuk di setiap postingan @{defaultUsername}.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

