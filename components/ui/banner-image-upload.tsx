'use client';

import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { formatImageUrl } from '@/lib/url-utils';
import { FileUploadService } from '@/services/file-upload.service';
import { Loader2, Upload, X, Image as ImageIcon, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BannerImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
}

export function BannerImageUpload({
  value,
  onChange,
  disabled,
  label = 'Upload Banner Flash Sale',
  description = 'Rekomendasi rasio gambar lanskap (16:9 / 21:9), format JPG, PNG, atau WEBP maks 5MB.',
}: BannerImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const handleFile = async (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Format tidak didukung',
        description: 'Hanya file gambar (JPG, PNG, WEBP) yang dapat diunggah.',
        variant: 'destructive',
      });
      return;
    }

    // Local instant preview
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setIsUploading(true);

    try {
      const uploadedUrl = await FileUploadService.upload(file);
      onChange(uploadedUrl);
      setPreview(null);
      toast({
        title: 'Berhasil diunggah',
        description: 'Banner flash sale berhasil disimpan ke penyimpanan cloud.',
      });
    } catch (error: any) {
      setPreview(null);
      toast({
        title: 'Gagal upload banner',
        description: error?.message || 'Terjadi kesalahan saat mengunggah gambar banner.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file);
    // Reset file input value so re-selecting same file triggers onChange
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || isUploading) return;
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const currentImageUrl = formatImageUrl(value);
  const displayUrl = preview || currentImageUrl;

  return (
    <div className="space-y-3 w-full">
      {displayUrl ? (
        <div className="relative w-full rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-white/10 group shadow-md bg-slate-900/5 dark:bg-black/40">
          <div className="aspect-[21/9] sm:aspect-[16/6] w-full max-h-72 overflow-hidden flex items-center justify-center">
            <img
              src={displayUrl}
              alt="Banner Flash Sale"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>

          {/* Loading Overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-2 z-20">
              <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
              <p className="text-xs font-bold uppercase tracking-wider">Mengunggah banner ke server...</p>
            </div>
          )}

          {/* Banner Active Badge */}
          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-white/10">
            <CheckCircle2 size={12} className="text-emerald-400" /> Banner Terpasang
          </div>

          {/* Floating Actions on Hover */}
          {!isUploading && !disabled && (
            <div className="absolute top-3 right-3 flex items-center gap-2 transition-opacity">
              <label className="cursor-pointer bg-white/90 hover:bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-1.5 backdrop-blur-md">
                <RefreshCw size={12} />
                <span>Ganti Banner</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={onFileInputChange}
                  disabled={disabled || isUploading}
                />
              </label>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  onChange('');
                  setPreview(null);
                }}
                className="h-8 rounded-xl shadow-lg gap-1 px-3 text-xs font-bold"
              >
                <X size={14} /> Hapus
              </Button>
            </div>
          )}
        </div>
      ) : (
        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex flex-col items-center justify-center w-full aspect-[21/9] sm:aspect-[16/5] max-h-56 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${
            isDragOver
              ? 'border-pink-500 bg-pink-500/10 scale-[0.99]'
              : 'border-slate-200 dark:border-white/10 hover:border-pink-500 hover:bg-pink-50/10 bg-slate-50/50 dark:bg-white/[0.02]'
          }`}
        >
          <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 text-pink-500 animate-spin mb-3" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Mengunggah gambar banner...</p>
                <p className="text-xs text-slate-400 mt-1">Harap tunggu sebentar</p>
              </>
            ) : (
              <>
                <div className="h-14 w-14 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 mb-3 shadow-inner group-hover:scale-110 transition-transform">
                  <Upload className="h-7 w-7" />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {label}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                  Klik untuk memilih file gambar dari komputer atau seret file ke area ini
                </p>
                <span className="text-[10px] text-slate-400 font-medium mt-2 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full">
                  {description}
                </span>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={onFileInputChange}
            disabled={disabled || isUploading}
          />
        </label>
      )}
    </div>
  );
}
