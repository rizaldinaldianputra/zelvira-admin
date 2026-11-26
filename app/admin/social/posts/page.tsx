'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  PlusSquare,
  Share2,
  Calendar as CalendarIcon,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Video,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Trash2,
  Eye,
  Smartphone,
  ExternalLink,
  Layers,
  Heart,
  MessageCircle,
  Bookmark,
  Music2,
  Hash,
  ShieldAlert,
  ShoppingBag,
  Package,
  X,
  Search,
  Upload,
  FileVideo,
  FileImage,
  ChevronLeft,
  ChevronRight,
  History,
  Check,
  Play,
  ArrowRight,
  Youtube,
  Instagram,
  Facebook,
  Twitter,
  Linkedin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { socialService } from '@/services/social.service';
import { ProductService } from '@/services/product.service';
import { FileUploadService } from '@/services/file-upload.service';
import { SocialAccount, SocialPost, SocialMediaType, SocialPostType, TikTokCreatorInfo, TikTokPublishStatusResult } from '@/types/social';
import { Product } from '@/types/product';
import { formatImageUrl } from '@/lib/url-utils';

const TikTokIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.84-4.49V8.72A8.17 8.17 0 0 0 20.35 10l.65-.02V6.69h-1.41z" />
  </svg>
);

type ActiveTab = 'POSTINGAN' | 'SCHEDULE' | 'RIWAYAT';

const AVAILABLE_PLATFORMS = [
  {
    id: 'TIKTOK',
    label: 'TikTok',
    bgActive: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-950 dark:text-cyan-100 border-2 border-cyan-500 ring-2 ring-cyan-400/30 shadow-xs',
    dot: 'bg-cyan-500',
  },
  {
    id: 'INSTAGRAM',
    label: 'Instagram',
    bgActive: 'bg-linear-to-r from-purple-500/15 via-pink-500/15 to-rose-500/15 dark:from-purple-950/50 dark:via-pink-950/50 dark:to-rose-950/50 text-pink-700 dark:text-pink-200 border-2 border-pink-500 ring-2 ring-pink-400/30 shadow-xs',
    dot: 'bg-pink-500',
  },
  {
    id: 'THREADS',
    label: 'Threads',
    bgActive: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-2 border-zinc-900 dark:border-white ring-2 ring-zinc-400/30 shadow-xs',
    dot: 'bg-zinc-900 dark:bg-white',
  },
  {
    id: 'LINKEDIN',
    label: 'LinkedIn',
    bgActive: 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 border-2 border-blue-600 ring-2 ring-blue-400/30 shadow-xs',
    dot: 'bg-blue-600',
  },
  {
    id: 'X',
    label: 'X (Twitter)',
    bgActive: 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 border-2 border-slate-500 dark:border-slate-400 ring-2 ring-slate-400/30 shadow-xs',
    dot: 'bg-slate-600 dark:bg-slate-300',
  },
  {
    id: 'FACEBOOK',
    label: 'Facebook',
    bgActive: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100 border-2 border-indigo-600 ring-2 ring-indigo-400/30 shadow-xs',
    dot: 'bg-indigo-600',
  },
  {
    id: 'YOUTUBE',
    label: 'YouTube',
    bgActive: 'bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-100 border-2 border-red-600 ring-2 ring-red-400/30 shadow-xs',
    dot: 'bg-red-600',
  },
];

// Helper to detect if a post should be routed to YouTube Shorts
const isShortsPost = (p?: { postType?: string | null; caption?: string | null }): boolean => {
  if (!p) return false;
  const pt = (p.postType || '').toUpperCase();
  if (pt === 'SHORTS' || pt === 'REEL' || pt === 'STORY') return true;
  if (p.caption && p.caption.toLowerCase().includes('#shorts')) return true;
  return false;
};

const getYouTubeLiveUrl = (videoId: string, p?: { postType?: string | null; caption?: string | null }): string => {
  return isShortsPost(p)
    ? `https://www.youtube.com/shorts/${videoId}`
    : `https://www.youtube.com/watch?v=${videoId}`;
};

export type CalendarPlatformKey = 'YOUTUBE' | 'INSTAGRAM' | 'THREADS' | 'TIKTOK' | 'LINKEDIN' | 'FACEBOOK' | 'X';

export interface CalendarPlatformConfig {
  key: CalendarPlatformKey;
  label: string;
  pillClass: string;
  icon: (cls?: string) => React.ReactNode;
}

const CALENDAR_PLATFORMS: CalendarPlatformConfig[] = [
  {
    key: 'YOUTUBE',
    label: 'YouTube (Video/Shorts)',
    pillClass: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border-red-200 dark:border-red-800/60 hover:bg-red-100',
    icon: (cls = 'w-3.5 h-3.5') => <Youtube className={`${cls} text-red-600 fill-red-600`} />,
  },
  {
    key: 'INSTAGRAM',
    label: 'Instagram',
    pillClass: 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-300 border-pink-200 dark:border-pink-800/60 hover:bg-pink-100',
    icon: (cls = 'w-3.5 h-3.5') => <Instagram className={`${cls} text-pink-600`} />,
  },
  {
    key: 'THREADS',
    label: 'Threads (Meta)',
    pillClass: 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200',
    icon: (cls = 'w-3.5 h-3.5') => <MessageCircle className={`${cls} text-zinc-900 dark:text-zinc-100`} />,
  },
  {
    key: 'TIKTOK',
    label: 'TikTok',
    pillClass: 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-cyan-300 border-slate-300 dark:border-cyan-800/60 hover:bg-slate-200',
    icon: (cls = 'w-3.5 h-3.5') => <TikTokIcon className={`${cls} text-slate-900 dark:text-cyan-400`} />,
  },
  {
    key: 'LINKEDIN',
    label: 'LinkedIn',
    pillClass: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300 border-sky-200 dark:border-sky-800/60 hover:bg-sky-100',
    icon: (cls = 'w-3.5 h-3.5') => <Linkedin className={`${cls} text-sky-600`} />,
  },
  {
    key: 'FACEBOOK',
    label: 'Facebook',
    pillClass: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800/60 hover:bg-blue-100',
    icon: (cls = 'w-3.5 h-3.5') => <Facebook className={`${cls} text-blue-600`} />,
  },
  {
    key: 'X',
    label: 'X (Twitter)',
    pillClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200',
    icon: (cls = 'w-3.5 h-3.5') => <Twitter className={`${cls} text-slate-600 dark:text-slate-300`} />,
  },
];

const postMatchesCalendarPlatform = (post: SocialPost, platKey: CalendarPlatformKey): boolean => {
  const rawPlatforms = post.targetPlatforms
    ? post.targetPlatforms.split(',').map((p) => p.trim().toUpperCase())
    : [];

  if (platKey === 'YOUTUBE') {
    return rawPlatforms.includes('YOUTUBE') || !!post.youtubeVideoId;
  }
  if (platKey === 'INSTAGRAM') {
    return rawPlatforms.includes('INSTAGRAM');
  }
  if (platKey === 'THREADS') {
    return rawPlatforms.includes('THREADS') || !!post.threadsMediaId;
  }
  if (platKey === 'TIKTOK') {
    return rawPlatforms.includes('TIKTOK');
  }
  if (platKey === 'LINKEDIN') {
    return rawPlatforms.includes('LINKEDIN') || !!post.linkedinPostUrn;
  }
  if (platKey === 'FACEBOOK') {
    return rawPlatforms.includes('FACEBOOK') || !!post.facebookPostId;
  }
  if (platKey === 'X') {
    return rawPlatforms.includes('X') || rawPlatforms.includes('TWITTER');
  }
  return false;
};

