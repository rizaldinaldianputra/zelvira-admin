'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { OrganizationService } from '@/services/organization.service';
import { apiClient } from '@/services/api.client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Building2, MapPin, Phone, Mail, Instagram, Facebook,
  Youtube, Twitter, Play, Apple, Map, Globe, Save, Loader2,
  Smartphone, Search, X
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const orgSchema = z.object({
  name: z.string().min(1, 'Nama merek wajib diisi'),
  address: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  email: z.string().email('Email tidak valid').optional().nullable().or(z.literal('')),
  instagramUrl: z.string().url('URL tidak valid').optional().nullable().or(z.literal('')),
  facebookUrl: z.string().url('URL tidak valid').optional().nullable().or(z.literal('')),
  twitterUrl: z.string().url('URL tidak valid').optional().nullable().or(z.literal('')),
  youtubeUrl: z.string().url('URL tidak valid').optional().nullable().or(z.literal('')),
  tiktokUrl: z.string().url('URL tidak valid').optional().nullable().or(z.literal('')),
  playstoreUrl: z.string().url('URL tidak valid').optional().nullable().or(z.literal('')),
  appstoreUrl: z.string().url('URL tidak valid').optional().nullable().or(z.literal('')),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  originProvinceId: z.string().optional().nullable(),
  originCityId: z.string().optional().nullable(),
  originDistrictId: z.string().optional().nullable(),
  originSubdistrictId: z.string().optional().nullable(),
  originLocationName: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
});

type OrgFormValues = z.infer<typeof orgSchema>;

