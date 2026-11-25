'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageCircle,
  Package,
  ShoppingBag,
  Trash2,
  CheckCheck,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationService, NotificationHistory } from '@/services/notification.service';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState<NotificationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'ORDER' | 'CHAT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await NotificationService.getAll();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setNotifications(list);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast({
        title: 'Gagal Memuat Notifikasi',
        description: 'Tidak dapat mengambil daftar notifikasi dari server.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s for new orders/chats
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await NotificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast({
        title: 'Berhasil',
        description: 'Semua notifikasi telah ditandai sebagai sudah dibaca.',
      });
    } catch (error) {
      toast({
        title: 'Gagal',
        description: 'Gagal memperbarui status notifikasi.',
        variant: 'destructive',
      });
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus semua riwayat notifikasi?')) return;
    try {
      await NotificationService.clearAll();
      setNotifications([]);
      toast({
        title: 'Berhasil Dihapus',
        description: 'Seluruh riwayat notifikasi telah dibersihkan.',
      });
    } catch (error) {
      toast({
        title: 'Gagal',
        description: 'Gagal membersihkan riwayat notifikasi.',
        variant: 'destructive',
      });
    }
  };

  // Helper to parse deep link target from notification payload
  const getDirectLink = (n: NotificationHistory) => {
    let payload: any = {};
    try {
      if (n.dataPayload) {
        payload = typeof n.dataPayload === 'string' ? JSON.parse(n.dataPayload) : n.dataPayload;
      }
    } catch {}

    const type = (n.type || payload.type || '').toUpperCase();

    if (type === 'ORDER' || n.title.toLowerCase().includes('pesanan') || n.title.toLowerCase().includes('order')) {
      if (payload.orderId) {
        return `/admin/orders/${payload.orderId}`;
      }
      return '/admin/orders';
    }

    if (type === 'CHAT' || n.title.toLowerCase().includes('chat') || n.title.toLowerCase().includes('pesan')) {
      return '/admin/support';
    }

    return null;
  };

  const handleDirectNavigate = async (n: NotificationHistory) => {
    if (!n.isRead) {
      await handleMarkAsRead(n.id);
    }

    const targetUrl = getDirectLink(n);
    if (targetUrl) {
      router.push(targetUrl);
    } else {
      router.push('/admin/orders');
    }
  };

  // Filter: Orders and Chats primary focus
  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((n) => {
        const type = (n.type || '').toUpperCase();
        const titleLower = n.title.toLowerCase();
        const bodyLower = n.body.toLowerCase();

        // Type filter
        if (filterType === 'ORDER') {
          return type === 'ORDER' || titleLower.includes('pesanan') || titleLower.includes('order');
        }
        if (filterType === 'CHAT') {
          return type === 'CHAT' || titleLower.includes('chat') || titleLower.includes('pesan');
        }

        // 'ALL': Focus only on Orders and Chats as requested
        return (
          type === 'ORDER' ||
          type === 'CHAT' ||
          titleLower.includes('pesanan') ||
          titleLower.includes('order') ||
          titleLower.includes('chat') ||
          titleLower.includes('pesan')
        );
      })
      .filter((n) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
      });
  }, [notifications, filterType, searchQuery]);

  const unreadCount = useMemo(() => {
    return filteredNotifications.filter((n) => !n.isRead).length;
  }, [filteredNotifications]);

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-outfit">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                Notifikasi Pesanan & Chat
              </h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-pink-500 text-white animate-pulse">
                  {unreadCount} Baru
                </span>
              )}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
              Pantau pesanan baru masuk dan percakapan pelanggan customer service secara instan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
            >
              <CheckCheck className="h-4 w-4 mr-1.5 text-emerald-500" />
              Tandai Semua Dibaca
            </Button>
          )}

          {notifications.length > 0 && (
            <Button
              onClick={handleClearAll}
              variant="ghost"
              size="sm"
              className="rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-bold"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Bersihkan
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xs">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterType('ALL')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer',
              filterType === 'ALL'
                ? 'bg-pink-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterType('ORDER')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer',
              filterType === 'ORDER'
                ? 'bg-pink-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <ShoppingBag size={14} /> Pesanan Masuk
          </button>
          <button
            onClick={() => setFilterType('CHAT')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer',
              filterType === 'CHAT'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <MessageCircle size={14} /> Chat Pelanggan
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari notifikasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Memuat notifikasi pesanan & chat...
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-20 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/40 p-8 space-y-3">
            <div className="w-14 h-14 rounded-3xl bg-pink-500/10 text-pink-500 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Tidak Ada Notifikasi Baru
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Semua orderan dan percakapan pelanggan saat ini telah tertangani dengan baik.
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const isOrder =
              (n.type || '').toUpperCase() === 'ORDER' ||
              n.title.toLowerCase().includes('pesanan') ||
              n.title.toLowerCase().includes('order');
            const isChat =
              (n.type || '').toUpperCase() === 'CHAT' ||
              n.title.toLowerCase().includes('chat') ||
              n.title.toLowerCase().includes('pesan');

            const directLink = getDirectLink(n);

            return (
              <div
                key={n.id}
                onClick={() => handleDirectNavigate(n)}
                className={cn(
                  'group p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4',
                  !n.isRead
                    ? 'bg-white dark:bg-slate-900/95 border-pink-500/40 dark:border-pink-500/30 shadow-md shadow-pink-500/5 ring-1 ring-pink-500/10'
                    : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                )}
              >
                <div className="flex items-start gap-4 flex-1">
                  {/* Icon Avatar */}
                  <div
                    className={cn(
                      'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105',
                      isOrder
                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        : isChat
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-pink-500/10 text-pink-500 border border-pink-500/20'
                    )}
                  >
                    {isOrder ? (
                      <ShoppingBag size={22} />
                    ) : isChat ? (
                      <MessageCircle size={22} />
                    ) : (
                      <Bell size={22} />
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-pink-500/10 text-pink-500 border border-pink-500/20">
                          BARU
                        </span>
                      )}
                      <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 ml-auto sm:ml-0">
                        <Clock size={11} /> {formatTime(n.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                      {n.body}
                    </p>
                  </div>
                </div>

                {/* Actions & Direct Link */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                  {!n.isRead && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleMarkAsRead(n.id, e)}
                      className="rounded-xl text-xs font-semibold text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                      title="Tandai Sudah Dibaca"
                    >
                      <CheckCircle2 size={15} className="mr-1.5" />
                      Tandai Dibaca
                    </Button>
                  )}

                  <Button
                    size="sm"
                    className="rounded-xl bg-slate-900 hover:bg-pink-600 dark:bg-slate-800 dark:hover:bg-pink-600 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <span>{isOrder ? 'Buka Pesanan' : isChat ? 'Buka Chat CS' : 'Lihat Detail'}</span>
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
