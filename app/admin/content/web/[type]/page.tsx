'use client';

import { use, useMemo, useState, useEffect } from 'react';
import {
  FileJson,
  ArrowLeft,
  Plus,
  Monitor,
  Star,
  ExternalLink,
  Layers,
  Heart,
  Tag,
  Clock,
  Sparkles,
  ShoppingBag,
  Flame,
  Crown,
  LayoutGrid,
  Search,
  Check,
  Loader2,
  Trash2,
  Edit,
  X,
  AlertCircle,
} from 'lucide-react';
import { ContentItem } from '@/types/content';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CrudTable } from '@/components/admin/crud-table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWebContentItems } from '@/hooks/use-web-content-items';
import { ContentService } from '@/services/content.service';
import { ProductService } from '@/services/product.service';
import { formatImageUrl } from '@/lib/url-utils';
import { useToast } from '@/hooks/use-toast';

interface PageProps {
  params: Promise<{ type: string }>;
}

type SectionTab = 'ALL' | 'BEST_SELLER' | 'NEW_ARRIVAL' | 'SALE' | 'TRENDING';

const SECTION_CONFIGS: Record<SectionTab, { label: string; icon: any; desc: string; defaultBadge: string; badgeColor: string }> = {
  ALL: {
    label: 'Semua Kurasi Produk',
    icon: LayoutGrid,
    desc: 'Menampilkan seluruh produk yang dikurasi untuk homepage website.',
    defaultBadge: 'Featured',
    badgeColor: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200',
  },
  BEST_SELLER: {
    label: '🌟 Koleksi Produk Unggulan',
    icon: Star,
    desc: 'Section 1: Produk terlaris pilihan terbaik Zelvira dengan jaminan mutu premium.',
    defaultBadge: 'Best Seller',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
  },
  NEW_ARRIVAL: {
    label: '✨ New Arrivals - Rilisan Terbaru',
    icon: Sparkles,
    desc: 'Section 2: Tampil di grid Runway Atelier SS 2026 (3 Kartu Potret Vertikal + 2 Kartu Horisontal Capsule).',
    defaultBadge: 'New Season',
    badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300',
  },
  SALE: {
    label: '🔥 Promo Sale & Special Offers',
    icon: Flame,
    desc: 'Section 3: Tampil di Asymmetric Bento Deal Grid dengan Mega Deal, live countdown timer, stock urgency, dan kupon ZELVIRASALE.',
    defaultBadge: '50% OFF',
    badgeColor: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300',
  },
  TRENDING: {
    label: '👑 Produk Terbaru & Populer',
    icon: Crown,
    desc: 'Section 4: Tampil di Leaderboard Hall of Fame Podium (#1 Gold Champion + #2 s/d #5 Tiered Tiles) dengan real-time social proof.',
    defaultBadge: 'Top Trending',
    badgeColor: 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300',
  },
};

