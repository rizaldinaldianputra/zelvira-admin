'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageCircle,
  Share2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Send,
  EyeOff,
  User,
  Filter,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { socialService } from '@/services/social.service';
import { SocialComment, SocialAccount } from '@/types/social';

const PLATFORM_FILTERS = [
  { id: 'ALL', label: 'Semua Kanal' },
  { id: 'TIKTOK', label: 'TikTok' },
  { id: 'INSTAGRAM', label: 'Instagram' },
  { id: 'LINKEDIN', label: 'LinkedIn' },
  { id: 'X', label: 'X (Twitter)' },
  { id: 'FACEBOOK', label: 'Facebook' },
  { id: 'YOUTUBE', label: 'YouTube' },
];

export default function SocialCommentsPage() {
  const { toast } = useToast();

  const [comments, setComments] = useState<SocialComment[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Reply Modal / Active Reply
  const [replyingCommentId, setReplyingCommentId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [accountsData, commentsData] = await Promise.all([
        socialService.getAccounts(),
        socialService.getComments(selectedPlatform, searchQuery),
      ]);
      setAccounts(accountsData || []);
      setComments(commentsData || []);
    } catch (err: any) {
      console.error('Error fetching comments', err);
      toast({
        title: 'Gagal Memuat Komentar',
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

  const handleSyncComments = async () => {
    setIsSyncing(true);
    try {
      const res = await socialService.syncComments();
      const count = res?.newCommentsCount ?? 0;
      if (count > 0) {
        toast({
          title: 'Sinkronisasi Berhasil',
          description: `${count} komentar baru berhasil disinkronkan dari akun terhubung!`,
        });
      } else {
        toast({
          title: 'Komentar Terkini',
          description: 'Tidak ada komentar baru dari akun media sosial yang terintegrasi.',
        });
      }
      await loadData();
    } catch (err: any) {
      toast({
        title: 'Gagal Sinkronisasi',
        description: err.message || 'Gagal menyinkronkan komentar dari API platform.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleReplySubmit = async (commentId: number) => {
    if (!replyText.trim()) {
      toast({
        title: 'Teks Balasan Kosong',
        description: 'Tuliskan pesan balasan untuk komentar ini.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmittingReply(true);
    try {
      await socialService.replyComment(commentId, replyText.trim());
      toast({
        title: 'Balasan Berhasil Dikirim!',
        description: 'Pesan balasan langsung dikirimkan ke saluran media sosial terkait.',
      });
      setReplyingCommentId(null);
      setReplyText('');
      loadData();
    } catch (err: any) {
      toast({
        title: 'Gagal Mengirim Balasan',
        description: err.message || 'Terjadi kesalahan sistem',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleHideComment = async (commentId: number) => {
    if (!confirm('Sembunyikan komentar ini dari publikasi?')) return;
    try {
      await socialService.hideComment(commentId);
      toast({
        title: 'Komentar Disembunyikan',
        description: 'Komentar tidak lagi terlihat di postingan.',
      });
      loadData();
    } catch (err: any) {
      toast({
        title: 'Gagal Menyembunyikan Komentar',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  // Stats
  const totalComments = comments.length;
  const pendingReplies = comments.filter((c) => !c.isReplied && c.status !== 'HIDDEN').length;
  const repliedComments = comments.filter((c) => c.isReplied).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Komentar & Interaksi Pelanggan
                </h1>
                <Badge variant="outline" className="border-cyan-300 text-cyan-600 bg-cyan-50 text-[10px] font-bold">
                  Unified Inbox
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pantau seluruh tanggapan, pertanyaan pelanggan, dan moderasi komentar dari semua akun media sosial Anda.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleSyncComments}
            disabled={isSyncing || isLoading}
            variant="outline"
            className="rounded-xl border-slate-200 dark:border-white/10 text-xs font-bold gap-2 bg-linear-to-r hover:from-cyan-50 hover:to-pink-50 dark:hover:from-cyan-950/20 dark:hover:to-pink-950/20 text-slate-800 dark:text-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-pink-500' : ''}`} />
            {isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Komentar API'}
          </Button>

          <Button
            onClick={loadData}
            variant="outline"
            className="rounded-xl border-slate-200 dark:border-white/10 text-xs font-bold gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Muat Ulang
          </Button>

          <Link href="/admin/social/posts">
            <Button className="rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold gap-2 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              Buka Post Composer
            </Button>
          </Link>
        </div>
      </div>

      {/* Notice if no social accounts are integrated */}
      {accounts.filter(a => a.isActive || a.hasToken).length === 0 && !isLoading && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">Belum Ada Akun Media Sosial yang Terintegrasi</h4>
              <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-0.5">
                Data komentar hanya akan ditarik dari akun resmi yang sudah dihubungkan (TikTok, Instagram, Facebook, X, dll).
              </p>
            </div>
          </div>
          <Link href="/admin/settings?tab=social">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0 gap-1.5 shadow-sm">
              Hubungkan Akun Sosial
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Total Komentar Masuk</span>
            <MessageSquare className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {totalComments}
          </p>
          <p className="text-[10px] text-slate-400">Di seluruh kanal media sosial</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Perlu Dibalas</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">
            {pendingReplies}
          </p>
          <p className="text-[10px] text-slate-400">Pertanyaan dan tanggapan aktif</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Sudah Dibalas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600">
            {repliedComments}
          </p>
          <p className="text-[10px] text-slate-400">Interaksi admin terselesaikan</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200 dark:border-white/10 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Platforms Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {PLATFORM_FILTERS.map((p) => {
              const isConnected = p.id === 'ALL'
                ? accounts.some(a => a.isActive || a.hasToken)
                : accounts.some(a => a.platform?.toUpperCase() === p.id && (a.isActive || a.hasToken));
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlatform(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${selectedPlatform === p.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                >
                  {p.label}
                  {p.id !== 'ALL' && isConnected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Terhubung" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Search form */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-sm w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari komentar atau username..."
                className="pl-9 text-xs rounded-xl"
              />
            </div>
            <Button type="submit" size="sm" className="rounded-xl text-xs font-bold bg-slate-900 text-white">
              Cari
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Comments List */}
      <Card className="border-slate-200 dark:border-white/10 shadow-sm">
        <CardHeader className="p-4 sm:p-6 pb-3">
          <CardTitle className="text-base font-bold">Daftar Komentar Masuk</CardTitle>
          <CardDescription className="text-xs">
            Balas langsung komentar dari admin panel tanpa perlu membuka aplikasi media sosial satu per satu.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 pt-0">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-pink-500" />
              Memuat komentar dari media sosial...
            </div>
          ) : comments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <MessageCircle className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Belum ada komentar.</p>
              <p className="text-[11px] text-slate-400">Komentar baru dari followers postingan Anda akan muncul di sini secara otomatis.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {comments.map((comment) => (
                <div key={comment.id} className="py-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center font-bold text-xs">
                          {comment.authorAvatarUrl ? (
                            <img src={comment.authorAvatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        {/* Channel Badge */}
                        <span className="absolute -bottom-1 -right-1 text-[9px] font-black bg-slate-900 text-cyan-300 px-1 py-0.2 rounded-full border border-white">
                          {comment.platform.substring(0, 2)}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="min-w-0 space-y-1">
                        {comment.accountName && (
                          <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <span>Akun:</span>
                            <span className="text-cyan-600 dark:text-cyan-400 font-bold">{comment.accountName}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {comment.authorName}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            @{comment.authorUsername}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            • {new Date(comment.createdAt).toLocaleString('id-ID')}
                          </span>
                        </div>

                        {/* Comment Text */}
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 text-xs text-slate-800 dark:text-slate-200 leading-relaxed max-w-2xl">
                          {comment.commentText}
                        </div>

                        {/* Existing Reply if already answered */}
                        {comment.replyText && (
                          <div className="ml-4 pl-3 border-l-2 border-emerald-500 space-y-1 pt-1">
                            <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Dibalas oleh Admin {comment.repliedAt ? `(${new Date(comment.repliedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})` : ''}:</span>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-300 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-100 dark:border-white/5">
                              {comment.replyText}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right side: Post Info & Actions */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {/* Post Thumbnail if available */}
                      {comment.postThumbnailUrl && (
                        <div className="w-12 h-12 rounded-xl bg-black overflow-hidden flex items-center justify-center border border-slate-200">
                          <img src={comment.postThumbnailUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (replyingCommentId === comment.id) {
                              setReplyingCommentId(null);
                            } else {
                              setReplyingCommentId(comment.id);
                              setReplyText(`Halo @${comment.authorUsername}, terima kasih sudah bertanya! `);
                            }
                          }}
                          className="rounded-xl text-xs font-bold h-7 gap-1"
                        >
                          <Send className="w-3 h-3 text-pink-500" />
                          {replyingCommentId === comment.id ? 'Batal' : 'Balas'}
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleHideComment(comment.id)}
                          className="rounded-xl h-7 w-7 text-slate-400 hover:text-rose-500"
                          title="Sembunyikan komentar"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Reply Input Box */}
                  {replyingCommentId === comment.id && (
                    <div className="ml-12 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-pink-200 dark:border-pink-900/40 space-y-2 animate-in fade-in">
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Kirim Balasan Resmi sebagai Zelvira Official:
                      </Label>
                      <textarea
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Ketik balasan Anda..."
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setReplyingCommentId(null)}
                          className="rounded-xl text-xs"
                        >
                          Batal
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReplySubmit(comment.id)}
                          disabled={isSubmittingReply}
                          className="rounded-xl bg-linear-to-r from-pink-600 to-purple-600 text-white font-bold text-xs"
                        >
                          {isSubmittingReply ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />
                          ) : (
                            <Send className="w-3 h-3 mr-1" />
                          )}
                          Kirim Balasan
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

