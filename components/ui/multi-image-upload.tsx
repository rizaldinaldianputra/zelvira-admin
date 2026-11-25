'use client';

import React, { useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { formatImageUrl } from '@/lib/url-utils';
import { FileUploadService } from '@/services/file-upload.service';
import {
  Upload,
  X,
  Star,
  Plus,
  Loader2,
  Image as ImageIcon,
  Check,
  Link as LinkIcon,
  Trash2,
  ArrowLeftRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MultiImageUploadProps {
  // Explicit thumbnail & banners props
  thumbnailImage?: string;
  onThumbnailChange?: (url: string) => void;
  bannerImages?: string[];
  onBannersChange?: (urls: string[]) => void;
  // Backward compatibility aliases
  primaryImage?: string;
  onPrimaryChange?: (url: string) => void;
  images?: string[];
  onImagesChange?: (urls: string[]) => void;
  disabled?: boolean;
}

export function MultiImageUpload({
  thumbnailImage,
  onThumbnailChange,
  bannerImages,
  onBannersChange,
  primaryImage = '',
  onPrimaryChange,
  images = [],
  onImagesChange,
  disabled = false,
}: MultiImageUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const primaryInputRef = useRef<HTMLInputElement>(null);

  // Synchronized accessors for thumbnail and banners
  const currentPrimary = thumbnailImage !== undefined ? thumbnailImage : primaryImage;
  const setPrimary = (url: string) => {
    if (onThumbnailChange) onThumbnailChange(url);
    if (onPrimaryChange) onPrimaryChange(url);
  };

  const currentGallery = bannerImages !== undefined ? bannerImages : images;
  const setGallery = (urls: string[]) => {
    if (onBannersChange) onBannersChange(urls);
    if (onImagesChange) onImagesChange(urls);
  };

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  // Handle uploading thumbnail specifically
  const handlePrimaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Format tidak didukung',
        description: 'Hanya file gambar (JPG, PNG, WEBP) yang dapat diunggah.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress('Mengunggah thumbnail card...');
    try {
      const url = await FileUploadService.upload(file);
      setPrimary(url);
      toast({ title: 'Berhasil', description: 'Thumbnail card produk berhasil diunggah' });
    } catch (error: any) {
      toast({
        title: 'Gagal Upload',
        description: error?.message || 'Gagal mengupload thumbnail',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (primaryInputRef.current) {
        primaryInputRef.current.value = '';
      }
    }
  };

  // Handle uploading multiple banner images
  const handleMultipleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newUploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      setUploadProgress(`Mengunggah banner ${i + 1} dari ${files.length}...`);
      try {
        const url = await FileUploadService.upload(file);
        newUploadedUrls.push(url);
      } catch (err: any) {
        toast({
          title: 'Gagal mengunggah banner',
          description: file.name + ': ' + (err?.message || 'Error upload'),
          variant: 'destructive',
        });
      }
    }

    if (newUploadedUrls.length > 0) {
      // If thumbnail is empty, set the first one as thumbnail
      if (!currentPrimary && newUploadedUrls.length > 0) {
        const first = newUploadedUrls.shift()!;
        setPrimary(first);
      }

      // Filter out duplicates
      const currentList = currentGallery || [];
      const updated = [...currentList, ...newUploadedUrls].filter(
        (url, idx, self) => self.indexOf(url) === idx
      );
      setGallery(updated);

      toast({
        title: 'Berhasil',
        description: `${newUploadedUrls.length} banner berhasil ditambahkan ke slider produk`,
      });
    }

    setIsUploading(false);
    setUploadProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Set an image from banner slider as thumbnail (swaps old thumbnail into banners)
  const handleSetAsPrimary = (selectedUrl: string) => {
    if (!selectedUrl || selectedUrl === currentPrimary) return;

    const oldPrimary = currentPrimary;
    const currentList = currentGallery || [];
    const withoutSelected = currentList.filter((u) => u !== selectedUrl);

    if (oldPrimary && !withoutSelected.includes(oldPrimary)) {
      withoutSelected.unshift(oldPrimary);
    }

    setPrimary(selectedUrl);
    setGallery(withoutSelected);

    toast({
      title: 'Thumbnail Diperbarui',
      description: 'Gambar ini sekarang menjadi thumbnail card produk.',
    });
  };

  // Remove image from banner slider
  const handleRemoveGalleryImage = (indexToRemove: number) => {
    const currentList = currentGallery || [];
    const updated = currentList.filter((_, idx) => idx !== indexToRemove);
    setGallery(updated);
    toast({ title: 'Dihapus', description: 'Banner telah dihapus dari slider' });
  };

  // Remove thumbnail
  const handleRemovePrimary = () => {
    const currentList = currentGallery || [];
    if (currentList.length > 0) {
      const nextPrimary = currentList[0];
      const remaining = currentList.slice(1);
      setPrimary(nextPrimary);
      setGallery(remaining);
      toast({
        title: 'Thumbnail Diganti',
        description: 'Banner pertama otomatis dijadikan thumbnail baru.',
      });
    } else {
      setPrimary('');
      toast({ title: 'Dihapus', description: 'Thumbnail telah dihapus' });
    }
  };

  // Add via custom URL
  const handleAddCustomUrl = () => {
    const clean = customUrl.trim();
    if (!clean) return;

    if (!currentPrimary) {
      setPrimary(clean);
    } else {
      const currentList = currentGallery || [];
      if (!currentList.includes(clean)) {
        setGallery([...currentList, clean]);
      }
    }

    setCustomUrl('');
    setShowUrlModal(false);
    toast({ title: 'Berhasil', description: 'URL gambar berhasil ditambahkan' });
  };

  const cleanPrimaryUrl = formatImageUrl(currentPrimary);

  // Gallery items without duplicating the primary
  const galleryItems = (currentGallery || []).filter((u) => u && u !== currentPrimary);

  return (
    <div className="space-y-6">
      {/* Hidden file inputs */}
      <input
        ref={primaryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handlePrimaryUpload}
        disabled={disabled || isUploading}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleMultipleUpload}
        disabled={disabled || isUploading}
      />

      {/* Progress banner */}
      {isUploading && (
        <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center gap-3 text-pink-600 dark:text-pink-400 text-xs font-bold animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{uploadProgress || 'Mengunggah gambar...'}</span>
        </div>
      )}

      {/* Section: 1. Thumbnail Produk (Card Produk) */}
      <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs">
                <Star className="w-3 h-3 fill-white" /> Thumbnail Card Produk
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Cover Utama Card Katalog &amp; Etalase
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Foto cover berasio 1:1 persegi yang tampil di card produk etalase web, mobile app, dan marketplace.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isUploading}
              onClick={() => primaryInputRef.current?.click()}
              className="rounded-xl text-xs font-bold gap-1.5 h-8 border-pink-200 text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/20"
            >
              <Upload className="w-3.5 h-3.5" /> Ganti Thumbnail
            </Button>
          </div>
        </div>

        {cleanPrimaryUrl ? (
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <div className="relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-pink-500 group bg-slate-100 shadow-md shadow-pink-500/10 shrink-0">
              <img
                src={cleanPrimaryUrl}
                alt="Thumbnail Card Produk"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <button
                type="button"
                onClick={handleRemovePrimary}
                disabled={disabled}
                className="absolute top-2 right-2 w-7 h-7 rounded-xl bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition-all shadow-md cursor-pointer"
                title="Hapus thumbnail produk"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 text-center">
                <span className="text-[10px] text-white font-extrabold flex items-center justify-center gap-1">
                  <Check className="w-3 h-3 text-pink-400" /> Thumbnail Card Aktif
                </span>
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-500 max-w-sm">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                Thumbnail siap ditampilkan pada kartu produk etalase.
              </p>
              <p className="text-[11px] text-slate-400">
                Untuk mengganti thumbnail dari salah satu banner di bawah, cukup klik tombol{' '}
                <span className="text-pink-600 font-bold">&quot;Jadikan Thumbnail&quot;</span> pada banner pilihan.
              </p>
            </div>
          </div>
        ) : (
          <div
            onClick={() => !isUploading && primaryInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-white/20 rounded-2xl p-6 text-center hover:border-pink-500 hover:bg-pink-50/20 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-950/40 text-pink-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <ImageIcon className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Klik untuk memilih Thumbnail Card Produk
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Format JPG, PNG, WEBP (Ideal 1000x1000 px persegi)
            </p>
          </div>
        )}
      </div>

      {/* Section: 2. Banner Slider Produk (Slide Halaman Detail Produk) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-xs uppercase tracking-tight text-slate-800 dark:text-slate-200">
                Banner Produk ({galleryItems.length} Banner Slide Detail)
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 font-bold">
                Bisa Banyak Banner (Multi-Slide)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Upload banyak banner agar di halaman detail produk pembeli dapat menggeser/slide melihat banyak foto &amp; banner produk interaktif.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isUploading}
              onClick={() => setShowUrlModal(!showUrlModal)}
              className="rounded-xl text-xs font-bold gap-1.5 h-8"
            >
              <LinkIcon className="w-3.5 h-3.5" /> URL Eksternal
            </Button>

            <Button
              type="button"
              size="sm"
              disabled={disabled || isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl text-xs font-bold gap-1.5 h-8 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Banner (+ Multi)
            </Button>
          </div>
        </div>

        {/* Input by URL Dropdown */}
        {showUrlModal && (
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 flex items-center gap-2 animate-in fade-in duration-200">
            <Input
              type="url"
              placeholder="https://domain.com/path-to-image.jpg"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="text-xs h-8 rounded-lg bg-white dark:bg-slate-900"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomUrl();
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              onClick={handleAddCustomUrl}
              className="h-8 rounded-lg text-xs font-bold bg-pink-600 text-white hover:bg-pink-700 shrink-0"
            >
              Tambahkan
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowUrlModal(false)}
              className="h-8 w-8 p-0 rounded-lg shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 pt-1">
          {galleryItems.map((url, idx) => {
            const formatted = formatImageUrl(url);
            return (
              <div
                key={url + idx}
                className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800/40 shadow-xs hover:border-pink-400 transition-all flex flex-col justify-between"
              >
                <img
                  src={formatted}
                  alt={`Galeri ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />

                {/* Badge Number */}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-black text-white">
                  #{idx + 1}
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemoveGalleryImage(idx)}
                  disabled={disabled}
                  className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md cursor-pointer"
                  title="Hapus foto dari galeri"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Make Primary Action */}
                <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleSetAsPrimary(url)}
                    disabled={disabled}
                    className="w-full py-1 px-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-[10px] font-bold flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                  >
                    <ArrowLeftRight className="w-3 h-3" /> Jadikan Thumbnail
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add Tile Button */}
          <button
            type="button"
            disabled={disabled || isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-pink-500 hover:bg-pink-50/20 dark:hover:bg-pink-950/20 transition-all flex flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-pink-600 cursor-pointer p-3 text-center group"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-pink-100 dark:group-hover:bg-pink-950/60 flex items-center justify-center transition-colors">
              <Plus className="w-5 h-5 text-slate-600 group-hover:text-pink-600" />
            </div>
            <span className="text-[11px] font-bold leading-tight">Unggah Banner</span>
            <span className="text-[9px] text-slate-400">Pilih 1 atau Banyak</span>
          </button>
        </div>
      </div>
    </div>
  );
}
