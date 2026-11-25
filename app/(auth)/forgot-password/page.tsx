'use client';

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
                        id={`otp-${idx}`}
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
