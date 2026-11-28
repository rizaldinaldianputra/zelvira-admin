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
  Smartphone, ChevronDown
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
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [subdistricts, setSubdistricts] = useState<any[]>([]);

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
        const [data, provRes] = await Promise.all([
          OrganizationService.get(),
          apiClient.get<any>('/v1/shipping/provinces').catch(() => []),
        ]);
        setProvinces(Array.isArray(provRes) ? provRes : []);
        if (data.originProvinceId) {
          apiClient.get<any>(`/v1/shipping/cities?provinceId=${data.originProvinceId}`).then((r) => setCities(Array.isArray(r) ? r : [])).catch(() => {});
        }
        if (data.originCityId) {
          apiClient.get<any>(`/v1/shipping/districts?cityId=${data.originCityId}`).then((r) => setDistricts(Array.isArray(r) ? r : [])).catch(() => {});
        }
        if (data.originDistrictId) {
          apiClient.get<any>(`/v1/shipping/subdistricts?districtId=${data.originDistrictId}`).then((r) => setSubdistricts(Array.isArray(r) ? r : [])).catch(() => {});
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

            {/* LOKASI ASAL PENGIRIMAN (ORIGIN) */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Lokasi Asal Pengiriman (Origin Ongkir)
                </FormLabel>
                {form.watch('originSubdistrictId') && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    ID: {form.watch('originSubdistrictId')}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Provinsi</label>
                  <div className="relative">
                    <select
                      value={form.watch('originProvinceId') || ''}
                      onChange={async (e) => {
                        const val = e.target.value;
                        form.setValue('originProvinceId', val);
                        form.setValue('originCityId', '');
                        form.setValue('originDistrictId', '');
                        form.setValue('originSubdistrictId', '');
                        form.setValue('originLocationName', '');
                        setCities([]);
                        setDistricts([]);
                        setSubdistricts([]);
                        if (val) {
                          const res = await apiClient.get<any>(`/v1/shipping/cities?provinceId=${val}`).catch(() => []);
                          setCities(Array.isArray(res) ? res : []);
                        }
                      }}
                      className="w-full h-12 pl-4 pr-10 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-white/5 font-semibold text-sm text-slate-800 dark:text-slate-100 appearance-none focus:outline-none focus:ring-2 focus:ring-pink-500/30 transition-all"
                    >
                      <option value="">Pilih Provinsi</option>
                      {provinces.map((p: any) => (
                        <option key={p.province_id} value={p.province_id}>
                          {p.province}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Kota / Kabupaten</label>
                  <div className="relative">
                    <select
                      value={form.watch('originCityId') || ''}
                      disabled={!form.watch('originProvinceId')}
                      onChange={async (e) => {
                        const val = e.target.value;
                        form.setValue('originCityId', val);
                        form.setValue('originDistrictId', '');
                        form.setValue('originSubdistrictId', '');
                        form.setValue('originLocationName', '');
                        setDistricts([]);
                        setSubdistricts([]);
                        if (val) {
                          const res = await apiClient.get<any>(`/v1/shipping/districts?cityId=${val}`).catch(() => []);
                          setDistricts(Array.isArray(res) ? res : []);
                        }
                      }}
                      className="w-full h-12 pl-4 pr-10 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-white/5 font-semibold text-sm text-slate-800 dark:text-slate-100 appearance-none focus:outline-none focus:ring-2 focus:ring-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <option value="">Pilih Kota / Kabupaten</option>
                      {cities.map((c: any) => (
                        <option key={c.city_id} value={c.city_id}>
                          {c.type ? `${c.type} ` : ''}{c.city_name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Kecamatan</label>
                  <div className="relative">
                    <select
                      value={form.watch('originDistrictId') || ''}
                      disabled={!form.watch('originCityId')}
                      onChange={async (e) => {
                        const val = e.target.value;
                        form.setValue('originDistrictId', val);
                        form.setValue('originSubdistrictId', '');
                        form.setValue('originLocationName', '');
                        setSubdistricts([]);
                        if (val) {
                          const res = await apiClient.get<any>(`/v1/shipping/subdistricts?districtId=${val}`).catch(() => []);
                          setSubdistricts(Array.isArray(res) ? res : []);
                        }
                      }}
                      className="w-full h-12 pl-4 pr-10 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-white/5 font-semibold text-sm text-slate-800 dark:text-slate-100 appearance-none focus:outline-none focus:ring-2 focus:ring-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <option value="">Pilih Kecamatan</option>
                      {districts.map((d: any) => (
                        <option key={d.district_id} value={d.district_id}>
                          {d.district_name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Kelurahan / Desa</label>
                  <div className="relative">
                    <select
                      value={form.watch('originSubdistrictId') || ''}
                      disabled={!form.watch('originDistrictId')}
                      onChange={(e) => {
                        const val = e.target.value;
                        form.setValue('originSubdistrictId', val);
                        const sub = subdistricts.find((s: any) => String(s.subdistrict_id) === String(val));
                        const dist = districts.find((d: any) => String(d.district_id) === String(form.getValues('originDistrictId')));
                        const city = cities.find((c: any) => String(c.city_id) === String(form.getValues('originCityId')));
                        const prov = provinces.find((p: any) => String(p.province_id) === String(form.getValues('originProvinceId')));
                        if (sub) {
                          form.setValue(
                            'originLocationName',
                            [sub.subdistrict_name, dist?.district_name, city?.city_name, prov?.province].filter(Boolean).join(', ')
                          );
                        }
                      }}
                      className="w-full h-12 pl-4 pr-10 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-white/5 font-semibold text-sm text-slate-800 dark:text-slate-100 appearance-none focus:outline-none focus:ring-2 focus:ring-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <option value="">Pilih Kelurahan / Desa</option>
                      {subdistricts.map((s: any) => (
                        <option key={s.subdistrict_id} value={s.subdistrict_id}>
                          {s.subdistrict_name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {form.watch('originLocationName') && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50 flex items-center gap-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>Origin Aktif: {form.watch('originLocationName')}</span>
                </div>
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
