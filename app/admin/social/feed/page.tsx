'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Send,
  Video,
  ImageIcon,
  Sparkles,
  Share2,
  Calendar,
  PlusSquare,
  Activity,
  Heart,
  MessageCircle,
  Eye,
  Bookmark,
  ExternalLink,
  Layers,
  Filter,
  Play,
  Youtube
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { socialService } from '@/services/social.service';
import { SocialFeedItem, SocialAccount } from '@/types/social';

const PLATFORM_FILTERS = [
  { id: 'ALL', label: 'Semua Kanal' },
  { id: 'TIKTOK', label: 'TikTok' },
  { id: 'INSTAGRAM', label: 'Instagram' },
  { id: 'LINKEDIN', label: 'LinkedIn' },
  { id: 'X', label: 'X (Twitter)' },
  { id: 'FACEBOOK', label: 'Facebook' },
  { id: 'YOUTUBE', label: 'YouTube' },
];

export default function SocialFeedStatusPage() {
  const { toast } = useToast();

  const [feedItems, setFeedItems] = useState<SocialFeedItem[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [postTypeFilter, setPostTypeFilter] = useState<'ALL' | 'FEED' | 'STORY'>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [accountsData, feedData] = await Promise.all([
        socialService.getAccounts(),
        socialService.getFeed(selectedPlatform),
      ]);
      setAccounts(accountsData || []);
      setFeedItems(feedData || []);
    } catch (err: any) {
      console.error('Failed to load feed', err);
      toast({
        title: 'Gagal Memuat Feed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPlatform]);

  const filteredFeed = feedItems.filter((item) => {
    if (postTypeFilter !== 'ALL' && item.postType !== postTypeFilter) return false;
    return true;
  });

  // Calculate Engagement Metrics
  const totalViews = feedItems.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalLikes = feedItems.reduce((acc, curr) => acc + (curr.likes || 0), 0);
  const totalComments = feedItems.reduce((acc, curr) => acc + (curr.comments || 0), 0);
  const totalShares = feedItems.reduce((acc, curr) => acc + (curr.shares || 0), 0);

  // Helper to check if a feed item is YouTube Shorts
  const isYouTubeShortsItem = (item: SocialFeedItem): boolean => {
    const pt = (item.postType || '').toUpperCase();
    if (pt === 'SHORTS' || pt === 'REEL' || pt === 'STORY') return true;
    if (item.caption && item.caption.toLowerCase().includes('#shorts')) return true;
    return false;
  };

  const getYouTubeLiveUrl = (videoId: string, item?: SocialFeedItem): string => {
    return item && isYouTubeShortsItem(item)
      ? `https://www.youtube.com/shorts/${videoId}`
      : `https://www.youtube.com/watch?v=${videoId}`;
  };

  // Helper to determine the primary live link for a post
  const getLiveUrl = (item: SocialFeedItem): string | null => {
    if (item.youtubeVideoId && item.youtubeVideoId.trim()) {
      return getYouTubeLiveUrl(item.youtubeVideoId.trim(), item);
    }
    if (item.liveUrl && item.liveUrl.trim()) return item.liveUrl.trim();
    if (item.linkedinPostUrn && item.linkedinPostUrn.trim()) {
      return `https://www.linkedin.com/feed/update/${item.linkedinPostUrn.trim()}`;
    }
    if (item.mediaUrl && item.mediaUrl.trim()) {
      const first = item.mediaUrl.split(',')[0].trim();
      if (first.startsWith('http://') || first.startsWith('https://')) return first;
    }
    return null;
  };

  // Helper to check if item is video format
  const isVideoItem = (item: SocialFeedItem): boolean => {
    if (item.youtubeVideoId) return true;
    if (item.mediaType === 'VIDEO') return true;
    if (item.targetPlatforms && item.targetPlatforms.includes('YOUTUBE')) return true;
    if (item.mediaUrl && (item.mediaUrl.includes('.mp4') || item.mediaUrl.includes('.webm') || item.mediaUrl.includes('.mov'))) return true;
    return false;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Feed & Status Live Monitor
                </h1>
                <Badge variant="outline" className="border-pink-300 text-pink-600 bg-pink-50 text-[10px] font-bold">
                  Multi-Platform Analytics
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Lihat hasil postingan yang sedang tayang, story aktif 24 jam, dan metrik interaksi penonton secara real-time.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={loadData}
            variant="outline"
            className="rounded-xl border-slate-200 dark:border-white/10 text-xs font-bold gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Perbarui Feed
          </Button>

          <Link href="/admin/social/posts">
            <Button className="rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold gap-2 shadow-sm">
              <PlusSquare className="w-3.5 h-3.5 text-pink-400" />
              Buat Post Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Engagement Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Total Tayangan</span>
            <Eye className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {totalViews.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-slate-400">Jangkauan akun terhubung</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Total Likes / Reaksi</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600">
            {totalLikes.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-slate-400">Interaksi suka dari penonton</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Total Komentar</span>
            <MessageCircle className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-purple-600">
            {totalComments.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-slate-400">Pertanyaan & diskusi followers</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Total Dibagikan</span>
            <Share2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600">
            {totalShares.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-slate-400">Postingan disebarkan kembali</p>
        </div>
      </div>

      {/* Filter and View Selector */}
      <Card className="border-slate-200 dark:border-white/10 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Platforms Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {PLATFORM_FILTERS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPlatform(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedPlatform === p.id
                    ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border-2 border-pink-500 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/60'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Post Type filter */}
            <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-bold border border-slate-200 dark:border-white/10">
              <button
                onClick={() => setPostTypeFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  postTypeFilter === 'ALL'
                    ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 font-bold border border-pink-500/40 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Semua Tipe
              </button>
              <button
                onClick={() => setPostTypeFilter('FEED')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  postTypeFilter === 'FEED'
                    ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 font-bold border border-pink-500/40 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Feed
              </button>
              <button
                onClick={() => setPostTypeFilter('STORY')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  postTypeFilter === 'STORY'
                    ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 font-bold border border-pink-500/40 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Story / Status
              </button>
            </div>

            {/* View Mode */}
            <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-bold border border-slate-200 dark:border-white/10">
              <button
                onClick={() => setViewMode('GRID')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  viewMode === 'GRID'
                    ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 font-bold border border-pink-500/40 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Grid Card
              </button>
              <button
                onClick={() => setViewMode('TABLE')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  viewMode === 'TABLE'
                    ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 font-bold border border-pink-500/40 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Tabel
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feed Content */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-pink-500" />
          Mengambil data feed langsung dari kanal sosial media...
        </div>
      ) : filteredFeed.length === 0 ? (
        <Card className="border-slate-200 dark:border-white/10 shadow-sm p-12 text-center text-slate-400 space-y-3">
          <BarChart3 className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Belum ada konten feed atau status.</p>
          <p className="text-[11px] text-slate-400">Gunakan menu Post & Schedule untuk mempublikasikan konten pertama Anda.</p>
          <Link href="/admin/social/posts">
            <Button size="sm" className="rounded-xl bg-slate-900 text-white font-bold text-xs mt-2">
              Buat Post Baru
            </Button>
          </Link>
        </Card>
      ) : viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in">
          {filteredFeed.map((item) => {
            const liveUrl = getLiveUrl(item);
            const isVideo = isVideoItem(item);
            const ytThumbnail = item.youtubeVideoId
              ? `https://img.youtube.com/vi/${item.youtubeVideoId}/hqdefault.jpg`
              : null;

            return (
              <Card
                key={item.id}
                className="border-slate-200 dark:border-white/10 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900 rounded-2xl"
              >
                {/* Media Preview Box (Clickable to open live link like history) */}
                <div className="w-full h-48 bg-slate-950 relative flex items-center justify-center overflow-hidden">
                  {liveUrl ? (
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-full relative flex items-center justify-center cursor-pointer group/media"
                      title="Klik untuk membuka link postingan di tab baru"
                    >
                      {/* Media Image / Video / Poster */}
                      {ytThumbnail ? (
                        <img
                          src={ytThumbnail}
                          alt="YouTube Thumbnail"
                          className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-300"
                        />
                      ) : item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt="Thumbnail"
                          className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-300"
                        />
                      ) : item.mediaUrl ? (
                        isVideo ? (
                          <video
                            src={item.mediaUrl.split(',')[0]}
                            className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-300"
                            muted
                            playsInline
                          />
                        ) : (
                          <img
                            src={item.mediaUrl.split(',')[0]}
                            alt=""
                            className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-300"
                          />
                        )
                      ) : isVideo ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white">
                          <Video className="w-8 h-8 text-pink-400 mb-1" />
                          <span className="text-[9px] font-black tracking-widest text-slate-400">VIDEO</span>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white">
                          <ImageIcon className="w-10 h-10 text-slate-600 opacity-40 mb-1" />
                          <span className="text-[10px] text-slate-500">Tanpa Media</span>
                        </div>
                      )}

                      {/* Video Play Button Overlay */}
                      {isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover/media:bg-black/10 transition-colors pointer-events-none">
                          <div className="w-11 h-11 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-lg group-hover/media:scale-110 transition-transform">
                            <Play className="w-5 h-5 fill-white ml-0.5" />
                          </div>
                        </div>
                      )}

                      {/* Hover Overlay: "Buka Konten ↗" */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold pointer-events-none">
                        <ExternalLink className="w-4 h-4 text-pink-400" />
                        <span>Buka Konten Live</span>
                      </div>
                    </a>
                  ) : (
                    <div className="w-full h-full relative flex items-center justify-center">
                      {item.mediaUrl ? (
                        isVideo ? (
                          <video
                            src={item.mediaUrl.split(',')[0]}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                          />
                        ) : (
                          <img
                            src={item.mediaUrl.split(',')[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white">
                          <ImageIcon className="w-10 h-10 text-slate-600 opacity-40" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Top Overlay Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
                    <Badge className="bg-black/80 backdrop-blur-md text-[10px] text-cyan-300 border border-white/10 font-bold">
                      {item.targetPlatforms}
                    </Badge>

                    <div className="flex items-center gap-1.5">
                      <Badge
                        className={`text-[9px] font-bold ${
                          item.postType === 'STORY' ? 'bg-purple-600' : 'bg-pink-600'
                        }`}
                      >
                        {item.postType || 'FEED'}
                      </Badge>
                      {liveUrl && (
                        <span className="p-1 rounded-md bg-black/70 text-white shadow-xs">
                          <ExternalLink className="w-3 h-3 text-cyan-300" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    {/* Caption with direct clickable link */}
                    {liveUrl ? (
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-slate-900 dark:text-white hover:text-pink-600 dark:hover:text-pink-400 line-clamp-2 leading-snug transition-colors inline-flex items-center gap-1 group/link"
                        title="Buka link postingan di tab baru"
                      >
                        <span>{item.caption || 'Tanpa Caption'}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0 text-pink-500" />
                      </a>
                    ) : (
                      <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {item.caption || 'Tanpa Caption'}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{item.publishedAt ? new Date(item.publishedAt).toLocaleString('id-ID') : 'Baru saja'}</span>
                      {item.youtubeVideoId && (
                        <span className="font-mono text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded text-[9px]">
                          ID: {item.youtubeVideoId}
                        </span>
                      )}
                    </div>

                    {/* Dedicated Open Link Action Button (like in history) */}
                    <div className="pt-1">
                      {item.youtubeVideoId ? (
                        <div className="flex items-center gap-1.5 w-full">
                          <a
                            href={getYouTubeLiveUrl(item.youtubeVideoId, item)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 flex-1 py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-all"
                            title={isYouTubeShortsItem(item) ? "Buka di YouTube Shorts" : "Tonton di YouTube"}
                          >
                            <Youtube className="w-3.5 h-3.5" />
                            <span>{isYouTubeShortsItem(item) ? 'Buka Shorts' : 'Tonton di YouTube'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <a
                            href={`https://studio.youtube.com/video/${item.youtubeVideoId}/edit`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs transition-all shrink-0"
                            title="Buka di YouTube Studio"
                          >
                            <span>Studio</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ) : item.linkedinPostUrn ? (
                        <a
                          href={`https://www.linkedin.com/feed/update/${item.linkedinPostUrn}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-all"
                          title="Buka postingan di LinkedIn"
                        >
                          <span>Buka di LinkedIn</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : liveUrl ? (
                        <a
                          href={liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-bold shadow-xs transition-all"
                          title="Buka konten live di tab baru"
                        >
                          <span>Buka Link Konten</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : null}
                    </div>
                  </div>

                  {/* Engagement Bar */}
                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 grid grid-cols-4 text-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="text-slate-400 font-normal block text-[9px]">Tayangan</span>
                      <span className="text-cyan-600 dark:text-cyan-400">{(item.views || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-normal block text-[9px]">Likes</span>
                      <span className="text-rose-600">{(item.likes || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-normal block text-[9px]">Komen</span>
                      <span className="text-purple-600">{(item.comments || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-normal block text-[9px]">Shares</span>
                      <span className="text-emerald-600">{(item.shares || 0).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <Card className="border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="py-3 px-4">Konten Media</th>
                  <th className="py-3 px-3">Kanal</th>
                  <th className="py-3 px-3">Tipe</th>
                  <th className="py-3 px-3">Tayangan</th>
                  <th className="py-3 px-3">Likes</th>
                  <th className="py-3 px-3">Komentar</th>
                  <th className="py-3 px-3">Waktu Tayang</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredFeed.map((item) => {
                  const liveUrl = getLiveUrl(item);
                  const isVideo = isVideoItem(item);
                  const ytThumbnail = item.youtubeVideoId
                    ? `https://img.youtube.com/vi/${item.youtubeVideoId}/hqdefault.jpg`
                    : null;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                      {/* Media & Caption */}
                      <td className="py-3 px-4 max-w-[280px]">
                        <div className="flex items-center gap-3">
                          {/* Clickable thumbnail */}
                          {liveUrl ? (
                            <a
                              href={liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-10 h-10 rounded-xl bg-black overflow-hidden shrink-0 flex items-center justify-center relative group/thumb cursor-pointer"
                              title="Buka konten live"
                            >
                              {ytThumbnail ? (
                                <img src={ytThumbnail} alt="" className="w-full h-full object-cover" />
                              ) : item.thumbnailUrl ? (
                                <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                              ) : item.mediaUrl ? (
                                isVideo ? (
                                  <video src={item.mediaUrl.split(',')[0]} className="w-full h-full object-cover" muted />
                                ) : (
                                  <img src={item.mediaUrl.split(',')[0]} alt="" className="w-full h-full object-cover" />
                                )
                              ) : isVideo ? (
                                <Video className="w-4 h-4 text-pink-400" />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-slate-400" />
                              )}
                              {isVideo && (
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                  <Play className="w-3 h-3 fill-white text-white" />
                                </div>
                              )}
                            </a>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-black overflow-hidden shrink-0 flex items-center justify-center">
                              {item.mediaUrl ? (
                                <img src={item.mediaUrl.split(',')[0]} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                          )}

                          {/* Caption */}
                          <div className="min-w-0 flex-1">
                            {liveUrl ? (
                              <a
                                href={liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="truncate font-bold text-slate-800 dark:text-slate-200 hover:text-pink-600 dark:hover:text-pink-400 inline-flex items-center gap-1 group/tbl"
                              >
                                <span className="truncate">{item.caption || 'Tanpa Caption'}</span>
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover/tbl:opacity-100 transition-opacity shrink-0" />
                              </a>
                            ) : (
                              <span className="truncate font-bold text-slate-800 dark:text-slate-200">
                                {item.caption || 'Tanpa Caption'}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Kanal */}
                      <td className="py-3 px-3 font-mono font-bold text-[11px]">
                        {item.targetPlatforms}
                      </td>

                      {/* Tipe */}
                      <td className="py-3 px-3">
                        <Badge variant="outline" className="text-[10px]">
                          {item.postType || 'FEED'}
                        </Badge>
                      </td>

                      {/* Views */}
                      <td className="py-3 px-3 font-bold text-cyan-600">
                        {(item.views || 0).toLocaleString('id-ID')}
                      </td>

                      {/* Likes */}
                      <td className="py-3 px-3 font-bold text-rose-600">
                        {(item.likes || 0).toLocaleString('id-ID')}
                      </td>

                      {/* Komentar */}
                      <td className="py-3 px-3 font-bold text-purple-600">
                        {(item.comments || 0).toLocaleString('id-ID')}
                      </td>

                      {/* Waktu Tayang */}
                      <td className="py-3 px-3 text-[11px] text-slate-400">
                        {item.publishedAt ? new Date(item.publishedAt).toLocaleString('id-ID') : '-'}
                      </td>

                      {/* Aksi Open Link (like history) */}
                      <td className="py-3 px-3 text-center">
                        {item.youtubeVideoId ? (
                          <div className="inline-flex items-center gap-1">
                            <a
                              href={getYouTubeLiveUrl(item.youtubeVideoId, item)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold shadow-2xs transition-all"
                              title={isYouTubeShortsItem(item) ? "Buka di YouTube Shorts" : "Tonton di YouTube"}
                            >
                              <Youtube className="w-3 h-3" />
                              <span>{isYouTubeShortsItem(item) ? 'Shorts' : 'YouTube'}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                            <a
                              href={`https://studio.youtube.com/video/${item.youtubeVideoId}/edit`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-900 hover:bg-black text-white text-[11px] font-bold shadow-2xs transition-all"
                              title="Buka di YouTube Studio"
                            >
                              <span>Studio</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        ) : item.linkedinPostUrn ? (
                          <a
                            href={`https://www.linkedin.com/feed/update/${item.linkedinPostUrn}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-bold shadow-2xs transition-all"
                            title="Buka di LinkedIn"
                          >
                            <span>LinkedIn</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : liveUrl ? (
                          <a
                            href={liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 text-[11px] font-bold shadow-2xs transition-all"
                            title="Buka Link Konten"
                          >
                            <span>Buka Link</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
