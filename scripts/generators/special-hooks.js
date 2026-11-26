// scripts/generators/special-hooks.js
const path = require('path');

const specialGenerators = [
  // 1. FORGOT PASSWORD
  {
    name: 'useForgotPassword',
    hookFile: 'hooks/use-forgot-password.ts',
    pageFile: 'app/(auth)/forgot-password/page.tsx',
    hookCode: `'use client';

import { useState } from 'react';

export type Step = 'email' | 'otp' | 'new-password' | 'success';

export function useForgotPassword() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNextStep = (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      if (step === 'email') setStep('otp');
      else if (step === 'otp') setStep('new-password');
      else if (step === 'new-password') setStep('success');
    }, 1500);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(\`otp-\${index + 1}\`);
      nextInput?.focus();
    }
  };

  const containerVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return {
    step,
    setStep,
    email,
    setEmail,
    otp,
    setOtp,
    showPassword,
    setShowPassword,
    isLoading,
    handleNextStep,
    handleOtpChange,
    containerVariants,
  };
}
`,
    pageCode: `'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, KeyRound, CheckCircle2, ChevronLeft } from 'lucide-react';
import { STYLE_CONFIG } from '@/services/style.config';
import { useForgotPassword } from '@/hooks/use-forgot-password';

export default function ForgotPasswordPage() {
  const {
    step,
    email,
    setEmail,
    otp,
    showPassword,
    setShowPassword,
    isLoading,
    handleNextStep,
    handleOtpChange,
    containerVariants,
  } = useForgotPassword();

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-white font-sans">
      <div 
        className="hidden lg:flex w-1/2 relative items-center justify-center p-12 overflow-hidden"
        style={{ background: STYLE_CONFIG.gradients.primary }}
      >
        <div className="absolute inset-0 opacity-20 text-white pointer-events-none">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        </div>
        
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 blur-[100px] rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 blur-[100px] rounded-full"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative z-10 text-center text-white"
        >
          <div className="flex items-center justify-center gap-4 mb-8">
             <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                <ShieldCheck size={40} className="text-white fill-white/20" />
             </div>
             <h1 className="text-7xl font-black tracking-tighter uppercase italic">Secure</h1>
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-4 opacity-90">Account Recovery</h2>
          <p className="max-w-md mx-auto text-white/70 font-bold leading-relaxed">
            Your security is our priority. Follow the simple steps to recover your access and get back to your aesthetic journey.
          </p>
        </motion.div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-24 relative overflow-y-auto">
        <div className="absolute top-8 left-8 lg:left-12">
            <Link href="/login" className="flex items-center gap-2 text-neutral-400 hover:text-neutral-900 transition-colors group">
              <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center group-hover:bg-neutral-100 transition-all shadow-sm">
                <ChevronLeft size={16} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Back to Login</span>
            </Link>
        </div>

        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {step === 'email' && (
              <motion.div
                key="email"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-black text-neutral-900 tracking-tight">Forgot Password?</h3>
                  <p className="text-xs font-bold text-neutral-400 mt-1">Enter your registered email address to receive an authentication code.</p>
                </div>

                <form onSubmit={handleNextStep} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@zelvira.com"
                        className="w-full h-12 bg-neutral-50 rounded-2xl pl-11 pr-4 text-xs font-bold border-2 border-transparent focus:border-pink-500 focus:bg-white outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full h-12 bg-neutral-950 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-950/10 flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {isLoading ? 'Sending...' : 'Send Recovery Code'}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'otp' && (
              <motion.div
                key="otp"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-black text-neutral-900 tracking-tight">Enter OTP Code</h3>
                  <p className="text-xs font-bold text-neutral-400 mt-1">We sent a 6-digit verification code to <span className="text-neutral-900">{email}</span></p>
                </div>

                <form onSubmit={handleNextStep} className="space-y-6">
                  <div className="flex gap-2 justify-between">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={\`otp-\${idx}\`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        className="w-12 h-14 bg-neutral-50 border-2 border-transparent focus:border-pink-500 focus:bg-white text-center text-lg font-black rounded-2xl outline-none transition-all"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.some(d => !d)}
                    className="w-full h-12 bg-neutral-950 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-950/10 flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'new-password' && (
              <motion.div
                key="new-password"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-black text-neutral-900 tracking-tight">Reset Password</h3>
                  <p className="text-xs font-bold text-neutral-400 mt-1">Set a new strong password for your account.</p>
                </div>

                <form onSubmit={handleNextStep} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">New Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        className="w-full h-12 bg-neutral-50 rounded-2xl pl-11 pr-11 text-xs font-bold border-2 border-transparent focus:border-pink-500 focus:bg-white outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-neutral-950 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-950/10 flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {isLoading ? 'Updating...' : 'Set New Password'}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6 text-center"
              >
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-neutral-900 tracking-tight">Password Reset Complete</h3>
                  <p className="text-xs font-bold text-neutral-400 mt-1">Your password has been successfully updated. You can now login to your account.</p>
                </div>

                <Link
                  href="/login"
                  className="w-full h-12 bg-neutral-950 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-950/10 flex items-center justify-center gap-2 group"
                >
                  Proceed to Login
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
`
  },

  // 2. LOGIN WHATSAPP
  {
    name: 'useLoginWhatsapp',
    hookFile: 'hooks/use-login-whatsapp.ts',
    pageFile: 'app/(auth)/login-whatsapp/page.tsx',
    hookCode: `'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth.service';

export function useLoginWhatsapp() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      toast({ title: 'Error', description: 'Silakan masukkan nomor WhatsApp Anda', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      await authService.requestOtp(cleanPhone);
      setStep('OTP');
      setCountdown(60);
      toast({ 
        title: 'OTP Terkirim!', 
        description: 'Silakan cek pesan WhatsApp Anda untuk kode verifikasi.',
      });
    } catch (err: any) {
      toast({ 
        title: 'Gagal Mengirim OTP', 
        description: err?.response?.data?.message || 'Pastikan nomor WhatsApp Anda benar.',
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      toast({ title: 'Error', description: 'Masukkan 6 digit kode OTP', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      const res = await authService.loginWithOtp(cleanPhone, otpCode);
      toast({ title: 'Berhasil!', description: \`Selamat datang kembali, \${res.fullName}\` });
      
      if (res.roles.includes('ROLE_ADMIN')) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      toast({ 
        title: 'Verifikasi Gagal', 
        description: err?.response?.data?.message || 'Kode OTP salah atau sudah kedaluwarsa.',
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    step,
    setStep,
    phoneNumber,
    setPhoneNumber,
    otpCode,
    setOtpCode,
    isLoading,
    countdown,
    handleRequestOtp,
    handleVerifyOtp,
  };
}
`,
    pageCode: `'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ArrowLeft, Loader2, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { useLoginWhatsapp } from '@/hooks/use-login-whatsapp';

export default function WhatsappLoginPage() {
  const {
    step,
    setStep,
    phoneNumber,
    setPhoneNumber,
    otpCode,
    setOtpCode,
    isLoading,
    countdown,
    handleRequestOtp,
    handleVerifyOtp,
  } = useLoginWhatsapp();

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 font-outfit">
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-50">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-8 text-sm font-semibold group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Kembali ke Login Email
          </Link>

          <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none">
            <div className="text-center mb-8">
              <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                {step === 'PHONE' ? 'Login via WhatsApp' : 'Verifikasi Kode OTP'}
              </h1>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
                {step === 'PHONE' 
                  ? 'Masuk cepat dan aman tanpa ribet mengingat kata sandi akun Anda.' 
                  : \`Masukkan 6 digit kode yang baru saja kami kirimkan ke \${phoneNumber}\`
                }
              </p>
            </div>

            <AnimatePresence mode="wait">
              {step === 'PHONE' ? (
                <motion.form 
                  key="phone-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleRequestOtp} 
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Nomor WhatsApp
                    </label>
                    <div className="relative">
                      <PhoneInput
                        international
                        defaultCountry="ID"
                        value={phoneNumber}
                        onChange={(val: any) => setPhoneNumber(val || '')}
                        className="flex h-12 w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 text-sm font-semibold focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-emerald-600/25 transition-all gap-2"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                    Kirim Kode OTP
                  </Button>
                </motion.form>
              ) : (
                <motion.form 
                  key="otp-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleVerifyOtp} 
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Kode Verifikasi (OTP)
                    </label>
                    <Input 
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="• • • • • •"
                      className="h-14 text-center tracking-[0.5em] text-2xl font-black rounded-2xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 focus:ring-emerald-500"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading || otpCode.length < 6}
                    className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-emerald-600/25 transition-all gap-2"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    Verifikasi & Masuk
                  </Button>

                  <div className="text-center pt-2">
                    {countdown > 0 ? (
                      <p className="text-xs font-semibold text-slate-400">
                        Kirim ulang kode dalam <span className="text-emerald-600 font-bold">{countdown} detik</span>
                      </p>
                    ) : (
                      <button 
                        type="button" 
                        onClick={handleRequestOtp} 
                        className="text-xs font-bold text-emerald-600 hover:underline"
                      >
                        Kirim Ulang Kode OTP
                      </button>
                    )}
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
`
  },

  // 3. LOGIN SUCCESS
  {
    name: 'useLoginSuccess',
    hookFile: 'hooks/use-login-success.ts',
    pageFile: 'app/login/success/page.tsx',
    hookCode: `'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth.service';

export function useLoginSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      authService.handleOAuthSuccess(token).then((user) => {
        if (user?.roles?.includes('ROLE_ADMIN')) {
          router.push('/admin');
        } else {
          router.push('/');
        }
        router.refresh();
      });
    } else {
      router.push('/login');
    }
  }, [router, searchParams]);
}
`,
    pageCode: `'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useLoginSuccess } from '@/hooks/use-login-success';

function LoginSuccessContent() {
  useLoginSuccess();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50/30">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-pink-500 mx-auto" />
        <h2 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Authenticating</h2>
        <p className="text-slate-400 font-bold text-sm">Finishing the premium handshake...</p>
      </div>
    </div>
  );
}

export default function LoginSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    }>
      <LoginSuccessContent />
    </Suspense>
  );
}
`
  },

  // 4. ORDER DETAIL
  {
    name: 'useOrderDetail',
    hookFile: 'hooks/use-order-detail.ts',
    pageFile: 'app/admin/orders/[id]/page.tsx',
    hookCode: `'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { OrderService } from '@/services/order.service';
import { Order, OrderStatus } from '@/types/order';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle2, Package, Truck, XCircle, AlertCircle, RefreshCcw } from 'lucide-react';

export const ORDER_STATUS_CONFIG: Partial<Record<OrderStatus, { label: string, color: string, icon: any }>> = {
  PENDING: { label: 'Pending Payment', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  PAID: { label: 'Payment Received', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
  PROCESSING: { label: 'Processing', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: Clock },
  DELIVERING: { label: 'Delivering', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Truck },
  COMPLETED: { label: 'Completed', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400', icon: Package },
  CANCELLED: { label: 'Cancelled', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: XCircle },
  COMPLAINT: { label: 'Complaint', color: 'bg-amber-50 text-amber-600', icon: AlertCircle },
  RETURNED: { label: 'Returned', color: 'bg-slate-100 text-slate-600', icon: RefreshCcw },
};

export function useOrderDetail() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    if (params.id) {
      const fetchOrder = async () => {
        try {
          const data = await OrderService.getById(Number(params.id));
          setOrder(data);
        } catch {
          toast({ title: 'Error', description: 'Failed to fetch order details', variant: 'destructive' });
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrder();
    }
  }, [params.id, toast]);

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!order) return;
    try {
      await OrderService.updateStatus(order.id, newStatus);
      setOrder({ ...order, status: newStatus });
      toast({ title: 'Success', description: \`Order status updated to \${newStatus}\` });
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const handleShipOrder = async () => {
    if (!order) return;
    if (!trackingNumber.trim()) {
      toast({ title: 'Error', description: 'Tracking number is required to ship the order', variant: 'destructive' });
      return;
    }
    
    try {
      await OrderService.addTrackingNumber(order.id, trackingNumber);
      await OrderService.updateStatus(order.id, 'DELIVERING');
      setOrder({ ...order, trackingNumber, status: 'DELIVERING' });
      toast({ title: 'Success', description: \`Order shipped with tracking number \${trackingNumber}\` });
      setTrackingNumber('');
    } catch {
      toast({ title: 'Error', description: 'Failed to ship order', variant: 'destructive' });
    }
  };

  const currentStatus = (order && ORDER_STATUS_CONFIG[order.status]) || { 
    label: 'Unknown', 
    color: 'bg-slate-100 text-slate-700', 
    icon: Package 
  };

  return {
    order,
    isLoading,
    trackingNumber,
    setTrackingNumber,
    currentStatus,
    handleUpdateStatus,
    handleShipOrder,
    router,
  };
}
`,
    pageCode: `'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Printer, Truck, CheckCircle2 } from 'lucide-react';
import { useOrderDetail } from '@/hooks/use-order-detail';

export default function OrderDetailsPage() {
  const {
    order,
    isLoading,
    trackingNumber,
    setTrackingNumber,
    currentStatus,
    handleUpdateStatus,
    handleShipOrder,
    router,
  } = useOrderDetail();

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>;
  if (!order) return <div className="text-center py-20">Order not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-white/40 border border-white/20">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Order {order.orderNumber}</h1>
            <p className="text-sm text-slate-500">{new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-full gap-2 border-slate-200">
            <Printer className="h-4 w-4" /> Print Invoice
          </Button>
          <div className={\`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm shadow-sm \${currentStatus.color}\`}>
            <currentStatus.icon className="h-4 w-4" />
            {currentStatus.label}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-lg">Order Items</h3>
            <div className="divide-y divide-slate-100">
              {order.items?.map((item: any) => (
                <div key={item.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm">{item.productName || item.product?.name || 'Product Item'}</p>
                    <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-sm">Rp {Number(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t flex justify-between font-bold">
              <span>Total</span>
              <span className="text-pink-600">Rp {Number(order.totalAmount || order.total || 0).toLocaleString()}</span>
            </div>
          </div>

          {order.status === 'PROCESSING' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-lg">Shipment Handling</h3>
              <div className="flex gap-3">
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter courier air waybill / tracking code..."
                  className="rounded-2xl"
                />
                <Button onClick={handleShipOrder} className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2">
                  <Truck size={16} /> Mark as Shipped
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-lg">Customer Info</h3>
            <div className="text-sm space-y-1">
              <p className="font-bold">{order.shippingAddress?.recipientName || 'Customer'}</p>
              <p className="text-slate-500">{order.shippingAddress?.phone}</p>
              <p className="text-slate-500">{order.shippingAddress?.fullAddress}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
            <h3 className="font-bold text-lg">Quick Status Change</h3>
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={() => handleUpdateStatus('PROCESSING')} className="justify-start">
                Mark as Processing
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleUpdateStatus('COMPLETED')} className="justify-start text-emerald-600">
                Mark as Completed
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleUpdateStatus('CANCELLED')} className="justify-start text-rose-600">
                Cancel Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`
  },

  // 5. ORDER TASKS
  {
    name: 'useOrderTasks',
    hookFile: 'hooks/use-order-tasks.ts',
    pageFile: 'app/admin/orders/tasks/page.tsx',
    hookCode: `'use client';

import { useEffect, useState, useRef } from 'react';
import { OrderWorkflowService } from '@/services/order-workflow.service';
import { WorkflowTask } from '@/types/order-workflow';
import { authService } from '@/services/auth.service';
import { useToast } from '@/hooks/use-toast';

export function useOrderTasks() {
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const isMounted = useRef(false);

  // Task Action State
  const [selectedTask, setSelectedTask] = useState<WorkflowTask | null>(null);
  const [actionType, setActionType] = useState<'REVIEW' | 'DELIVERY' | 'COMPLAINT' | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const res = await OrderWorkflowService.getAdminTasks();
      setTasks(res || []);
      setUser(authService.getUser());
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch workflow tasks', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted.current) return;
    fetchTasks();
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const handleCompleteTask = async (variables: Record<string, any>) => {
    if (!selectedTask) return;
    setIsProcessing(true);
    try {
      await OrderWorkflowService.completeTask(selectedTask.id, {
        ...variables,
        resolutionNote: actionType === 'COMPLAINT' ? resolutionNote : ''
      });
      toast({ title: 'Success', description: 'Task completed successfully' });
      setActionType(null);
      setSelectedTask(null);
      setResolutionNote('');
      fetchTasks();
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to complete task', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const openAction = (task: WorkflowTask) => {
    setSelectedTask(task);
    if (task.name.includes('Review')) setActionType('REVIEW');
    else if (task.name.includes('Tracking') || task.name.includes('Delivery')) setActionType('DELIVERY');
    else if (task.name.includes('Complaint')) setActionType('COMPLAINT');
    setTrackingNumber('');
  };

  const filteredTasks = tasks.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    String(t.variables.orderNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  return {
    tasks,
    isLoading,
    search,
    setSearch,
    filteredTasks,
    selectedTask,
    setSelectedTask,
    actionType,
    setActionType,
    trackingNumber,
    setTrackingNumber,
    resolutionNote,
    setResolutionNote,
    isProcessing,
    user,
    handleCompleteTask,
    openAction,
    fetchTasks,
  };
}
`,
    pageCode: `'use client';

import { ClipboardList, CheckCircle2, XCircle, Truck, Search, RefreshCw, User, Package, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { useOrderTasks } from '@/hooks/use-order-tasks';

export default function OrderTasksPage() {
  const {
    isLoading,
    search,
    setSearch,
    filteredTasks,
    selectedTask,
    setSelectedTask,
    actionType,
    setActionType,
    trackingNumber,
    setTrackingNumber,
    resolutionNote,
    setResolutionNote,
    isProcessing,
    user,
    handleCompleteTask,
    openAction,
    fetchTasks,
  } = useOrderTasks();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
             <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Order Workflow Tasks</h1>
            <p className="text-slate-500 text-sm mt-0.5">Tasks delegated to your role queue by Camunda BPM engine.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button onClick={fetchTasks} variant="outline" size="sm" className="rounded-2xl border-slate-200">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter tasks by name or order number..."
          className="pl-11 h-12 rounded-2xl bg-white border-slate-200"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400 font-bold text-sm">
            {isLoading ? 'Loading active tasks...' : 'No pending tasks assigned to you right now.'}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <Badge variant="pink" className="rounded-full text-[10px] uppercase font-bold px-3 py-1">
                  {task.name}
                </Badge>
                <span className="text-[10px] text-slate-400 font-mono">#{task.variables?.orderNumber}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Order #{task.variables?.orderNumber}</p>
                <p className="text-xs text-slate-500 mt-1">Total: Rp {Number(task.variables?.totalAmount || 0).toLocaleString()}</p>
              </div>
              <Button onClick={() => openAction(task)} className="w-full rounded-2xl bg-pink-500 hover:bg-pink-600 font-bold text-xs uppercase">
                Take Action
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Action Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Workflow Task</DialogTitle>
            <DialogDescription>{selectedTask?.name}</DialogDescription>
          </DialogHeader>

          {actionType === 'REVIEW' && (
            <div className="space-y-4 py-4">
              <p className="text-sm text-slate-600">Review payment & inventory for Order #{selectedTask?.variables?.orderNumber}.</p>
              <div className="flex gap-3">
                <Button onClick={() => handleCompleteTask({ isApproved: true })} disabled={isProcessing} className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
                </Button>
                <Button onClick={() => handleCompleteTask({ isApproved: false })} disabled={isProcessing} variant="outline" className="flex-1 rounded-2xl text-rose-600">
                  <XCircle className="h-4 w-4 mr-2" /> Reject
                </Button>
              </div>
            </div>
          )}

          {actionType === 'DELIVERY' && (
            <div className="space-y-4 py-4">
              <Label>Courier Tracking / Waybill Number</Label>
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. JNE123456789"
                className="rounded-2xl"
              />
              <DialogFooter>
                <Button onClick={() => handleCompleteTask({ trackingNumber })} disabled={isProcessing || !trackingNumber} className="w-full rounded-2xl bg-blue-600">
                  Confirm Shipment
                </Button>
              </DialogFooter>
            </div>
          )}

          {actionType === 'COMPLAINT' && (
            <div className="space-y-4 py-4">
              <Label>Resolution Notes</Label>
              <Input
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Refund issued or replacement sent..."
                className="rounded-2xl"
              />
              <DialogFooter>
                <Button onClick={() => handleCompleteTask({ resolutionNote })} disabled={isProcessing || !resolutionNote} className="w-full rounded-2xl bg-amber-600">
                  Resolve Complaint
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
`
  },

  // 6. STOCK DETAIL
  {
    name: 'useStockDetail',
    hookFile: 'hooks/use-stock-detail.ts',
    pageFile: 'app/admin/stock/[id]/page.tsx',
    hookCode: `'use client';

import React, { useEffect, useState } from 'react';
import { ProductService } from '@/services/product.service';
import { Product, ProductVariant } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { ColumnDef } from '@tanstack/react-table';
import { StockTransactionService } from '@/services/stock-transaction.service';
import { StockSummary, StockTransaction } from '@/types/stock';

export function useStockDetail(productId: number) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [summaries, setSummaries] = useState<Record<number, StockSummary>>({});
  const [history, setHistory] = useState<StockTransaction[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(0);

  const [activeTab, setActiveTab] = useState<'variants' | 'history'>('variants');
  const { toast } = useToast();

  // Modal State
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [modalType, setModalType] = useState<'ADD' | 'ADJUST' | 'LOG' | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Per-Variant History State
  const [variantHistory, setVariantHistory] = useState<StockTransaction[]>([]);
  const [isVariantHistoryLoading, setIsVariantHistoryLoading] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await ProductService.getById(productId);
      setProduct(data);

      const variantIds = data.variants.map((v: any) => v.id);
      if (variantIds.length > 0) {
        const summaryResults = await StockTransactionService.getSummaries(variantIds);
        const summaryMap: Record<number, StockSummary> = {};
        summaryResults.forEach((s: any) => {
          summaryMap[s.variantId] = s;
        });
        setSummaries(summaryMap);
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch product data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setIsHistoryLoading(true);
      const res = await StockTransactionService.getHistoryByProduct(productId, historyPage, 10);
      setHistory(res.content);
      setHistoryTotalPages(res.totalPages);
    } catch (error) {
      console.error('Failed to fetch history', error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [productId]);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [productId, activeTab, historyPage]);

  const handleOpenAction = (variant: ProductVariant, type: 'ADD' | 'ADJUST') => {
    setSelectedVariant(variant);
    setModalType(type);
    setAmount(0);
    setNotes('');
  };

  const handleOpenLog = async (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setModalType('LOG');
    setVariantHistory([]);
    try {
      setIsVariantHistoryLoading(true);
      const res = await StockTransactionService.getHistoryByVariant(variant.id, 0, 50);
      setVariantHistory(res.content || []);
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch variant history', variant: 'destructive' });
    } finally {
      setIsVariantHistoryLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedVariant) return;
    setIsActionLoading(true);
    try {
      if (modalType === 'ADD') {
        await StockTransactionService.addStock({
          variantId: selectedVariant.id,
          quantity: amount,
          notes
        });
        toast({ title: 'Success', description: \`Added \${amount} to \${selectedVariant.sku}\` });
      } else if (modalType === 'ADJUST') {
        await StockTransactionService.adjustStock({
          variantId: selectedVariant.id,
          quantity: amount,
          notes
        });
        toast({ title: 'Success', description: \`Adjusted \${selectedVariant.sku} to \${amount}\` });
      }
      setModalType(null);
      fetchData();
      if (activeTab === 'history') fetchHistory();
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Action failed', variant: 'destructive' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const totalStock = product?.variants?.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) || 0;

  return {
    product,
    isLoading,
    summaries,
    history,
    isHistoryLoading,
    historyPage,
    setHistoryPage,
    historyTotalPages,
    activeTab,
    setActiveTab,
    selectedVariant,
    setSelectedVariant,
    modalType,
    setModalType,
    amount,
    setAmount,
    notes,
    setNotes,
    isActionLoading,
    variantHistory,
    isVariantHistoryLoading,
    handleOpenAction,
    handleOpenLog,
    handleAction,
    totalStock,
  };
}
`,
    pageCode: `'use client';

import { use } from 'react';
import {
  Package,
  ArrowLeft,
  History,
  PlusCircle,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { formatImageUrl } from '@/lib/url-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useStockDetail } from '@/hooks/use-stock-detail';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductStockDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const productId = parseInt(resolvedParams.id);

  const {
    product,
    isLoading,
    summaries,
    history,
    historyPage,
    setHistoryPage,
    historyTotalPages,
    activeTab,
    setActiveTab,
    selectedVariant,
    modalType,
    setModalType,
    amount,
    setAmount,
    notes,
    setNotes,
    isActionLoading,
    variantHistory,
    isVariantHistoryLoading,
    handleOpenAction,
    handleOpenLog,
    handleAction,
    totalStock,
  } = useStockDetail(productId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Product not found.</p>
        <Link href="/admin/stock">
          <Button variant="link" className="text-pink-500 mt-2">Back to Inventory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/admin/stock" className="text-pink-500 hover:text-pink-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Inventory Management</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
            {product.name}
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">{product.category?.name || 'Category'} • Total Stock: {totalStock}</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={activeTab === 'variants' ? 'default' : 'outline'}
            onClick={() => setActiveTab('variants')}
            className="rounded-2xl font-bold"
          >
            Variants
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'outline'}
            onClick={() => setActiveTab('history')}
            className="rounded-2xl font-bold"
          >
            History Log
          </Button>
        </div>
      </div>

      {activeTab === 'variants' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {product.variants?.map((v) => (
            <div key={v.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-slate-900 uppercase">{v.sku}</p>
                  <p className="text-xs text-slate-400">{v.size} / {v.color}</p>
                </div>
                <Badge variant="outline" className="text-xs font-bold font-mono">
                  {v.stock || 0} in stock
                </Badge>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button size="sm" variant="outline" onClick={() => handleOpenAction(v, 'ADD')} className="flex-1 rounded-xl gap-1 text-xs">
                  <PlusCircle size={14} /> Add
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleOpenAction(v, 'ADJUST')} className="flex-1 rounded-xl gap-1 text-xs">
                  <ArrowRightLeft size={14} /> Adjust
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleOpenLog(v)} className="rounded-xl text-xs">
                  <History size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4">
          <h3 className="font-bold text-lg">Product Transaction Log</h3>
          <div className="divide-y divide-slate-100">
            {history.map((tx) => (
              <div key={tx.id} className="py-3 flex justify-between items-center text-sm">
                <div>
                  <p className="font-bold">{tx.type} ({tx.quantityChange > 0 ? \`+\${tx.quantityChange}\` : tx.quantityChange})</p>
                  <p className="text-xs text-slate-400">{new Date(tx.createdAt).toLocaleString()} • {tx.notes || 'No notes'}</p>
                </div>
                <span className="font-mono font-bold text-slate-700">Balance: {tx.finalStock}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={!!modalType} onOpenChange={() => setModalType(null)}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle>
              {modalType === 'ADD' ? 'Add Stock' : modalType === 'ADJUST' ? 'Adjust Stock' : 'Variant History'}
            </DialogTitle>
            <DialogDescription>{selectedVariant?.sku}</DialogDescription>
          </DialogHeader>

          {modalType !== 'LOG' ? (
            <div className="space-y-4 py-4">
              <div>
                <Label>{modalType === 'ADD' ? 'Quantity to Add' : 'New Exact Stock Total'}</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="rounded-2xl mt-1"
                />
              </div>
              <div>
                <Label>Audit Notes</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reason for stock movement..."
                  className="rounded-2xl mt-1"
                />
              </div>
              <DialogFooter>
                <Button onClick={handleAction} disabled={isActionLoading} className="w-full rounded-2xl bg-pink-500 font-bold">
                  Submit
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 py-4">
              {variantHistory.map((h) => (
                <div key={h.id} className="text-xs border-b pb-2 flex justify-between">
                  <span>{new Date(h.createdAt).toLocaleDateString()} - {h.type}</span>
                  <span className="font-bold font-mono">{h.quantityChange} (Bal: {h.finalStock})</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
`
  },

  // 7. WHATSAPP
  {
    name: 'useWhatsapp',
    hookFile: 'hooks/use-whatsapp.ts',
    pageFile: 'app/admin/whatsapp/page.tsx',
    hookCode: `'use client';

import { useState, useEffect, useCallback } from 'react';
import { whatsappService } from '@/services/whatsapp.service';
import { useToast } from '@/hooks/use-toast';

export function useWhatsapp() {
  const { toast } = useToast();
  const [status, setStatus] = useState<string>('INITIALIZING');
  const [deviceNumber, setDeviceNumber] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  
  // Test Message state
  const [testPhone, setTestPhone] = useState<string | undefined>();
  const [testMessage, setTestMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const fetchQr = async () => {
    setQrLoading(true);
    try {
      const url = await whatsappService.fetchQrCodeBlob();
      setQrUrl(url);
    } catch (error) {
      console.error('Failed to fetch QR code', error);
    } finally {
      setQrLoading(false);
    }
  };

  const fetchStatus = useCallback(async () => {
    try {
      const data = await whatsappService.getStatus();
      setStatus(data.status);
      setDeviceNumber(data.deviceNumber || null);

      if (data.status === 'QR_READY') {
        if (!qrUrl && !qrLoading) {
          fetchQr();
        }
      } else if (data.status === 'READY' || data.status === 'AUTHENTICATED') {
        setQrUrl(null);
      } else {
        setQrUrl(null);
      }
    } catch (error) {
      console.error('Failed to fetch WhatsApp status', error);
    }
  }, [qrUrl, qrLoading]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await whatsappService.logoutSession();
      toast({ title: 'Success', description: 'Logged out successfully' });
      setStatus('DISCONNECTED');
      setDeviceNumber(null);
      setQrUrl(null);
      fetchStatus();
    } catch {
      toast({ title: 'Error', description: 'Failed to logout', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!testPhone || !testMessage) return;
    setIsSending(true);
    try {
      toast({ title: 'Success', description: 'Test message triggered' });
      setTestMessage('');
    } catch {
      toast({ title: 'Error', description: 'Failed to send test message', variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  return {
    status,
    deviceNumber,
    qrUrl,
    isLoading,
    qrLoading,
    testPhone,
    setTestPhone,
    testMessage,
    setTestMessage,
    isSending,
    handleLogout,
    handleSendTest,
    fetchQr,
    fetchStatus,
  };
}
`,
    pageCode: `'use client';

import {
  QrCode,
  RefreshCcw,
  LogOut,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Smartphone,
  ShieldCheck,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { useWhatsapp } from '@/hooks/use-whatsapp';

export default function WhatsAppAdminPage() {
  const {
    status,
    deviceNumber,
    qrUrl,
    isLoading,
    qrLoading,
    testPhone,
    setTestPhone,
    testMessage,
    setTestMessage,
    isSending,
    handleLogout,
    handleSendTest,
    fetchQr,
    fetchStatus,
  } = useWhatsapp();

  const isConnected = status === 'READY' || status === 'AUTHENTICATED';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-outfit">
      <div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">WhatsApp Gateway</h1>
        <p className="text-slate-500 text-sm mt-1">Manage connection status and automated notifications via WhatsApp.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-slate-200 dark:border-white/10 shadow-sm rounded-3xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Device Status</CardTitle>
                <CardDescription>Gateway connection state</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                    <CheckCircle2 size={16} /> Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                    <AlertCircle size={16} /> {status}
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isConnected ? (
              <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center">
                    <Smartphone size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{deviceNumber || 'Connected Device'}</p>
                    <p className="text-xs text-slate-500">Ready to broadcast notifications</p>
                  </div>
                </div>
                <Button onClick={handleLogout} disabled={isLoading} variant="outline" className="rounded-xl border-rose-200 text-rose-600">
                  <LogOut size={16} className="mr-2" /> Disconnect Session
                </Button>
              </div>
            ) : (
              <div className="text-center py-10 space-y-4 border-2 border-dashed rounded-3xl">
                {qrUrl ? (
                  <div className="space-y-4">
                    <img src={qrUrl} alt="WhatsApp QR Code" className="w-64 h-64 mx-auto rounded-2xl border" />
                    <p className="text-xs text-slate-500">Scan this QR code using WhatsApp on your device</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <QrCode size={48} className="mx-auto text-slate-400" />
                    <p className="text-sm font-bold text-slate-600">No active QR session</p>
                    <Button onClick={fetchQr} disabled={qrLoading} className="rounded-xl bg-pink-500">
                      {qrLoading ? <Loader2 className="animate-spin mr-2" /> : <RefreshCcw className="mr-2" />} Request QR
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Send Test Card */}
        <Card className="border-slate-200 dark:border-white/10 shadow-sm rounded-3xl">
          <CardHeader>
            <CardTitle className="text-xl">Test Message</CardTitle>
            <CardDescription>Send test WhatsApp alert</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">Target Phone</label>
              <PhoneInput
                international
                defaultCountry="ID"
                value={testPhone}
                onChange={setTestPhone}
                className="flex h-10 w-full rounded-xl border border-slate-200 px-3 text-xs"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">Message Body</label>
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                rows={3}
                placeholder="Hello from Zelvira Admin!"
                className="w-full text-xs p-3 rounded-xl border border-slate-200"
              />
            </div>
            <Button onClick={handleSendTest} disabled={isSending || !testPhone || !testMessage} className="w-full rounded-xl bg-emerald-600 font-bold gap-2">
              <Send size={16} /> Send Test
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
`
  },

  // 8. INTEGRATIONS
  {
    name: 'useIntegrations',
    hookFile: 'hooks/use-integrations.ts',
    pageFile: 'app/admin/integrations/page.tsx',
    hookCode: `'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { DigiflazzService } from '@/services/digiflazz.service';
import { digitalProductService } from '@/services/digital-product.service';

export function useIntegrations() {
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [digiflazzBalance, setDigiflazzBalance] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  const handleConnect = async (marketplace: string) => {
    setIsConnecting(marketplace);
    try {
      const res = await fetch(\`/api/marketplace/auth-url/\${marketplace}\`);
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          toast.success(\`Redirecting to \${marketplace} authorization...\`);
        }
      }
    } catch {
      toast.error(\`Failed to connect to \${marketplace}\`);
    } finally {
      setTimeout(() => setIsConnecting(null), 1000);
    }
  };

  const checkDigiflazzBalance = async () => {
    try {
      toast.loading('Checking balance...', { id: 'balance' });
      const res = await DigiflazzService.checkBalance();
      setDigiflazzBalance(res.deposit);
      toast.success(\`Balance: Rp \${res.deposit.toLocaleString()}\`, { id: 'balance' });
    } catch {
      toast.error('Failed to get Digiflazz balance', { id: 'balance' });
    }
  };

  const handleSyncProducts = async (type: 'prepaid' | 'pasca') => {
    setIsSyncing(type);
    toast.loading(\`Syncing \${type} products...\`, { id: 'sync' });
    try {
      await digitalProductService.syncProducts(type);
      toast.success(\`Successfully triggered \${type} product sync\`, { id: 'sync' });
    } catch {
      toast.error(\`Failed to sync \${type} products\`, { id: 'sync' });
    } finally {
      setIsSyncing(null);
    }
  };

  return {
    isConnecting,
    digiflazzBalance,
    isSyncing,
    handleConnect,
    checkDigiflazzBalance,
    handleSyncProducts,
  };
}
`,
    pageCode: `'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, CheckCircle2, AlertCircle, RefreshCw, Wallet } from 'lucide-react';
import { useIntegrations } from '@/hooks/use-integrations';

export default function IntegrationsPage() {
  const {
    digiflazzBalance,
    isSyncing,
    checkDigiflazzBalance,
    handleSyncProducts,
  } = useIntegrations();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">Marketplace & Service Integrations</h1>
          <p className="text-slate-500 text-sm mt-1">Connect your Zelvira store to external marketplaces and digital product suppliers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="bg-blue-600 text-white p-3 rounded-2xl">
                <Smartphone className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500">
                {digiflazzBalance !== null ? (
                  <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Connected</span>
                ) : (
                  <><AlertCircle className="h-3 w-3" /> Verify Connection</>
                )}
              </div>
            </div>
            <CardTitle>Digiflazz PPOB</CardTitle>
            <CardDescription>Jual pulsa, paket data, dan token PLN secara otomatis.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg flex items-center justify-between border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Saldo Deposit</span>
              </div>
              <span className="font-bold text-blue-600">
                {digiflazzBalance !== null ? \`Rp \${digiflazzBalance.toLocaleString()}\` : '???'}
              </span>
            </div>

            <div className="flex gap-2">
              <Button onClick={checkDigiflazzBalance} variant="outline" size="sm" className="flex-1 rounded-xl">
                Check Balance
              </Button>
              <Button onClick={() => handleSyncProducts('prepaid')} disabled={isSyncing !== null} size="sm" className="flex-1 rounded-xl bg-blue-600">
                <RefreshCw className={\`h-3.5 w-3.5 mr-1 \${isSyncing === 'prepaid' ? 'animate-spin' : ''}\`} /> Sync Products
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
`
  },

  // 9. SEARCH ANALYTICS
  {
    name: 'useSearchAnalytics',
    hookFile: 'hooks/use-search-analytics.ts',
    pageFile: 'app/admin/search/page.tsx',
    hookCode: `'use client';

import { useEffect, useState } from 'react';

const mockData = [
  { id: 1, keyword: 'Iphone 15 Pro Max', count: 1250, trend: 'up' },
  { id: 2, keyword: 'Sepatu Lari Nike', count: 840, trend: 'up' },
  { id: 3, keyword: 'Kaos Oversized Black', count: 720, trend: 'steady' },
  { id: 4, keyword: 'Mechanical Keyboard Blue Switch', count: 580, trend: 'up' },
  { id: 5, keyword: 'Smartwatch Gen 6', count: 420, trend: 'down' },
  { id: 6, keyword: 'SSD NVMe 1TB', count: 390, trend: 'up' },
  { id: 7, keyword: 'Laptop Gaming RTX 4060', count: 310, trend: 'up' },
  { id: 8, keyword: 'Headset Wireless 7.1', count: 280, trend: 'steady' },
];

export function useSearchAnalytics() {
  const [trending, setTrending] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTrending(mockData);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return {
    trending,
    isLoading,
  };
}
`,
    pageCode: `'use client';

import { Search, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSearchAnalytics } from '@/hooks/use-search-analytics';

export default function SearchAnalyticsPage() {
  const { trending } = useSearchAnalytics();

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
             <Search className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">Search Insights</h1>
            <p className="text-slate-500 text-sm font-bold italic">Monitor what your customers are searching for in real-time.</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-100/50 p-8">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-pink-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Trending Keywords</h3>
            </div>
            <Badge variant="outline" className="rounded-full px-3 py-1 text-[10px] uppercase font-black bg-slate-50 border-slate-200">Last 7 Days</Badge>
        </div>

        <div className="space-y-4">
           {trending.map((item, index) => (
             <div key={item.id} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-slate-200 dark:hover:border-white/10">
               <div className="flex items-center gap-6">
                 <span className="text-2xl font-black text-slate-200 group-hover:text-pink-500 transition-colors w-8">#{index + 1}</span>
                 <div className="flex flex-col">
                   <span className="text-md font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight transition-all group-hover:translate-x-1">{item.keyword}</span>
                   <span className="text-xs text-slate-400 font-bold">{item.count.toLocaleString()} unique searches</span>
                 </div>
               </div>
               <div className="flex items-center gap-4">
                  {item.trend === 'up' && <Badge className="bg-emerald-500/10 text-emerald-600 border-none rounded-full h-8 w-8 p-0 flex items-center justify-center shadow-none"><TrendingUp className="h-4 w-4" /></Badge>}
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
`
  },

  // 10. SETTINGS GENERAL
  {
    name: 'useSettingsGeneral',
    hookFile: 'hooks/use-settings-general.ts',
    pageFile: 'app/admin/settings/general/page.tsx',
    hookCode: `'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export function useSettingsGeneral() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    googleAnalyticsId: 'G-XXXXXXXXXX',
    fcmServerKey: 'AAAA...',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    settings,
    setSettings,
    handleSave,
  };
}
`,
    pageCode: `'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Globe, Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSettingsGeneral } from '@/hooks/use-settings-general';

export default function GeneralSettingsPage() {
  const {
    loading,
    settings,
    setSettings,
    handleSave,
  } = useSettingsGeneral();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/admin/settings">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">App Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage global configurations and system-wide keys.</p>
        </div>
      </div>

      <Tabs defaultValue="security" className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-white/5 p-1 rounded-2xl h-14 border border-slate-200 dark:border-white/10">
          <TabsTrigger value="security" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
            <Shield className="w-4 h-4 mr-2" /> Security & Keys
          </TabsTrigger>
          <TabsTrigger value="general" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
            <Globe className="w-4 h-4 mr-2" /> General
          </TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-slate-200 dark:border-white/10 rounded-[2rem]">
            <CardHeader>
              <CardTitle className="text-lg">Firebase & Cloud Messaging</CardTitle>
              <CardDescription>Keys for push notifications and authentication.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">FCM Server Key (Legacy)</Label>
                <Input
                  type="password"
                  value={settings.fcmServerKey}
                  onChange={(e) => setSettings({ ...settings, fcmServerKey: e.target.value })}
                  className="h-12 rounded-xl font-mono"
                />
              </div>
            </CardContent>
            <CardFooter className="justify-end p-6">
              <Button onClick={handleSave} disabled={loading} className="rounded-xl bg-pink-500 hover:bg-pink-600 px-8 h-11 font-bold">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Keys
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card className="border-slate-200 dark:border-white/10 rounded-[2rem]">
            <CardHeader>
              <CardTitle className="text-lg">General System Config</CardTitle>
              <CardDescription>Miscellaneous global settings.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Google Analytics ID</Label>
                <Input
                  value={settings.googleAnalyticsId}
                  onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
            </CardContent>
            <CardFooter className="justify-end p-6">
              <Button onClick={handleSave} disabled={loading} className="rounded-xl bg-pink-500 hover:bg-pink-600 px-8 h-11 font-bold">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
`
  },

  // 11. SETTINGS MOBILE
  {
    name: 'useSettingsMobile',
    hookFile: 'hooks/use-settings-mobile.ts',
    pageFile: 'app/admin/settings/mobile/page.tsx',
    hookCode: `'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export function useSettingsMobile() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    mobileAppVersion: '1.0.5',
    minAppVersion: '1.0.0',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Mobile settings saved successfully');
    } catch {
      toast.error('Failed to save mobile settings');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    settings,
    setSettings,
    handleSave,
  };
}
`,
    pageCode: `'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, Bell, Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSettingsMobile } from '@/hooks/use-settings-mobile';

export default function MobileSettingsPage() {
  const {
    loading,
    settings,
    setSettings,
    handleSave,
  } = useSettingsMobile();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/admin/settings">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">Mobile App Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Control the current version and update policy of your applications.</p>
        </div>
      </div>

      <Card className="border-slate-200 dark:border-white/10 rounded-[2rem] overflow-hidden">
        <CardHeader className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-xl text-pink-600">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-lg">Mobile Versioning</CardTitle>
              <CardDescription>Android & iOS version control</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Current App Version</Label>
              <Input
                value={settings.mobileAppVersion}
                onChange={(e) => setSettings({ ...settings, mobileAppVersion: e.target.value })}
                placeholder="e.g. 1.0.5"
                className="h-12 rounded-xl"
              />
              <p className="text-[10px] text-slate-400 italic font-medium">The version shown to users in the app.</p>
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Minimum Required Version</Label>
              <Input
                value={settings.minAppVersion}
                onChange={(e) => setSettings({ ...settings, minAppVersion: e.target.value })}
                placeholder="e.g. 1.0.0"
                className="h-12 rounded-xl"
              />
              <p className="text-[10px] text-slate-400 italic font-medium">Users below this version will be prompted to update.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex gap-3">
            <Bell className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              Updating the minimum version will trigger a force-update overlay for all users currently on older versions.
            </p>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 p-6 justify-end">
          <Button onClick={handleSave} disabled={loading} className="rounded-xl bg-pink-500 hover:bg-pink-600 px-8 h-11 font-bold shadow-lg shadow-pink-500/20">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Mobile Config
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
`
  },

  // 12. SUPPORT ROOMS
  {
    name: 'useSupportRooms',
    hookFile: 'hooks/use-support-rooms.ts',
    pageFile: 'app/admin/support/page.tsx',
    hookCode: `'use client';

import { useState, useEffect } from 'react';

export interface ChatRoom {
  id: number;
  roomId: string;
  createdAt: string;
  updatedAt: string;
}

export function useSupportRooms() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRooms = async () => {
    try {
      const res = await fetch('https://api.zelvira.co.id/api/v1/chat/rooms');
      const data = await res.json();
      if (data.success) {
        setRooms(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch chat rooms', error);
    }
  };

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredRooms = rooms.filter((room) =>
    room.roomId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    rooms,
    selectedRoomId,
    setSelectedRoomId,
    searchTerm,
    setSearchTerm,
    filteredRooms,
    fetchRooms,
  };
}
`,
    pageCode: `'use client';

import ChatAdmin from '@/components/admin/ChatAdmin';
import { Card } from '@/components/ui/card';
import { MessagesSquare, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSupportRooms } from '@/hooks/use-support-rooms';

export default function SupportChatPage() {
  const {
    selectedRoomId,
    setSelectedRoomId,
    searchTerm,
    setSearchTerm,
    filteredRooms,
  } = useSupportRooms();

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
            <MessagesSquare className="text-blue-600" size={32} />
            Customer Support
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Manage and respond to customer inquiries in real-time.</p>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden bg-white/60 shadow-xl border-none rounded-3xl flex">
        <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                placeholder="Search room ID..." 
                className="pl-10 rounded-full border-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredRooms.length === 0 ? (
              <div className="text-center p-8 text-slate-400 text-sm font-medium">
                No active chat rooms found.
              </div>
            ) : (
              filteredRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.roomId)}
                  className={\`w-full text-left p-4 rounded-2xl transition-all \${
                    selectedRoomId === room.roomId 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'hover:bg-white text-slate-700'
                  }\`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold truncate pr-2">{room.roomId}</span>
                    <span className={\`text-[10px] font-bold \${selectedRoomId === room.roomId ? 'text-blue-200' : 'text-slate-400'}\`}>
                      {new Date(room.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={\`text-xs truncate \${selectedRoomId === room.roomId ? 'text-blue-100' : 'text-slate-500'}\`}>
                    Tap to view conversation
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 bg-white/50 flex flex-col">
          {selectedRoomId ? (
            <ChatAdmin roomId={selectedRoomId} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <MessagesSquare size={48} className="opacity-20" />
              <p className="font-medium text-sm">Select a room from the left to start chatting</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
`
  }
];

module.exports = { specialGenerators };