export default function OrganizationSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [originSearch, setOriginSearch] = useState('');
  const [originResults, setOriginResults] = useState<any[]>([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);

  const form = useForm<OrgFormValues>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: '',
      address: '',
      phoneNumber: '',
      email: '',
      instagramUrl: '',
      facebookUrl: '',
      twitterUrl: '',
      youtubeUrl: '',
      tiktokUrl: '',
      playstoreUrl: '',
      appstoreUrl: '',
      latitude: 0,
      longitude: 0,
      logoUrl: '',
    },
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await OrganizationService.get();
        if (data.originLocationName) {
          setOriginSearch(data.originLocationName);
        }
        form.reset({
          ...data,
          email: data.email || '',
          instagramUrl: data.instagramUrl || '',
          facebookUrl: data.facebookUrl || '',
          twitterUrl: data.twitterUrl || '',
          youtubeUrl: data.youtubeUrl || '',
          tiktokUrl: data.tiktokUrl || '',
          playstoreUrl: data.playstoreUrl || '',
          appstoreUrl: data.appstoreUrl || '',
        });
      } catch (error) {
        toast({ title: 'Error', description: 'Gagal memuat data organisasi', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const onSubmit = async (values: OrgFormValues) => {
    setIsLoading(true);
    try {
      await OrganizationService.update(values);
      toast({ title: 'Berhasil', description: 'Konfigurasi organisasi diperbarui' });
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal memperbarui konfigurasi', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Organization Config</h1>
          <p className="text-slate-400 text-sm font-medium">Kelola identitas merek, kontak, dan sosial media toko Anda.</p>
        </div>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isLoading}
          className="rounded-full bg-pink-500 hover:bg-pink-600 text-white font-black px-10 shadow-lg shadow-pink-500/20"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Simpan Perubahan
        </Button>
      </div>

      <Form {...form}>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* IDENTITAS & KONTAK */}
          <div className="space-y-6 bg-white/60 dark:bg-slate-900/60 p-8 rounded-[3rem] border border-white/20 shadow-sm backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600">
                <Building2 size={20} />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">Identitas & Kontak</h3>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Merek / Toko</FormLabel>
                  <FormControl>
                    <Input {...field} className="h-12 rounded-2xl border-none bg-slate-100 dark:bg-white/5 font-semibold" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alamat Lengkap</FormLabel>
                  <FormControl>
                    <Textarea {...field as any} className="min-h-[100px] rounded-2xl border-none bg-slate-100 dark:bg-white/5 font-medium" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* LOKASI ASAL PENGIRIMAN (ORIGIN) - 1 BARIS SEARCHABLE DROPDOWN */}
            <div className="space-y-2 pt-2 relative">
              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Lokasi Asal Pengiriman (Origin Ongkir)
              </FormLabel>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  value={originSearch}
                  onFocus={() => {
                    if (originResults.length > 0) setShowOriginDropdown(true);
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    setOriginSearch(val);
                    setShowOriginDropdown(true);
                    if (val.trim().length < 3) {
                      setOriginResults([]);
                      return;
                    }
                    setIsSearchingOrigin(true);
                    apiClient
                      .get<any>(`/v1/shipping/search/domestic?search=${encodeURIComponent(val.trim())}`)
                      .then((res) => {
                        setOriginResults(Array.isArray(res) ? res : []);
                      })
                      .catch(() => setOriginResults([]))
                      .finally(() => setIsSearchingOrigin(false));
                  }}
                  placeholder="Ketik nama kecamatan, kota, atau kelurahan (min. 3 huruf)..."
                  className="h-12 pl-11 pr-10 rounded-2xl border-none bg-slate-100 dark:bg-white/5 font-semibold text-sm"
                />
                {isSearchingOrigin ? (
                  <Loader2 className="w-4 h-4 animate-spin text-pink-500 absolute right-4 top-1/2 -translate-y-1/2" />
                ) : originSearch ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOriginSearch('');
                      setOriginResults([]);
                      setShowOriginDropdown(false);
                      form.setValue('originSubdistrictId', '');
                      form.setValue('originLocationName', '');
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : null}

                {showOriginDropdown && originSearch.trim().length >= 3 && (
                  <div className="absolute z-50 mt-2 w-full max-h-64 overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl divide-y divide-slate-100 dark:divide-slate-800">
                    {isSearchingOrigin ? (
                      <div className="p-4 text-xs text-slate-500 flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Mencari lokasi...
                      </div>
                    ) : originResults.length === 0 ? (
                      <div className="p-4 text-xs text-slate-500">Lokasi tidak ditemukan.</div>
                    ) : (
                      originResults.map((item: any, idx: number) => {
                        const id = String(item.id ?? item.subdistrict_id ?? '');
                        const label =
                          item.label ||
                          [item.subdistrict_name, item.district_name, item.city_name, item.province_name]
                            .filter(Boolean)
                            .join(', ');
                        return (
                          <button
                            key={id || idx}
                            type="button"
                            onClick={() => {
                              form.setValue('originSubdistrictId', id);
                              form.setValue('originLocationName', label);
                              setOriginSearch(label);
                              setShowOriginDropdown(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-pink-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between gap-2"
                          >
                            <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{label}</span>
                            {item.zip_code && (
                              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                                {item.zip_code}
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {form.watch('originSubdistrictId') && (
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Origin Aktif: {form.watch('originLocationName')} (ID: {form.watch('originSubdistrictId')})
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">No. Handphone</FormLabel>
                    <FormControl>
                      <Input {...field as any} className="h-12 rounded-2xl border-none bg-slate-100 dark:bg-white/5 font-semibold" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Resmi</FormLabel>
                    <FormControl>
                      <Input {...field as any} className="h-12 rounded-2xl border-none bg-slate-100 dark:bg-white/5 font-semibold" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* SOSIAL MEDIA */}
          <div className="space-y-6 bg-white/60 dark:bg-slate-900/60 p-8 rounded-[3rem] border border-white/20 shadow-sm backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <Globe size={20} />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">Social Media Links</h3>
            </div>

            <div className="space-y-4">
              {[
                { name: 'instagramUrl', label: 'Instagram', icon: Instagram },
                { name: 'facebookUrl', label: 'Facebook', icon: Facebook },
                { name: 'twitterUrl', label: 'Twitter', icon: Twitter },
                { name: 'youtubeUrl', label: 'Youtube', icon: Youtube },
                { name: 'tiktokUrl', label: 'TikTok', icon: Play },
              ].map((social) => (
                <FormField
                  key={social.name}
                  control={form.control}
                  name={social.name as any}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-3">
                        <social.icon size={16} className="text-slate-400" />
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">{social.label}</FormLabel>
                      </div>
                      <FormControl>
                        <Input {...field} placeholder="https://..." className="h-10 rounded-xl border-none bg-slate-100 dark:bg-white/5 text-xs font-medium" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>

          {/* LOKASI (MAPS) */}
          <div className="space-y-6 bg-white/60 dark:bg-slate-900/60 p-8 rounded-[3rem] border border-white/20 shadow-sm backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                <Map size={20} />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">Lokasi Koordinat</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Latitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        value={field.value ?? 0}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        className="h-12 rounded-2xl border-none bg-slate-100 dark:bg-white/5 font-bold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Longitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        value={field.value ?? 0}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        className="h-12 rounded-2xl border-none bg-slate-100 dark:bg-white/5 font-bold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* APP STORE LINKS */}
          <div className="space-y-6 bg-white/60 dark:bg-slate-900/60 p-8 rounded-[3rem] border border-white/20 shadow-sm backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                <Smartphone size={20} />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">App Stores</h3>
            </div>

            <FormField
              control={form.control}
              name="playstoreUrl"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-3">
                    <Play size={16} className="text-slate-400" />
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Google Play Store</FormLabel>
                  </div>
                  <FormControl>
                    <Input {...field as any} placeholder="https://play.google.com/..." className="h-12 rounded-2xl border-none bg-slate-100 dark:bg-white/5 font-medium" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appstoreUrl"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-3">
                    <Apple size={16} className="text-slate-400" />
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Apple App Store</FormLabel>
                  </div>
                  <FormControl>
                    <Input {...field as any} placeholder="https://apps.apple.com/..." className="h-12 rounded-2xl border-none bg-slate-100 dark:bg-white/5 font-medium" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}
