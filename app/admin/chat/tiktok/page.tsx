'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Store,
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
  ShoppingBag,
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
  'Halo kak, ada yang bisa kami bantu? 😊',
  'Pesanan kakak sedang kami siapkan dan segera dikirim ya!',
  'Stok produk ready kak, silakan langsung di-checkout.',
  'Terima kasih sudah berbelanja di Zelvira Official Store!',
];

export default function TikTokChatPage() {
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
      const res = await MarketplaceService.getChatConversations('tiktok', 30);
      if (res?.success && Array.isArray(res.conversations)) {
        setConversations(res.conversations);
        setPermissionRequired(false);
        setStatusMessage(null);
        if (res.conversations.length > 0 && !selectedConversation) {
          selectConversation(res.conversations[0]);
        }
      } else {
        if (res?.permission_required) {
          setPermissionRequired(true);
        }
        setStatusMessage(res?.message || 'Menghubungkan ke layanan chat TikTok...');
      }
    } catch (err: any) {
      setStatusMessage(err?.message || 'Gagal terhubung ke TikTok Shop');
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const selectConversation = async (conv: Conversation) => {
    setSelectedConversation(conv);
    setIsLoadingMessages(true);
    try {
      const res = await MarketplaceService.getChatMessages('tiktok', conv.id || conv.conversation_id);
      if (res?.success && Array.isArray(res.messages)) {
        setMessages(res.messages);
      } else {
        setMessages([]);
      }
    } catch (err: any) {
      console.warn('Failed to load messages for conversation:', err);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !selectedConversation || isSending) return;

    const convId = selectedConversation.id || selectedConversation.conversation_id;
    const tempMsg: Message = {
      id: 'temp-' + Date.now(),
      content: text,
      type: 'TEXT',
      create_time: Math.floor(Date.now() / 1000),
      sender_role: 'SELLER',
      sender_name: 'Zelvira Official'
    };

    setMessages((prev) => [...prev, tempMsg]);
    setInputText('');
    setIsSending(true);

    try {
      const res = await MarketplaceService.sendChatMessage('tiktok', convId, text);
      if (res?.success) {
        toast.success('Pesan terkirim ke pembeli TikTok!');
      } else {
        toast.error(res?.message || 'Gagal mengirim pesan via TikTok API');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Gagal mengirim pesan');
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    (c.buyer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.latest_message || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-black flex items-center justify-center text-white shadow-md">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                TikTok Shop Seller Chat
              </h1>
              <Badge className="bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border-none">
                Resmi Terintegrasi
              </Badge>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Kelola pesan pembeli TikTok Shop langsung dari admin tanpa perlu membuka aplikasi seller di HP.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchConversations}
            disabled={isLoadingConversations}
            className="rounded-xl gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingConversations ? 'animate-spin' : ''}`} />
            Muat Ulang
          </Button>

          <Button
            size="sm"
            asChild
            className="rounded-xl gap-1.5 text-xs font-semibold bg-black hover:bg-slate-800 text-white shadow-sm"
          >
            <a
              href="https://seller-id.tiktok.com/chat"
              target="_blank"
              rel="noopener noreferrer"
              title="Buka TikTok Seller Center Web Chat"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Buka Web Seller Chat
            </a>
          </Button>
        </div>
      </div>

      {/* Main Container */}
      <Card className="flex-1 overflow-hidden bg-white/70 dark:bg-slate-900/70 shadow-xl border border-slate-200 dark:border-slate-800 rounded-3xl flex">
        {/* Left Column: Conversation Sessions */}
        <div className="w-full sm:w-80 md:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/60 dark:bg-slate-950/40">
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input
                placeholder="Cari pembeli atau pesan..."
                className="pl-9 text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {isLoadingConversations ? (
              <div className="text-center p-8 text-slate-400 text-xs flex flex-col items-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin text-pink-500" />
                <span>Memuat percakapan TikTok...</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs flex flex-col items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Belum ada chat aktif</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {statusMessage || 'Pesan dari pembeli TikTok Shop akan muncul di sini secara otomatis.'}
                  </p>
                </div>
                {permissionRequired && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 rounded-xl text-left text-[11px] text-amber-800 dark:text-amber-200 mt-2 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                      Izin API Customer Service
                    </div>
                    <p className="text-[10px] leading-relaxed">
                      TikTok Shop Partner API mensyaratkan izin khusus <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">seller.customer_service</code> yang disetujui di TikTok Partner Center.
                    </p>
                    <a
                      href="https://seller-id.tiktok.com/chat"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-600 hover:underline pt-1"
                    >
                      Buka Web Chat TikTok Seller Langsung <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedConversation?.id === conv.id;
                return (
                  <button
                    key={conv.id || conv.conversation_id}
                    onClick={() => selectConversation(conv)}
                    className={`w-full text-left p-3 rounded-2xl transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-black text-white shadow-md'
                        : 'hover:bg-white dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white font-bold text-sm">
                        {conv.buyer_avatar ? (
                          <img src={conv.buyer_avatar} alt={conv.buyer_name} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          (conv.buyer_name || 'B').charAt(0).toUpperCase()
                        )}
                      </div>
                      {(conv.unread_count ?? 0) > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`font-semibold text-xs truncate ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                          {conv.buyer_name || 'TikTok Buyer'}
                        </p>
                        {conv.latest_message_time && (
                          <span className={`text-[10px] shrink-0 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                            {new Date(conv.latest_message_time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                        {conv.latest_message || 'Tidak ada pesan teks'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Stream */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-sm">
                    {(selectedConversation.buyer_name || 'B').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      {selectedConversation.buyer_name || 'TikTok Buyer'}
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" title="Online" />
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      ID Percakapan: {selectedConversation.id || selectedConversation.conversation_id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-8 text-xs text-slate-600 dark:text-slate-300 gap-1"
                  >
                    <a
                      href="https://seller-id.tiktok.com/chat"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink size={13} />
                      Buka Web Chat
                    </a>
                  </Button>
                </div>
              </div>

              {/* Message Bubbles */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 dark:bg-slate-950/20">
                {isLoadingMessages ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-pink-500" />
                    <span>Memuat riwayat chat...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                    <p>Belum ada riwayat pesan dalam sesi ini.</p>
                    <p className="text-[10px] mt-1 text-slate-400">Kirim pesan pertama Anda di bawah.</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isSeller = (msg.sender_role || '').toUpperCase() === 'SELLER';
                    return (
                      <div
                        key={msg.id || idx}
                        className={`flex flex-col ${isSeller ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-xs ${
                            isSeller
                              ? 'bg-black text-white rounded-br-none'
                              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-bl-none'
                          }`}
                        >
                          <div className={`text-[9px] font-bold mb-0.5 ${isSeller ? 'text-pink-300' : 'text-slate-400'}`}>
                            {isSeller ? 'Zelvira Official (CS)' : selectedConversation.buyer_name || 'Pembeli'}
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          {msg.create_time && (
                            <div className={`text-[9px] mt-1 text-right ${isSeller ? 'text-slate-400' : 'text-slate-400'}`}>
                              {new Date(msg.create_time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <Sparkles className="h-3.5 w-3.5 text-pink-500 shrink-0 ml-1" />
                {QUICK_REPLIES.map((text, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(text)}
                    className="shrink-0 text-[10px] font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-pink-50 hover:text-pink-600 dark:hover:bg-pink-950/40 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200/50 dark:border-slate-700/50"
                  >
                    {text}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
                <Input
                  placeholder="Ketik balasan untuk pembeli TikTok..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="rounded-xl border-slate-200 dark:border-slate-800 text-xs"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isSending}
                  className="rounded-xl px-4 bg-black hover:bg-slate-800 text-white shrink-0 text-xs gap-1 font-semibold"
                >
                  <Send size={13} />
                  Kirim
                </Button>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <div className="h-16 w-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-3">
                <MessageCircle size={32} />
              </div>
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Pilih Percakapan Pembeli</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Pilih salah satu sesi chat di sebelah kiri untuk melihat percakapan dan membalas pertanyaan pembeli TikTok Shop Anda.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