export default function SocialPostsPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('POSTINGAN');

  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [filterPlatform, setFilterPlatform] = useState<string>('ALL');

  // Direct Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Composer Form states
  const [selectedProductId, setSelectedProductId] = useState<number | undefined>(undefined);
  const [caption, setCaption] = useState('');
  const [title, setTitle] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['TIKTOK']);
  const [postType, setPostType] = useState<SocialPostType>('FEED');
  const [mediaType, setMediaType] = useState<SocialMediaType>('VIDEO');
  const [mediaUrl, setMediaUrl] = useState('');
  const [privacyLevel, setPrivacyLevel] = useState('PUBLIC_TO_EVERYONE');
  const [tiktokPostMode, setTiktokPostMode] = useState<'DIRECT_POST' | 'MEDIA_UPLOAD'>('DIRECT_POST');
  const [tiktokCreatorInfo, setTiktokCreatorInfo] = useState<TikTokCreatorInfo | null>(null);
  const [isLoadingTikTokCreator, setIsLoadingTikTokCreator] = useState(false);
  const [checkingTikTokPublishId, setCheckingTikTokPublishId] = useState<string | null>(null);
  const [tikTokStatusMap, setTikTokStatusMap] = useState<Record<string, TikTokPublishStatusResult>>({});

  // Scheduling options
  const [publishTiming, setPublishTiming] = useState<'NOW' | 'SCHEDULE'>('NOW');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('18:00');

  // Product Catalog Picker states
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');

  // Preview Mode
  const [previewPlatform, setPreviewPlatform] = useState<string>('TIKTOK');

  // Calendar states
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarPosts, setCalendarPosts] = useState<SocialPost[]>([]);
  const [selectedCalendarPost, setSelectedCalendarPost] = useState<SocialPost | null>(null);
  const [platformDialog, setPlatformDialog] = useState<{
    platform: CalendarPlatformKey;
    label: string;
    dateStr: string;
    formattedDate: string;
    posts: SocialPost[];
  } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [accountsData, postsData] = await Promise.all([
        socialService.getAccounts(),
        socialService.getPosts('ALL', filterPlatform),
      ]);
      setAccounts(accountsData || []);
      setPosts(postsData || []);

      const ttAccount = (accountsData || []).find(
        (a) => a.platform === 'TIKTOK' && a.isActive && a.hasToken
      );
      if (ttAccount) {
        setIsLoadingTikTokCreator(true);
        socialService
          .getTikTokCreatorInfo()
          .then((info) => {
            setTiktokCreatorInfo(info);
            if (info?.privacyLevelOptions?.length) {
              setPrivacyLevel((prev) =>
                info.privacyLevelOptions.includes(prev) ? prev : info.privacyLevelOptions[0]
              );
            }
          })
          .catch(() => {
            setTiktokCreatorInfo(null);
          })
          .finally(() => setIsLoadingTikTokCreator(false));
      } else {
        setTiktokCreatorInfo(null);
      }
    } catch (err: any) {
      console.error('Error fetching social posts data', err);
      toast({
        title: 'Gagal Memuat Data',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCalendarData = async () => {
    try {
      const year = calendarDate.getFullYear();
      const month = calendarDate.getMonth();
      const start = new Date(year, month - 1, 1).toISOString();
      const end = new Date(year, month + 2, 0).toISOString();
      const data = await socialService.getCalendarPosts(start, end);
      setCalendarPosts(data || []);
    } catch (err: any) {
      console.error('Error fetching calendar data', err);
    }
  };

  useEffect(() => {
    loadData();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlType = params.get('type');
      if (urlType === 'STORY' || urlType === 'REEL' || urlType === 'FEED') {
        setPostType(urlType as SocialPostType);
      }
      const urlTab = params.get('tab');
      if (urlTab === 'POSTINGAN' || urlTab === 'SCHEDULE' || urlTab === 'RIWAYAT') {
        setActiveTab(urlTab as ActiveTab);
      }
    }
  }, [filterPlatform]);

  useEffect(() => {
    if (activeTab === 'SCHEDULE') {
      loadCalendarData();
    }
  }, [activeTab, calendarDate]);

  // Direct File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: max 100MB
    const maxBytes = 100 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast({
        title: 'Ukuran File Terlalu Besar',
        description: 'Maksimal ukuran file media adalah 100MB.',
        variant: 'destructive',
      });
      return;
    }

    const isVid = file.type.startsWith('video/') || file.name.match(/\.(mp4|mov|webm)$/i);
    setMediaType(isVid ? 'VIDEO' : 'IMAGE');
    setUploadedFileName(file.name);
    setIsUploading(true);

    try {
      const uploadedUrl = await FileUploadService.upload(file);
      setMediaUrl(uploadedUrl);
      toast({
        title: 'Media Berhasil Diunggah!',
        description: `${file.name} siap digunakan untuk publikasi.`,
      });
    } catch (err: any) {
      console.error('File upload error', err);
      toast({
        title: 'Gagal Mengunggah Media',
        description: err.message || 'Pastikan format file didukung (.mp4, .mov, .jpg, .png)',
        variant: 'destructive',
      });
      setUploadedFileName(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveMedia = () => {
    setMediaUrl('');
    setUploadedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const loadCatalogProducts = async () => {
    setIsLoadingCatalog(true);
    try {
      const res = await ProductService.getAll();
      setCatalogProducts(res.content || []);
    } catch (err: any) {
      toast({
        title: 'Gagal Memuat Katalog',
        description: err.message || 'Tidak dapat mengambil data produk.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  const handleOpenProductPicker = () => {
    setShowProductPicker(true);
    if (catalogProducts.length === 0) {
      loadCatalogProducts();
    }
  };

  const handleSelectProduct = (product: Product) => {
    let img: string | null = null;
    if (product.imageUrl) img = formatImageUrl(product.imageUrl);
    else if (product.images && product.images.length > 0) {
      const first = product.images[0];
      const url = typeof first === 'string' ? first : (first as any)?.url || (first as any)?.imageUrl;
      if (url) img = formatImageUrl(url);
    } else if (product.variants && product.variants.length > 0) {
      const vWithImg = product.variants.find((v) => v.imageUrl);
      if (vWithImg?.imageUrl) img = formatImageUrl(vWithImg.imageUrl);
    }

    if (img) {
      setMediaUrl(img);
      setMediaType('IMAGE');
      setUploadedFileName(product.name);
    }

    const priceText = product.price ? `Rp ${Number(product.price).toLocaleString('id-ID')}` : '';
    const newCaption = `✨ ${product.name} ${priceText ? `\n💰 ${priceText}` : ''}\n\nKoleksi eksklusif terbaru dari Zelvira! Bahan premium & nyaman dipakai harian.\n\nBelanja sekarang di Zelvira Official Store!\n#zelvira #ootd #fashionstyle #racuntiktok`;

    setSelectedProductId(product.id);
    setTitle(product.name);
    setCaption(newCaption);
    setShowProductPicker(false);

    toast({
      title: 'Produk Terpilih!',
      description: `${product.name} berhasil diintegrasikan ke Post Composer.`,
    });
  };

  const togglePlatform = (p: string) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const addHashtag = (tag: string) => {
    setCaption((prev) => (prev ? `${prev} ${tag}` : tag));
  };

  const handleCreatePost = async (asDraft: boolean = false) => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: 'Pilih Minimal 1 Kanal',
        description: 'Tentukan saluran media sosial tujuan.',
        variant: 'destructive',
      });
      return;
    }

    if (!caption.trim()) {
      toast({
        title: 'Caption Wajib Diisi',
        description: 'Tuliskan deskripsi atau caption untuk postingan Anda.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedPlatforms.includes('YOUTUBE')) {
      if (mediaType === 'IMAGE') {
        toast({
          title: 'YouTube Tidak Mendukung Format Foto',
          description: 'YouTube hanya menerima file Video (.mp4). Untuk upload foto Story/Status, silakan hapus centang YouTube (gunakan Instagram / Facebook), atau ganti format media menjadi Video MP4.',
          variant: 'destructive',
        });
        return;
      }
      if (!mediaUrl.trim()) {
        toast({
          title: 'File Video YouTube Wajib Diunggah',
          description: 'Silakan lampirkan file video MP4 untuk YouTube.',
          variant: 'destructive',
        });
        return;
      }
    }

    let finalScheduledAt: string | undefined = undefined;
    if (publishTiming === 'SCHEDULE' && !asDraft) {
      if (!scheduledDate) {
        toast({
          title: 'Tanggal Jadwal Belum Dipilih',
          description: 'Pilih tanggal publikasi yang diinginkan.',
          variant: 'destructive',
        });
        return;
      }
      finalScheduledAt = `${scheduledDate}T${scheduledTime || '00:00'}:00`;
    }

    setIsSubmitting(true);
    try {
      await socialService.createPost({
        productId: selectedProductId,
        title: title.trim() || undefined,
        caption: caption.trim(),
        mediaType,
        mediaUrls: mediaUrl.trim() || undefined,
        thumbnailUrl: mediaType === "IMAGE" ? (mediaUrl.trim() || undefined) : undefined,
        targetPlatforms: selectedPlatforms.join(','),
        postType,
        status: asDraft ? 'DRAFT' : (publishTiming === 'SCHEDULE' ? 'SCHEDULED' : 'PUBLISHED'),
        scheduledAt: finalScheduledAt,
        privacyLevel,
        tiktokPostMode: selectedPlatforms.includes('TIKTOK') ? tiktokPostMode : undefined,
        publishNow: publishTiming === 'NOW' && !asDraft,
      });

      toast({
        title: asDraft ? 'Draf Disimpan!' : (publishTiming === 'NOW' ? 'Postingan Dipublikasikan!' : 'Jadwal Berhasil Dibuat!'),
        description: asDraft ? 'Postingan tersimpan di draf.' : 'Postingan berhasil diproses ke platform tujuan.',
      });

      // Reset Form
      setSelectedProductId(undefined);
      setCaption('');
      setTitle('');
      setMediaUrl('');
      setUploadedFileName(null);
      loadData();
      if (publishTiming === 'SCHEDULE') {
        setActiveTab('SCHEDULE');
      }
    } catch (err: any) {
      toast({
        title: 'Gagal Membuat Postingan',
        description: err.message || 'Terjadi kesalahan sistem',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishNow = async (id: number) => {
    try {
      await socialService.publishPostNow(id);
      toast({
        title: 'Mempublikasikan Postingan',
        description: 'Postingan sedang dikirimkan ke platform media sosial.',
      });
      loadData();
      if (activeTab === 'SCHEDULE') loadCalendarData();
    } catch (err: any) {
      toast({
        title: 'Gagal Publikasi',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeletePost = async (id: number) => {
    if (!confirm('Yakin ingin menghapus postingan ini?')) return;
    try {
      await socialService.deletePost(id);
      toast({
        title: 'Post Terhapus',
        description: 'Postingan berhasil dihapus.',
      });
      loadData();
      if (activeTab === 'SCHEDULE') loadCalendarData();
      setSelectedCalendarPost(null);
    } catch (err: any) {
      toast({
        title: 'Gagal Menghapus Post',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const handleCheckTikTokStatus = async (publishId: string) => {
    setCheckingTikTokPublishId(publishId);
    try {
      const statusRes = await socialService.checkTikTokStatus(publishId);
      setTikTokStatusMap((prev) => ({ ...prev, [publishId]: statusRes }));
      toast({
        title: `Status TikTok: ${statusRes.status}`,
        description: statusRes.message || statusRes.failReason || 'Status publikasi TikTok diperbarui.',
        variant: statusRes.status === 'FAILED' ? 'destructive' : 'default',
      });
      loadData();
    } catch (err: any) {
      toast({
        title: 'Gagal Cek Status TikTok',
        description: err.message || 'Tidak dapat memeriksa status TikTok.',
        variant: 'destructive',
      });
    } finally {
      setCheckingTikTokPublishId(null);
    }
  };

  // Lists filtered by tab
  const activeAndDraftPosts = posts.filter(p => p.status === 'DRAFT' || p.status === 'PUBLISHING');
  const scheduledPosts = posts.filter(p => p.status === 'SCHEDULED');
  const historyPosts = posts.filter(p => p.status === 'PUBLISHED' || p.status === 'FAILED');

  // Calendar Math
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    calendarDays.push({
      day: d,
      isCurrentMonth: false,
      dateString: `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    calendarDays.push({
      day: d,
      isCurrentMonth: true,
      dateString: `${year}-${monthStr}-${dayStr}`,
    });
  }
  const remainingCells = (7 - (calendarDays.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonth = month === 11 ? 1 : month + 2;
    const nextYear = month === 11 ? year + 1 : year;
    calendarDays.push({
      day: d,
      isCurrentMonth: false,
      dateString: `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    });
  }

  const postsByDate: Record<string, SocialPost[]> = {};
  calendarPosts.forEach((p) => {
    const dateSource = p.scheduledAt || p.publishedAt || p.createdAt;
    if (dateSource) {
      const dateKey = dateSource.split('T')[0];
      if (!postsByDate[dateKey]) postsByDate[dateKey] = [];
      postsByDate[dateKey].push(p);
    }
  });

  const isVideoMedia = (p: SocialPost): boolean => {
    if (p.mediaType === 'VIDEO') return true;
    if (p.postType === 'REEL') return true;
    const url = (p.thumbnailUrl || p.mediaUrls || '').toLowerCase();
    return url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.webm') || url.includes('.mp4');
  };

  const renderPostThumbnail = (p: SocialPost, sizeClass = 'w-14 h-14') => {
    if (isVideoMedia(p)) {
      return (
        <div className={`${sizeClass} rounded-xl bg-slate-900 dark:bg-black text-white shrink-0 flex flex-col items-center justify-center border border-slate-700/80 shadow-inner group select-none`}>
          <Video className="w-5 h-5 text-pink-400 group-hover:scale-110 transition-transform" />
          <span className="text-[8px] font-black tracking-widest text-slate-400 mt-0.5">VIDEO</span>
        </div>
      );
    }
    const imgSrc = p.thumbnailUrl || p.mediaUrls?.split(',')[0];
    if (imgSrc) {
      return (
        <div className={`${sizeClass} rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200 dark:border-white/10`}>
          <img src={imgSrc} alt="Thumb" className="w-full h-full object-cover" />
        </div>
      );
    }
    return (
      <div className={`${sizeClass} rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200 dark:border-white/10`}>
        <ImageIcon className="w-5 h-5 text-slate-400" />
      </div>
    );
  };

  const renderPlatformIcon = (platform: string, sizeClass = 'w-3.5 h-3.5') => {
    const p = platform.trim().toUpperCase();
    if (p === 'YOUTUBE') return <Youtube className={`${sizeClass} text-red-500`} />;
    if (p === 'INSTAGRAM') return <Instagram className={`${sizeClass} text-pink-500`} />;
    if (p === 'THREADS') return <MessageCircle className={`${sizeClass} text-zinc-900 dark:text-zinc-100`} />;
    if (p === 'TIKTOK') return <TikTokIcon className={`${sizeClass} text-cyan-400`} />;
    if (p === 'LINKEDIN') return <Linkedin className={`${sizeClass} text-sky-500`} />;
    if (p === 'FACEBOOK') return <Facebook className={`${sizeClass} text-blue-500`} />;
    if (p === 'X') return <Twitter className={`${sizeClass} text-slate-300`} />;
    return <Video className={`${sizeClass} text-slate-400`} />;
  };

  const renderCalendarPostIconBadge = (post: SocialPost) => {
    const rawPlatforms = post.targetPlatforms ? post.targetPlatforms.split(',').map((p) => p.trim()) : ['TIKTOK'];
    const isYt = rawPlatforms.includes('YOUTUBE') || !!post.youtubeVideoId;
    const isShorts = post.postType === 'SHORTS' || post.postType === 'REEL' || (post.caption && post.caption.toLowerCase().includes('#shorts'));
    const isPublished = post.status === 'PUBLISHED';
    const isFailed = post.status === 'FAILED';

    return (
      <button
        key={post.id}
        type="button"
        onClick={() => setSelectedCalendarPost(post)}
        className="group/badge inline-flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs font-bold transition-all hover:scale-110 active:scale-95 shadow-xs cursor-pointer select-none bg-slate-900 text-white dark:bg-slate-800 border border-slate-700/80 hover:border-pink-500"
        title={`${rawPlatforms.join(', ')} • ${isYt ? (isShorts ? 'YouTube Shorts' : 'YouTube Video') : (post.postType || 'FEED')} • Status: ${post.status}\nKlik untuk melihat detail`}
      >
        <div className="flex items-center gap-1">
          {rawPlatforms.map((plt) => {
            const p = plt.toUpperCase();
            if (p === 'YOUTUBE') {
              return (
                <span
                  key={plt}
                  className="flex items-center gap-0.5 text-red-500 font-extrabold"
                  title={isShorts ? 'YouTube Shorts' : 'YouTube Video'}
                >
                  <Youtube className="w-3.5 h-3.5 fill-red-600 text-white" />
                  {isShorts && (
                    <span className="text-[8px] bg-red-600 text-white px-1 rounded font-black tracking-tight leading-tight">
                      Shorts
                    </span>
                  )}
                </span>
              );
            }
            if (p === 'INSTAGRAM') {
              return (
                <span key={plt} className="text-pink-400" title="Instagram">
                  <Instagram className="w-3.5 h-3.5" />
                </span>
              );
            }
            if (p === 'THREADS') {
              return (
                <span key={plt} className="text-zinc-200" title="Threads (Meta)">
                  <MessageCircle className="w-3.5 h-3.5" />
                </span>
              );
            }
            if (p === 'TIKTOK') {
              return (
                <span key={plt} className="text-cyan-300" title="TikTok">
                  <TikTokIcon className="w-3 h-3" />
                </span>
              );
            }
            if (p === 'LINKEDIN') {
              return (
                <span key={plt} className="text-sky-400" title="LinkedIn">
                  <Linkedin className="w-3.5 h-3.5" />
                </span>
              );
            }
            if (p === 'FACEBOOK') {
              return (
                <span key={plt} className="text-blue-400" title="Facebook">
                  <Facebook className="w-3.5 h-3.5" />
                </span>
              );
            }
            if (p === 'X') {
              return (
                <span key={plt} className="text-slate-300" title="X (Twitter)">
                  <Twitter className="w-3.5 h-3.5" />
                </span>
              );
            }
            return <Video key={plt} className="w-3.5 h-3.5 text-slate-300" />;
          })}
        </div>

        {/* Small Status Dot */}
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${isPublished
              ? 'bg-emerald-400 ring-1 ring-emerald-300'
              : isFailed
                ? 'bg-rose-500'
                : 'bg-cyan-400'
            }`}
        />
      </button>
    );
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredCatalog = catalogProducts.filter((p) =>
    !catalogSearch.trim() ||
    p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(catalogSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-cyan-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
              <PlusSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Social Content Hub
                </h1>
                <Badge variant="outline" className="border-pink-300 text-pink-600 bg-pink-50 text-[10px] font-bold">
                  Multi-Channel
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Posting langsung, penjadwalan kalender interaktif, dan riwayat tayang ke TikTok, Instagram, LinkedIn, X, Facebook, & YouTube.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/settings?tab=social">
            <Button variant="outline" className="rounded-xl border-slate-200 dark:border-white/10 text-xs font-bold gap-2">
              <Share2 className="w-3.5 h-3.5 text-pink-500" />
              Kelola Akun Sosial ({accounts.filter(a => a.isActive && a.hasToken).length} Terhubung)
            </Button>
          </Link>
          <Button
            onClick={loadData}
            variant="ghost"
            size="icon"
            className="rounded-xl h-9 w-9 text-slate-400 hover:text-slate-600"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* 3 Core Tabs Navigation (Postingan, Schedule, Riwayat Postingan) */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
        <div className="flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('POSTINGAN')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${activeTab === 'POSTINGAN'
                ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border-2 border-pink-500 dark:border-pink-500 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
          >
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span>Postingan & Composer</span>
            {activeAndDraftPosts.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-pink-500/20 text-pink-500 font-mono">
                {activeAndDraftPosts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('SCHEDULE')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${activeTab === 'SCHEDULE'
                ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-2 border-purple-500 dark:border-purple-500 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
          >
            <CalendarIcon className="w-4 h-4 text-purple-500" />
            <span>Schedule & Kalender</span>
            {scheduledPosts.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-purple-500/20 text-purple-500 font-mono">
                {scheduledPosts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('RIWAYAT')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${activeTab === 'RIWAYAT'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-500 dark:border-emerald-500 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
          >
            <History className="w-4 h-4 text-emerald-500" />
            <span>Riwayat Postingan</span>
            {historyPosts.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-emerald-500/20 text-emerald-500 font-mono">
                {historyPosts.length}
              </span>
            )}
          </button>
        </div>

        {/* Global Platform Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 hidden sm:inline font-bold">Kanal:</span>
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="text-xs p-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 font-bold"
          >
            <option value="ALL">Semua Kanal</option>
            <option value="TIKTOK">TikTok</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="THREADS">Threads (Meta)</option>
            <option value="FACEBOOK">Facebook</option>
            <option value="LINKEDIN">LinkedIn</option>
            <option value="X">X (Twitter)</option>
            <option value="YOUTUBE">YouTube</option>
          </select>
        </div>
      </div>

      {/* ==============================================================
          TAB 1: POSTINGAN (STUDIO COMPOSER + DIRECT UPLOAD + MOCKUP)
          ============================================================== */}
      {activeTab === 'POSTINGAN' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Composer (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <Card className="border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-pink-500" />
                    <span className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Content Creator Studio
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleOpenProductPicker}
                    className="rounded-xl border-pink-200 text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/20 text-xs font-bold gap-1.5 h-7"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Pilih Produk dari API
                  </Button>
                </div>

                <CardContent className="p-5 space-y-4">
                  {/* 1. Multi-Platform Selection */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Pilih Saluran Media Sosial (Bisa Multi-Channel):
                      </Label>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {selectedPlatforms.length} Terpilih
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {AVAILABLE_PLATFORMS.map((platform) => {
                        const isSelected = selectedPlatforms.includes(platform.id);
                        const acc = accounts.find((a) => a.platform === platform.id && a.isActive && a.hasToken);

                        return (
                          <button
                            key={platform.id}
                            type="button"
                            onClick={() => {
                              togglePlatform(platform.id);
                              setPreviewPlatform(platform.id);
                            }}
                            className={`p-2.5 rounded-xl text-left border text-xs font-bold transition-all flex flex-col justify-between h-16 ${isSelected
                                ? platform.bgActive
                                : 'bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                              }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="truncate">{platform.label}</span>
                              <span className={`w-2 h-2 rounded-full ${isSelected ? platform.dot : 'bg-slate-300'}`} />
                            </div>
                            <span className="text-[10px] opacity-80 font-normal truncate">
                              {acc ? `@${acc.accountName}` : 'Belum Konek'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Format Konten & Tipe Posting (Column Layout) */}
                  <div className="flex flex-col gap-4 pt-1">
                    {/* Format Konten */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Format Konten</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setMediaType('VIDEO')}
                          className={`rounded-xl text-xs font-bold gap-2 h-10 transition-all ${mediaType === 'VIDEO'
                              ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border-2 border-pink-500 ring-2 ring-pink-400/20 shadow-xs'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-pink-300 hover:text-pink-600'
                            }`}
                        >
                          <Video className="w-4 h-4 text-pink-500" /> Video Vertikal / MP4
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setMediaType('IMAGE')}
                          className={`rounded-xl text-xs font-bold gap-2 h-10 transition-all ${mediaType === 'IMAGE'
                              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-2 border-blue-500 ring-2 ring-blue-400/20 shadow-xs'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-blue-300 hover:text-blue-600'
                            }`}
                        >
                          <ImageIcon className="w-4 h-4 text-blue-500" /> Foto / Feed
                        </Button>
                      </div>
                    </div>

                    {/* Tipe Posting (Disesuaikan khusus YouTube & Multi-Platform) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {selectedPlatforms.includes('YOUTUBE') ? 'Format Konten YouTube & Media Sosial' : 'Tipe Posting'}
                        </Label>
                        {selectedPlatforms.includes('YOUTUBE') && (
                          <span className="text-[10px] text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                            <Youtube className="w-3.5 h-3.5" />
                            {postType === 'SHORTS' || postType === 'REEL'
                              ? 'Mode YouTube Shorts'
                              : postType === 'STORY'
                                ? 'Mode YouTube Shorts (Status Vertikal)'
                                : 'Mode YouTube Video Reguler'}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPostType('SHORTS');
                            setMediaType('VIDEO');
                          }}
                          className={`rounded-xl text-xs font-bold gap-1.5 h-11 transition-all ${postType === 'SHORTS' || postType === 'REEL'
                              ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-2 border-red-500 ring-2 ring-red-400/20 shadow-xs'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-red-300'
                            }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-red-500" />
                          <div className="text-left">
                            <span className="block font-bold">Shorts / Reels</span>
                            <span className="block text-[9px] opacity-75 font-normal">Vertikal (9:16) ≤ 60 dtk</span>
                          </div>
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPostType('FEED');
                            if (selectedPlatforms.includes('YOUTUBE')) setMediaType('VIDEO');
                          }}
                          className={`rounded-xl text-xs font-bold gap-1.5 h-11 transition-all ${postType === 'FEED' || postType === 'VIDEO'
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-2 border-indigo-500 ring-2 ring-indigo-400/20 shadow-xs'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-indigo-300'
                            }`}
                        >
                          <Video className="w-3.5 h-3.5 text-indigo-500" />
                          <div className="text-left">
                            <span className="block font-bold">
                              {selectedPlatforms.includes('YOUTUBE') ? 'YouTube Video' : 'Feed Reguler'}
                            </span>
                            <span className="block text-[9px] opacity-75 font-normal">
                              {selectedPlatforms.includes('YOUTUBE') ? 'Horizontal (16:9) Bebas' : 'Postingan Feed Utama'}
                            </span>
                          </div>
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPostType('STORY');
                            if (selectedPlatforms.includes('YOUTUBE') && mediaType === 'IMAGE') {
                              toast({
                                title: 'Status di YouTube Memerlukan Video',
                                description: 'YouTube tidak memiliki fitur Story foto. Jika memilih YouTube, gunakan file video vertikal (.mp4) untuk Shorts.',
                              });
                            }
                          }}
                          className={`rounded-xl text-xs font-bold gap-1.5 h-11 transition-all ${postType === 'STORY'
                              ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-2 border-purple-500 ring-2 ring-purple-400/20 shadow-xs'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-purple-300'
                            }`}
                        >
                          <Clock className="w-3.5 h-3.5 text-purple-500" />
                          <div className="text-left">
                            <span className="block font-bold">Status / Story</span>
                            <span className="block text-[9px] opacity-75 font-normal">
                              {selectedPlatforms.includes('YOUTUBE') ? 'Kanal IG / Shorts' : 'Kanal Instagram/Status'}
                            </span>
                          </div>
                        </Button>
                      </div>

                      {/* Warning when YouTube + STORY + IMAGE */}
                      {selectedPlatforms.includes('YOUTUBE') && postType === 'STORY' && mediaType === 'IMAGE' && (
                        <div className="mt-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-900/50 text-xs text-red-800 dark:text-red-300 flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <div className="leading-relaxed">
                            <strong>Perhatian YouTube:</strong> YouTube resmi menonaktifkan fitur Story foto. Jika memilih YouTube untuk Status/Story, konten akan diunggah sebagai <strong>YouTube Shorts</strong> sehingga file <strong>WAJIB berupa Video Vertikal (.mp4)</strong>. Jika ingin mengunggah foto Story, silakan <strong>hapus centang kanal YouTube</strong> (gunakan Instagram/Facebook saja).
                          </div>
                        </div>
                      )}

                      {/* YouTube Title Input */}
                      {selectedPlatforms.includes('YOUTUBE') && (
                        <div className="mt-2.5 p-3 rounded-xl bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold text-red-900 dark:text-red-300 flex items-center gap-1.5">
                              <Youtube className="w-3.5 h-3.5 text-red-600" />
                              Judul Video YouTube (Title)
                            </Label>
                            <span className="text-[10px] font-mono text-red-700 dark:text-red-400">
                              {title.length}/100
                            </span>
                          </div>
                          <Input
                            value={title}
                            maxLength={100}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={
                              postType === 'SHORTS' || postType === 'REEL' || postType === 'STORY'
                                ? 'Judul Shorts (cth: OOTD Casual Fashion Zelvira 2026)'
                                : 'Judul Video YouTube (cth: Review & Fashion Show Koleksi Zelvira)'
                            }
                            className="text-xs h-9 bg-white dark:bg-slate-900 border-red-200 dark:border-red-900/60"
                          />
                          <p className="text-[10px] text-red-700 dark:text-red-400 leading-relaxed">
                            {postType === 'SHORTS' || postType === 'REEL'
                              ? '💡 Tag #Shorts akan otomatis disertakan ke judul dan deskripsi video YouTube.'
                              : '💡 Judul ini akan menjadi headline utama video di kanal YouTube Anda.'}
                          </p>
                        </div>
                      )}

                      {/* YouTube Guidelines Banner */}
                      {selectedPlatforms.includes('YOUTUBE') && (
                        <div className="mt-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Ketentuan YouTube Agar Masuk ke Tab Shorts & Live:</span>
                          </div>
                          <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800 dark:text-amber-400 pl-1 leading-relaxed">
                            <li><strong>YouTube Shorts</strong>: Video <strong>WAJIB Vertikal (rasio 9:16)</strong> atau Kotak (1:1) dengan durasi <strong>≤ 60 detik</strong>. Jika mengunggah video landscape (16:9), YouTube otomatis memasukkannya ke tab Video biasa.</li>
                            <li><strong>Waktu Pemrosesan</strong>: Video yang baru berhasil diupload butuh waktu 1–5 menit untuk diproses resolusinya oleh YouTube sebelum tampil di beranda channel.</li>
                            <li><strong>Status Privasi</strong>: Jika OAuth Google masih status <em>Testing / Unverified</em>, video otomatis dikunci sebagai <strong>Private</strong> oleh YouTube. Anda dapat memeriksanya di <strong>studio.youtube.com</strong>.</li>
                          </ul>
                        </div>
                      )}

                      {/* TikTok Content Posting API Controls */}
                      {selectedPlatforms.includes('TIKTOK') && (
                        <div className="mt-2.5 p-3.5 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900/50 text-xs space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                              <span className="p-1 rounded-md bg-slate-900 text-cyan-400">
                                <TikTokIcon className="w-3.5 h-3.5" />
                              </span>
                              <span>Pengaturan TikTok Content Posting API</span>
                            </div>
                            {isLoadingTikTokCreator ? (
                              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                <RefreshCw className="w-3 h-3 animate-spin" /> Mengecek creator info...
                              </span>
                            ) : tiktokCreatorInfo?.connected ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                <CheckCircle2 className="w-3 h-3" />
                                {tiktokCreatorInfo.creatorUsername
                                  ? `@${tiktokCreatorInfo.creatorUsername}`
                                  : tiktokCreatorInfo.accountName || 'Terhubung'}
                                {tiktokCreatorInfo.isSandboxRestricted ? ' (Sandbox)' : ''}
                              </span>
                            ) : (
                              <Link
                                href="/admin/settings?tab=social"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors"
                              >
                                <ShieldAlert className="w-3 h-3" /> Hubungkan TikTok di Settings
                              </Link>
                            )}
                          </div>

                          {/* Post Mode Selector */}
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                              Mode Pengiriman TikTok
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setTiktokPostMode('DIRECT_POST')}
                                className={`text-left p-2.5 rounded-lg border transition-all ${
                                  tiktokPostMode === 'DIRECT_POST'
                                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-cyan-600 dark:border-cyan-500 shadow-xs'
                                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-cyan-400'
                                }`}
                              >
                                <div className="text-xs font-bold">Direct Post (`video.publish`)</div>
                                <div className={`text-[10px] mt-0.5 ${tiktokPostMode === 'DIRECT_POST' ? 'text-cyan-200' : 'text-slate-500'}`}>
                                  Terbit langsung ke akun TikTok
                                </div>
                              </button>
                              <button
                                type="button"
                                onClick={() => setTiktokPostMode('MEDIA_UPLOAD')}
                                className={`text-left p-2.5 rounded-lg border transition-all ${
                                  tiktokPostMode === 'MEDIA_UPLOAD'
                                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-cyan-600 dark:border-cyan-500 shadow-xs'
                                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-cyan-400'
                                }`}
                              >
                                <div className="text-xs font-bold">Draf / Kotak Masuk (`video.upload`)</div>
                                <div className={`text-[10px] mt-0.5 ${tiktokPostMode === 'MEDIA_UPLOAD' ? 'text-cyan-200' : 'text-slate-500'}`}>
                                  Kirim ke notifikasi TikTok App untuk diedit
                                </div>
                              </button>
                            </div>
                          </div>

                          {/* Privacy Level (Required for Direct Post) */}
                          {tiktokPostMode === 'DIRECT_POST' && (
                            <div className="space-y-1.5">
                              <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                Visibilitas / Privasi Direct Post
                              </Label>
                              <div className="flex flex-wrap gap-1.5">
                                {(
                                  [
                                    { value: 'SELF_ONLY', label: 'Hanya Saya (Privat / Sandbox)' },
                                    { value: 'PUBLIC_TO_EVERYONE', label: 'Publik (Semua Orang)' },
                                    { value: 'MUTUAL_FOLLOW_FRIENDS', label: 'Teman Saling Ikuti' },
                                    { value: 'FOLLOWER_OF_CREATOR', label: 'Pengikut' },
                                  ] as const
                                ).map((opt) => {
                                  const allowed =
                                    !tiktokCreatorInfo?.privacyLevelOptions?.length ||
                                    tiktokCreatorInfo.privacyLevelOptions.includes(opt.value);
                                  const selected = privacyLevel === opt.value;
                                  return (
                                    <button
                                      key={opt.value}
                                      type="button"
                                      disabled={!allowed}
                                      onClick={() => setPrivacyLevel(opt.value)}
                                      className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                                        selected
                                          ? 'bg-cyan-600 text-white border-cyan-600'
                                          : allowed
                                          ? 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-cyan-400'
                                          : 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed line-through'
                                      }`}
                                      title={
                                        allowed
                                          ? opt.label
                                          : 'Belum diizinkan saat aplikasi masih dalam mode Sandbox / belum diaudit TikTok'
                                      }
                                    >
                                      {opt.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div className="text-[11px] text-cyan-900 dark:text-cyan-200 leading-relaxed space-y-1 bg-white/70 dark:bg-slate-900/50 rounded-lg p-2.5 border border-cyan-200/70 dark:border-cyan-900/40">
                            <p>
                              • <strong>Aturan Mode Sandbox / Unaudited:</strong> Selama app belum diaudit TikTok, Direct Post membatasi privasi ke <strong>SELF_ONLY</strong> (backend otomatis fallback ke <code>SELF_ONLY</code> jika ditolak) dan <strong>akun TikTok target di HP wajib diset ke Akun Privat (Private Account)</strong>.
                            </p>
                            <p>
                              • <strong>Video (MP4/WebM):</strong> Diunggah langsung via chunked <code>FILE_UPLOAD</code> ke TikTok tanpa perlu verifikasi domain URL.
                            </p>
                            <p>
                              • <strong>Foto / Carousel:</strong> Gambar otomatis dikonversi ke JPEG & dikirim via <code>PULL_FROM_URL</code> (wajib verifikasi domain/prefix <code>https://s3.zelvira.co.id/</code> di Portal TikTok).
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. DIRECT FILE UPLOAD (NO URL INPUT) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-pink-500" />
                        Unggah Media Langsung (Video / Foto)
                      </Label>
                      <span className="text-[10px] text-slate-400">Max 100MB (.mp4, .mov, .jpg, .png)</span>
                    </div>

                    {/* Hidden Native File Input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="video/mp4,video/quicktime,video/webm,image/jpeg,image/png,image/webp"
                      className="hidden"
                    />

                    {/* Upload Dropzone or Uploaded Preview */}
                    {!mediaUrl ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer group ${isUploading
                            ? 'border-pink-500 bg-pink-50/50 dark:bg-pink-950/20'
                            : 'border-slate-200 dark:border-white/10 hover:border-pink-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                      >
                        {isUploading ? (
                          <div className="space-y-2">
                            <RefreshCw className="w-8 h-8 animate-spin text-pink-500 mx-auto" />
                            <p className="text-xs font-bold text-pink-600">Mengunggah ke Cloud Storage Zelvira...</p>
                            <p className="text-[10px] text-slate-400">Mohon tunggu hingga proses selesai</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                              <Upload className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                Klik untuk Upload File atau Tarik ke Sini
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Mendukung Video MP4/MOV vertikal (TikTok/Reels/Shorts) & Foto Produk HD
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-black overflow-hidden shrink-0 flex items-center justify-center border border-emerald-300">
                            {mediaType === 'VIDEO' ? (
                              <FileVideo className="w-6 h-6 text-cyan-400" />
                            ) : (
                              <img src={mediaUrl} alt="Upload" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                                {uploadedFileName || 'Media Berhasil Diunggah'}
                              </span>
                            </div>
                            <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                              {mediaUrl}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-xl text-[10px] font-bold h-7"
                          >
                            Ganti File
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={handleRemoveMedia}
                            className="rounded-xl h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Caption & Hashtags */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Caption & Hashtag Postingan
                      </Label>
                      <span className="text-[10px] font-mono text-slate-400">
                        {caption.length} karakter
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Tuliskan caption menarik, ajakan interaksi (CTA), dan hashtag promosi produk Zelvira..."
                      className="w-full text-xs p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none leading-relaxed"
                    />

                    {/* Hashtag Suggestions */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 mr-1 flex items-center gap-1 font-bold">
                        <Hash className="w-3 h-3" /> Rekomendasi:
                      </span>
                      {['#zelvira', '#fashionstyle', '#ootdindonesia', '#diskonspesial', '#racuntiktok', '#fyp', '#viral'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addHashtag(tag)}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 5. Scheduling / Timing */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 space-y-3">
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-500" /> Waktu Publikasi:
                    </Label>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPublishTiming('NOW')}
                        className={`p-3 rounded-xl border text-left text-xs transition-all ${publishTiming === 'NOW'
                            ? 'bg-white dark:bg-slate-800 border-pink-500 shadow-sm ring-1 ring-pink-500'
                            : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-500'
                          }`}
                      >
                        <p className="font-bold text-slate-900 dark:text-white">Publikasikan Sekarang</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Langsung kirim ke seluruh kanal terpilih.</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPublishTiming('SCHEDULE')}
                        className={`p-3 rounded-xl border text-left text-xs transition-all ${publishTiming === 'SCHEDULE'
                            ? 'bg-white dark:bg-slate-800 border-purple-500 shadow-sm ring-1 ring-purple-500'
                            : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-500'
                          }`}
                      >
                        <p className="font-bold text-slate-900 dark:text-white">Jadwalkan Kalender</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Otomatis posting di jam tertentu.</p>
                      </button>
                    </div>

                    {publishTiming === 'SCHEDULE' && (
                      <div className="grid grid-cols-2 gap-3 pt-2 animate-in fade-in">
                        <div className="space-y-1">
                          <Label className="text-[11px] text-slate-500 font-bold">Pilih Tanggal</Label>
                          <Input
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            className="text-xs rounded-xl bg-white dark:bg-slate-800"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] text-slate-500 font-bold">Pilih Jam</Label>
                          <Input
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="text-xs rounded-xl bg-white dark:bg-slate-800"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleCreatePost(true)}
                      disabled={isSubmitting || isUploading}
                      className="rounded-xl text-xs font-bold"
                    >
                      Simpan Draf
                    </Button>

                    <Button
                      type="button"
                      onClick={() => handleCreatePost(false)}
                      disabled={isSubmitting || isUploading}
                      className="rounded-xl bg-linear-to-r from-cyan-600 via-pink-600 to-purple-600 hover:opacity-95 text-white font-black text-xs gap-2 shadow-md uppercase tracking-wide px-5"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Memproses...
                        </>
                      ) : publishTiming === 'NOW' ? (
                        <>
                          <Send className="w-3.5 h-3.5" /> Publikasikan Sekarang
                        </>
                      ) : (
                        <>
                          <CalendarIcon className="w-3.5 h-3.5" /> Jadwalkan Postingan
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Mockup Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="border-slate-200 dark:border-white/10 shadow-sm sticky top-4">
                <div className="p-3.5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-pink-500" /> Device Feed Mockup
                  </span>
                  <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    {['TIKTOK', 'INSTAGRAM', 'THREADS', 'FACEBOOK'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPreviewPlatform(p)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${previewPlatform === p
                            ? 'bg-pink-600 text-white shadow-xs font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <CardContent className="p-5 flex justify-center bg-slate-50/50 dark:bg-slate-950/40">
                  <div className="w-70 h-130 rounded-[36px] bg-black p-3.5 shadow-2xl border-4 border-slate-800 relative flex flex-col justify-between text-white overflow-hidden select-none">
                    {/* Notch */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-full z-20 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-slate-800" />
                    </div>

                    {/* Media Preview */}
                    <div className="absolute inset-0 z-0 bg-linear-to-b from-slate-900 via-slate-800 to-black flex items-center justify-center overflow-hidden">
                      {mediaUrl ? (
                        mediaType === 'VIDEO' ? (
                          <video src={mediaUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                        ) : (
                          <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                        )
                      ) : (
                        <div className="text-center p-4 text-slate-500 space-y-2">
                          <ImageIcon className="w-10 h-10 mx-auto opacity-30" />
                          <p className="text-[10px]">Preview Media Konten</p>
                        </div>
                      )}
                    </div>

                    {/* Top Bar inside Phone */}
                    <div className="relative z-10 pt-4 flex items-center justify-center gap-4 text-xs font-bold text-white/90">
                      {previewPlatform === 'TIKTOK' ? (
                        <>
                          <span className="text-white/60 text-[11px]">Mengikuti</span>
                          <span className="text-white border-b-2 border-white pb-0.5 text-[11px]">Untuk Anda</span>
                        </>
                      ) : (
                        <div className="w-full flex items-center justify-between px-1">
                          <span className="text-[11px] font-black tracking-tight">{previewPlatform}</span>
                          <Heart className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Bottom Content & Engagement Column */}
                    <div className="relative z-10 flex items-end justify-between pb-3">
                      <div className="space-y-1.5 max-w-47.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-linear-to-tr from-cyan-400 to-pink-500 flex items-center justify-center text-[10px] font-bold">
                            Z
                          </div>
                          <span className="text-xs font-black shadow-sm truncate">
                            @zelvira.official
                          </span>
                        </div>

                        <p className="text-[11px] text-white/95 leading-snug line-clamp-3 font-normal drop-shadow">
                          {caption || 'Deskripsi postingan Anda akan muncul di sini bersama hashtag pilihan...'}
                        </p>

                        <div className="flex items-center gap-1 text-[9px] text-white/80">
                          <Music2 className="w-3 h-3 animate-spin text-pink-400" />
                          <span className="truncate">Suara Asli - Zelvira Studio</span>
                        </div>
                      </div>

                      {/* Right Action Icons Column */}
                      <div className="space-y-3 flex flex-col items-center">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                          </div>
                          <span className="text-[9px] mt-0.5">2.4k</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                            <MessageCircle className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-[9px] mt-0.5">148</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                          <Bookmark className="w-4 h-4 text-amber-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Draf List */}
          {activeAndDraftPosts.length > 0 && (
            <Card className="border-slate-200 dark:border-white/10 shadow-sm">
              <CardHeader className="p-4 sm:p-6 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" /> Draf Konten Tersimpan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 divide-y divide-slate-100 dark:divide-white/5">
                {activeAndDraftPosts.map((post) => (
                  <div key={post.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {renderPostThumbnail(post, 'w-10 h-10')}
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-100">{post.caption}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Target: {post.targetPlatforms}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handlePublishNow(post.id)}
                        className="rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white shadow-xs"
                      >
                        Publikasikan
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeletePost(post.id)}
                        className="text-rose-500 h-8 w-8 rounded-xl"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ==============================================================
          TAB 2: SCHEDULE (CALENDAR & SCHEDULED QUEUE)
          ============================================================== */}
      {activeTab === 'SCHEDULE' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <Card className="border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
            {/* Calendar Header */}
            <div className="p-4 border-b border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-purple-600" />
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Kalender Jadwal Tayang: {monthNames[month]} {year}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCalendarDate(new Date())}
                  className="rounded-xl text-xs font-bold h-7 ml-2"
                >
                  Hari Ini
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCalendarDate(new Date(year, month - 1, 1))}
                  className="rounded-xl h-8 w-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCalendarDate(new Date(year, month + 1, 1))}
                  className="rounded-xl h-8 w-8"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={loadCalendarData}
                  className="rounded-xl h-8 w-8 ml-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Calendar Legend Bar */}
            <div className="px-4 py-2 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/40 flex flex-wrap items-center justify-between gap-2 text-[10px]">
              <div className="flex flex-wrap items-center gap-2.5 text-slate-600 dark:text-slate-400">
                <span className="font-bold text-slate-700 dark:text-slate-300">Ikon Kanal:</span>
                <span className="inline-flex items-center gap-1 text-red-600 font-bold">
                  <Youtube className="w-3.5 h-3.5" /> YouTube (Video/Shorts)
                </span>
                <span className="inline-flex items-center gap-1 text-pink-600 font-bold">
                  <Instagram className="w-3.5 h-3.5" /> Instagram
                </span>
                <span className="inline-flex items-center gap-1 text-zinc-900 dark:text-zinc-200 font-bold">
                  <MessageCircle className="w-3.5 h-3.5" /> Threads
                </span>
                <span className="inline-flex items-center gap-1 text-slate-900 dark:text-cyan-300 font-bold">
                  <TikTokIcon className="w-3 h-3" /> TikTok
                </span>
                <span className="inline-flex items-center gap-1 text-sky-600 font-bold">
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                </span>
                <span className="inline-flex items-center gap-1 text-blue-600 font-bold">
                  <Facebook className="w-3.5 h-3.5" /> Facebook
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[9px]">
                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Tayang Live
                </span>
                <span className="inline-flex items-center gap-1 text-cyan-600 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Terjadwal
                </span>
                <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Gagal
                </span>
              </div>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 border-b border-slate-100 dark:border-white/5 text-center bg-slate-100/50 dark:bg-slate-800/40 text-[11px] font-black uppercase tracking-wider py-2 text-slate-500">
              {daysOfWeek.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-slate-950">
              {calendarDays.map((cell, idx) => {
                const isToday = cell.dateString === todayStr;
                const dayPosts = postsByDate[cell.dateString] || [];

                return (
                  <div
                    key={idx}
                    className={`min-h-27.5 p-2 transition-colors relative flex flex-col justify-between group ${!cell.isCurrentMonth ? 'bg-slate-50/40 dark:bg-slate-900/20 text-slate-300 dark:text-slate-700' : ''
                      } ${isToday ? 'bg-pink-50/20 dark:bg-pink-950/10' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-black w-6 h-6 rounded-full flex items-center justify-center ${isToday
                            ? 'bg-pink-600 text-white shadow-sm'
                            : cell.isCurrentMonth
                              ? 'text-slate-800 dark:text-slate-200'
                              : 'text-slate-400'
                          }`}
                      >
                        {cell.day}
                      </span>
                    </div>

                    {/* 5 Grouped Platform Icons: YouTube, Instagram, TikTok, LinkedIn, Facebook */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 content-start">
                      {CALENDAR_PLATFORMS.map((plat) => {
                        const matching = dayPosts.filter((p) => postMatchesCalendarPlatform(p, plat.key));
                        if (matching.length === 0) return null;

                        const hasShorts = plat.key === 'YOUTUBE' && matching.some((p) => isShortsPost(p));
                        const hasFailed = matching.some((p) => p.status === 'FAILED');
                        const hasPublished = matching.some((p) => p.status === 'PUBLISHED');

                        return (
                          <button
                            key={plat.key}
                            type="button"
                            onClick={() => {
                              const dateObj = new Date(cell.dateString + 'T00:00:00');
                              const formatted = isNaN(dateObj.getTime())
                                ? cell.dateString
                                : dateObj.toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  });
                              setPlatformDialog({
                                platform: plat.key,
                                label: plat.label,
                                dateStr: cell.dateString,
                                formattedDate: formatted,
                                posts: matching,
                              });
                            }}
                            className={`group/plat relative inline-flex items-center gap-1 px-1.5 py-1 rounded-xl text-xs font-bold transition-all hover:scale-110 active:scale-95 shadow-xs border ${plat.pillClass} cursor-pointer`}
                            title={`${plat.label}: ${matching.length} konten pada ${cell.dateString}\nKlik untuk melihat list postingan`}
                          >
                            <span className="flex items-center shrink-0">
                              {plat.icon('w-3.5 h-3.5')}
                            </span>

                            {matching.length > 1 && (
                              <span className="text-[10px] font-black px-1 rounded-full bg-black/10 dark:bg-white/20 leading-tight">
                                {matching.length}
                              </span>
                            )}

                            {hasShorts && (
                              <span className="text-[7.5px] bg-red-600 text-white px-0.5 rounded font-black tracking-tight leading-none">
                                Shorts
                              </span>
                            )}

                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                hasFailed
                                  ? 'bg-rose-500 ring-1 ring-rose-300'
                                  : hasPublished
                                  ? 'bg-emerald-500'
                                  : 'bg-cyan-500 animate-pulse'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Scheduled Queue Cards */}
          <Card className="border-slate-200 dark:border-white/10 shadow-sm">
            <CardHeader className="p-4 sm:p-6 pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-500" />
                Antrian Konten Terjadwal ({scheduledPosts.length})
              </CardTitle>
              <CardDescription className="text-xs">
                Postingan yang otomatis akan diterbitkan sesuai jam dan tanggal yang telah Anda tentukan.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {scheduledPosts.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">
                  Tidak ada postingan dalam antrian jadwal saat ini.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scheduledPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/40 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {renderPostThumbnail(post, 'w-12 h-12')}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {post.caption}
                            </p>
                            <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-bold mt-0.5">
                              {post.scheduledAt ? new Date(post.scheduledAt).toLocaleString('id-ID') : 'Segera'}
                            </p>
                          </div>
                        </div>

                        <Badge className="bg-cyan-600 text-[10px]">Terjadwal</Badge>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-white/5">
                        <span className="text-[10px] text-slate-400 font-mono">
                          Kanal: {post.targetPlatforms}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handlePublishNow(post.id)}
                            className="rounded-xl text-[10px] font-bold h-7 bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                          >
                            <Send className="w-3 h-3 mr-1 text-pink-400" /> Terbitkan Sekarang
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeletePost(post.id)}
                            className="rounded-xl text-rose-500 h-7 w-7"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ==============================================================
          TAB 3: RIWAYAT POSTINGAN (PUBLISHED & FINISHED FEED HISTORY)
          ============================================================== */}
      {activeTab === 'RIWAYAT' && (
        <Card className="border-slate-200 dark:border-white/10 shadow-sm animate-in fade-in duration-300">
          <CardHeader className="p-4 sm:p-6 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-500" />
              Riwayat Penayangan Konten Media Sosial
            </CardTitle>
            <CardDescription className="text-xs">
              Log pengiriman, tautan live publikasi, dan status eksekusi API untuk seluruh saluran.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {historyPosts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Belum ada riwayat postingan yang telah dipublikasikan.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {historyPosts.map((post) => {
                  const ytLiveUrl = post.youtubeVideoId ? getYouTubeLiveUrl(post.youtubeVideoId, post) : null;
                  const liLiveUrl = post.linkedinPostUrn ? `https://www.linkedin.com/feed/update/${post.linkedinPostUrn}` : null;
                  const primaryLiveUrl = ytLiveUrl || liLiveUrl || (post.mediaUrls ? post.mediaUrls.split(',')[0] : null);

                  return (
                    <div key={post.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Thumbnail: Video Icon if video, or Clickable to live URL */}
                        {primaryLiveUrl ? (
                          <a
                            href={primaryLiveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cursor-pointer hover:opacity-90 transition-opacity shrink-0"
                            title="Klik untuk membuka konten live di tab baru"
                          >
                            {renderPostThumbnail(post, 'w-14 h-14')}
                          </a>
                        ) : (
                          renderPostThumbnail(post, 'w-14 h-14')
                        )}

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {post.targetPlatforms.split(',').map((plt) => (
                              <span key={plt} className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded-full">
                                {plt.trim()}
                              </span>
                            ))}

                            {post.status === 'PUBLISHED' && (
                              <Badge className="bg-emerald-600 text-[10px]">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Tayang Live
                              </Badge>
                            )}
                            {post.status === 'FAILED' && (
                              <Badge variant="destructive" className="text-[10px]">
                                <AlertCircle className="w-3 h-3 mr-1" /> Gagal
                              </Badge>
                            )}
                            {post.youtubeVideoId && (
                              <span className="text-[10px] font-mono text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-900/40">
                                Video ID: {post.youtubeVideoId}
                              </span>
                            )}
                          </div>

                          {/* Caption with direct clickable link */}
                          {primaryLiveUrl ? (
                            <a
                              href={primaryLiveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-slate-800 dark:text-slate-100 hover:text-red-600 dark:hover:text-red-400 line-clamp-2 transition-colors inline-flex items-center gap-1 group/link"
                            >
                              <span>{post.caption}</span>
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
                            </a>
                          ) : (
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2">
                              {post.caption}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                            {post.publishedAt && (
                              <span>
                                Ditayangkan: <strong>{new Date(post.publishedAt).toLocaleString('id-ID')}</strong>
                              </span>
                            )}
                            {post.postType && (
                              <span className="uppercase text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                {post.postType}
                              </span>
                            )}
                          </div>

                          {post.errorMessage && (
                            <p className="text-[10px] text-rose-600 font-mono bg-rose-50 dark:bg-rose-950/20 p-1.5 rounded-lg border border-rose-100">
                              {post.errorMessage}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action buttons & direct live link button */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {post.status === 'PUBLISHED' && post.youtubeVideoId && (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={getYouTubeLiveUrl(post.youtubeVideoId, post)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-all"
                              title={isShortsPost(post) ? "Buka di YouTube Shorts" : "Buka di YouTube"}
                            >
                              <Youtube className="w-3.5 h-3.5" />
                              <span>{isShortsPost(post) ? 'Buka YouTube Shorts' : 'Tonton di YouTube'}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <a
                              href={`https://studio.youtube.com/video/${post.youtubeVideoId}/edit`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs transition-all"
                              title="Buka di YouTube Studio untuk cek status proses & ubah visibilitas ke Publik"
                            >
                              <span>Studio</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        {post.tiktokPublishId && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {tikTokStatusMap[post.tiktokPublishId] && (
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border ${
                                  tikTokStatusMap[post.tiktokPublishId].status === 'FAILED'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900'
                                    : tikTokStatusMap[post.tiktokPublishId].status === 'PUBLISH_COMPLETE' ||
                                      tikTokStatusMap[post.tiktokPublishId].status === 'SEND_TO_USER_INBOX'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900'
                                    : 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-900'
                                }`}
                                title={tikTokStatusMap[post.tiktokPublishId].message || ''}
                              >
                                {tikTokStatusMap[post.tiktokPublishId].status}
                              </span>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={checkingTikTokPublishId === post.tiktokPublishId}
                              onClick={() => handleCheckTikTokStatus(post.tiktokPublishId!)}
                              className="rounded-xl text-xs font-bold border-cyan-300 text-cyan-800 hover:bg-cyan-50 dark:border-cyan-800 dark:text-cyan-300 dark:hover:bg-cyan-950/40"
                              title={`Cek status publikasi TikTok (${post.tiktokPublishId})`}
                            >
                              <RefreshCw
                                className={`w-3 h-3 mr-1.5 ${
                                  checkingTikTokPublishId === post.tiktokPublishId ? 'animate-spin' : ''
                                }`}
                              />
                              Cek Status TikTok
                            </Button>
                          </div>
                        )}

                        {post.status === 'PUBLISHED' && post.linkedinPostUrn && (
                          <a
                            href={`https://www.linkedin.com/feed/update/${post.linkedinPostUrn}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-all"
                            title="Buka postingan di LinkedIn"
                          >
                            <span>Buka LinkedIn</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        {post.mediaUrls && !post.youtubeVideoId && (
                          <a
                            href={post.mediaUrls.split(',')[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
                            title="Lihat file media di tab baru"
                          >
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                            <span>Media</span>
                          </a>
                        )}

                        {post.status === 'FAILED' && (
                          <Button
                            size="sm"
                            onClick={() => handlePublishNow(post.id)}
                            className="rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-black"
                          >
                            Coba Lagi
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeletePost(post.id)}
                          className="rounded-xl h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Product Catalog Picker Modal */}
      {showProductPicker && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 max-w-2xl w-full rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-pink-500" />
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wide">Pilih Produk dari API Zelvira</h3>
                  <p className="text-[11px] text-slate-400">Pilih produk untuk otomatis mengisi gambar dan caption postingan</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowProductPicker(false)}
                className="h-8 w-8 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Cari nama atau SKU produk..."
                className="pl-10 text-xs rounded-xl"
              />
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-white/5 space-y-1 pr-1">
              {isLoadingCatalog ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-pink-500" />
                  Mengambil data produk dari backend API...
                </div>
              ) : filteredCatalog.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Tidak ada produk ditemukan.
                </div>
              ) : (
                filteredCatalog.map((prod) => {
                  let img = prod.imageUrl;
                  if (!img && prod.images && prod.images.length > 0) {
                    img = typeof prod.images[0] === 'string' ? prod.images[0] : (prod.images[0] as any)?.url;
                  }
                  return (
                    <div
                      key={prod.id}
                      onClick={() => handleSelectProduct(prod)}
                      className="p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-white/10">
                          {img ? (
                            <img src={formatImageUrl(img)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                              No Img
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate group-hover:text-pink-600">
                            {prod.name}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span>{prod.category?.name || 'Uncategorized'}</span>
                            {prod.sku && <span className="font-mono">SKU: {prod.sku}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-black text-pink-600">
                          Rp {Number(prod.price || 0).toLocaleString('id-ID')}
                        </p>
                        <Button size="sm" variant="outline" className="rounded-xl text-[10px] h-6 px-2.5 mt-1 font-bold">
                          Pilih
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Platform Posts Dialog List Modal (Grouping 5 Icons) */}
      {platformDialog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 max-w-2xl w-full rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10">
                  {CALENDAR_PLATFORMS.find((p) => p.key === platformDialog.platform)?.icon('w-5 h-5') || (
                    <Share2 className="w-5 h-5 text-pink-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                    {platformDialog.label}
                    <Badge variant="secondary" className="text-xs font-mono">
                      {platformDialog.posts.length} Konten
                    </Badge>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Jadwal Tayang: <span className="font-semibold text-slate-700 dark:text-slate-300">{platformDialog.formattedDate}</span>
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPlatformDialog(null)}
                className="h-8 w-8 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* List of Posts */}
            <div className="space-y-3 overflow-y-auto pr-1 flex-1">
              {platformDialog.posts.map((post) => {
                const isShorts = isShortsPost(post);
                const isYt = platformDialog.platform === 'YOUTUBE';
                const timeStr = post.scheduledAt
                  ? new Date(post.scheduledAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
                  : post.publishedAt
                  ? new Date(post.publishedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
                  : 'Segera';

                return (
                  <div
                    key={post.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    {/* Media + Info */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {renderPostThumbnail(post, 'w-16 h-16 shrink-0')}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Post Type Badge */}
                          <Badge variant="outline" className="text-[10px] font-mono uppercase font-bold">
                            {isYt ? (isShorts ? 'YouTube Shorts' : 'YouTube Video') : (post.postType || 'FEED')}
                          </Badge>

                          {/* Status Badge */}
                          {post.status === 'PUBLISHED' && (
                            <Badge className="bg-emerald-600 text-[10px]">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Tayang Live
                            </Badge>
                          )}
                          {post.status === 'SCHEDULED' && (
                            <Badge className="bg-cyan-600 text-[10px]">
                              <Clock className="w-3 h-3 mr-1" /> Terjadwal: {timeStr}
                            </Badge>
                          )}
                          {post.status === 'FAILED' && (
                            <Badge variant="destructive" className="text-[10px]">
                              <AlertCircle className="w-3 h-3 mr-1" /> Gagal
                            </Badge>
                          )}
                          {post.status === 'DRAFT' && (
                            <Badge variant="secondary" className="text-[10px]">
                              Draf
                            </Badge>
                          )}
                        </div>

                        {/* Title & Caption */}
                        {post.title && (
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {post.title}
                          </h4>
                        )}
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {post.caption || 'Tanpa keterangan'}
                        </p>

                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono pt-0.5">
                          <span>Waktu: {timeStr}</span>
                          {post.mediaType && <span>• Tipe Media: {post.mediaType}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-white/5">
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCalendarPost(post);
                          }}
                          className="rounded-xl text-xs font-bold h-7 px-2.5"
                        >
                          <Eye className="w-3 h-3 mr-1" /> Detail
                        </Button>

                        {post.status !== 'PUBLISHED' && (
                          <Button
                            size="sm"
                            onClick={async () => {
                              await handlePublishNow(post.id);
                              setPlatformDialog((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      posts: prev.posts.map((p) =>
                                        p.id === post.id ? { ...p, status: 'PUBLISHING' } : p
                                      ),
                                    }
                                  : null
                              );
                            }}
                            className="rounded-xl text-xs font-bold h-7 px-2.5 bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <Send className="w-3 h-3 mr-1" /> Publikasi
                          </Button>
                        )}

                        {post.status === 'PUBLISHED' && isYt && post.youtubeVideoId && (
                          <a
                            href={getYouTubeLiveUrl(post.youtubeVideoId, post)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 h-7 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-all"
                          >
                            <Youtube className="w-3 h-3" />
                            <span>Lihat</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            await handleDeletePost(post.id);
                            setPlatformDialog((prev) => {
                              if (!prev) return null;
                              const remaining = prev.posts.filter((p) => p.id !== post.id);
                              if (remaining.length === 0) return null;
                              return { ...prev, posts: remaining };
                            });
                          }}
                          className="rounded-xl text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 h-7 w-7 p-0"
                          title="Hapus postingan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPlatformDialog(null)}
                className="rounded-xl text-xs"
              >
                Tutup
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const targetPlat = platformDialog.platform;
                  const dateVal = platformDialog.dateStr;
                  setPlatformDialog(null);
                  setActiveTab('POSTINGAN');
                  setPublishTiming('SCHEDULE');
                  setScheduledDate(dateVal);
                  setSelectedPlatforms([targetPlat]);
                }}
                className="rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white gap-1.5"
              >
                <PlusSquare className="w-3.5 h-3.5" /> Jadwalkan di {platformDialog.label}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Post Detail Modal */}
      {selectedCalendarPost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-500" />
                <h3 className="font-black text-sm uppercase tracking-wide">Detail Postingan Kalender</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedCalendarPost(null)}
                className="h-7 w-7 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Media / Video Preview */}
            {(selectedCalendarPost.mediaUrls || selectedCalendarPost.youtubeVideoId) && (
              <div className="w-full h-48 rounded-2xl bg-black overflow-hidden flex items-center justify-center relative">
                {selectedCalendarPost.youtubeVideoId ? (
                  <div className="w-full h-full relative">
                    <img
                      src={`https://img.youtube.com/vi/${selectedCalendarPost.youtubeVideoId}/hqdefault.jpg`}
                      alt="YouTube Thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                ) : selectedCalendarPost.mediaType === 'VIDEO' ? (
                  <video src={selectedCalendarPost.mediaUrls?.split(',')[0]} className="w-full h-full object-cover" controls />
                ) : (
                  <img src={selectedCalendarPost.mediaUrls?.split(',')[0]} alt="Media" className="w-full h-full object-cover" />
                )}
              </div>
            )}

            {/* Target Platforms & Type Badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              {selectedCalendarPost.targetPlatforms.split(',').map((plt) => {
                const p = plt.trim().toUpperCase();
                const isYt = p === 'YOUTUBE';
                const isShorts = selectedCalendarPost.postType === 'SHORTS' || selectedCalendarPost.postType === 'REEL' || (selectedCalendarPost.caption && selectedCalendarPost.caption.toLowerCase().includes('#shorts'));
                return (
                  <span
                    key={plt}
                    className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-900 text-white dark:bg-slate-800 border border-slate-700"
                  >
                    {renderPlatformIcon(p, 'w-3 h-3')}
                    <span>{isYt ? (isShorts ? 'YouTube Shorts' : 'YouTube Video') : plt.trim()}</span>
                  </span>
                );
              })}

              {selectedCalendarPost.status === 'PUBLISHED' && (
                <Badge className="bg-emerald-600 text-[10px]">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Tayang Live
                </Badge>
              )}
              {selectedCalendarPost.status === 'SCHEDULED' && (
                <Badge className="bg-cyan-600 text-[10px]">
                  <Clock className="w-3 h-3 mr-1" /> Terjadwal
                </Badge>
              )}
              {selectedCalendarPost.status === 'FAILED' && (
                <Badge variant="destructive" className="text-[10px]">
                  <AlertCircle className="w-3 h-3 mr-1" /> Gagal
                </Badge>
              )}
            </div>

            {/* Schedule & Timing Info */}
            <div className="text-[11px] text-slate-500 space-y-1 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-white/5">
              {selectedCalendarPost.scheduledAt && (
                <div className="flex items-center justify-between">
                  <span>Jadwal Tayang:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(selectedCalendarPost.scheduledAt).toLocaleString('id-ID')}
                  </span>
                </div>
              )}
              {selectedCalendarPost.publishedAt && (
                <div className="flex items-center justify-between">
                  <span>Waktu Publikasi:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {new Date(selectedCalendarPost.publishedAt).toLocaleString('id-ID')}
                  </span>
                </div>
              )}
              {selectedCalendarPost.youtubeVideoId && (
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span>YouTube Video ID:</span>
                  <span className="text-red-600 font-bold">{selectedCalendarPost.youtubeVideoId}</span>
                </div>
              )}
            </div>

            {/* Title & Caption */}
            <div className="space-y-1.5">
              {selectedCalendarPost.title && (
                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                  {selectedCalendarPost.title}
                </h4>
              )}
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                {selectedCalendarPost.caption}
              </div>
            </div>

            {/* Error Message if Failed */}
            {selectedCalendarPost.errorMessage && (
              <p className="text-[11px] text-rose-600 font-mono bg-rose-50 dark:bg-rose-950/20 p-2 rounded-xl border border-rose-200">
                {selectedCalendarPost.errorMessage}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between pt-2 gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeletePost(selectedCalendarPost.id)}
                className="rounded-xl text-xs font-bold gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus
              </Button>

              <div className="flex flex-wrap items-center gap-2">
                {selectedCalendarPost.status === 'PUBLISHED' && selectedCalendarPost.youtubeVideoId && (
                  <div className="flex items-center gap-1.5">
                    <a
                      href={getYouTubeLiveUrl(selectedCalendarPost.youtubeVideoId, selectedCalendarPost)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-all"
                    >
                      <Youtube className="w-3.5 h-3.5" /> {isShortsPost(selectedCalendarPost) ? 'Buka YouTube Shorts' : 'Tonton di YouTube'} <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href={`https://studio.youtube.com/video/${selectedCalendarPost.youtubeVideoId}/edit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs transition-all"
                      title="Buka di YouTube Studio"
                    >
                      <span>Studio</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {selectedCalendarPost.status === 'PUBLISHED' && selectedCalendarPost.linkedinPostUrn && (
                  <a
                    href={`https://www.linkedin.com/feed/update/${selectedCalendarPost.linkedinPostUrn}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-all"
                  >
                    <Linkedin className="w-3.5 h-3.5" /> Buka di LinkedIn <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {selectedCalendarPost.status !== 'PUBLISHED' && (
                  <Button
                    size="sm"
                    onClick={() => handlePublishNow(selectedCalendarPost.id)}
                    className="rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold gap-1.5"
                  >
                    <Send className="w-3 h-3 text-pink-400" /> Publikasikan
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCalendarPost(null)}
                  className="rounded-xl text-xs"
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
