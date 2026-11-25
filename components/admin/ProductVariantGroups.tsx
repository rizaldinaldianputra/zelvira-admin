'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Control, UseFormReturn, useFieldArray, useWatch } from 'react-hook-form';
import { ProductFormValues } from '@/hooks/use-product-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { formatImageUrl } from '@/lib/url-utils';
import { FileUploadService } from '@/services/file-upload.service';
import {
  Plus,
  Trash2,
  Layers,
  Sparkles,
  Wand2,
  Palette,
  Boxes,
  Tag,
  HelpCircle,
  Check,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Camera,
  Image as ImageIcon,
  Loader2,
  Upload,
  RefreshCw,
  X,
  Copy,
  Link as LinkIcon,
} from 'lucide-react';

interface ProductVariantGroupsProps {
  form: UseFormReturn<ProductFormValues>;
  control: Control<ProductFormValues>;
  groupFields: any[];
  appendGroup: (value: any) => void;
  removeGroup: (index: number) => void;
}

export function ProductVariantGroups({
  form,
  control,
  groupFields,
  appendGroup,
  removeGroup,
}: ProductVariantGroupsProps) {
  const [showGuide, setShowGuide] = useState(false);

  // Watch entire variantGroups to compute live stats
  const watchedGroups = useWatch({
    control,
    name: 'variantGroups',
  });

  const totalVariants = (watchedGroups || []).reduce(
    (acc, g) => acc + (g?.details?.length || 0),
    0
  );

  const totalStock = (watchedGroups || []).reduce(
    (acc, g) =>
      acc +
      (g?.details || []).reduce(
        (subAcc: number, d: any) => subAcc + (Number(d?.stock) || 0),
        0
      ),
    0
  );

  const allPrices = (watchedGroups || []).flatMap((g) =>
    (g?.details || []).map((d: any) => Number(d?.price) || 0).filter((p: number) => p > 0)
  );
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;

  return (
    <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-white/10">
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="text-pink-500 h-5 w-5" />
              Variant Groups & Stock Management
            </h3>
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="text-slate-400 hover:text-pink-500 transition-colors"
              title="Bantuan konsep varian"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kelola model/style produk (contoh: Tunic, Jaket) beserta kombinasi warna, ukuran, dan stok masing-masing.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            appendGroup({
              groupName: `Style ${groupFields.length + 1}`,
              details: [
                {
                  sku: '',
                  size: 'All Size',
                  color: 'Standard',
                  hexColor: '#1e293b',
                  price: 150000,
                  discountPrice: 0,
                  stock: 10,
                  isActive: true,
                  imageUrl: '',
                },
              ],
            })
          }
          className="gap-2 rounded-xl bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400 hover:bg-pink-100 font-bold"
        >
          <Plus size={16} /> Tambah Model / Style Group
        </Button>
      </div>

      {/* Guide Banner (Collapsible) */}
      {showGuide && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 space-y-2">
          <p className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Cara Kerja Variant Groups di Master Produk:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Model / Style Group:</strong> Digunakan jika 1 produk punya tipe model berbeda (misal: <em>Tunic</em> dan <em>Jaket</em>). Jika hanya ada 1 tipe, cukup beri nama <em>&quot;Model Utama&quot;</em> atau <em>&quot;Default&quot;</em>.
            </li>
            <li>
              <strong>Kombinasi Variasi:</strong> Setiap baris mewakili 1 pilihan unik (contoh: <em>Merah - Ukuran M</em>).
            </li>
            <li>
              <strong>Stok Masing-Masing:</strong> Setiap variasi memiliki inventaris sendiri (contoh: <em>Warna Merah stok 1 unit, Warna Biru stok 5 unit</em>).
            </li>
            <li>
              <strong>Quick Generator:</strong> Klik tombol petir di tiap group untuk otomatis membuat kombinasi Warna x Ukuran tanpa repot ketik satu per satu!
            </li>
          </ul>
        </div>
      )}

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-white/5">
        <div className="flex flex-col">
          <span className="text-[11px] text-slate-500 font-medium">Style / Models</span>
          <span className="text-base font-bold text-slate-800 dark:text-slate-100">
            {groupFields.length} Group
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] text-slate-500 font-medium">Total Kombinasi</span>
          <span className="text-base font-bold text-slate-800 dark:text-slate-100">
            {totalVariants} Variasi
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] text-slate-500 font-medium">Total Stok Produk</span>
          <span className="text-base font-bold text-pink-600 dark:text-pink-400">
            {totalStock} Units
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] text-slate-500 font-medium">Rentang Harga</span>
          <span className="text-base font-bold text-slate-800 dark:text-slate-100">
            {minPrice === maxPrice
              ? `Rp ${minPrice.toLocaleString()}`
              : `Rp ${minPrice.toLocaleString()} - Rp ${maxPrice.toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* Groups List */}
      <div className="space-y-6">
        {groupFields.map((group, groupIdx) => (
          <VariantGroupCard
            key={group.id}
            groupIdx={groupIdx}
            form={form}
            control={control}
            canDelete={groupFields.length > 1}
            onDeleteGroup={() => removeGroup(groupIdx)}
          />
        ))}
      </div>
    </div>
  );
}

interface VariantPhotoCellProps {
  value?: string;
  onChange: (url: string) => void;
  colorName?: string;
  onApplyToColor?: () => void;
  hasOtherSameColor?: boolean;
}

function VariantPhotoCell({
  value,
  onChange,
  colorName,
  onApplyToColor,
  hasOtherSameColor,
}: VariantPhotoCellProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Format tidak didukung',
        description: 'Pilih berkas gambar (JPG, PNG, WEBP)',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const uploadedUrl = await FileUploadService.upload(file);
      onChange(uploadedUrl);
      toast({
        title: 'Foto Varian Tersimpan',
        description: colorName
          ? `Foto untuk varian (${colorName}) berhasil diunggah`
          : 'Foto varian berhasil diunggah',
      });
    } catch (err: any) {
      toast({
        title: 'Gagal Upload Foto',
        description: err?.message || 'Terjadi kesalahan saat mengunggah foto varian',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
      setShowUrlInput(false);
      toast({ title: 'Tersimpan', description: 'URL foto varian diterapkan' });
    }
  };

  const formattedUrl = formatImageUrl(value);

  return (
    <div className="relative inline-flex items-center justify-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      {isUploading ? (
        <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-950/40 border border-pink-300 dark:border-pink-800 flex items-center justify-center shadow-xs">
          <Loader2 className="w-4 h-4 animate-spin text-pink-600" />
        </div>
      ) : formattedUrl ? (
        <div className="relative group/vimg w-9 h-9 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-xs bg-slate-100 dark:bg-slate-800 shrink-0">
          <img
            src={formattedUrl}
            alt={colorName ? `Varian ${colorName}` : 'Foto Varian'}
            className="w-full h-full object-cover transition-transform group-hover/vimg:scale-105"
          />

          {/* Hover Overlay with Action Buttons */}
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/vimg:opacity-100 transition-opacity flex items-center justify-center gap-0.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1 rounded bg-white/90 hover:bg-white text-slate-800 shadow-xs cursor-pointer"
              title="Ganti Foto Varian"
            >
              <RefreshCw className="w-2.5 h-2.5" />
            </button>

            {hasOtherSameColor && onApplyToColor && (
              <button
                type="button"
                onClick={onApplyToColor}
                className="p-1 rounded bg-pink-600 hover:bg-pink-700 text-white shadow-xs cursor-pointer"
                title={`Samakan foto ke semua varian warna "${colorName}"`}
              >
                <Copy className="w-2.5 h-2.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1 rounded bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
              title="Hapus Foto Varian"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 rounded-xl border border-dashed border-slate-300 dark:border-white/20 hover:border-pink-500 hover:bg-pink-50/30 dark:hover:bg-pink-950/20 flex flex-col items-center justify-center text-slate-400 hover:text-pink-600 transition-all cursor-pointer group shadow-2xs"
            title="Upload Foto Varian (Opsional - seperti Shopee)"
          >
            <Camera className="w-3.5 h-3.5 group-hover:scale-110 transition-transform text-slate-400 group-hover:text-pink-500" />
            <span className="text-[7.5px] font-black tracking-tight text-slate-400 group-hover:text-pink-600">
              +Foto
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-slate-300 hover:text-slate-500 p-0.5 rounded cursor-pointer"
            title="Input URL Foto"
          >
            <LinkIcon className="w-2.5 h-2.5" />
          </button>
        </div>
      )}

      {/* Mini URL Input Popover */}
      {showUrlInput && (
        <div className="absolute top-10 left-0 z-30 p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 w-52 animate-in fade-in zoom-in-95">
          <Input
            placeholder="URL foto..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="h-7 text-[10px] rounded-lg"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleApplyUrl();
              }
            }}
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-2 py-1 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-[10px] font-bold shrink-0 cursor-pointer"
          >
            OK
          </button>
          <button
            type="button"
            onClick={() => setShowUrlInput(false)}
            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

interface VariantGroupCardProps {
  groupIdx: number;
  form: UseFormReturn<ProductFormValues>;
  control: Control<ProductFormValues>;
  canDelete: boolean;
  onDeleteGroup: () => void;
}

function VariantGroupCard({
  groupIdx,
  form,
  control,
  canDelete,
  onDeleteGroup,
}: VariantGroupCardProps) {
  const {
    fields: detailFields,
    append: appendDetail,
    remove: removeDetail,
    replace: replaceDetails,
  } = useFieldArray({
    control,
    name: `variantGroups.${groupIdx}.details`,
  });

  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [genColors, setGenColors] = useState('Merah, Biru, Hitam');
  const [genSizes, setGenSizes] = useState('S, M, L, XL');
  const [genPrice, setGenPrice] = useState<number>(150000);
  const [genStock, setGenStock] = useState<number>(1);

  // Bulk Apply States
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkStock, setBulkStock] = useState('');

  const currentGroupName = form.watch(`variantGroups.${groupIdx}.groupName`) || '';
  const currentDetails = form.watch(`variantGroups.${groupIdx}.details`) || [];

  const groupTotalStock = currentDetails.reduce(
    (sum, d) => sum + (Number(d?.stock) || 0),
    0
  );

  // Unique colors in this group with their current photo
  const uniqueColors = useMemo(() => {
    const map = new Map<string, { color: string; hexColor?: string; imageUrl?: string; count: number }>();
    (currentDetails || []).forEach((d) => {
      const c = (d?.color || '').trim();
      if (!c) return;
      const key = c.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          color: c,
          hexColor: d.hexColor,
          imageUrl: d.imageUrl || '',
          count: 1,
        });
      } else {
        const item = map.get(key)!;
        item.count += 1;
        if (!item.imageUrl && d.imageUrl) {
          item.imageUrl = d.imageUrl;
        }
      }
    });
    return Array.from(map.values());
  }, [currentDetails]);

  // Bulk apply photo to all variants of a color
  const handleApplyColorPhoto = (targetColor: string, newUrl: string) => {
    (currentDetails || []).forEach((d, idx) => {
      if ((d?.color || '').trim().toLowerCase() === targetColor.trim().toLowerCase()) {
        form.setValue(`variantGroups.${groupIdx}.details.${idx}.imageUrl`, newUrl, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    });
    toast({
      title: 'Foto Warna Diterapkan',
      description: `Foto berhasil diterapkan ke semua varian warna "${targetColor}"`,
    });
  };

  // Quick preset group names
  const stylePresets = ['Tunic', 'Jaket', 'Blouse', 'Gamis', 'Kemeja', 'Regular Style'];

  // Handle Quick Combination Generation
  const handleGenerate = () => {
    const colors = genColors
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    const sizes = genSizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (colors.length === 0 || sizes.length === 0) {
      return;
    }

    const colorHexMap: Record<string, string> = {
      merah: '#EF4444',
      red: '#EF4444',
      biru: '#3B82F6',
      blue: '#3B82F6',
      navy: '#1E3A8A',
      hitam: '#0F172A',
      black: '#0F172A',
      putih: '#F8FAFC',
      white: '#F8FAFC',
      hijau: '#10B981',
      green: '#10B981',
      kuning: '#F59E0B',
      yellow: '#F59E0B',
      abu: '#64748B',
      grey: '#64748B',
      gray: '#64748B',
      pink: '#EC4899',
      cokelat: '#78350F',
      brown: '#78350F',
    };

    const rawMasterSku = form.getValues('sku')?.trim();
    const productSlug = form.getValues('slug') || 'PRD';
    const basePrefix = rawMasterSku || productSlug.toUpperCase();
    const groupPrefix = (currentGroupName || 'STYLE').substring(0, 3).toUpperCase();
    const newVariants: any[] = [];

    colors.forEach((color, cIdx) => {
      const lowerColor = color.toLowerCase();
      const detectedHex = colorHexMap[lowerColor] || '#475569';

      sizes.forEach((size, sIdx) => {
        const autoSku = `${basePrefix}-${groupPrefix}-${color.substring(0, 3).toUpperCase()}-${size.substring(0, 3).toUpperCase()}-${cIdx * sizes.length + sIdx + 1}`.replace(/\s+/g, '');

        // Preserve existing variant ID and info if matching color and size
        const existing = (currentDetails || []).find(
          (d: any) =>
            (d?.color || '').trim().toLowerCase() === color.trim().toLowerCase() &&
            (d?.size || '').trim().toLowerCase() === size.trim().toLowerCase()
        );

        newVariants.push({
          id: existing?.id,
          sku: existing?.sku || autoSku,
          color: color,
          hexColor: existing?.hexColor || detectedHex,
          size: size,
          price: genPrice > 0 ? genPrice : (existing?.price || 150000),
          discountPrice: existing?.discountPrice || 0,
          stock: genStock >= 0 ? genStock : (existing?.stock !== undefined ? existing.stock : 1),
          isActive: existing?.isActive !== false,
          imageUrl: existing?.imageUrl || '',
        });
      });
    });

    replaceDetails(newVariants);
    setIsGeneratorOpen(false);
  };

  // Bulk Apply Price
  const handleApplyBulkPrice = () => {
    const numPrice = Number(bulkPrice);
    if (isNaN(numPrice) || numPrice < 0) return;
    currentDetails.forEach((_, idx) => {
      form.setValue(`variantGroups.${groupIdx}.details.${idx}.price`, numPrice, {
        shouldValidate: true,
      });
    });
    setBulkPrice('');
  };

  // Bulk Apply Stock
  const handleApplyBulkStock = () => {
    const numStock = Number(bulkStock);
    if (isNaN(numStock) || numStock < 0) return;
    currentDetails.forEach((_, idx) => {
      form.setValue(`variantGroups.${groupIdx}.details.${idx}.stock`, numStock, {
        shouldValidate: true,
      });
    });
    setBulkStock('');
  };

  // Auto generate single SKU
  const handleAutoSku = (detailIdx: number) => {
    const rawMasterSku = form.getValues('sku')?.trim();
    const productSlug = form.getValues('slug') || 'PRD';
    const basePrefix = rawMasterSku || productSlug.toUpperCase();
    const groupPrefix = (currentGroupName || 'STYLE').substring(0, 3).toUpperCase();
    const color = form.getValues(`variantGroups.${groupIdx}.details.${detailIdx}.color`) || 'CLR';
    const size = form.getValues(`variantGroups.${groupIdx}.details.${detailIdx}.size`) || 'SZ';
    const autoSku = `${basePrefix}-${groupPrefix}-${color.substring(0, 3).toUpperCase()}-${size.substring(0, 3).toUpperCase()}-${detailIdx + 1}`.replace(/\s+/g, '');
    form.setValue(`variantGroups.${groupIdx}.details.${detailIdx}.sku`, autoSku);
  };

  return (
    <div className="p-5 md:p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 shadow-sm space-y-5">
      {/* Group Card Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-pink-600 bg-pink-100 dark:bg-pink-950/40 px-2 py-0.5 rounded-md">
              Group #{groupIdx + 1}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Nama Model / Style:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="e.g. Tunic, Jaket, Model Gamis"
              className="max-w-xs rounded-xl font-bold bg-white dark:bg-slate-800 border-slate-200 text-slate-900 dark:text-white"
              {...form.register(`variantGroups.${groupIdx}.groupName`)}
            />

            {/* Quick Preset Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {stylePresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() =>
                    form.setValue(`variantGroups.${groupIdx}.groupName`, preset, {
                      shouldValidate: true,
                    })
                  }
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                    currentGroupName === preset
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent font-bold'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Group Badges & Delete */}
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-3 py-1 text-xs font-bold rounded-xl">
            {detailFields.length} Varian
          </Badge>
          <Badge
            variant="pink"
            className="px-3 py-1 text-xs font-bold rounded-xl"
          >
            Stok Group: {groupTotalStock} unit
          </Badge>

          {canDelete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDeleteGroup}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl"
              title="Hapus Group ini"
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Generator & Bulk Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Quick Gen Toggle */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsGeneratorOpen(!isGeneratorOpen)}
          className={`gap-2 rounded-xl text-xs font-bold transition-all ${
            isGeneratorOpen
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : 'bg-white dark:bg-slate-800 border-slate-200 hover:border-pink-300 text-slate-700 dark:text-slate-200'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          {isGeneratorOpen ? 'Tutup Quick Generator' : '⚡ Quick Generator (Warna × Ukuran)'}
          {isGeneratorOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </Button>

        {/* Bulk Action Inputs */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Terapkan ke semua varian:</span>
          {/* Bulk Price */}
          <div className="flex items-center gap-1">
            <Input
              type="number"
              placeholder="Harga (Rp)"
              value={bulkPrice}
              onChange={(e) => setBulkPrice(e.target.value)}
              className="h-8 w-28 text-xs rounded-lg bg-white dark:bg-slate-800"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleApplyBulkPrice}
              disabled={!bulkPrice}
              className="h-8 px-2 text-xs rounded-lg"
            >
              Set Harga
            </Button>
          </div>

          {/* Bulk Stock */}
          <div className="flex items-center gap-1">
            <Input
              type="number"
              placeholder="Stok"
              value={bulkStock}
              onChange={(e) => setBulkStock(e.target.value)}
              className="h-8 w-20 text-xs rounded-lg bg-white dark:bg-slate-800"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleApplyBulkStock}
              disabled={!bulkStock}
              className="h-8 px-2 text-xs rounded-lg"
            >
              Set Stok
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Generator Panel */}
      {isGeneratorOpen && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700/50 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Wand2 className="h-4 w-4 text-amber-500" />
              Otomatis Generate Kombinasi Varian untuk &quot;{currentGroupName || 'Style'}&quot;
            </span>
            <span className="text-[11px] text-slate-400">
              Pisahkan dengan tanda koma (,)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                Warna:
              </label>
              <Input
                value={genColors}
                onChange={(e) => setGenColors(e.target.value)}
                placeholder="Merah, Biru, Hitam"
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                Ukuran:
              </label>
              <Input
                value={genSizes}
                onChange={(e) => setGenSizes(e.target.value)}
                placeholder="S, M, L, XL"
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                Harga Default (Rp):
              </label>
              <Input
                type="number"
                value={genPrice}
                onChange={(e) => setGenPrice(Number(e.target.value))}
                placeholder="150000"
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                Stok Default:
              </label>
              <Input
                type="number"
                value={genStock}
                onChange={(e) => setGenStock(Number(e.target.value))}
                placeholder="1"
                className="h-9 text-xs rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsGeneratorOpen(false)}
              className="rounded-xl text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleGenerate}
              className="rounded-xl text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold gap-1"
            >
              <Check size={14} /> Generate Kombinasi
            </Button>
          </div>
        </div>
      )}

      {/* Shopee-style Variant Photo per Color (Optional Helper) */}
      {uniqueColors.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 space-y-2.5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-pink-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Foto Varian per Warna (Gaya Shopee)
              </span>
              <span className="text-[10px] text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 px-2 py-0.5 rounded-full font-bold">
                Opsional
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Unggah foto di sini untuk mengisi serempak ke semua ukuran warna tersebut
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {uniqueColors.map((uc) => (
              <div
                key={uc.color}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/50 text-xs shadow-2xs"
              >
                <VariantPhotoCell
                  value={uc.imageUrl}
                  onChange={(newUrl) => handleApplyColorPhoto(uc.color, newUrl)}
                  colorName={uc.color}
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    {uc.hexColor && (
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-2xs"
                        style={{ backgroundColor: uc.hexColor }}
                      />
                    )}
                    <span className="font-bold text-slate-800 dark:text-slate-100">{uc.color}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {uc.count} varian ukuran
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Variants Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-800/80 shadow-inner">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/70 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-white/5 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-3 w-10 text-center">#</th>
              <th className="py-3 px-2 min-w-[65px] text-center">Foto</th>
              <th className="py-3 px-3 min-w-[130px]">Warna & Hex</th>
              <th className="py-3 px-3 min-w-[90px]">Ukuran</th>
              <th className="py-3 px-3 min-w-[160px]">SKU</th>
              <th className="py-3 px-3 min-w-[110px]">Harga (Rp)</th>
              <th className="py-3 px-3 min-w-[110px]">Diskon (Rp)</th>
              <th className="py-3 px-3 min-w-[110px]">Stok Unit</th>
              <th className="py-3 px-3 w-16 text-center">Aktif</th>
              <th className="py-3 px-3 w-12 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {detailFields.map((detail, detailIdx) => {
              const currentStock = Number(
                form.watch(
                  `variantGroups.${groupIdx}.details.${detailIdx}.stock`
                )
              ) || 0;

              return (
                <tr
                  key={detail.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors"
                >
                  {/* Row Index */}
                  <td className="py-2.5 px-3 text-center text-slate-400 font-medium">
                    <input
                      type="hidden"
                      {...form.register(
                        `variantGroups.${groupIdx}.details.${detailIdx}.id`,
                        { valueAsNumber: true }
                      )}
                    />
                    {detailIdx + 1}
                  </td>

                  {/* Variant Photo (Optional - Shopee style) */}
                  <td className="py-2.5 px-2 text-center">
                    <VariantPhotoCell
                      value={form.watch(`variantGroups.${groupIdx}.details.${detailIdx}.imageUrl`) || ''}
                      onChange={(url: string) => {
                        form.setValue(`variantGroups.${groupIdx}.details.${detailIdx}.imageUrl`, url, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                      colorName={form.watch(`variantGroups.${groupIdx}.details.${detailIdx}.color`)}
                      onApplyToColor={() => {
                        const color = form.watch(`variantGroups.${groupIdx}.details.${detailIdx}.color`);
                        const url = form.watch(`variantGroups.${groupIdx}.details.${detailIdx}.imageUrl`);
                        if (color && url) {
                          handleApplyColorPhoto(color, url);
                        }
                      }}
                      hasOtherSameColor={
                        (currentDetails || []).filter(
                          (d, idx) =>
                            idx !== detailIdx &&
                            (d?.color || '').trim().toLowerCase() ===
                              (form.watch(`variantGroups.${groupIdx}.details.${detailIdx}.color`) || '').trim().toLowerCase()
                        ).length > 0
                      }
                    />
                  </td>

                  {/* Color & Hex */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        {...form.register(
                          `variantGroups.${groupIdx}.details.${detailIdx}.hexColor`
                        )}
                        className="h-7 w-7 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-600 p-0.5 bg-transparent shrink-0"
                        title="Pilih warna hex"
                      />
                      <Input
                        placeholder="e.g. Merah"
                        className="h-8 text-xs rounded-lg bg-transparent"
                        {...form.register(
                          `variantGroups.${groupIdx}.details.${detailIdx}.color`
                        )}
                      />
                    </div>
                  </td>

                  {/* Size */}
                  <td className="py-2.5 px-3">
                    <Input
                      placeholder="e.g. M / XL"
                      className="h-8 text-xs rounded-lg bg-transparent"
                      {...form.register(
                        `variantGroups.${groupIdx}.details.${detailIdx}.size`
                      )}
                    />
                  </td>

                  {/* SKU */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1">
                      <Input
                        placeholder="SKU"
                        className="h-8 text-xs font-mono rounded-lg bg-transparent"
                        {...form.register(
                          `variantGroups.${groupIdx}.details.${detailIdx}.sku`
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => handleAutoSku(detailIdx)}
                        className="p-1 text-slate-400 hover:text-pink-500 rounded"
                        title="Auto Generate SKU"
                      >
                        <Wand2 size={13} />
                      </button>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-2.5 px-3">
                    <Input
                      type="number"
                      step="any"
                      placeholder="0"
                      className="h-8 text-xs font-semibold rounded-lg bg-transparent"
                      {...form.register(
                        `variantGroups.${groupIdx}.details.${detailIdx}.price`,
                        { valueAsNumber: true }
                      )}
                    />
                  </td>

                  {/* Discount Price */}
                  <td className="py-2.5 px-3">
                    <Input
                      type="number"
                      step="any"
                      placeholder="0"
                      className="h-8 text-xs rounded-lg bg-transparent text-slate-500"
                      {...form.register(
                        `variantGroups.${groupIdx}.details.${detailIdx}.discountPrice`,
                        { valueAsNumber: true }
                      )}
                    />
                  </td>

                  {/* Individual Stock */}
                  <td className="py-2.5 px-3">
                    <div className="space-y-1">
                      <Input
                        type="number"
                        placeholder="Stok"
                        className="h-8 text-xs font-bold rounded-lg bg-transparent"
                        {...form.register(
                          `variantGroups.${groupIdx}.details.${detailIdx}.stock`,
                          { valueAsNumber: true }
                        )}
                      />
                      {/* Stock Status Indicator */}
                      <div>
                        {currentStock === 0 ? (
                          <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                            Habis (0)
                          </span>
                        ) : currentStock <= 3 ? (
                          <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                            Kritis ({currentStock})
                          </span>
                        ) : (
                          <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                            Tersedia ({currentStock})
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Active Toggle */}
                  <td className="py-2.5 px-3 text-center">
                    <Switch
                      checked={form.watch(
                        `variantGroups.${groupIdx}.details.${detailIdx}.isActive`
                      )}
                      onCheckedChange={(checked) =>
                        form.setValue(
                          `variantGroups.${groupIdx}.details.${detailIdx}.isActive`,
                          checked
                        )
                      }
                    />
                  </td>

                  {/* Delete Action */}
                  <td className="py-2.5 px-3 text-center">
                    {detailFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDetail(detailIdx)}
                        className="text-red-400 hover:text-red-600 p-1 h-7 w-7 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Single Variant Button */}
      <div className="flex justify-start">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            appendDetail({
              sku: '',
              size: 'All Size',
              color: 'Default',
              hexColor: '#1e293b',
              price: 150000,
              discountPrice: 0,
              stock: 1,
              isActive: true,
              imageUrl: '',
            })
          }
          className="gap-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 border-dashed border-slate-300 dark:border-slate-700"
        >
          <Plus size={14} /> Tambah Varian Manual ke {currentGroupName || 'Group Ini'}
        </Button>
      </div>
    </div>
  );
}
