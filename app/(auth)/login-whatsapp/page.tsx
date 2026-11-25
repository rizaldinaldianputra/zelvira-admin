'use client';

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
                  : `Masukkan 6 digit kode yang baru saja kami kirimkan ke ${phoneNumber}`
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
