'use client';

import React, { useState, useEffect } from 'react';
import { ShippingService } from '@/services/shipping.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  RefreshCw,
  MapPin,
  Building2,
  Search,
  CheckCircle2,
  AlertCircle,
  Database
} from 'lucide-react';
import { toast } from 'sonner';

export default function LocationsAdminPage() {
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [stats, setStats] = useState<{ total_provinces: number; total_cities: number }>({
    total_provinces: 0,
    total_cities: 0,
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'provinces' | 'cities'>('provinces');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, provList, cityList] = await Promise.all([
        ShippingService.getLocationStats(),
        ShippingService.getAllProvinces(),
        ShippingService.getAllCities(),
      ]);
      setStats(statsData);
      setProvinces(provList);
      setCities(cityList);
    } catch (err: any) {
      console.error('Failed to load locations', err);
      toast.error('Gagal memuat data wilayah: ' + (err.message || 'Terjadi kesalahan'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSync = async () => {
    try {
      setSyncing(true);
      toast.info('Memulai sinkronisasi data dari RajaOngkir... Proses ini dapat memakan waktu 10-30 detik.');
      const result = await ShippingService.syncLocations();
      toast.success(
        `Sinkronisasi Berhasil! ${result?.provinces_synced || 0} Provinsi & ${result?.cities_synced || 0} Kota tersimpan ke database.`
      );
      await loadData();
    } catch (err: any) {
      console.error('Sync failed', err);
      toast.error('Gagal melakukan sinkronisasi: ' + (err.message || 'Terjadi kesalahan'));
    } finally {
      setSyncing(false);
    }
  };

  const filteredProvinces = provinces.filter((p) =>
    (p.name || p.province || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.province_id || p.provinceId || '').toString().includes(searchQuery)
  );

  const filteredCities = cities.filter((c) =>
    (c.cityName || c.city_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.postalCode || c.postal_code || '').toString().includes(searchQuery) ||
    (c.cityId || c.city_id || '').toString().includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
              Store Locations & Regional Data
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Sinkronisasi dan kelola data master Provinsi & Kota/Kabupaten langsung ke database Zelvira.
            </p>
          </div>
        </div>

        <Button
          onClick={handleSync}
          disabled={syncing}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-600/20 px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all hover:scale-[1.02]"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Menyinkronkan...' : 'Sync Data dari RajaOngkir'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Provinsi</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">
              {stats.total_provinces}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Kota / Kabupaten</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">
              {stats.total_cities}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-600 dark:text-amber-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status Database</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5 flex items-center gap-1.5">
              {stats.total_provinces > 0 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Data Tersinkron
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Belum Ada Data (Klik Sync)
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Card Header & Controls */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('provinces')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'provinces'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
            >
              Provinsi ({filteredProvinces.length})
            </button>
            <button
              onClick={() => setActiveTab('cities')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'cities'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
            >
              Kota / Kabupaten ({filteredCities.length})
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder={`Cari ${activeTab === 'provinces' ? 'provinsi' : 'kota / tipe / kode pos'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-3" />
            <p>Memuat data wilayah dari database...</p>
          </div>
        ) : activeTab === 'provinces' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">ID Provinsi</th>
                  <th className="py-3.5 px-6">Nama Provinsi</th>
                  <th className="py-3.5 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredProvinces.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400">
                      Tidak ada data provinsi. Silakan klik tombol <strong>"Sync Data dari RajaOngkir"</strong> di atas.
                    </td>
                  </tr>
                ) : (
                  filteredProvinces.map((p) => (
                    <tr key={p.provinceId || p.province_id || p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-6 font-mono text-xs text-slate-500">
                        {p.provinceId || p.province_id || p.id}
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-slate-800 dark:text-slate-100">
                        {p.name || p.province}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                          Tersimpan di DB
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">ID Kota</th>
                  <th className="py-3.5 px-6">ID Prov</th>
                  <th className="py-3.5 px-6">Nama Kota / Kabupaten</th>
                  <th className="py-3.5 px-6">Tipe</th>
                  <th className="py-3.5 px-6">Kode Pos</th>
                  <th className="py-3.5 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredCities.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Tidak ada data kota. Silakan klik tombol <strong>"Sync Data dari RajaOngkir"</strong> di atas.
                    </td>
                  </tr>
                ) : (
                  filteredCities.map((c) => (
                    <tr key={c.cityId || c.city_id || c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-6 font-mono text-xs text-slate-500">
                        {c.cityId || c.city_id || c.id}
                      </td>
                      <td className="py-3.5 px-6 font-mono text-xs text-slate-500">
                        {c.provinceId || c.province_id}
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-slate-800 dark:text-slate-100">
                        {c.cityName || c.city_name}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {c.type || '-'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {c.postalCode || c.postal_code || '-'}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                          Tersimpan di DB
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
