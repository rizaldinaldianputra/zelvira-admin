'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Smartphone, Bell, Save, Loader2, ArrowLeft, ShieldAlert, Sparkles, CheckCircle2, Download, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useSettingsMobile } from '@/hooks/use-settings-mobile';

export default function MobileSettingsPage() {
  const {
    loading,
    fetching,
    settings,
    setSettings,
    handleSave,
  } = useSettingsMobile();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link href="/admin/settings">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl border border-slate-200 dark:border-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
          <Smartphone className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Pengaturan Mobile App</h1>
          <p className="text-slate-500 text-sm mt-0.5">Kelola versi rilis aplikasi mobile, kebijakan pembaruan wajib, dan tautan unduhan.</p>
        </div>
      </div>

      {fetching ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          <p className="text-sm text-slate-500 font-medium">Memuat konfigurasi mobile app...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 dark:border-white/10 rounded-4xl overflow-hidden shadow-sm">
              <CardHeader className="bg-slate-50/50 dark:bg-white/2 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-pink-100 dark:bg-pink-900/30 rounded-2xl text-pink-600">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Konfigurasi Versi Aplikasi</CardTitle>
                    <CardDescription>Atur nomor versi rilis dan batas versi minimum</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Versi Terbaru (Latest Version)
                    </Label>
                    <Input
                      value={settings.latestVersion}
                      onChange={(e) => setSettings({ ...settings, latestVersion: e.target.value })}
                      placeholder="contoh: 1.1.0"
                      className="h-12 rounded-xl text-base font-semibold"
                    />
                    <p className="text-[11px] text-slate-400">Versi aplikasi terbaru yang tersedia di Play Store / App Store.</p>
                  </div>

                  <div className="space-y-2.5">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Versi Minimal Wajib (Min Version)
                    </Label>
                    <Input
                      value={settings.minVersion}
                      onChange={(e) => setSettings({ ...settings, minVersion: e.target.value })}
                      placeholder="contoh: 1.0.0"
                      className="h-12 rounded-xl text-base font-semibold"
                    />
                    <p className="text-[11px] text-slate-400">Pengguna di bawah versi ini WAJIB update (tidak bisa dilewati).</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/3 border border-slate-200/60 dark:border-white/5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                      <Label className="text-sm font-bold text-slate-900 dark:text-white cursor-pointer">
                        Paksa Semua Pengguna Update (Force Update Global)
                      </Label>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Jika diaktifkan, semua pengguna yang belum berada di versi terbaru akan dipaksa update tanpa bisa melewati dialog.
                    </p>
                  </div>
                  <Switch
                    checked={settings.forceUpdate}
                    onCheckedChange={(checked) => setSettings({ ...settings, forceUpdate: checked })}
                  />
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    URL Unduhan / Link Play Store
                  </Label>
                  <div className="relative">
                    <Download className="w-4 h-4 absolute left-3.5 top-4 text-slate-400" />
                    <Input
                      value={settings.downloadUrl}
                      onChange={(e) => setSettings({ ...settings, downloadUrl: e.target.value })}
                      placeholder="https://play.google.com/store/apps/details?id=com.zelvira.ecommerce"
                      className="h-12 pl-10 rounded-xl"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">Link yang dibuka saat pengguna menekan tombol "Perbarui Sekarang".</p>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Judul Dialog Pembaruan
                  </Label>
                  <Input
                    value={settings.title}
                    onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                    placeholder="Pembaruan Aplikasi Tersedia"
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Pesan / Catatan Rilis (Release Notes)
                  </Label>
                  <Textarea
                    value={settings.message}
                    onChange={(e) => setSettings({ ...settings, message: e.target.value })}
                    rows={4}
                    placeholder="Tuliskan fitur baru, perbaikan bug, atau instruksi update..."
                    className="rounded-xl text-sm"
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50/50 dark:bg-white/2 border-t border-slate-100 dark:border-white/5 p-6 flex items-center justify-between">
                <span className="text-xs text-slate-400">Pastikan nomor versi sesuai semantic format (cth: 1.0.0)</span>
                <Button
                  id="btn-save-mobile-settings"
                  onClick={handleSave}
                  disabled={loading}
                  className="rounded-xl bg-pink-500 hover:bg-pink-600 px-8 h-12 font-bold shadow-lg shadow-pink-500/20 text-white"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Simpan Pengaturan
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Right Column: Visual Behavior Preview (1 col) */}
          <div className="space-y-6">
            <Card className="border-slate-200 dark:border-white/10 rounded-4xl overflow-hidden shadow-sm bg-linear-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950">
              <CardHeader className="border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2 text-pink-600 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Logika Dialog di Mobile</span>
                </div>
                <CardTitle className="text-base mt-1">3 Skenario Pembaruan</CardTitle>
                <CardDescription>Bagaimana aplikasi mobile bereaksi terhadap versi yang Anda atur:</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Skenario 1 */}
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>1. Wajib Update</span>
                  </div>
                  <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
                    Terjadi jika <strong>versi HP &lt; Min Version ({settings.minVersion})</strong> atau toggle Paksa Update aktif.
                  </p>
                  <div className="text-[11px] bg-rose-100 dark:bg-rose-900/30 p-2.5 rounded-xl text-rose-700 dark:text-rose-300">
                    🔒 Dialog <strong>tidak bisa ditutup/dilewati</strong>. Hanya ada 1 tombol: <em>"Perbarui Sekarang"</em>.
                  </div>
                </div>

                {/* Skenario 2 */}
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>2. Boleh Lewati Update</span>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    Terjadi jika <strong>{settings.minVersion} &le; versi HP &lt; {settings.latestVersion}</strong>.
                  </p>
                  <div className="text-[11px] bg-amber-100 dark:bg-amber-900/30 p-2.5 rounded-xl text-amber-700 dark:text-amber-300">
                    🔓 Pengguna diberi pilihan: tombol <em>"Perbarui Sekarang"</em> atau <em>"Nanti Saja / Lewati"</em>.
                  </div>
                </div>

                {/* Skenario 3 */}
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>3. Tidak Muncul Update</span>
                  </div>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    Terjadi jika <strong>versi HP &ge; {settings.latestVersion}</strong> (sudah versi terbaru).
                  </p>
                  <div className="text-[11px] bg-emerald-100 dark:bg-emerald-900/30 p-2.5 rounded-xl text-emerald-700 dark:text-emerald-300">
                    ✨ Tidak ada dialog yang muncul, aplikasi langsung berjalan normal ke Beranda.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
