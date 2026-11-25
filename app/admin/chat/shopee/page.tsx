'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag,
  Search,
  Send,
  RefreshCw,
  ExternalLink,
  MessageCircle,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  User,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Info
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MarketplaceService } from '@/services/marketplace.service';

interface Conversation {
  id: string;
  conversation_id: string;
  buyer_name: string;
  buyer_avatar?: string;
  unread_count?: number;
  latest_message?: string;
  latest_message_time?: number;
  status?: string;
}

interface Message {
  id: string;
  content: string;
  type?: string;
  create_time?: number;
  sender_role?: string;
  sender_name?: string;
}

const QUICK_REPLIES = [
  'Halo kak, ada yang bisa kami bantu seputar produk Zelvira? 😊',
  'Pesanan kakak sedang kami siapkan dan segera di-pick up kurir ya!',
  'Produk ready stock kak, silakan langsung di-checkout sebelum kehabisan.',
  'Terima kasih banyak sudah berbelanja di Zelvira Official Store Shopee!',
];

export default function ShopeeChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [permissionRequired, setPermissionRequired] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const res = await MarketplaceService.getChatConversations('shopee', 30);
      if (res?.success && Array.isArray(res.conversations) && res.conversations.length > 0) {
        setConversations(res.conversations);
        setPermissionRequired(false);
        setStatusMessage(null);
        if (!selectedConversation) {
          selectConversation(res.conversations[0]);
        }
      } else {
        setConversations([]);
        if (res?.permission_required) {
          setPermissionRequired(true);
        }
        setStatusMessage(res?.message || 'Shopee Seller Chat siap dihubungkan melalui Shopee Open Platform.');
      }
    } catch (err: any) {
      setStatusMessage(err?.message || 'Gagal terhubung ke Shopee Seller API');
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const selectConversation = async (conv: Conversation) => {
    setSelectedConversation(conv);
    setIsLoadingMessages(true);
    try {
      const convId = conv.conversation_id || conv.id;
      const res = await MarketplaceService.getChatMessages('shopee', convId, 50);
      if (res?.success && Array.isArray(res.messages)) {
        setMessages(res.messages);
      } else {
        setMessages([]);
      }
    } catch {
      toast.error('Gagal mengambil pesan Shopee');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedConversation || isSending) return;
    const convId = selectedConversation.conversation_id || selectedConversation.id;
    const contentToSend = inputText.trim();
    setIsSending(true);

    try {
      const res = await MarketplaceService.sendChatMessage('shopee', convId, contentToSend, 'TEXT');
      if (res?.success) {
        const newMsg: Message = {
          id: Date.now().toString(),
          content: contentToSend,
          type: 'TEXT',
          create_time: Math.floor(Date.now() / 1000),
          sender_role: 'SELLER',
          sender_name: 'Zelvira Official'
        };
        setMessages((prev) => [...prev, newMsg]);
        setInputText('');
        toast.success('Pesan terkirim ke pembeli Shopee');
      } else {
        toast.error(res?.message || 'Gagal mengirim pesan Shopee');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Gagal mengirim pesan');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter((c) =>
    (c.buyer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.latest_message || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 dark:bg-black/40 backdrop-blur-xl p-6 rounded-3xl border border-white/60 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#EE4D2D]/10 flex items-center justify-center text-[#EE4D2D] shadow-inner font-bold text-xl">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Shopee Seller Chat
              </h1>
              <Badge className="bg-[#EE4D2D]/10 text-[#EE4D2D] hover:bg-[#EE4D2D]/20 border border-[#EE4D2D]/20">
                Shopee Open Platform
              </Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Kelola pesan chat pembeli Shopee langsung dari dashboard admin Zelvira.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchConversations}
            disabled={isLoadingConversations}
            className="rounded-xl border-slate-200 dark:border-white/10 text-xs font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoadingConversations ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <a
            href="https://seller.shopee.co.id/webchat/conversations"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              size="sm"
              className="bg-[#EE4D2D] hover:bg-[#D73211] text-white rounded-xl shadow-md text-xs font-semibold flex items-center gap-1.5"
            >
              <span>Buka Shopee Web Chat</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </a>
        </div>
      </div>

      {/* Info card regarding Shopee Web Chat & Partner API */}
      <Card className="p-4 rounded-2xl border border-amber-200 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Info className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong>Shopee Seller Web Chat:</strong> Anda dapat membalas pesan pembeli Shopee langsung di sini, atau membuka portal resmi Shopee Webchat tanpa perlu aplikasi Shopee di ponsel.
          </span>
        </div>
        <a
          href="https://seller.shopee.co.id/webchat/conversations"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 font-semibold text-[#EE4D2D] hover:underline flex items-center gap-1"
        >
          seller.shopee.co.id/webchat <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </Card>

      {/* Main Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
        {/* Left: Conversation List */}
        <Card className="lg:col-span-4 rounded-3xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur-xl flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Percakapan Shopee
              </span>
              <Badge variant="secondary" className="text-xs">
                {conversations.length} sesi
              </Badge>
            </div>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Cari pembeli / pesan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
            {isLoadingConversations ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <RefreshCw className="h-5 w-5 animate-spin mx-auto text-[#EE4D2D]" />
                <p>Memuat percakapan Shopee...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-[#EE4D2D]/10 text-[#EE4D2D] flex items-center justify-center mx-auto">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <p className="text-xs font-medium">Belum ada percakapan aktif dari Shopee</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Pastikan akun Shopee Open Platform Partner Anda terhubung atau gunakan link Shopee Webchat resmi.
                </p>
                <a
                  href="https://seller.shopee.co.id/webchat/conversations"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" variant="outline" className="text-xs rounded-xl mt-1 border-[#EE4D2D]/30 text-[#EE4D2D]">
                    Buka Shopee Webchat <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </a>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = (selectedConversation?.conversation_id || selectedConversation?.id) === (c.conversation_id || c.id);
                return (
                  <div
                    key={c.id || c.conversation_id}
                    onClick={() => selectConversation(c)}
                    className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-white/5 ${
                      isSelected ? 'bg-[#EE4D2D]/10 dark:bg-[#EE4D2D]/20 border-l-4 border-[#EE4D2D]' : ''
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#EE4D2D] to-orange-400 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                      {c.buyer_name ? c.buyer_name.charAt(0).toUpperCase() : 'B'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {c.buyer_name || 'Pembeli Shopee'}
                        </span>
                        {c.latest_message_time && (
                          <span className="text-[10px] text-slate-400">
                            {new Date(c.latest_message_time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {c.latest_message || 'Belum ada pesan terbaru'}
                      </p>
                    </div>
                    {c.unread_count && c.unread_count > 0 ? (
                      <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-[#EE4D2D] text-white text-[10px] font-bold flex items-center justify-center">
                        {c.unread_count}
                      </span>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Right: Active Chat Window */}
        <Card className="lg:col-span-8 rounded-3xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur-xl flex flex-col overflow-hidden shadow-sm">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-white/40 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#EE4D2D] to-orange-400 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {selectedConversation.buyer_name ? selectedConversation.buyer_name.charAt(0).toUpperCase() : 'B'}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedConversation.buyer_name || 'Pembeli Shopee'}
                    </h2>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                      ID Sesi: {selectedConversation.conversation_id || selectedConversation.id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://seller.shopee.co.id/webchat/conversations"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#EE4D2D] hover:underline flex items-center gap-1 font-medium"
                  >
                    Buka di Shopee <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50/50 to-white/30 dark:from-black/20 dark:to-black/40">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full text-xs text-slate-400 space-y-2">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto text-[#EE4D2D]" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2 text-center">
                    <MessageCircle className="h-8 w-8 text-[#EE4D2D]/30" />
                    <p className="text-xs">Mulai percakapan dengan pembeli ini</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isSeller = m.sender_role === 'SELLER' || m.sender_role === 'MERCHANT';
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isSeller ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl p-3 text-xs shadow-sm ${
                            isSeller
                              ? 'bg-[#EE4D2D] text-white rounded-br-sm'
                              : 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-white/10 rounded-bl-sm'
                          }`}
                        >
                          <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                        </div>
                        {m.create_time && (
                          <span className="text-[10px] text-slate-400 mt-1 px-1">
                            {new Date(m.create_time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              <div className="px-4 py-2 border-t border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-white/5 overflow-x-auto flex items-center gap-2">
                <span className="text-[10px] font-semibold text-slate-400 shrink-0 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-[#EE4D2D]" /> Balasan Cepat:
                </span>
                {QUICK_REPLIES.map((qr, i) => (
                  <button
                    key={i}
                    onClick={() => setInputText(qr)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-[#EE4D2D] shrink-0 transition-colors"
                  >
                    {qr}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-slate-100 dark:border-white/10 bg-white/60 dark:bg-black/30 flex items-center gap-2">
                <Input
                  placeholder="Ketik balasan untuk pembeli Shopee... (Tekan Enter untuk kirim)"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="text-xs h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isSending || !inputText.trim()}
                  className="bg-[#EE4D2D] hover:bg-[#D73211] text-white rounded-xl h-10 px-4 shrink-0 shadow-md text-xs font-semibold flex items-center gap-1.5"
                >
                  {isSending ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Kirim</span>
                      <Send className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400 space-y-4">
              <div className="h-16 w-16 rounded-3xl bg-[#EE4D2D]/10 text-[#EE4D2D] flex items-center justify-center">
                <MessageCircle className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                  Pilih Percakapan Shopee
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Pilih salah satu pesan dari daftar di sebelah kiri untuk membaca dan membalas pertanyaan pembeli toko Shopee Anda.
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
