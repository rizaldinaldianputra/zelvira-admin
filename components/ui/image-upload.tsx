'use client';

import { toast } from '@/hooks/use-toast';
import { formatImageUrl } from '@/lib/url-utils';
import { FileUploadService } from '@/services/file-upload.service';
import { Loader2, Upload, X, RefreshCw, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    setIsUploading(true);
    try {
      const url = await FileUploadService.upload(file);
      onChange(url);
      setPreview(null);
      toast({ title: 'Berhasil', description: 'Foto berhasil diunggah' });
    } catch (error: any) {
      setPreview(null);
      toast({
        title: 'Gagal Upload',
        description: error?.message || 'Gagal mengupload gambar',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleApplyUrl = () => {
    if (customUrl.trim()) {
      onChange(customUrl.trim());
      setCustomUrl('');
      setShowUrlInput(false);
      toast({ title: 'Tersimpan', description: 'URL foto berhasil diterapkan' });
    }
  };

  const currentImageUrl = formatImageUrl(value);
  const displayUrl = preview || currentImageUrl;

  return (
    <div className="space-y-3 w-full">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={onUpload}
        disabled={disabled || isUploading}
      />

      <div className="flex flex-wrap items-start gap-5">
        {displayUrl ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div
              className="relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-white/10 group bg-slate-100 cursor-pointer shadow-sm hover:border-pink-500 transition-all shrink-0"
              onClick={() => !isUploading && inputRef.current?.click()}
              title="Klik untuk memilih foto baru"
            >
              <img
                src={displayUrl}
                alt="Upload Preview"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />

              {isUploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] text-white">
                  <Loader2 className="h-7 w-7 animate-spin mb-1 text-pink-400" />
                  <span className="text-[10px] font-bold">Mengunggah...</span>
                </div>
              )}

              {!isUploading && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2 text-center">
                  <RefreshCw className="h-6 w-6 mb-1 text-pink-300" />
                  <span className="text-[10px] font-bold">Klik Ganti Foto</span>
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled || isUploading}
                  onClick={() => inputRef.current?.click()}
                  className="h-9 rounded-xl border-slate-200 text-xs font-bold gap-1.5 hover:border-pink-500 hover:text-pink-600 bg-white shadow-sm"
                >
                  {isUploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5 text-pink-500" />
                  )}
                  Ganti Foto
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled || isUploading}
                  onClick={handleRemove}
                  className="h-9 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1.5"
                >
                  <X className="h-3.5 w-3.5" />
                  Hapus
                </Button>
              </div>

              <div className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                Klik kotak foto atau tombol &quot;Ganti Foto&quot; untuk memilih berkas dari komputer.
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div
              onClick={() => !isUploading && inputRef.current?.click()}
              className="flex flex-col items-center justify-center w-36 h-36 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl cursor-pointer hover:border-pink-500 hover:bg-pink-50/20 transition-all group bg-slate-50/60 shadow-sm shrink-0"
            >
              <div className="flex flex-col items-center justify-center p-3 text-center">
                {isUploading ? (
                  <>
                    <Loader2 className="h-8 w-8 text-pink-500 animate-spin mb-1.5" />
                    <p className="text-[11px] font-bold text-slate-600">Mengupload...</p>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 group-hover:text-pink-600">Pilih Foto</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WEBP</p>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="h-8 rounded-xl text-xs text-slate-600 border-slate-200 gap-1.5"
              >
                <LinkIcon className="h-3 w-3 text-slate-400" />
                {showUrlInput ? 'Tutup URL' : 'Gunakan URL Foto'}
              </Button>

              {showUrlInput && (
                <div className="flex items-center gap-2 pt-1">
                  <Input
                    placeholder="https://domain.com/foto.jpg"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="h-8 text-xs w-60 rounded-xl"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleApplyUrl}
                    className="h-8 rounded-xl text-xs bg-black text-white hover:bg-slate-800"
                  >
                    Terapkan
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
