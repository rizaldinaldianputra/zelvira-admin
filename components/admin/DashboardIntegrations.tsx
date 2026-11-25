'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  ShoppingBag,
  Share2,
  Instagram,
  Smartphone,
  CreditCard,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Globe,
  Radio,
  Sliders,
  Settings,
  Youtube,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MarketplaceService } from '@/services/marketplace.service';
import { socialService } from '@/services/social.service';
import { SocialAccount } from '@/types/social';

export function DashboardIntegrations() {
  const [tiktokConnected, setTiktokConnected] = useState<boolean>(false);
  const [tiktokShopName, setTiktokShopName] = useState<string>('');
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchStatus = () => {
    setIsLoading(true);
    Promise.allSettled([
      MarketplaceService.getAuthorizedShops('tiktok'),
      socialService.getAccounts(),
    ]).then(([tiktokRes, socialRes]) => {
      if (tiktokRes.status === 'fulfilled' && tiktokRes.value?.length > 0) {
        setTiktokConnected(true);
        setTiktokShopName(tiktokRes.value[0].shopName || 'Toko TikTok Terhubung');
      } else {
        setTiktokConnected(false);
      }

      if (socialRes.status === 'fulfilled') {
        setSocialAccounts(socialRes.value || []);
      }
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const getSocial = (platformKey: string) => {
    return socialAccounts.find(
      (a) => a.platform?.toUpperCase() === platformKey.toUpperCase()
    );
  };

  const isSocialConnected = (platformKey: string) => {
    const acc = getSocial(platformKey);
    return Boolean(acc && acc.isActive && acc.hasToken);
  };

  const igAccount = getSocial('INSTAGRAM');
  const ttAccount = getSocial('TIKTOK');
  const liAccount = getSocial('LINKEDIN');
  const ytAccount = getSocial('YOUTUBE');
  const fbAccount = getSocial('FACEBOOK');
  const xAccount = getSocial('X');

  const socialPlatforms = [
    {
      id: 'instagram',
      name: 'Instagram Graph API',
      handle: igAccount?.accountName || '@zelviraofficialstore',
      icon: Instagram,
      iconClass: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white',
      connected: isSocialConnected('INSTAGRAM'),
    },
    {
      id: 'tiktok',
      name: 'TikTok Creator API',
      handle: ttAccount?.accountName || '@zelvira',
      icon: Radio,
      iconClass: 'bg-black text-cyan-400',
      connected: isSocialConnected('TIKTOK'),
    },
    {
      id: 'linkedin',
      name: 'LinkedIn Business',
      handle: liAccount?.accountName || 'Zelvira Official',
      icon: Share2,
      iconClass: 'bg-[#0077b5] text-white',
      connected: isSocialConnected('LINKEDIN'),
    },
    {
      id: 'youtube',
      name: 'YouTube Shorts & Video',
      handle: ytAccount?.accountName || 'Zelvira Official',
      icon: Youtube,
      iconClass: 'bg-[#ff0000] text-white',
      connected: isSocialConnected('YOUTUBE'),
    },
  ];

  const connectedSocialCount = [
    isSocialConnected('INSTAGRAM'),
    isSocialConnected('TIKTOK'),
    isSocialConnected('LINKEDIN'),
    isSocialConnected('YOUTUBE'),
    isSocialConnected('FACEBOOK'),
    isSocialConnected('X'),
  ].filter(Boolean).length;

  return (
    <div className="rounded-3xl border border-white/40 bg-white/70 p-6 md:p-8 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-black/40 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200/60 dark:border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-linear-to-tr from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
            <Sliders className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                Integrasi & Channel Terhubung
              </h3>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold">
                {connectedSocialCount + (tiktokConnected ? 1 : 0) + 3} Layanan Aktif
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Status terpusat Marketplace, Social Media Omnichannel, dan Sistem Gateway Zelvira.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchStatus}
            disabled={isLoading}
            className="rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold gap-1.5 h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Periksa Status
          </Button>
          <Link href="/admin/settings">
            <Button
              size="sm"
              className="rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 font-bold text-xs gap-1.5 h-9"
            >
              <span>System Settings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 3 Grouped Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GROUP 1: SHOP & MARKETPLACE */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 p-5 shadow-xs flex flex-col justify-between hover:border-pink-300 dark:hover:border-pink-800 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-orange-500 via-rose-500 to-pink-500" />

          <div>
            {/* Group Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-linear-to-tr from-orange-500 to-pink-500 text-white shadow-xs">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-tight">
                    Shop & Marketplace
                  </h4>
                  <p className="text-[11px] text-slate-400">Sinkronisasi Katalog & Stok</p>
                </div>
              </div>
              <Badge className="text-[10px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20">
                {tiktokConnected ? '1/2 Terhubung' : 'Siap Otorisasi'}
              </Badge>
            </div>

            {/* Services List */}
            <div className="py-4 space-y-3">
              {/* Shopee */}
              <Link
                href="/admin/integrations/shopee"
                className="group/item flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 border border-slate-100 dark:border-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-orange-500 text-white shadow-xs">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block group-hover/item:text-orange-600 transition-colors">
                      Shopee Open Platform
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Shopee Indonesia Partner API</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200">
                  Siap Konfigurasi
                </Badge>
              </Link>

              {/* TikTok Shop */}
              <Link
                href="/admin/integrations/tiktok"
                className="group/item flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-pink-50/50 dark:hover:bg-pink-950/20 border border-slate-100 dark:border-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-black text-pink-500 shadow-xs">
                    <Store className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block group-hover/item:text-pink-600 transition-colors">
                      TikTok Shop Seller API
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium truncate max-w-32.5 block">
                      {tiktokConnected ? tiktokShopName : 'Partner Open API Toko'}
                    </span>
                  </div>
                </div>
                {tiktokConnected ? (
                  <Badge className="text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Terhubung
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200">
                    Siap Otorisasi
                  </Badge>
                )}
              </Link>
            </div>
          </div>

          {/* Group Action Button */}
          <Link href="/admin/settings?tab=shop" className="block pt-2">
            <Button
              variant="outline"
              className="w-full rounded-2xl border-slate-200 dark:border-white/10 hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-950/30 text-xs font-bold justify-between h-10 group/btn"
            >
              <span className="text-slate-700 dark:text-slate-200 group-hover/btn:text-orange-600">
                Buka Konfigurasi
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:translate-x-1 group-hover/btn:text-orange-600 transition-all" />
            </Button>
          </Link>
        </div>

        {/* GROUP 2: SOCIAL MEDIA CHANNELS */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 p-5 shadow-xs flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-800 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-purple-600 via-pink-600 to-rose-600" />

          <div>
            {/* Group Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-linear-to-tr from-purple-600 to-rose-600 text-white shadow-xs">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-tight">
                    Social Media Channels
                  </h4>
                  <p className="text-[11px] text-slate-400">Omnichannel Publishing</p>
                </div>
              </div>
              <Badge className="text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                {connectedSocialCount}/6 Terhubung
              </Badge>
            </div>

            {/* Services List */}
            <div className="py-4 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {socialPlatforms.map((p) => (
                  <Link
                    key={p.id}
                    href="/admin/settings?tab=social"
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 border border-slate-100 dark:border-white/5 transition-colors block"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`p-1.5 rounded-lg shadow-2xs ${p.iconClass}`}>
                        <p.icon className="h-3.5 w-3.5" />
                      </div>
                      {p.connected ? (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Aktif
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded-full">
                          Siap
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                      {p.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {p.handle}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Extra chips for Facebook & X */}
              <div className="pt-1 flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-medium">Platform Lainnya:</span>
                <Link
                  href="/admin/settings?tab=social"
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:text-purple-600 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full"
                >
                  <Globe className="w-2.5 h-2.5 text-blue-600" /> Facebook
                </Link>
                <Link
                  href="/admin/settings?tab=social"
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:text-purple-600 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full"
                >
                  <Radio className="w-2.5 h-2.5 text-slate-800 dark:text-white" /> X (Twitter)
                </Link>
              </div>
            </div>
          </div>

          {/* Group Action Button */}
          <Link href="/admin/settings?tab=social" className="block pt-2">
            <Button
              variant="outline"
              className="w-full rounded-2xl border-slate-200 dark:border-white/10 hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-950/30 text-xs font-bold justify-between h-10 group/btn"
            >
              <span className="text-slate-700 dark:text-slate-200 group-hover/btn:text-purple-600">
                Buka Konfigurasi
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:translate-x-1 group-hover/btn:text-purple-600 transition-all" />
            </Button>
          </Link>
        </div>

        {/* GROUP 3: GATEWAY & PAYMENT SYSTEM */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 p-5 shadow-xs flex flex-col justify-between hover:border-teal-300 dark:hover:border-teal-800 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-600" />

          <div>
            {/* Group Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-linear-to-tr from-emerald-500 to-cyan-600 text-white shadow-xs">
                  <Sliders className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-tight">
                    Gateway & Sistem
                  </h4>
                  <p className="text-[11px] text-slate-400">Payment, OTP & PPOB</p>
                </div>
              </div>
              <Badge className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                3/3 Aktif
              </Badge>
            </div>

            {/* Services List */}
            <div className="py-4 space-y-2.5">
              {/* Midtrans */}
              <Link
                href="/admin/settings/general"
                className="group/item flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 border border-slate-100 dark:border-white/5 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-600 text-white shadow-xs">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block group-hover/item:text-cyan-600 transition-colors">
                      Midtrans Payment
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">QRIS, VA Bank & E-Wallet</span>
                  </div>
                </div>
                <Badge className="text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Aktif
                </Badge>
              </Link>

              {/* WhatsApp */}
              <Link
                href="/admin/whatsapp"
                className="group/item flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 border border-slate-100 dark:border-white/5 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-xs">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block group-hover/item:text-emerald-600 transition-colors">
                      WhatsApp Gateway (Zenziva)
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">OTP 2FA & Notifikasi Resi</span>
                  </div>
                </div>
                <Badge className="text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Aktif
                </Badge>
              </Link>

              {/* Digiflazz */}
              <Link
                href="/admin/integrations/digiflazz"
                className="group/item flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 border border-slate-100 dark:border-white/5 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block group-hover/item:text-blue-600 transition-colors">
                      Digiflazz PPOB Provider
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Inquiry Pulsa & Token PLN</span>
                  </div>
                </div>
                <Badge className="text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Terhubung
                </Badge>
              </Link>
            </div>
          </div>

          {/* Group Action Button */}
          <Link href="/admin/settings?tab=system" className="block pt-2">
            <Button
              variant="outline"
              className="w-full rounded-2xl border-slate-200 dark:border-white/10 hover:bg-teal-50 hover:border-teal-200 dark:hover:bg-teal-950/30 text-xs font-bold justify-between h-10 group/btn"
            >
              <span className="text-slate-700 dark:text-slate-200 group-hover/btn:text-teal-600">
                Buka Konfigurasi
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:translate-x-1 group-hover/btn:text-teal-600 transition-all" />
            </Button>
          </Link>
        </div>
      </div>

      {/* BOTTOM BUTTON & BANNER: System Settings & Integrations */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-linear-to-r from-slate-900 via-slate-800 to-black text-white p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-pink-400 shrink-0 shadow-inner">
            <Settings className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h4 className="font-black text-base sm:text-lg tracking-tight uppercase">
                System Settings & Integrations
              </h4>
              <Badge className="bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5">
                Pusat Konfigurasi
              </Badge>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Buka pusat kendali terpadu untuk mengelola kredensial API secret, webhook endpoint callback, otorisasi OAuth marketplace, profil organisasi, dan seluruh parameter sistem Zelvira.
            </p>
          </div>
        </div>

        <Link href="/admin/settings" className="shrink-0 w-full sm:w-auto">
          <Button className="w-full sm:w-auto rounded-2xl bg-linear-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-pink-500/20 gap-2.5 h-12 px-6">
            <Settings className="w-4 h-4" />
            <span>System Settings & Integrations</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
