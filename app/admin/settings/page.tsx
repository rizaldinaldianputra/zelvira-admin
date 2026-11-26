'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Building2,
  Sliders,
  Globe,
  Radio,
  Search,
  Settings,
  Key,
  Lock,
  Trash2,
  ExternalLink,
  Layers,
  Zap,
  Info
} from 'lucide-react';
import { MarketplaceService } from '@/services/marketplace.service';
import { socialService } from '@/services/social.service';
import { TikTokShop } from '@/types/marketplace';
import { SocialAccount } from '@/types/social';
import { useToast } from '@/hooks/use-toast';

type TabType = 'ALL' | 'SHOP' | 'SOCIAL' | 'SYSTEM';

interface SettingCardItem {
  id: string;
  title: string;
  category: string;
  tabGroup: 'SHOP' | 'SOCIAL' | 'SYSTEM';
  protocol: string;
  icon: any;
  color: string;
  gradient: string;
  description: string;
  status: 'connected' | 'ready';
  statusText: string;
  accountName?: string;
  href: string;
  webhookUrl?: string;
  socialPlatform?: string;
  socialAccountId?: number;
  details: { label: string; value: string; isSecret?: boolean }[];
}

export default function SettingsDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [socialSubFilter, setSocialSubFilter] = useState<'ALL' | 'FACEBOOK' | 'INSTAGRAM' | 'THREADS' | 'OTHER'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live state
  const [tiktokShops, setTiktokShops] = useState<TikTokShop[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

  // Manual token modal state
  const [showManualModal, setShowManualModal] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState('');
  const [manualAccountName, setManualAccountName] = useState('');
  const [manualAccountId, setManualAccountId] = useState('');
  const [isSubmittingToken, setIsSubmittingToken] = useState(false);

  const fetchData = () => {
    setIsLoading(true);
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
  };

  useEffect(() => {
    fetchData();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab')?.toUpperCase();
      if (tabParam === 'SHOP') setActiveTab('SHOP');
      else if (tabParam === 'SOCIAL') setActiveTab('SOCIAL');
      else if (tabParam === 'SYSTEM') setActiveTab('SYSTEM');

      // Handle OAuth Redirect Status
      const status = params.get('status');
      const platform = params.get('platform');
      const message = params.get('message');
      if (status === 'success') {
        toast({
          title: 'Otorisasi Berhasil!',
          description: `Akun ${platform?.toUpperCase()} berhasil terhubung.`,
        });
        setActiveTab('SOCIAL');
      } else if (status === 'error') {
        toast({
          title: 'Gagal Otorisasi',
          description: message || `Otorisasi ${platform?.toUpperCase()} gagal atau dibatalkan.`,
          variant: 'destructive',
        });
        setActiveTab('SOCIAL');
      }
    }
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    toast({ title: 'Disalin!', description: 'Teks berhasil disalin ke clipboard.' });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleConnectOAuth = async (platform: string) => {
    setConnectingPlatform(platform);
    try {
      const authUrl = await socialService.getAuthUrl(platform);
      if (authUrl) {
        window.location.href = authUrl;
      } else {
        toast({
          title: 'Gagal Menyiapkan Otorisasi',
          description: 'URL otorisasi tidak ditemukan.',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error Otorisasi',
        description: err.message || 'Gagal memuat URL otorisasi',
        variant: 'destructive',
      });
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleSaveManualToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) {
      toast({
        title: 'Token Wajib Diisi',
        description: 'Silakan masukkan Access Token.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmittingToken(true);
    try {
      await socialService.saveManualToken({
        platform: showManualModal!,
        accountId: manualAccountId.trim() || undefined,
        accountName: manualAccountName.trim() || undefined,
        accessToken: manualToken.trim(),
      });

      toast({
        title: 'Akun Terhubung!',
        description: `Koneksi akun ${showManualModal} berhasil disimpan.`,
      });

      setShowManualModal(null);
      setManualToken('');
      setManualAccountName('');
      setManualAccountId('');
      fetchData();
    } catch (err: any) {
      toast({
        title: 'Gagal Menyimpan Token',
        description: err.message || 'Terjadi kesalahan.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingToken(false);
    }
  };

  const handleDisconnectSocial = async (id: number, platform: string) => {
    if (!confirm(`Yakin ingin memutuskan koneksi akun ${platform}?`)) return;

    try {
      await socialService.disconnectAccount(id);
      toast({
        title: 'Koneksi Diputuskan',
        description: `Akun ${platform} berhasil diputuskan.`,
      });
      fetchData();
    } catch (err: any) {
      toast({
        title: 'Gagal Memutuskan Koneksi',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const getSocialAccount = (platform: string) => {
    return socialAccounts.find((a) => a.platform?.toUpperCase() === platform.toUpperCase());
  };

  const hasTiktok = tiktokShops.length > 0;
  const igAccount = getSocialAccount('INSTAGRAM');
  const ttCreatorAccount = getSocialAccount('TIKTOK');
  const liAccount = getSocialAccount('LINKEDIN');
  const fbAccount = getSocialAccount('FACEBOOK');
  const xAccount = getSocialAccount('X');
  const ytAccount = getSocialAccount('YOUTUBE');
  const thAccount = getSocialAccount('THREADS');

  // Master Settings Cards list
  const settingsCards: SettingCardItem[] = [
    // ==========================================
    // 1. SHOP / MARKETPLACE TAB
    // ==========================================
    {
      id: 'tiktok-shop',
      title: 'TikTok Shop Seller API',
      category: 'Marketplace Toko',
      tabGroup: 'SHOP',
      protocol: 'Partner Open API v2',
      icon: Store,
      color: 'bg-black text-pink-500',
      gradient: 'from-pink-500 via-rose-500 to-black',
      description: 'Sinkronisasi master katalog produk Zelvira, pembaruan stok otomatis, dan penarikan order langsung dari TikTok Shop.',
      status: hasTiktok ? 'connected' : 'ready',
      statusText: hasTiktok ? `${tiktokShops.length} Toko Terhubung` : 'Siap Otorisasi',
      accountName: hasTiktok ? tiktokShops[0].shopName : 'Koneksi Siap Diotorisasi',
      href: '/admin/integrations/tiktok',
      webhookUrl: 'https://api.zelvira.co.id/api/v1/marketplace/tiktok/webhook',
      details: [
        { label: 'Status Toko', value: hasTiktok ? tiktokShops[0].shopName : 'Siap Diotorisasi' },
        { label: 'Webhook Endpoint', value: 'https://api.zelvira.co.id/api/v1/marketplace/tiktok/webhook' },
      ],
    },
    {
      id: 'shopee',
      title: 'Shopee Open Platform',
      category: 'Marketplace Toko',
      tabGroup: 'SHOP',
      protocol: 'Shopee Open API v2',
      icon: ShoppingBag,
      color: 'bg-orange-500 text-white',
      gradient: 'from-orange-500 to-amber-600',
      description: 'Integrasi modul sinkronisasi produk, penyesuaian harga, serta pelacakan order dari marketplace Shopee.',
      status: 'ready',
      statusText: 'Siap Konfigurasi',
      accountName: 'Shopee Indonesia Store',
      href: '/admin/integrations/shopee',
      webhookUrl: 'https://api.zelvira.co.id/api/v1/marketplace/shopee/webhook',
      details: [
        { label: 'Platform ID', value: 'Shopee Partner ID' },
        { label: 'Webhook Endpoint', value: 'https://api.zelvira.co.id/api/v1/marketplace/shopee/webhook' },
      ],
    },

    // ==========================================
    // 2. SOCIAL MEDIA TAB (META ECOSYSTEM & OTHERS)
    // ==========================================
    {
      id: 'facebook',
      title: 'Facebook Pages & Reels API',
      category: 'Meta (Facebook)',
      tabGroup: 'SOCIAL',
      protocol: 'Graph API v21.0',
      icon: Globe,
      color: 'bg-[#1877F2] text-white',
      gradient: 'from-[#1877F2] to-[#0D5EC7]',
      description: 'Kelola otorisasi Halaman Bisnis (Fanpage) Facebook Zelvira Store, posting status, foto, video reels, dan interaksi halaman.',
      status: (fbAccount && fbAccount.isActive && fbAccount.hasToken) ? 'connected' : 'ready',
      statusText: (fbAccount && fbAccount.isActive && fbAccount.hasToken) ? 'Terhubung' : 'Siap Dihubungkan',
      accountName: fbAccount?.accountName || 'Zelvira Official Page',
      socialPlatform: 'FACEBOOK',
      socialAccountId: fbAccount?.id,
      href: '/admin/settings?tab=social',
      details: [
        { label: 'Platform ID', value: 'Meta App ID: 1178932708147074' },
        { label: 'Tipe Akun', value: 'Facebook Fanpage / Business Page' },
        { label: 'Halaman Terhubung', value: fbAccount?.accountName || 'Belum Terhubung' },
        { label: 'Redirect URI', value: 'https://api.zelvira.co.id/api/v1/social/callback/facebook' },
      ],
    },
    {
      id: 'instagram',
      title: 'Instagram Business API',
      category: 'Meta (Instagram)',
      tabGroup: 'SOCIAL',
      protocol: 'Instagram Graph API',
      icon: Instagram,
      color: 'bg-linear-to-tr from-amber-500 via-rose-500 to-purple-600 text-white',
      gradient: 'from-amber-500 via-rose-500 to-purple-600',
      description: 'Kelola otorisasi akun Instagram Bisnis (@zelviraofficialstore), publikasi postingan Feed, Carousel, Reels, dan Story/Status.',
      status: (igAccount && igAccount.isActive && igAccount.hasToken) ? 'connected' : 'ready',
      statusText: (igAccount && igAccount.isActive && igAccount.hasToken) ? 'Terhubung' : 'Siap Dihubungkan',
      accountName: igAccount?.accountName || '@zelviraofficialstore',
      socialPlatform: 'INSTAGRAM',
      socialAccountId: igAccount?.id,
      href: '/admin/settings?tab=social',
      webhookUrl: 'https://api.zelvira.co.id/api/v1/callbacks/instagram/webhook',
      details: [
        { label: 'Platform ID', value: 'Meta App ID: 1178932708147074' },
        { label: 'Tipe Akun', value: 'Instagram Professional / Creator' },
        { label: 'Akun Terhubung', value: igAccount?.accountName || '@zelviraofficialstore' },
        { label: 'Redirect URI', value: 'https://api.zelvira.co.id/api/v1/social/callback/instagram' },
      ],
    },
    {
      id: 'threads',
      title: 'Threads API (Meta)',
      category: 'Meta (Threads)',
      tabGroup: 'SOCIAL',
      protocol: 'Threads Graph API',
      icon: MessageCircle,
      color: 'bg-black text-white',
      gradient: 'from-black via-zinc-800 to-neutral-900',
      description: 'Aplikasi Threads khusus Zelvira Store. Publikasi thread teks, gambar, video, dan status langsung ke aplikasi Threads.',
      status: (thAccount && thAccount.isActive && thAccount.hasToken) ? 'connected' : 'ready',
      statusText: (thAccount && thAccount.isActive && thAccount.hasToken) ? 'Terhubung' : 'Siap Dihubungkan',
      accountName: thAccount?.accountName || '@zelviraofficialstore',
      socialPlatform: 'THREADS',
      socialAccountId: thAccount?.id,
      href: '/admin/settings?tab=social',
      webhookUrl: 'https://api.zelvira.co.id/api/v1/social/callback/threads',
      details: [
        { label: 'Platform ID', value: 'Threads App ID: 1100121756212184' },
        { label: 'Tipe Akun', value: 'Threads Profile Account' },
        { label: 'Akun Terhubung', value: thAccount?.accountName || '@zelviraofficialstore' },
        { label: 'Redirect URI', value: 'https://api.zelvira.co.id/api/v1/social/callback/threads' },
      ],
    },
    {
      id: 'tiktok-creator',
      title: 'TikTok Content Posting API',
      category: 'Social Media',
      tabGroup: 'SOCIAL',
      protocol: 'Creator API v2',
      icon: Radio,
      color: 'bg-black text-cyan-400',
      gradient: 'from-black via-cyan-500 to-pink-500',
      description: 'Menerbitkan video vertikal, status promosi, foto carousel, dan update showcase produk langsung ke profil TikTok Zelvira.',
      status: (ttCreatorAccount && ttCreatorAccount.isActive && ttCreatorAccount.hasToken) ? 'connected' : 'ready',
      statusText: (ttCreatorAccount && ttCreatorAccount.isActive && ttCreatorAccount.hasToken) ? 'Terhubung' : 'Siap Dihubungkan',
      accountName: ttCreatorAccount?.accountName || '@zelvira',
      socialPlatform: 'TIKTOK',
      socialAccountId: ttCreatorAccount?.id,
      href: '/admin/settings?tab=social',
      details: [
        { label: 'Client Key', value: ttCreatorAccount?.clientKey || 'sbawknsk6eooabz8hq' },
        { label: 'Akun Terhubung', value: ttCreatorAccount?.accountName || '@zelvira' },
        { label: 'Redirect URI', value: 'https://api.zelvira.co.id/api/v1/social/callback/tiktok' },
      ],
    },
    {
      id: 'linkedin',
      title: 'LinkedIn Business Page API',
      category: 'Social Media',
      tabGroup: 'SOCIAL',
      protocol: 'REST Images & Posts API',
      icon: Share2,
      color: 'bg-[#0077b5] text-white',
      gradient: 'from-[#0077b5] to-[#004182]',
      description: 'Menerbitkan foto produk asli (binary upload), artikel, dan update korporat langsung ke Halaman Bisnis LinkedIn Zelvira.',
      status: (liAccount && liAccount.isActive && liAccount.hasToken) ? 'connected' : 'ready',
      statusText: (liAccount && liAccount.isActive && liAccount.hasToken) ? 'Terhubung' : 'Siap Dihubungkan',
      accountName: liAccount?.accountName || 'Zelvira Official Store',
      socialPlatform: 'LINKEDIN',
      socialAccountId: liAccount?.id,
      href: '/admin/settings?tab=social',
      details: [
        { label: 'Client ID', value: '86bsbluntr0jzu' },
        { label: 'Halaman', value: liAccount?.accountName || 'Zelvira Official' },
        { label: 'Redirect URI', value: 'https://api.zelvira.co.id/api/v1/social/callback/linkedin' },
      ],
    },
    {
      id: 'x',
      title: 'X (Twitter) Developer API',
      category: 'Social Media',
      tabGroup: 'SOCIAL',
      protocol: 'OAuth 2.0 PKCE',
      icon: Radio,
      color: 'bg-slate-950 text-white',
      gradient: 'from-slate-900 via-slate-800 to-black',
      description: 'Kirim cuitan, thread promosi produk baru, dan broadcast promo flash sale Zelvira secara otomatis.',
      status: (xAccount && xAccount.isActive && xAccount.hasToken) ? 'connected' : 'ready',
      statusText: (xAccount && xAccount.isActive && xAccount.hasToken) ? 'Terhubung' : 'Siap Dihubungkan',
      accountName: xAccount?.accountName || '@zelvira_id',
      socialPlatform: 'X',
      socialAccountId: xAccount?.id,
      href: '/admin/settings?tab=social',
      details: [
        { label: 'Handle Akun', value: xAccount?.accountName || '@zelvira_id' },
        { label: 'Redirect URI', value: 'https://api.zelvira.co.id/api/v1/social/callback/x' },
      ],
    },
    {
      id: 'youtube',
      title: 'YouTube Shorts & Video',
      category: 'Social Media',
      tabGroup: 'SOCIAL',
      protocol: 'Google OAuth 2.0',
      icon: Smartphone,
      color: 'bg-[#ff0000] text-white',
      gradient: 'from-[#ff0000] to-[#b30000]',
      description: 'Menerbitkan video vertikal ke YouTube Shorts dan konten video review produk Zelvira.',
      status: (ytAccount && ytAccount.isActive && ytAccount.hasToken) ? 'connected' : 'ready',
      statusText: (ytAccount && ytAccount.isActive && ytAccount.hasToken) ? 'Terhubung' : 'Siap Dihubungkan',
      accountName: ytAccount?.accountName || 'Zelvira Official Channel',
      socialPlatform: 'YOUTUBE',
      socialAccountId: ytAccount?.id,
      href: '/admin/settings?tab=social',
      details: [
        { label: 'Saluran Aktif', value: (ytAccount && ytAccount.isActive && ytAccount.hasToken) ? (ytAccount.accountName || 'Saluran Terhubung') : 'Belum Terhubung' },
        ...(ytAccount?.accountId ? [{ label: 'Channel ID', value: ytAccount.accountId }] : []),
        { label: 'Redirect URI', value: 'https://api.zelvira.co.id/api/v1/social/callback/youtube' },
      ],
    },

    // ==========================================
    // 3. SYSTEM & GATEWAY TAB
    // ==========================================
    {
      id: 'whatsapp',
      title: 'WhatsApp Official (Zenziva Gateway)',
      category: 'Messaging & OTP',
      tabGroup: 'SYSTEM',
      protocol: 'HTTP Official WhatsApp API',
      icon: MessageCircle,
      color: 'bg-emerald-500 text-white',
      gradient: 'from-emerald-400 to-teal-600',
      description: 'Gateway pengiriman pesan OTP 2FA login admin, notifikasi pesanan masuk, resi pengiriman, dan invoice otomatis ke pelanggan.',
      status: 'connected',
      statusText: 'Aktif Terhubung',
      accountName: 'Zelvira Official WhatsApp Gateway',
      href: '/admin/whatsapp',
      details: [
        { label: 'Brand Name', value: 'Zelvira' },
        { label: 'Status OTP', value: 'Aktif (2FA & Notifikasi Resi)' },
      ],
    },
    {
      id: 'digiflazz',
      title: 'Digiflazz PPOB Provider',
      category: 'Digital & PPOB',
      tabGroup: 'SYSTEM',
      protocol: 'Digiflazz H2H API',
      icon: Smartphone,
      color: 'bg-blue-600 text-white',
      gradient: 'from-blue-500 to-indigo-600',
      description: 'Penyedia produk digital otomatis: pulsa all operator, paket data internet, token PLN prabayar, dan voucher game.',
      status: 'connected',
      statusText: 'Terhubung (H2H Ready)',
      accountName: 'Digiflazz H2H Production',
      href: '/admin/integrations/digiflazz',
      webhookUrl: 'https://api.zelvira.co.id/api/digiflazz/webhook',
      details: [
        { label: 'Webhook Endpoint', value: 'https://api.zelvira.co.id/api/digiflazz/webhook' },
        { label: 'Layanan', value: 'Inquiry Pulsa & Token PLN Real-time' },
      ],
    },
    {
      id: 'midtrans',
      title: 'Midtrans Payment Gateway',
      category: 'Payment Gateway',
      tabGroup: 'SYSTEM',
      protocol: 'Snap API & Core API Webhook',
      icon: CreditCard,
      color: 'bg-cyan-600 text-white',
      gradient: 'from-cyan-500 to-blue-600',
      description: 'Sistem pembayaran otomatis mendukung QRIS, Virtual Account (BCA, Mandiri, BRI, BNI), GoPay, ShopeePay, dan Kartu Kredit dengan auto-sync instan.',
      status: 'connected',
      statusText: 'Aktif Terhubung',
      accountName: 'Zelvira Midtrans Merchant',
      href: '/admin/settings/general',
      webhookUrl: 'https://api.zelvira.co.id/api/v1/callbacks/midtrans',
      details: [
        { label: 'Merchant ID', value: 'G404512774' },
        { label: 'Client Key', value: 'Mid-client-DDoZuhWWIzZo_1js' },
        { label: 'Webhook URL', value: 'https://api.zelvira.co.id/api/v1/callbacks/midtrans' },
      ],
    },
    {
      id: 'organization',
      title: 'Organization Configuration',
      category: 'Sistem & Legalitas',
      tabGroup: 'SYSTEM',
      protocol: 'Enterprise Profile',
      icon: Building2,
      color: 'bg-indigo-600 text-white',
      gradient: 'from-blue-500 to-indigo-600',
      description: 'Kelola identitas korporat, nama legal PT, NPWP perusahaan, alamat kantor pusat, kontak dukungan resmi, dan branding invoice.',
      status: 'connected',
      statusText: 'Dikonfigurasi',
      accountName: 'PT Zelvira Official Enterprise',
      href: '/admin/settings/organization',
      details: [
        { label: 'Identitas Bisnis', value: 'Zelvira Official Enterprise' },
        { label: 'Kontak Resmi', value: 'support@zelvira.com' },
      ],
    },
    {
      id: 'mobile-version',
      title: 'Mobile App Version Control',
      category: 'Sistem & Mobile',
      tabGroup: 'SYSTEM',
      protocol: 'App Release Manager',
      icon: Smartphone,
      color: 'bg-pink-600 text-white',
      gradient: 'from-pink-500 to-rose-600',
      description: 'Atur rilis versi aplikasi Android & iOS (Flutter), kebijakan force update, link APK/Play Store, dan catatan pembaruan rilis.',
      status: 'connected',
      statusText: 'Versi v1.0.0 Aktif',
      accountName: 'Zelvira Mobile Android/iOS',
      href: '/admin/settings/mobile',
      details: [
        { label: 'Versi Minimum', value: 'v1.0.0' },
        { label: 'Force Update', value: 'Aktif untuk pembaruan kritis' },
      ],
    },
  ];

  // Filtering cards by active tab and search query
  const filteredCards = settingsCards.filter((card) => {
    // Tab filter
    if (activeTab !== 'ALL' && card.tabGroup !== activeTab) {
      return false;
    }
    // Social Sub-Filter (Separates Meta Facebook, Instagram, Threads, and Others)
    if (activeTab === 'SOCIAL' && socialSubFilter !== 'ALL') {
      if (socialSubFilter === 'FACEBOOK' && card.socialPlatform !== 'FACEBOOK') return false;
      if (socialSubFilter === 'INSTAGRAM' && card.socialPlatform !== 'INSTAGRAM') return false;
      if (socialSubFilter === 'THREADS' && card.socialPlatform !== 'THREADS') return false;
      if (socialSubFilter === 'OTHER' && ['FACEBOOK', 'INSTAGRAM', 'THREADS'].includes(card.socialPlatform || '')) return false;
    }
    // Search query filter
    return (
      !searchQuery.trim() ||
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const shopCount = settingsCards.filter((c) => c.tabGroup === 'SHOP').length;
  const socialCount = settingsCards.filter((c) => c.tabGroup === 'SOCIAL').length;
  const systemCount = settingsCards.filter((c) => c.tabGroup === 'SYSTEM').length;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <Settings className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                System Settings & Integrations
              </h1>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-bold px-2.5 py-0.5">
                {settingsCards.length} Layanan Terhubung
              </Badge>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5 max-w-2xl">
              Pusat konfigurasi terpadu: Kelola Marketplace Toko, Media Sosial, WhatsApp Gateway, Pembayaran, dan Sistem Aplikasi.
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pengaturan atau integrasi..."
            className="pl-10 text-xs rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 h-11 font-medium shadow-xs"
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
      </div>

      {/* Modern Tab Bar Separator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 w-fit shadow-xs">
          {/* Tab 1: ALL */}
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'ALL'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Semua Layanan</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              {settingsCards.length}
            </Badge>
          </button>

          {/* Tab 2: SHOP / MARKETPLACE */}
          <button
            type="button"
            onClick={() => setActiveTab('SHOP')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'SHOP'
                ? 'bg-linear-to-r from-orange-500 to-pink-500 text-white shadow-md shadow-pink-500/20'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Shop & Marketplace</span>
            <Badge
              className={`text-[10px] px-1.5 py-0 h-4 ${activeTab === 'SHOP' ? 'bg-white/20 text-white border-transparent' : 'bg-slate-200 text-slate-700'
                }`}
            >
              {shopCount}
            </Badge>
          </button>

          {/* Tab 3: SOCIAL MEDIA */}
          <button
            type="button"
            onClick={() => setActiveTab('SOCIAL')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'SOCIAL'
                ? 'bg-linear-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Social Media Channels</span>
            <Badge
              className={`text-[10px] px-1.5 py-0 h-4 ${activeTab === 'SOCIAL' ? 'bg-white/20 text-white border-transparent' : 'bg-slate-200 text-slate-700'
                }`}
            >
              {socialCount}
            </Badge>
          </button>

          {/* Tab 4: SYSTEM & GATEWAY */}
          <button
            type="button"
            onClick={() => setActiveTab('SYSTEM')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'SYSTEM'
                ? 'bg-slate-900 text-white dark:bg-slate-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Gateway & Sistem</span>
            <Badge
              className={`text-[10px] px-1.5 py-0 h-4 ${activeTab === 'SYSTEM' ? 'bg-white/20 text-white border-transparent' : 'bg-slate-200 text-slate-700'
                }`}
            >
              {systemCount}
            </Badge>
          </button>
        </div>

        {/* Tab Description helper */}
        <div className="text-xs text-slate-400">
          {activeTab === 'SHOP' && 'Katalog Toko, Sinkronisasi Stok, dan Order Marketplace'}
          {activeTab === 'SOCIAL' && 'Posting Feed, Story, Reels, dan Otorisasi Akun Sosial'}
          {activeTab === 'SYSTEM' && 'Payment Gateway, OTP WhatsApp, PPOB & Konfigurasi App'}
          {activeTab === 'ALL' && 'Menampilkan seluruh konfigurasi'}
        </div>
      </div>

      {/* Sub-Filter Khusus Tab Social: Pemisahan Facebook, Instagram, Threads, dan Lainnya */}
      {activeTab === 'SOCIAL' && (
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Filter Channel:
            </span>
            <button
              type="button"
              onClick={() => setSocialSubFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                socialSubFilter === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800'
              }`}
            >
              Semua ({socialCount})
            </button>
            <button
              type="button"
              onClick={() => setSocialSubFilter('FACEBOOK')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                socialSubFilter === 'FACEBOOK'
                  ? 'bg-[#1877F2] text-white shadow-xs'
                  : 'text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Facebook (Pages)</span>
            </button>
            <button
              type="button"
              onClick={() => setSocialSubFilter('INSTAGRAM')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                socialSubFilter === 'INSTAGRAM'
                  ? 'bg-linear-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-xs'
                  : 'text-pink-700 dark:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-950/40'
              }`}
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Instagram (Bisnis)</span>
            </button>
            <button
              type="button"
              onClick={() => setSocialSubFilter('THREADS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                socialSubFilter === 'THREADS'
                  ? 'bg-black text-white dark:bg-zinc-800 shadow-xs'
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Threads (Meta)</span>
            </button>
            <button
              type="button"
              onClick={() => setSocialSubFilter('OTHER')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                socialSubFilter === 'OTHER'
                  ? 'bg-slate-700 text-white dark:bg-slate-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800'
              }`}
            >
              TikTok, YouTube, X & Lainnya
            </button>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Meta App ID: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">1178932708147074</span> | Threads App ID: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">1100121756212184</span>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map((item) => {
          const isConnected = item.status === 'connected';

          return (
            <Card
              key={item.id}
              className={`relative overflow-hidden transition-all rounded-4xl flex flex-col justify-between ${
                isConnected
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-md hover:shadow-xl hover:border-pink-300 dark:hover:border-pink-800 ring-1 ring-emerald-500/15'
                  : 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200/90 dark:border-slate-800 opacity-70 hover:opacity-100 shadow-none'
              }`}
            >
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 ${
                  isConnected ? `bg-linear-to-r ${item.gradient}` : 'bg-slate-300 dark:bg-slate-700'
                }`}
              />

              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`p-3 rounded-2xl shadow-sm transition-colors ${
                      isConnected
                        ? `${item.color} shadow-md`
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isConnected
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300/80 dark:border-slate-700'
                    }`}
                  >
                    {isConnected ? (
                      <span className="flex items-center gap-1 font-bold">
                        <CheckCircle2 className="h-3 w-3" /> {item.statusText}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-bold">
                        <AlertCircle className="h-3 w-3" /> {item.statusText}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-[9px] uppercase font-bold text-slate-500">
                    {item.category} · {item.protocol}
                  </Badge>
                </div>

                <CardTitle
                  className={`text-lg font-bold leading-tight ${
                    isConnected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.title}
                </CardTitle>

                <CardDescription className="text-xs text-slate-500 leading-relaxed mt-1">
                  {item.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                {/* Parameters info */}
                <div
                  className={`p-3.5 rounded-2xl border space-y-2 text-xs ${
                    isConnected
                      ? 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                      : 'bg-slate-100/60 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800/60'
                  }`}
                >
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

              {/* Action Buttons */}
              <div className="mt-auto pt-2 space-y-2">
                {/* For Social Media Items with direct connection options */}
                {item.socialPlatform ? (
                  <div className="space-y-2">
                    {item.status === 'connected' ? (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleConnectOAuth(item.socialPlatform!)}
                          disabled={connectingPlatform === item.socialPlatform}
                          className="flex-1 rounded-xl text-xs font-bold h-10 border-slate-200 dark:border-white/10 flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-white/5"
                        >
                          {connectingPlatform === item.socialPlatform ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                          )}
                          Ganti Saluran
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowManualModal(item.socialPlatform!);
                            setManualAccountName(item.accountName || '');
                          }}
                          className="rounded-xl text-xs font-bold h-10 px-3 border-slate-200 dark:border-white/10"
                          title="Ganti Token Manual"
                        >
                          <Key className="w-3.5 h-3.5 text-slate-400" />
                        </Button>
                        {item.socialAccountId && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDisconnectSocial(item.socialAccountId!, item.socialPlatform!)}
                            className="rounded-xl text-xs font-bold h-10 px-3"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          onClick={() => handleConnectOAuth(item.socialPlatform!)}
                          disabled={connectingPlatform === item.socialPlatform}
                          className="flex-1 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 font-bold text-xs uppercase tracking-wider h-10 shadow-sm flex items-center justify-center gap-1.5 group-hover:bg-pink-600 group-hover:text-white transition-all"
                        >
                          {connectingPlatform === item.socialPlatform ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menghubungkan...
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5" /> Hubungkan
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowManualModal(item.socialPlatform!)}
                          className="rounded-xl text-xs font-bold h-10 px-3 border-slate-200 dark:border-white/10"
                          title="Masukkan Token Manual"
                        >
                          <Key className="w-3.5 h-3.5 text-slate-400" />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Standard Link for Shop & System Items */
                  <Link href={item.href} className="block">
                    <Button className="w-full rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 font-bold text-xs uppercase tracking-wider h-11 shadow-sm flex items-center justify-center gap-1.5 group-hover:bg-pink-600 group-hover:text-white transition-all">
                      <span>Buka Konfigurasi</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        );
        })}
      </div>

      {/* Manual Token Dialog */}
      <Dialog open={!!showManualModal} onOpenChange={(open) => !open && setShowManualModal(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Key className="w-5 h-5 text-pink-500" />
              <span>Input Manual Token • {showManualModal}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Gunakan opsi ini jika Anda memiliki Access Token permanen atau token developer dari portal {showManualModal}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveManualToken} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Nama Akun / Handle</Label>
              <Input
                placeholder="Contoh: @zelviraofficialstore"
                value={manualAccountName}
                onChange={(e) => setManualAccountName(e.target.value)}
                className="rounded-xl text-xs h-10 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Account ID / User ID (Opsional)</Label>
              <Input
                placeholder="Contoh: 17841415885981301"
                value={manualAccountId}
                onChange={(e) => setManualAccountId(e.target.value)}
                className="rounded-xl text-xs h-10 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-rose-500">Access Token *</Label>
              <textarea
                placeholder="Tempel Access Token Anda di sini..."
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                rows={4}
                required
                className="w-full rounded-xl text-xs p-3 font-mono border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowManualModal(null)}
                className="rounded-xl text-xs font-bold"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingToken}
                className="rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white"
              >
                {isSubmittingToken ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  'Simpan & Hubungkan'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
