'use client';

import {
  LayoutTemplate,
  Shirt,
  Plus,
  ArrowRight,
  Monitor,
  Smartphone,
  Grid3X3,
  Star,
  Zap,
  Bell,
  Package,
  Image as ImageIcon,
  Heart,
  MessageSquare,
  TrendingUp,
  Sparkles,
  Crown,
  Flame,
  ShoppingBag,
  Tag,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

type Platform = 'WEB' | 'MOBILE';

interface ContentType {
  title: string;
  description: string;
  type: string;
  icon: any;
  color: string;
  lightColor: string;
  href: string;
  addHref: string;
  fields: string[];
}

const WEB_CONTENT_TYPES: ContentType[] = [
  {
    title: 'Hero Carousel',
    description: 'Banner slideshow utama di bagian atas homepage website. Gambar besar + judul + CTA.',
    type: 'HERO_CAROUSEL',
    icon: LayoutTemplate,
    color: 'from-pink-500 to-rose-600',
    lightColor: 'bg-pink-50 text-pink-600 dark:bg-pink-500/10',
    href: '/admin/content/web/HERO_CAROUSEL',
    addHref: '/admin/content/web/HERO_CAROUSEL/new',
    fields: ['Gambar', 'Judul', 'Subjudul', 'CTA Button', 'Background Gradient'],
  },
  {
    title: 'Featured Products',
    description: 'Pusat kurasi produk untuk 4 seksi beranda: Koleksi Unggulan, New Arrivals, Promo Sale, dan Populer/Trending.',
    type: 'FEATURED_PRODUCTS',
    icon: ShoppingBag,
    color: 'from-pink-500 via-rose-500 to-indigo-600',
    lightColor: 'bg-pink-50 text-pink-600 dark:bg-pink-500/10',
    href: '/admin/content/web/FEATURED_PRODUCTS',
    addHref: '/admin/content/web/FEATURED_PRODUCTS',
    fields: ['Produk Master', 'Pilihan Tab Seksi (4 Kategori)', 'Corner Badge', 'Urutan Tampil'],
  },
  {
    title: 'Flash Sale Web',
    description: 'Promo kilat di halaman web dengan countdown timer dan daftar multi-produk diskon.',
    type: 'FLASH_SALE_WEB',
    icon: Zap,
    color: 'from-orange-500 to-red-600',
    lightColor: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10',
    href: '/admin/flash-sales/web',
    addHref: '/admin/flash-sales/web/new',
    fields: ['Banner Sesi', 'Countdown Timer', 'Multi-Product List'],
  },
  {
    title: 'Exclusive Deals',
    description: 'Banner penawaran diskon eksklusif dan kurasi daftar produk promo untuk halaman /deals & beranda.',
    type: 'DEALS',
    icon: Tag,
    color: 'from-purple-500 via-pink-600 to-rose-600',
    lightColor: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10',
    href: '/admin/content/web/DEALS',
    addHref: '/admin/content/web/DEALS/new',
    fields: ['Banner Promo', 'Judul & Badge', 'CTA Link', 'Daftar Produk Deals (Multi-Product)'],
  },
  {
    title: 'News & Articles',
    description: 'Berita galeri, update koleksi, atau artikel fashion yang tampil di website.',
    type: 'NEWS',
    icon: LayoutTemplate,
    color: 'from-orange-400 to-amber-500',
    lightColor: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10',
    href: '/admin/news',
    addHref: '/admin/news/new',
    fields: ['Judul', 'Thumbnail', 'Banner', 'Konten (HTML)'],
  },
];

const MOBILE_CONTENT_TYPES: ContentType[] = [
  {
    title: 'Promo Carousel',
    description: 'Banner slideshow gradient di bagian atas aplikasi mobile. Tile, subtitle, dan deep link.',
    type: 'MOBILE_PROMO',
    icon: Smartphone,
    color: 'from-teal-500 to-cyan-600',
    lightColor: 'bg-teal-50 text-teal-600 dark:bg-teal-500/10',
    href: '/admin/content/mobile/MOBILE_PROMO',
    addHref: '/admin/content/mobile/MOBILE_PROMO/new',
    fields: ['Judul', 'Subtitle', 'Tag Chip', 'Gradient Colors', 'Deep Link'],
  },
  {
    title: 'Flash Sale Mobile',
    description: 'Strip Flash Sale horizontal di home app — tiap item adalah ProductCard diskon.',
    type: 'FLASH_SALE_MOBILE',
    icon: Zap,
    color: 'from-rose-500 to-orange-500',
    lightColor: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10',
    href: '/admin/flash-sales/mobile',
    addHref: '/admin/flash-sales/mobile/new',
    fields: ['Banner Sesi', 'Product Carousel', 'Max Purchase Limit'],
  },
  {
    title: 'Trending Now',
    description: 'Kartu trending horizontal dengan foto background, label kategori, dan judul besar.',
    type: 'TRENDING_LIST',
    icon: TrendingUp,
    color: 'from-violet-500 to-purple-600',
    lightColor: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10',
    href: '/admin/content/mobile/TRENDING_LIST',
    addHref: '/admin/content/mobile/TRENDING_LIST/new',
    fields: ['Foto Background', 'Label Kategori', 'Judul Kartu', 'Deep Link'],
  },
  {
    title: 'News & Articles',
    description: 'Berita galeri, update koleksi, atau artikel fashion yang tampil di aplikasi mobile.',
    type: 'NEWS',
    icon: LayoutTemplate,
    color: 'from-orange-400 to-amber-500',
    lightColor: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10',
    href: '/admin/news',
    addHref: '/admin/news/new',
    fields: ['Judul', 'Thumbnail', 'Banner', 'Konten (HTML)'],
  },
];

const PLATFORM_CONFIG = {
  WEB: {
    label: 'Web Storefront',
    icon: Monitor,
    gradient: 'from-violet-600 to-indigo-700',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    description: 'Konten yang tampil di website zelvira.com',
    accentColor: 'violet',
    types: WEB_CONTENT_TYPES,
  },
  MOBILE: {
    label: 'Mobile App',
    icon: Smartphone,
    gradient: 'from-emerald-500 to-teal-600',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    description: 'Konten yang tampil di aplikasi Flutter Android & iOS',
    accentColor: 'emerald',
    types: MOBILE_CONTENT_TYPES,
  }
};

interface ContentDashboardProps {
  platform: Platform;
  title: string;
}

export default function ContentDashboard({ platform, title }: ContentDashboardProps) {
  const config = PLATFORM_CONFIG[platform];
  const PlatformIcon = config.icon;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
          <PlatformIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
            {title}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Kelola tata letak konten visual, banner promosi, dan section khusus platform {config.label}.
          </p>
        </div>
      </div>

      {/* Platform Hero Card */}
      <div className={`rounded-3xl bg-gradient-to-br ${config.gradient} p-8 text-white shadow-2xl relative overflow-hidden`}>
        <div className="absolute right-0 top-0 h-full w-1/2 bg-white/5 [mask-image:radial-gradient(ellipse_at_right,white,transparent)]" />
        <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg flex-shrink-0">
            <PlatformIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{config.label} Content Management</h2>
            <p className="text-white/80 font-normal mt-1 text-sm">{config.description}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
                {config.types.length} tipe konten tersedia
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Type Cards Grid */}
      <div>
        <p className="text-xs font-medium text-slate-500 mb-4 px-1">
          Pilih tipe konten yang ingin dikelola
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {config.types.map((item, index) => (
            <motion.div
              key={item.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 30 }}
              className="group relative overflow-hidden rounded-3xl border border-white/40 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
            >
              {/* Background Glow */}
              <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${item.color} opacity-5 blur-3xl group-hover:opacity-15 transition-opacity duration-500`} />

              <div className="relative flex flex-col h-full">
                {/* Icon + Add Button */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.lightColor} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <Link
                    href={item.addHref}
                    className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-pink-600 dark:hover:bg-pink-500 dark:hover:text-white transition-all shadow-md hover:scale-110 active:scale-95"
                    title={`Tambah ${item.title}`}
                  >
                    <Plus size={16} />
                  </Link>
                </div>

                {/* Title & Description */}
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 group-hover:text-pink-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Fields Preview */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Field Tersedia:</p>
                    <ul className="space-y-0.5">
                      {item.fields.slice(0, 3).map((field) => (
                        <li key={field} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-normal">
                          <span className="h-1 w-1 rounded-full bg-pink-400 flex-shrink-0" />
                          {field}
                        </li>
                      ))}
                      {item.fields.length > 3 && (
                        <li className="text-[11px] text-slate-400 font-normal pl-2.5">
                          +{item.fields.length - 3} field lainnya
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/10">
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white group-hover:gap-3 transition-all group-hover:text-pink-600"
                  >
                    Kelola List <ArrowRight size={13} className="text-pink-500" />
                  </Link>
                  <div className={`h-1 w-8 rounded-full bg-linear-to-r ${item.color} opacity-30 group-hover:w-16 group-hover:opacity-100 transition-all duration-500`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
