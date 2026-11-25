'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Lock, Mail, Loader2, Eye, EyeOff, ShieldCheck, ArrowRight, MessageCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth.service';

const loginSchema = z.object({
  email: z.string().email({ message: 'Alamat email tidak valid' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter' }),
});

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'EMAIL' | 'WHATSAPP'>('EMAIL');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleLoginSuccess = (res: any) => {
    toast({
      title: 'Akses Diberikan',
      description: 'Selamat datang di Konsol Administrator Zelvira.',
    });
    const searchParams = new URLSearchParams(window.location.search);
    const next = searchParams.get('next');
    router.push(next || '/admin');
    router.refresh();
  };

  const handleLoginError = (err: any) => {
    const errorMessage =
      err?.response?.data?.message || err.message || 'Otentikasi gagal. Periksa kembali email dan kata sandi admin Anda.';
    toast({
      title: 'Autentikasi Gagal',
      description: errorMessage,
      variant: 'destructive',
    });
  };

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      const res = await authService.login(values);
      handleLoginSuccess(res);
    } catch (err: any) {
      handleLoginError(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleRequestOtp = async () => {
    if (!phoneNumber || phoneNumber.trim().length < 9) {
      toast({
        title: 'Nomor WhatsApp tidak valid',
        description: 'Masukkan nomor WhatsApp staf / admin terdaftar.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      await authService.requestOtp(cleanPhone);
      setOtpSent(true);
      toast({
        title: 'Kode OTP Terkirim',
        description: 'Periksa WhatsApp Anda untuk kode verifikasi 2FA.',
      });
    } catch (err: any) {
      handleLoginError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length < 4) {
      toast({
        title: 'Kode OTP belum lengkap',
        description: 'Masukkan kode verifikasi OTP 2FA dari WhatsApp.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      const res = await authService.loginWithOtp(cleanPhone, otpCode.trim());
      handleLoginSuccess(res);
    } catch (err: any) {
      handleLoginError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-slate-900/95 dark:bg-slate-950/95 text-white backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl shadow-black/40">
      {/* Brand Logo */}
      <div className="flex justify-center mb-6">
        <img
          src="/logo.png"
          alt="Zelixa Logo"
          className="h-12 w-auto max-w-[220px] object-contain drop-shadow-md"
        />
      </div>

      {/* Form Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 text-xs font-bold mb-3 border border-pink-500/20">
          <ShieldCheck size={13} className="text-pink-400" /> Portal Akses Administrator
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white uppercase">
          Masuk Konsol Admin
        </h2>
        <p className="text-xs md:text-sm text-slate-400 mt-1.5">
          Gunakan kredensial akun staf atau administrator resmi toko.
        </p>
      </div>

      {/* Login Mode Toggle Tabs */}
      <div className="flex bg-white/5 p-1 rounded-2xl mb-6 border border-white/5">
        <button
          type="button"
          onClick={() => setMode('EMAIL')}
          className={cn(
            'flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2',
            mode === 'EMAIL'
              ? 'bg-pink-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          )}
        >
          <Mail size={13} /> Email Staf
        </button>
        <button
          type="button"
          onClick={() => setMode('WHATSAPP')}
          className={cn(
            'flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2',
            mode === 'WHATSAPP'
              ? 'bg-emerald-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          )}
        >
          <MessageCircle size={13} /> WhatsApp 2FA
        </button>
      </div>

      {/* Mode 1: Email & Password */}
      {mode === 'EMAIL' ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Email Administrator
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-pink-500 transition-colors" />
                      <Input
                        type="email"
                        placeholder="admin@zelvira.com"
                        className="pl-11 h-12 rounded-2xl bg-slate-800/90 dark:bg-slate-900/90 border border-slate-700/60 text-white font-medium focus:bg-slate-900 focus:border-pink-500 focus-visible:ring-pink-500 placeholder:text-slate-500 shadow-inner"
                        {...field}
                        disabled={isLoading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs font-semibold text-rose-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Kata Sandi Admin
                    </FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-semibold text-pink-400 hover:text-pink-300 hover:underline"
                    >
                      Lupa Sandi?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-pink-500 transition-colors" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-11 pr-11 h-12 rounded-2xl bg-slate-800/90 dark:bg-slate-900/90 border border-slate-700/60 text-white font-medium focus:bg-slate-900 focus:border-pink-500 focus-visible:ring-pink-500 placeholder:text-slate-500 shadow-inner"
                        {...field}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs font-semibold text-rose-400" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-12 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 mt-2 transition-all active:scale-[0.99]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mengotentikasi...
                </>
              ) : (
                <>
                  Masuk ke Konsol Admin <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>
        </Form>
      ) : (
        /* Mode 2: WhatsApp 2FA OTP */
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Nomor WhatsApp Staf
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                +62
              </span>
              <Input
                placeholder="81234567890"
                value={phoneNumber.startsWith('62') ? phoneNumber.slice(2) : phoneNumber.startsWith('0') ? phoneNumber.slice(1) : phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="pl-14 h-12 rounded-2xl bg-slate-800/90 dark:bg-slate-900/90 border border-slate-700/60 text-white font-bold focus:bg-slate-900 focus-visible:ring-emerald-500 placeholder:text-slate-500 shadow-inner"
                disabled={isLoading || otpSent}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Kode OTP 2FA akan dikirimkan langsung ke nomor WhatsApp admin terdaftar.
            </p>
          </div>

          {otpSent && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Kode OTP 2FA
                </label>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={isLoading}
                  className="text-xs font-bold text-emerald-400 hover:underline"
                >
                  Kirim Ulang
                </button>
              </div>
              <Input
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                className="h-14 text-center text-3xl font-black tracking-[0.5em] rounded-2xl bg-slate-800/90 dark:bg-slate-900/90 border border-slate-700/60 font-mono text-emerald-400 focus:bg-slate-900"
                disabled={isLoading}
              />
            </div>
          )}

          {!otpSent ? (
            <Button
              type="button"
              onClick={handleRequestOtp}
              className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mengirim OTP...
                </>
              ) : (
                <>
                  <MessageCircle size={16} /> Kirim Kode OTP 2FA
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <Button
                type="button"
                onClick={handleVerifyOtp}
                className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} /> Verifikasi 2FA & Masuk
                  </>
                )}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtpCode('');
                }}
                className="w-full text-xs font-bold text-slate-400 hover:text-white text-center"
              >
                Ganti nomor WhatsApp
              </button>
            </div>
          )}
        </div>
      )}

      {/* Security Disclaimer */}
      <div className="mt-6 pt-5 border-t border-white/5 text-center space-y-1">
        <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldAlert size={12} className="text-amber-400" />
          Akses terbatas. Seluruh aktivitas otentikasi dicatat dalam audit trail.
        </p>
      </div>
    </div>
  );
}