export default function WebContentTypeListPage({ params }: PageProps) {
  const { type } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const {
    items,
    isLoading,
    typeInfo,
    handleDelete,
    fetchItems,
  } = useWebContentItems(type);

  // Tab filter for FEATURED_PRODUCTS
  const [activeTab, setActiveTab] = useState<SectionTab>('ALL');

  // Product Selection Modal State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customBadge, setCustomBadge] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Check URL query param ?tag= on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const tagParam = searchParams.get('tag')?.toUpperCase();
      if (tagParam && ['BEST_SELLER', 'NEW_ARRIVAL', 'SALE', 'TRENDING'].includes(tagParam)) {
        setActiveTab(tagParam as SectionTab);
      }
    }
  }, []);

  // Fetch catalog products when modal opens or search query changes
  useEffect(() => {
    if (!isPickerOpen) return;

    let isCancelled = false;
    const loadCatalog = async () => {
      setIsCatalogLoading(true);
      try {
        const res = await ProductService.getAll(0, 50, catalogSearch.trim() || undefined);
        if (!isCancelled) {
          const list = res.content || (Array.isArray(res) ? res : []);
          setCatalogProducts(list);
        }
      } catch (err) {
        console.warn('Failed to load products for picker:', err);
      } finally {
        if (!isCancelled) setIsCatalogLoading(false);
      }
    };

    const timer = setTimeout(loadCatalog, 300);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [isPickerOpen, catalogSearch]);

  // Filter items by active section tab
  const displayedItems = useMemo(() => {
    if (type !== 'FEATURED_PRODUCTS' || activeTab === 'ALL') {
      return items;
    }
    return items.filter((item) => (item.tag || '').toUpperCase() === activeTab);
  }, [items, type, activeTab]);

  // Section Counts
  const counts = useMemo(() => {
    return {
      ALL: items.length,
      BEST_SELLER: items.filter((i) => (i.tag || '').toUpperCase() === 'BEST_SELLER').length,
      NEW_ARRIVAL: items.filter((i) => (i.tag || '').toUpperCase() === 'NEW_ARRIVAL').length,
      SALE: items.filter((i) => (i.tag || '').toUpperCase() === 'SALE').length,
      TRENDING: items.filter((i) => (i.tag || '').toUpperCase() === 'TRENDING').length,
    };
  }, [items]);

  // Open the interactive product picker modal
  const handleOpenPicker = () => {
    setSelectedProduct(null);
    setCustomBadge(SECTION_CONFIGS[activeTab].defaultBadge);
    setIsPickerOpen(true);
  };

  // Confirm adding the selected product to the section via real API
  const handleConfirmAddProduct = async () => {
    if (!selectedProduct) {
      toast({ title: 'Pilih Produk', description: 'Silakan pilih produk terlebih dahulu', variant: 'destructive' });
      return;
    }

    const targetTag = activeTab === 'ALL' ? 'BEST_SELLER' : activeTab;
    setIsSaving(true);
    try {
      await ContentService.createItem({
        type: 'FEATURED_PRODUCTS',
        platform: 'WEB',
        productId: selectedProduct.id,
        tag: targetTag,
        badgeText: customBadge.trim() || SECTION_CONFIGS[targetTag].defaultBadge,
        title: selectedProduct.name,
        imageUrl: selectedProduct.imageUrl || (selectedProduct as any).img,
        isActive: true,
      } as any);

      toast({
        title: 'Berhasil Ditambahkan',
        description: `Produk "${selectedProduct.name}" berhasil dimasukkan ke menu ${SECTION_CONFIGS[targetTag].label}.`,
      });

      setIsPickerOpen(false);
      setSelectedProduct(null);
      fetchItems();
    } catch (err: any) {
      toast({
        title: 'Gagal Menambahkan',
        description: err.message || 'Terjadi kesalahan saat menyimpan produk ke CMS.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (item: ContentItem) => {
    router.push(`/admin/content/web/${type}/${item.id}`);
  };

  const handleToggleStatus = async (item: ContentItem) => {
    try {
      await ContentService.updateItem(item.id!, {
        ...item,
        isActive: !item.isActive,
      } as any);
      toast({ title: 'Berhasil', description: 'Status aktif konten diperbarui' });
      fetchItems();
    } catch {
      toast({ title: 'Error', description: 'Gagal memperbarui status', variant: 'destructive' });
    }
  };

  // Dynamic table columns based on the section type
  const columns: ColumnDef<ContentItem>[] = useMemo(() => {
    const baseStatusColumn: ColumnDef<ContentItem> = {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          variant={row.original.isActive ? 'pink' : 'secondary'}
          className="rounded-full uppercase text-[10px] px-3 font-bold tracking-widest cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => handleToggleStatus(row.original)}
          title="Klik untuk mengubah status aktif/nonaktif"
        >
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    };

    const baseDateColumn: ColumnDef<ContentItem> = {
      accessorKey: 'createdAt',
      header: 'Tanggal Dibuat',
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-slate-500">
          {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }) : '-'}
        </span>
      ),
    };

    switch (type) {
      case 'HERO_CAROUSEL':
        return [
          {
            accessorKey: 'imageUrl',
            header: 'Banner',
            cell: ({ row }) => (
              <div className="h-12 w-24 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 flex-shrink-0">
                {row.original.imageUrl ? (
                  <img src={formatImageUrl(row.original.imageUrl)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-400">
                    No Image
                  </div>
                )}
              </div>
            ),
          },
          {
            accessorKey: 'title',
            header: 'Judul & Subjudul',
            cell: ({ row }) => (
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 dark:text-white tracking-tight">
                  {row.original.title || 'Untitled Banner'}
                </span>
                <span className="text-xs text-slate-400 truncate max-w-[280px]">
                  {row.original.subtitle || '-'}
                </span>
              </div>
            ),
          },
          {
            accessorKey: 'badgeText',
            header: 'Tag / Badge',
            cell: ({ row }) => (
              row.original.badgeText ? (
                <Badge variant="outline" className="text-[10px] font-black uppercase text-pink-600 border-pink-200 bg-pink-50 dark:bg-pink-950/30">
                  {row.original.badgeText}
                </Badge>
              ) : <span className="text-slate-400 text-xs">-</span>
            ),
          },
          {
            accessorKey: 'ctaText',
            header: 'CTA Button',
            cell: ({ row }) => (
              <div className="flex flex-col text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-200">{row.original.ctaText || 'Shop Now'}</span>
                <span className="text-[10px] text-slate-400 truncate max-w-[150px]">{row.original.linkUrl || '/products'}</span>
              </div>
            ),
          },
          baseDateColumn,
          baseStatusColumn,
        ] as ColumnDef<ContentItem>[];

      case 'DEALS':
        return [
          {
            accessorKey: 'imageUrl',
            header: 'Banner Promo Deals',
            cell: ({ row }) => (
              <div className="h-12 w-24 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 flex-shrink-0">
                {row.original.imageUrl ? (
                  <img src={formatImageUrl(row.original.imageUrl)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-400">
                    No Banner
                  </div>
                )}
              </div>
            ),
          },
          {
            accessorKey: 'title',
            header: 'Judul Deal & Badge',
            cell: ({ row }) => (
              <div className="flex flex-col gap-1">
                <span className="font-bold text-slate-900 dark:text-white tracking-tight">
                  {row.original.title || 'Untitled Deal'}
                </span>
                <div className="flex items-center gap-2">
                  {row.original.badgeText && (
                    <Badge variant="outline" className="text-[10px] font-bold uppercase bg-purple-50 text-purple-600 border-purple-200">
                      {row.original.badgeText}
                    </Badge>
                  )}
                  <span className="text-xs text-slate-400 truncate max-w-[240px]">
                    {row.original.subtitle || '-'}
                  </span>
                </div>
              </div>
            ),
          },
          {
            accessorKey: 'productIds',
            header: 'Produk Terpilih',
            cell: ({ row }) => {
              const count = row.original.productIds ? row.original.productIds.split(',').filter(Boolean).length : 0;
              return (
                <Badge variant="outline" className="font-bold text-xs bg-purple-50 text-purple-700 border-purple-200">
                  {count} Produk Terpilih
                </Badge>
              );
            },
          },
          {
            accessorKey: 'ctaText',
            header: 'Tombol & Link CTA',
            cell: ({ row }) => (
              <div className="flex flex-col text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {row.original.ctaText || 'Klaim Sekarang'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {row.original.linkUrl || '/deals'}
                </span>
              </div>
            ),
          },
          baseDateColumn,
          baseStatusColumn,
        ] as ColumnDef<ContentItem>[];

      case 'FLASH_SALE_WEB':
        return [
          {
            accessorKey: 'imageUrl',
            header: 'Banner Sesi',
            cell: ({ row }) => (
              <div className="h-12 w-24 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 flex-shrink-0">
                {row.original.imageUrl ? (
                  <img src={formatImageUrl(row.original.imageUrl)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-400">
                    No Banner
                  </div>
                )}
              </div>
            ),
          },
          {
            accessorKey: 'title',
            header: 'Judul Flash Sale',
            cell: ({ row }) => (
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 dark:text-white tracking-tight">
                  {row.original.title || 'Flash Sale'}
                </span>
                <span className="text-xs text-slate-400 truncate max-w-[250px]">
                  {row.original.subtitle || '-'}
                </span>
              </div>
            ),
          },
          {
            accessorKey: 'startDate',
            header: 'Periode Countdown',
            cell: ({ row }) => {
              const start = row.original.startDate ? new Date(row.original.startDate).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-';
              const end = row.original.endDate ? new Date(row.original.endDate).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-';
              return (
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <Clock size={12} className="text-orange-500" />
                  <span>{start} — {end}</span>
                </div>
              );
            },
          },
          {
            accessorKey: 'productIds',
            header: 'Produk Diskon',
            cell: ({ row }) => {
              const count = row.original.productIds ? row.original.productIds.split(',').filter(Boolean).length : 0;
              return (
                <Badge variant="outline" className="font-bold text-xs bg-orange-50 text-orange-600 border-orange-200">
                  {count} Produk
                </Badge>
              );
            },
          },
          baseStatusColumn,
        ] as ColumnDef<ContentItem>[];

      case 'FEATURED_PRODUCTS':
        return [
          {
            accessorKey: 'product',
            header: 'Produk Terpilih',
            cell: ({ row }) => {
              const product = row.original.product;
              const img = product?.imageUrl || row.original.imageUrl || (product as any)?.img;
              return (
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 flex-shrink-0">
                    {img ? (
                      <img src={formatImageUrl(img)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-400">
                        <ShoppingBag size={16} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-white tracking-tight line-clamp-1">
                      {product?.name || row.original.title || 'Pilih Produk'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      ID: {row.original.productId || '-'} • {product?.category?.name || 'Katalog'}
                    </span>
                  </div>
                </div>
              );
            },
          },
          {
            accessorKey: 'tag',
            header: 'Menu Seksi',
            cell: ({ row }) => {
              const tag = (row.original.tag || 'ALL').toUpperCase();
              let colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
              let label = tag;

              if (tag === 'BEST_SELLER') {
                colorClass = 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300';
                label = '🌟 KOLEKSI UNGGULAN';
              } else if (tag === 'NEW_ARRIVAL') {
                colorClass = 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300';
                label = '✨ NEW ARRIVALS';
              } else if (tag === 'SALE') {
                colorClass = 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300';
                label = '🔥 PROMO SALE';
              } else if (tag === 'TRENDING') {
                colorClass = 'bg-cyan-50 text-cyan-700 border-cyan-300 dark:bg-cyan-950/40 dark:text-cyan-300';
                label = '👑 POPULER & TRENDING';
              }

              return (
                <Badge variant="outline" className={`font-black text-[10px] uppercase tracking-wider py-1 px-2.5 ${colorClass}`}>
                  {label}
                </Badge>
              );
            },
          },
          {
            accessorKey: 'badgeText',
            header: 'Corner Badge',
            cell: ({ row }) => {
              const badge = row.original.badgeText;
              return badge ? (
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 font-extrabold text-[11px] text-slate-700 dark:text-slate-300">
                  {badge}
                </span>
              ) : (
                <span className="text-slate-400 text-xs italic">-</span>
              );
            },
          },
          {
            accessorKey: 'price',
            header: 'Harga',
            cell: ({ row }) => {
              const price = row.original.product?.price;
              return (
                <span className="font-black text-xs text-pink-600 dark:text-pink-400 font-mono">
                  {price ? `Rp ${Number(price).toLocaleString('id-ID')}` : '-'}
                </span>
              );
            },
          },
          baseDateColumn,
          baseStatusColumn,
        ] as ColumnDef<ContentItem>[];

      default:
        return [
          {
            accessorKey: 'title',
            header: 'Item Title',
            cell: ({ row }) => (
              <div className="flex items-center gap-3">
                {row.original.imageUrl ? (
                  <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-50">
                    <img src={formatImageUrl(row.original.imageUrl)} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 flex-shrink-0">
                    <FileJson size={14} />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 dark:text-white tracking-tight">{row.original.title || 'Untitled'}</span>
                  <span className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">{row.original.subtitle}</span>
                </div>
              </div>
            ),
          },
          baseDateColumn,
          baseStatusColumn,
        ] as ColumnDef<ContentItem>[];
    }
  }, [type]);

  const activeSectionInfo = SECTION_CONFIGS[activeTab];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/content/web">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl border border-slate-200 dark:border-white/10">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <Monitor className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              {type === 'FEATURED_PRODUCTS' ? 'Manajemen  Produk Storefront' : typeInfo.label}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {type === 'FEATURED_PRODUCTS'
                ? 'Pilih produk dari database katalog untuk ditampilkan secara dinamis di 4 seksi beranda website.'
                : typeInfo.description}
            </p>
          </div>
        </div>

        {/* Primary Action Button */}
        {type === 'FEATURED_PRODUCTS' ? (
          <Button
            onClick={handleOpenPicker}
            className="rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-black gap-2 shadow-lg shadow-pink-500/25 px-6 py-6"
          >
            <Plus size={18} />
            <span>Pilih Produk untuk Ditampilkan</span>
          </Button>
        ) : (
          <Button
            onClick={() => router.push(`/admin/content/web/${type}/new`)}
            className="rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-black gap-2 shadow-lg shadow-pink-500/25 px-5"
          >
            <Plus size={16} />
            <span>Tambah Item</span>
          </Button>
        )}
      </div>

      {/* ─── SPECIAL SECTION TABS FOR FEATURED_PRODUCTS ─── */}
      {type === 'FEATURED_PRODUCTS' && (
        <div className="space-y-4">
          {/* Tabs bar */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-white/10">
            {(['ALL', 'BEST_SELLER', 'NEW_ARRIVAL', 'SALE', 'TRENDING'] as SectionTab[]).map((tab) => {
              const cfg = SECTION_CONFIGS[tab];
              const isActive = activeTab === tab;
              const count = counts[tab];

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${isActive
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md shadow-slate-900/5'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <span>{cfg.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-pink-500 text-white' : 'bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                      }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Contextual Section Callout */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-600 shrink-0">
                <activeSectionInfo.icon size={22} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {activeSectionInfo.label} ({counts[activeTab]} Produk Aktif di API)
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {activeSectionInfo.desc}
                </p>
              </div>
            </div>

            <Button
              onClick={handleOpenPicker}
              size="sm"
              className="rounded-xl font-bold text-xs shrink-0 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-pink-600 dark:hover:bg-pink-700 shadow-sm"
            >
              <Plus size={14} className="mr-1.5" />
              <span>Pilih Produk untuk {activeTab === 'ALL' ? 'Menu Ini' : activeSectionInfo.label.split('-')[0].trim()}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Crud Table with real API data */}
      <CrudTable
        data={displayedItems}
        columns={columns}
        searchKey="title"
        onEdit={handleEdit}
        onDelete={(item) => item.id && handleDelete(item.id)}
        isLoading={isLoading}
      />

      {/* ─── INTERACTIVE PRODUCT SELECTION MODAL (REAL API CRUD) ─── */}
      <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/10 p-6 sm:p-8 max-h-[85vh] flex flex-col">
          <DialogHeader className="space-y-1 pb-3 border-b border-slate-100 dark:border-white/10 text-left">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-pink-500/10 text-pink-600">
                <ShoppingBag size={20} />
              </span>
              <div>
                <DialogTitle className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Pilih Produk untuk {activeTab === 'ALL' ? 'Kurasi Storefront' : activeSectionInfo.label}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Pilih produk dari database katalog API untuk langsung ditampilkan pada seksi ini.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Search Input for Products */}
          <div className="relative my-3">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              placeholder="Cari produk berdasarkan nama, SKU, atau kategori..."
              className="pl-10 h-11 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-xs font-semibold"
            />
            {catalogSearch && (
              <button
                onClick={() => setCatalogSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Catalog Products List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px] max-h-[300px]">
            {isCatalogLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 size={24} className="animate-spin text-pink-500" />
                <span className="text-xs font-bold">Memuat produk dari API...</span>
              </div>
            ) : catalogProducts.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <AlertCircle size={28} className="mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-bold">Tidak ada produk ditemukan</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Coba gunakan kata kunci pencarian lain.</p>
              </div>
            ) : (
              catalogProducts.map((p) => {
                const isSelected = selectedProduct?.id === p.id;
                const img = p.imageUrl || (p as any).img;

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${isSelected
                      ? 'border-pink-500 bg-pink-50/40 dark:bg-pink-950/30 ring-2 ring-pink-500/20'
                      : 'border-slate-200/80 dark:border-white/10 hover:border-slate-300 bg-white dark:bg-slate-900/40'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shrink-0">
                        {img ? (
                          <img src={formatImageUrl(img)} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-300">
                            <ShoppingBag size={16} />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                          {p.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>{p.category?.name || 'Katalog'}</span>
                          <span>•</span>
                          <span className="text-pink-600 dark:text-pink-400 font-bold font-mono">
                            Rp {Number(p.price || 0).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <span className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-sm">
                          <Check size={14} className="stroke-3" />
                        </span>
                      ) : (
                        <span className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Configuration Area for Selected Product */}
          {selectedProduct && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/10 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">
                    Custom Corner Badge / Label Pojok (Opsional)
                  </label>
                  <Input
                    type="text"
                    value={customBadge}
                    onChange={(e) => setCustomBadge(e.target.value)}
                    placeholder={`Contoh: ${SECTION_CONFIGS[activeTab].defaultBadge}`}
                    className="h-10 text-xs rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200"
                  />
                </div>

                <div className="sm:self-end">
                  <Button
                    onClick={handleConfirmAddProduct}
                    disabled={isSaving}
                    className="w-full sm:w-auto h-10 px-6 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-pink-500/25"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={14} className="animate-spin mr-1.5" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Check size={14} className="mr-1.5" />
                        <span>Tambahkan ke Menu Ini</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
