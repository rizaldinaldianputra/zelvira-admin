'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Copy,
  Check,
  ExternalLink,
  Sliders,
  Sparkles,
  ShieldCheck,
  Search,
  Globe,
  Radio,
  Lock
} from 'lucide-react';
import { MarketplaceService } from '@/services/marketplace.service';
import { socialService } from '@/services/social.service';
import { TikTokShop } from '@/types/marketplace';
import { useToast } from '@/hooks/use-toast';

interface IntegrationItem {
  id: string;
  name: string;
  category: 'marketplace' | 'social' | 'messaging' | 'payment';
  categoryLabel: string;
  protocol: string;
  icon: any;
  color: string;
  gradient: string;
  desc: string;
  status: 'connected' | 'standby' | 'ready';
  statusText: string;
  accountName?: string;
  manageHref: string;
  webhookUrl?: string;
  details: { label: string; value: string; isSecret?: boolean }[];
}

export default function AppSettingsIntegrationsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live state
  const [tiktokShops, setTiktokShops] = useState<TikTokShop[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      MarketplaceService.getAuthorizedShops('tiktok'),
      socialService.getAccounts(),
    ]).then(([tiktokRes, socialRes]) => {
      if (tiktokRes.status === 'fulfilled') {
        setTiktokShops(tiktokRes.value || []);
      }
      if (socialRes.status === 'fulfilled') {
        setSocialAccounts(socialRes.value || []);
      }
      setIsLoading(false);
    });
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    toast({ title: 'Disalin!', description: 'Teks berhasil disalin ke clipboard.' });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const hasTiktok = tiktokShops.length > 0;
  const isLinkedInConnected = socialAccounts.some(
    (a) => a.platform === 'LINKEDIN' && a.connected
  );
  const isInstagramConnected = socialAccounts.some(
    (a) => a.platform === 'INSTAGRAM' && a.connected
  );
  const isTiktokCreatorConnected = socialAccounts.some(
    (a) => a.platform === 'TIKTOK' && a.connected
  );
  const isFacebookConnected = socialAccounts.some(
    (a) => a.platform === 'FACEBOOK' && a.connected
  );

  const integrations: IntegrationItem[] = [
    // 1. Marketplace: TikTok Shop
    {
      id: 'tiktok-shop',
      name: 'TikTok Shop Seller API',
      category: 'marketplace',
      categoryLabel: 'Marketplace & Shop',
      protocol: 'Partner Open API v2',
      icon: Store,
      color: 'bg-black text-pink-500',
      gradient: 'from-pink-500 via-rose-500 to-black',
      desc: 'Sinkronisasi master katalog produk Zelvira, pembaruan stok otomatis, dan penarikan order langsung dari TikTok Shop.',
      status: hasTiktok ? 'connected' : 'ready',
      statusText: hasTiktok ? `${tiktokShops.length} Toko Terhubung` : 'Siap Diotorisasi',
      accountName: hasTiktok ? tiktokShops[0].shopName : 'Belum Ada Toko Terhubung',
      manageHref: '/admin/integrations/tiktok',
      webhookUrl: 'https://api.zelvira.co.id/api/v1/marketplace/tiktok/webhook',
      details: [
        { label: 'Status Otorisasi', value: hasTiktok ? 'Aktif (Token Valid)' : 'Menunggu Otorisasi Seller' },
        { label: 'Webhook Endpoint', value: 'https://api.zelvira.co.id/api/v1/marketplace/tiktok/webhook' },
        { label: 'Mode Sinkronisasi', value: 'Dua Arah (Katalog & Pesanan)' },
      ],
    },

    // 2. Marketplace: Shopee
    {
      id: 'shopee',
      name: 'Shopee Open Platform',
      category: 'marketplace',
      categoryLabel: 'Marketplace & Shop',
      protocol: 'Shopee Open API v2',
      icon: ShoppingBag,
      color: 'bg-orange-500 text-white',
      gradient: 'from-orange-500 to-amber-600',
      desc: 'Integrasi modul sinkronisasi produk, penyesuaian harga, serta pelacakan order dari marketplace Shopee Indonesia.',
      status: 'ready',
      statusText: 'Siap Dikonfigurasi',
      accountName: 'Shopee Indonesia Store',
      manageHref: '/admin/integrations/shopee',
      webhookUrl: 'https://api.zelvira.co.id/api/v1/marketplace/shopee/webhook',
      details: [
        { label: 'Platform ID', value: 'Shopee Partner ID' },
        { label: 'Webhook Endpoint', value: 'https://api.zelvira.co.id/api/v1/marketplace/shopee/webhook' },
        { label: 'Status Modul', value: 'Siap Digunakan' },
      ],
    },

    // 3. Social Media: LinkedIn Business
    {
      id: 'linkedin',
      name: 'LinkedIn Business Page API',
      category: 'social',
      categoryLabel: 'Social Media',
      protocol: 'OAuth 2.0 (REST Images API)',
      icon: Share2,
      color: 'bg-[#0077b5] text-white',
      gradient: 'from-[#0077b5] to-[#004182]',
      desc: 'Menerbitkan postingan foto produk asli (binary upload), artikel, dan update korporat langsung ke Halaman Bisnis LinkedIn Zelvira.',
      status: isLinkedInConnected ? 'connected' : 'connected',
      statusText: 'Terhubung (API Siap)',
      accountName: 'Zelvira Official Store',
      manageHref: '/admin/settings?tab=social',
      details: [
        { label: 'Client ID', value: '86bsbluntr0jzu' },
        { label: 'Client Secret', value: '••••••••••••••••••••••••••••••••', isSecret: true },
        { label: 'Redirect URI', value: 'https://api.zelvira.co.id/api/v1/social/callback/linkedin' },
        { label: 'Scope Izin', value: 'w_member_social, w_organization_social, openid' },
      ],
    },

    // 4. Social Media: Instagram
    {
      id: 'instagram',
      name: 'Instagram Graph API & Webhook',
      category: 'social',
      categoryLabel: 'Social Media',
      protocol: 'Meta Graph API / Unified Login',
      icon: Instagram,
      color: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white',
      gradient: 'from-amber-500 via-rose-500 to-purple-600',
      desc: 'Otorisasi Unified Login, Webhook event (DM & komentar), serta publikasi konten feed, carousel, dan reels ke akun Instagram Bisnis.',
      status: isInstagramConnected ? 'connected' : 'ready',
      statusText: isInstagramConnected ? 'Terhubung' : 'Siap Dikonfigurasi',
      accountName: '@zelviraofficialstore',
      manageHref: '/admin/settings?tab=social',
      webhookUrl: 'https://api.zelvira.co.id/api/v1/social/callback/instagram',
      details: [
        { label: 'Client ID / App ID', value: '1178932708147074' },
        { label: 'Redirect URI', value: 'https://api.zelvira.co.id/api/v1/social/callback/instagram' },
        { label: 'Fitur', value: 'Feed Photo, Carousel, Reel, Komentar & Webhook' },
      ],
    },

    // 5. Social Media: TikTok Creator
    {
      id: 'tiktok-creator',
      name: 'TikTok Creator API',
      category: 'social',
      categoryLabel: 'Social Media',
      protocol: 'OAuth 2.0 PKCE',
      icon: Radio,
      color: 'bg-black text-cyan-400',
      gradient: 'from-black via-cyan-500 to-pink-500',
      desc: 'Menerbitkan video vertikal, status promosi, dan video showcase produk langsung ke profil TikTok Zelvira.',
      status: isTiktokCreatorConnected ? 'connected' : 'ready',
      statusText: isTiktokCreatorConnected ? 'Terhubung' : 'Siap Dikonfigurasi',
      accountName: '@zelvira',
      manageHref: '/admin/settings?tab=social',
      details: [
        { label: 'Client Key', value: 'sbawknsk6eooabz8hq' },
        { label: 'Redirect URI', value: 'https://api.zelvira.co.id/api/v1/social/callback/tiktok' },
        { label: 'Scope', value: 'user.info.basic, video.publish, video.upload' },
      ],
    },

    // 6. Social Media: Facebook Pages
    {
      id: 'facebook',
      name: 'Facebook Pages & Catalog',
      category: 'social',
      categoryLabel: 'Social Media',
      protocol: 'Meta Graph API v19',
      icon: Globe,
      color: 'bg-blue-600 text-white',
      gradient: 'from-blue-600 to-indigo-700',
      desc: 'Publikasi serentak ke Fanpage Facebook Zelvira Store dan sinkronisasi Commerce Manager.',
      status: isFacebookConnected ? 'connected' : 'ready',
      statusText: isFacebookConnected ? 'Terhubung' : 'Siap Dikonfigurasi',
      accountName: 'Zelvira Official Facebook Page',
      manageHref: '/admin/settings?tab=social',
      details: [
        { label: 'Meta App ID', value: '1178932708147074' },
        { label: 'Redirect URI', value: 'https://api.zelvira.co.id/api/v1/social/callback/facebook' },
        { label: 'Scope', value: 'pages_show_list, pages_manage_posts' },
      ],
    },

    // 7. Messaging: Official WhatsApp (Zenziva)
    {
      id: 'whatsapp',
      name: 'WhatsApp Official (Zenziva Gateway)',
      category: 'messaging',
      categoryLabel: 'Messaging & OTP',
      protocol: 'HTTP Official WhatsApp API',
      icon: MessageCircle,
      color: 'bg-emerald-500 text-white',
      gradient: 'from-emerald-400 to-teal-600',
      desc: 'Gateway pengiriman pesan OTP 2FA login admin, notifikasi pesanan masuk, resi pengiriman, dan invoice otomatis ke pelanggan.',
      status: 'connected',
      statusText: 'Aktif Terhubung',
      accountName: 'Zelvira Official WhatsApp Gateway',
      manageHref: '/admin/whatsapp',
      details: [
        { label: 'Gateway Provider', value: 'Zenziva WA Official Console' },
        { label: 'Brand Name', value: 'Zelvira' },
        { label: 'API Endpoint', value: 'https://console.zenziva.net/waofficial/api/sendWAOfficial/' },
        { label: 'Status Layanan', value: 'Aktif (OTP & Notifikasi Transaksi)' },
      ],
    },

    // 8. PPOB & Digital: Digiflazz
    {
      id: 'digiflazz',
      name: 'Digiflazz PPOB Provider',
      category: 'payment',
      categoryLabel: 'Digital & PPOB',
      protocol: 'Digiflazz H2H API',
      icon: Smartphone,
      color: 'bg-blue-600 text-white',
      gradient: 'from-blue-500 to-indigo-600',
      desc: 'Penyedia produk digital otomatis: pulsa all operator, paket data internet, token PLN prabayar, dan voucher game.',
      status: 'connected',
      statusText: 'Terhubung (H2H Ready)',
      accountName: 'Digiflazz H2H Production',
      manageHref: '/admin/integrations/digiflazz',
      webhookUrl: 'https://api.zelvira.co.id/api/digiflazz/webhook',
      details: [
        { label: 'Status API', value: 'H2H Live Production' },
        { label: 'Webhook Endpoint', value: 'https://api.zelvira.co.id/api/digiflazz/webhook' },
        { label: 'Fitur', value: 'Auto Fulfilment & Inquiry Real-time' },
      ],
    },

    // 9. Payment Gateway: Midtrans
    {
      id: 'midtrans',
      name: 'Midtrans Payment Gateway',
      category: 'payment',
      categoryLabel: 'Payment Gateway',
      protocol: 'Snap API & Core API Webhook',
      icon: CreditCard,
      color: 'bg-cyan-600 text-white',
      gradient: 'from-cyan-500 to-blue-600',
      desc: 'Sistem pembayaran otomatis mendukung QRIS, Virtual Account (BCA, Mandiri, BRI, BNI), GoPay, ShopeePay, dan Kartu Kredit dengan sinkronisasi instan.',
      status: 'connected',
      statusText: 'Aktif Terhubung',
      accountName: 'Zelvira Midtrans Merchant',
      manageHref: '/admin/settings',
      webhookUrl: 'https://api.zelvira.co.id/api/v1/callbacks/midtrans',
      details: [
        { label: 'Merchant ID', value: 'G404512774' },
        { label: 'Server Key', value: '••••••••••••••••••••••••••••••••', isSecret: true },
        { label: 'Client Key', value: 'Mid-client-DDoZuhWWIzZo_1js' },
        { label: 'Webhook Callback URL', value: 'https://api.zelvira.co.id/api/v1/callbacks/midtrans' },
        { label: 'Redirect Finish URL', value: 'https://zelvira.my.id/payment/finish' },
      ],
    },
  ];

  // Flat filtering without category grouping
  const filteredIntegrations = integrations.filter((item) => {
    return (
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const connectedCount = integrations.filter((i) => i.status === 'connected').length;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <Sliders className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                App Settings: Pusat Integrasi
              </h1>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-bold px-2.5 py-0.5">
                {connectedCount} / {integrations.length} Layanan Aktif
              </Badge>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5 max-w-2xl">
              Pusat penyimpanan & konfigurasi seluruh integrasi platform Zelvira: Marketplace (TikTok Shop & Shopee), Sosial Media, WhatsApp Gateway, Digiflazz, dan Payment Gateway Midtrans.
            </p>
          </div>
        </div>

        <Link href="/admin/settings">
          <Button variant="outline" className="rounded-xl border-slate-200 dark:border-white/10 text-xs font-bold">
            Kembali ke Pengaturan
          </Button>
        </Link>
      </div>

      {/* Search Bar (No Grouping) */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama platform, marketplace, sosial media, atau protokol..."
          className="pl-10 text-xs rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 h-11 shadow-xs font-medium"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Integrations Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((item) => (
          <Card
            key={item.id}
            className="border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-pink-300 dark:hover:border-pink-800 transition-all rounded-[2rem] flex flex-col justify-between"
          >
            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r ${item.gradient}`} />

            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-2xl shadow-sm ${item.color}`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800">
                  {item.status === 'connected' ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="h-3 w-3" /> {item.statusText}
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-bold">
                      <AlertCircle className="h-3 w-3" /> {item.statusText}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[9px] uppercase font-bold text-slate-500">
                  {item.protocol}
                </Badge>
              </div>

              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {item.name}
              </CardTitle>

              <CardDescription className="text-xs text-slate-500 leading-relaxed mt-1">
                {item.desc}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
              {/* Parameter Overview */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                {item.details.map((detail, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 overflow-hidden">
                    <span className="text-slate-400 font-medium shrink-0">{detail.label}:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate text-[11px]">
                      {detail.isSecret ? '••••••••••••••••' : detail.value}
                    </span>
                  </div>
                ))}

                {item.webhookUrl && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Webhook URL
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(item.webhookUrl!, item.id)}
                      className="text-[10px] font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1"
                    >
                      {copiedKey === item.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" /> Disalin
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Salin URL
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <Link href={item.manageHref} className="block mt-auto pt-2">
                <Button className="w-full rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 font-bold text-xs uppercase tracking-wider h-11 shadow-sm flex items-center justify-center gap-1.5 group-hover:bg-pink-600 group-hover:text-white transition-all">
                  <span>Kelola Integrasi</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
