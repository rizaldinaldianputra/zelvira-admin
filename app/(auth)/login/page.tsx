'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield,
  Layers,
  Store,
  BarChart3,
  Sparkles,
  Lock,
  Cpu,
} from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen w-full flex bg-slate-950 text-white font-outfit">
      {/* Left Side: Enterprise Admin Console Branding */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 lg:p-16 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-r border-white/5">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-violet-500/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center gap-4">
          <img
            src="/logo.png"
            alt="Zelixa Logo"
            className="h-12 w-auto max-w-[200px] object-contain drop-shadow"
          />
          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">
            Admin Console
          </span>
        </div>

        {/* Center: Mission & Control Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 space-y-8 my-auto py-8"
        >
          <div className="space-y-3">
            <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-tight text-white uppercase">
              Pusat Kendali <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-400 via-rose-400 to-amber-300">
                Operasional Toko
              </span>
            </h1>
            <p className="text-slate-400 text-sm xl:text-base max-w-lg leading-relaxed">
              Platform terpadu untuk pengelolaan katalog, inventaris multi-varian, sinkronisasi marketplace TikTok Shop, dan monitoring order secara real-time.
            </p>
          </div>

          {/* 3 Core System Pillars */}
          <div className="space-y-3 max-w-lg">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3.5 backdrop-blur-sm">
              <div className="h-10 w-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center flex-shrink-0">
                <Store size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Multi-Channel Sync</h4>
                <p className="text-[11px] text-slate-400">Sinkronisasi produk dan stok otomatis ke TikTok Shop & Marketplace.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3.5 backdrop-blur-sm">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <BarChart3 size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Live Analytics & Tasks</h4>
                <p className="text-[11px] text-slate-400">Antrean verifikasi order, pencetakan resi, dan analisis omset penjualan harian.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3.5 backdrop-blur-sm">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center flex-shrink-0">
                <Lock size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Enterprise Security (RBAC)</h4>
                <p className="text-[11px] text-slate-400">Hak akses terbatas berbasis peran dengan enkripsi sesi berstandar tinggi.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Note */}
        <div className="relative z-10 pt-4 border-t border-white/5 text-xs text-slate-500 flex items-center justify-between">
          <p>© {new Date().getFullYear()} Zelvira Enterprise System v2.0</p>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-slate-400 font-medium">Server Online</span>
          </div>
        </div>
      </div>

      {/* Right Side: Admin Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-16 relative bg-slate-950">
        {/* Mobile Header */}
        <div className="absolute top-8 left-0 w-full flex flex-col items-center gap-2 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-pink-500 flex items-center justify-center text-white">
              <Shield size={16} />
            </div>
            <span className="text-2xl font-black uppercase italic tracking-tighter text-white">zelvira</span>
            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">
              Admin
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md pt-12 lg:pt-0"
        >
          <LoginForm />
        </motion.div>
      </div>
    </div>
  );
}
