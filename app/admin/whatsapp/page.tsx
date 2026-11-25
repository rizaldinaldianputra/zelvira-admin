'use client';

import React, { useState } from 'react';
import {
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Send,
  Key,
  Globe,
  RefreshCw,
  ExternalLink,
  Zap,
  Sparkles,
  Smartphone,
  Eye,
  EyeOff,
  Copy,
  Check,
  CheckCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { useWhatsapp } from '@/hooks/use-whatsapp';

export default function WhatsAppAdminPage() {
  const {
    statusData,
    status,
    apiUrl,
    setApiUrl,
    userkey,
    setUserkey,
    passkey,
    setPasskey,
    brand,
    setBrand,
    isSaving,
    testPhone,
    setTestPhone,
    testOtp,
    setTestOtp,
    isSending,
    testResult,
    generateRandomOtp,
    handleSaveConfig,
    handleSendTest,
  } = useWhatsapp();

  const [showPasskey, setShowPasskey] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);

  const isConnected = status === 'READY' || status === 'CONNECTED';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-outfit animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-3xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
            <MessageCircle className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                WhatsApp Official Gateway
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Zenziva Official API
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Integrasi WhatsApp Business API Resmi (WABA) khusus pengiriman kode OTP autentikasi dan notifikasi transaksi pelanggan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://console.zenziva.net/waofficial/dashboard/api/#sendwaofficial"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-2xl shadow-sm transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Dokumentasi API Zenziva
          </a>
        </div>
      </div>

      {/* Top Status Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Card 1 */}
        <Card className="border-slate-200 dark:border-white/10 rounded-3xl shadow-sm bg-white dark:bg-slate-900 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Status Koneksi</span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-3 py-1 rounded-full">
                <CheckCircle2 size={14} /> Terhubung (Ready)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl text-emerald-600 dark:text-emerald-400">
                <Zap size={22} />
              </div>
              <div>
                <p className="font-extrabold text-base text-slate-900 dark:text-white">Cloud HTTP API</p>
                <p className="text-xs text-slate-500">Stateless direct-route ke server Meta WABA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Card 2 */}
        <Card className="border-slate-200 dark:border-white/10 rounded-3xl shadow-sm bg-white dark:bg-slate-900 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Brand Resmi</span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 px-2.5 py-1 rounded-full">
                Meta Verified
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl text-blue-600 dark:text-blue-400">
                <Sparkles size={22} />
              </div>
              <div>
                <p className="font-extrabold text-base text-slate-900 dark:text-white">{brand || 'Zelvira'}</p>
                <p className="text-xs text-slate-500">Pengirim tertera resmi di WhatsApp penerima</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Card 3 */}
        <Card className="border-slate-200 dark:border-white/10 rounded-3xl shadow-sm bg-white dark:bg-slate-900 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Layanan Aktif</span>
              <span className="text-xs font-bold text-pink-600 bg-pink-50 dark:bg-pink-500/10 dark:text-pink-400 px-2.5 py-1 rounded-full">
                Khusus OTP
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pink-50 dark:bg-pink-950/40 rounded-2xl text-pink-600 dark:text-pink-400">
                <Smartphone size={22} />
              </div>
              <div>
                <p className="font-extrabold text-base text-slate-900 dark:text-white">Official WA OTP</p>
                <p className="text-xs text-slate-500">Bebas QR scanner &amp; anti blokir nomor</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Config + Testing Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: API Credentials & Settings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-slate-200 dark:border-white/10 shadow-sm rounded-3xl bg-white dark:bg-slate-900">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                    Konfigurasi HTTP API Zenziva
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Kredensial API resmi Zenziva untuk pengiriman pesan WhatsApp Official OTP.
                  </CardDescription>
                </div>
                <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300">
                  <Key size={18} />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* API URL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Endpoint URL API
                  </Label>
                  <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                    POST Form-Data
                  </span>
                </div>
                <div className="relative">
                  <Input
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://console.zenziva.net/waofficial/api/sendWAOfficial/"
                    className="h-11 rounded-xl font-mono text-xs pl-9"
                  />
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Endpoint resmi Zenziva WABA: <code className="text-pink-500 font-semibold">https://console.zenziva.net/waofficial/api/sendWAOfficial/</code>
                </p>
              </div>

              {/* Userkey & Passkey */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Userkey
                  </Label>
                  <Input
                    value={userkey}
                    onChange={(e) => setUserkey(e.target.value)}
                    placeholder="Contoh: 4d5abda6cd03"
                    className="h-11 rounded-xl font-mono text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-500">
                      API Key (Passkey)
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowPasskey(!showPasskey)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 font-semibold"
                    >
                      {showPasskey ? <EyeOff size={12} /> : <Eye size={12} />}
                      {showPasskey ? 'Sembunyikan' : 'Tampilkan'}
                    </button>
                  </div>
                  <Input
                    type={showPasskey ? 'text' : 'password'}
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    placeholder="Contoh: 3a008c4d87001c6aa7d0b4b3"
                    className="h-11 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              {/* Brand Name */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Nama Brand Pengirim
                  </Label>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {brand.length}/25 Karakter
                  </span>
                </div>
                <Input
                  value={brand}
                  maxLength={25}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Contoh: Zelvira"
                  className="h-11 rounded-xl font-bold text-sm"
                />
                <p className="text-[11px] text-slate-400">
                  Nama brand bisnis Anda yang terverifikasi di akun Zenziva (maksimal 25 karakter).
                </p>
              </div>
            </CardContent>

            <CardFooter className="pt-2 pb-6 px-6 flex items-center justify-between border-t border-slate-100 dark:border-white/5 mt-4">
              <span className="text-xs text-slate-400 font-medium">
                Tersimpan di konfigurasi backend &amp; application.yml
              </span>
              <Button
                onClick={handleSaveConfig}
                disabled={isSaving}
                className="rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 h-10 shadow-md shadow-pink-500/20"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Simpan Perubahan
              </Button>
            </CardFooter>
          </Card>

          {/* Architecture info callout */}
          <Card className="border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/40 dark:bg-emerald-950/10 rounded-3xl p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Mengapa Menggunakan Zenziva WhatsApp Official OTP?
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Zelvira kini menggunakan saluran resmi <strong>Meta Cloud Business API (WABA)</strong> melalui Zenziva.
                  Berbeda dengan WhatsApp Web headless (Puppeteer/wajs) yang rentan logout dan risiko pemblokiran nomor, 
                  jalur Official OTP memiliki jaminan uptime 99.9%, kecepatan pengiriman di bawah 3 detik, dan dilengkapi centang verifikasi resmi.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Live Testing & WhatsApp Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-slate-200 dark:border-white/10 shadow-sm rounded-3xl bg-white dark:bg-slate-900">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-500" />
                Uji Coba Kirim OTP
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Kirim kode OTP pengujian ke nomor ponsel untuk memvalidasi integrasi Zenziva.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Phone input */}
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Nomor WhatsApp Penerima
                </Label>
                <PhoneInput
                  international
                  defaultCountry="ID"
                  value={testPhone}
                  onChange={setTestPhone}
                  placeholder="0812 3456 7890"
                  className="flex h-12 w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 px-4 py-2 text-sm font-semibold text-slate-900 dark:text-white focus-within:ring-2 focus-within:ring-emerald-500 transition-all"
                />
              </div>

              {/* OTP Code with Randomize button */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Kode OTP (Numerik)
                  </Label>
                  <button
                    type="button"
                    onClick={generateRandomOtp}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw size={12} />
                    Acak Kode
                  </button>
                </div>
                <Input
                  value={testOtp}
                  maxLength={10}
                  onChange={(e) => setTestOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="6 digit angka (contoh: 865978)"
                  className="h-11 rounded-xl font-mono text-center tracking-widest text-base font-black text-slate-900 dark:text-white"
                />
              </div>

              {/* WhatsApp Message Preview Bubble */}
              <div className="space-y-2 pt-2">
                <Label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Pratinjau Pesan WhatsApp Penerima
                </Label>
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-200/50 dark:border-emerald-800/30 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">
                        {brand ? brand.charAt(0).toUpperCase() : 'Z'}
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                        {brand || 'Zelvira'}
                        <CheckCheck className="w-3.5 h-3.5 text-blue-500 inline" />
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Baru saja</span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    Kode verifikasi <strong>{brand || 'Zelvira'}</strong> Anda adalah:
                  </p>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200/80 dark:border-emerald-800/40 flex items-center justify-between shadow-xs">
                    <span className="text-lg font-black tracking-widest text-emerald-600 dark:text-emerald-400 font-mono">
                      {testOtp || '123456'}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(testOtp || '123456')}
                      className="text-[11px] font-bold text-slate-500 hover:text-emerald-600 flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800"
                    >
                      {copiedOtp ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      {copiedOtp ? 'Tersalin' : 'Salin Kode'}
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-500 italic">
                    Jangan bagikan kode ini kepada siapapun demi keamanan akun Anda.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={handleSendTest}
                disabled={isSending || !testPhone}
                className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20"
              >
                {isSending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Mengirimkan via Zenziva...
                  </>
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Kirim Pesan Khusus OTP
                  </>
                )}
              </Button>

              {/* API Result Box */}
              {testResult && (
                <div
                  className={`p-4 rounded-2xl border text-xs space-y-2 animate-in fade-in duration-300 ${
                    testResult.success || testResult.status === '1'
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      {testResult.success || testResult.status === '1' ? (
                        <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <AlertCircle size={16} className="text-rose-600 dark:text-rose-400" />
                      )}
                      Status: {testResult.text || (testResult.success ? 'Success' : 'Failed')}
                    </span>
                    {testResult.cost !== undefined && (
                      <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 text-[10px] font-mono border">
                        Biaya: Rp {testResult.cost}
                      </span>
                    )}
                  </div>
                  {testResult.messageId && (
                    <p className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      Message ID: <span className="font-bold">{testResult.messageId}</span>
                    </p>
                  )}
                  {testResult.to && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      Tujuan: <span className="font-bold">{testResult.to}</span>
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
