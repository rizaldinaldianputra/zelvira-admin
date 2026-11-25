import Link from 'next/link';
import Image from 'next/image';
import { Home, Sparkles, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminNotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md mx-auto w-full flex flex-col items-center">
        {/* Logo */}
        <Link href="/admin" className="inline-block mb-8 transition-transform hover:scale-105">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
            <Image
              src="/logo.png"
              alt="Zelvira Admin"
              width={160}
              height={50}
              className="h-9 w-auto object-contain"
              priority
            />
          </div>
        </Link>

        {/* 404 Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-900/50 text-pink-600 dark:text-pink-400 text-xs font-bold uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Error 404 • Halaman Admin Tidak Ditemukan</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-3 text-slate-900 dark:text-white">
          Menu Belum Tersedia
        </h1>

        {/* Description */}
        <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto mb-8 leading-relaxed">
          Modul atau alamat halaman admin yang Anda tuju mungkin sudah dipindahkan, dihapus, atau memerlukan izin akses khusus.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <Link href="/admin">
            <Button className="rounded-2xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 font-bold text-xs uppercase tracking-wider h-11 px-6 shadow-sm flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Admin</span>
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="outline" className="rounded-2xl border-slate-200 dark:border-white/10 text-xs font-bold h-11 px-5">
              <span>System Settings</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

