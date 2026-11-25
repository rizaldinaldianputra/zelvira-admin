'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Layers,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  Award,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
  Calculator,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { pricingService } from '@/services/pricing.service';
import { PricingAnalytics, ProductProfitabilityDto } from '@/types/pricing';

export default function AnalisisKeuntunganPage() {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<PricingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPerformance, setSelectedPerformance] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'profit' | 'revenue' | 'margin' | 'margin_asc' | 'sold' | 'stock'>('profit');

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await pricingService.getPricingAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      toast({
        title: 'Gagal memuat analisis keuntungan',
        description: err.message || 'Terjadi kesalahan saat memuat data analitik',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const formatIdr = (num?: number) => {
    if (num === undefined || num === null) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getPerformanceBadge = (perf: string) => {
    switch (perf) {
      case 'STAR':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Produk Bintang (Star)
          </span>
        );
      case 'VOLUME_DRIVER':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            Penggerak Volume
          </span>
        );
      case 'MODERATE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
            Stabil / Moderat
          </span>
        );
      case 'LOW_PERFORMER':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Margin Tipis / Rendah
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
            {perf}
          </span>
        );
    }
  };

  const getMarginBadgeClass = (margin: number) => {
    if (margin >= 40) return 'text-emerald-700 bg-emerald-50 border-emerald-200 font-bold';
    if (margin >= 25) return 'text-blue-700 bg-blue-50 border-blue-200 font-medium';
    if (margin >= 15) return 'text-amber-700 bg-amber-50 border-amber-200 font-medium';
    return 'text-rose-700 bg-rose-50 border-rose-200 font-bold';
  };

  // Filter & Sort
  const filteredProducts = (analytics?.products || [])
    .filter((p) => {
      const matchSearch =
        search === '' ||
        p.productName.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(search.toLowerCase()));

      const matchPerf = selectedPerformance === 'ALL' || p.performanceLabel === selectedPerformance;

      return matchSearch && matchPerf;
    })
    .sort((a, b) => {
      if (sortBy === 'profit') return (b.totalProfit || 0) - (a.totalProfit || 0);
      if (sortBy === 'revenue') return (b.revenue || 0) - (a.revenue || 0);
      if (sortBy === 'margin') return (b.marginPercent || 0) - (a.marginPercent || 0);
      if (sortBy === 'margin_asc') return (a.marginPercent || 0) - (b.marginPercent || 0);
      if (sortBy === 'sold') return (b.unitsSold || 0) - (a.unitsSold || 0);
      if (sortBy === 'stock') return (b.totalStock || 0) - (a.totalStock || 0);
      return 0;
    });

  // Calculate counts for badges
  const starCount = analytics?.products.filter((p) => p.performanceLabel === 'STAR').length || 0;
  const volumeCount = analytics?.products.filter((p) => p.performanceLabel === 'VOLUME_DRIVER').length || 0;
  const moderateCount = analytics?.products.filter((p) => p.performanceLabel === 'MODERATE').length || 0;
  const lowCount = analytics?.products.filter((p) => p.performanceLabel === 'LOW_PERFORMER').length || 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Analisis Keuntungan Produk</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Evaluasi kesehatan margin, valuasi HPP persediaan gudang, kontribusi laba kotor, dan deteksi produk margin tipis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAnalytics}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Muat Ulang
          </Button>

          <Link href="/admin/pricing/calculator">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Kalkulator Harga
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase text-slate-500">
              Valuasi HPP Persediaan Gudang
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {formatIdr(analytics?.totalInventoryHppValue)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-blue-500" />
              Estimasi modal tertanam di seluruh stok aktif
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase text-slate-500">
              Total Omzet Penjualan
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-indigo-700">
              {formatIdr(analytics?.totalRevenue)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
              Pendapatan dari pesanan yang telah dibayar
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase text-slate-500">
              Total Laba Kotor (Gross Profit)
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-700">
              {formatIdr(analytics?.totalGrossProfit)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              Omzet dikurangi estimasi HPP produk
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase text-slate-500">
              Rata-rata Margin Toko
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-purple-700">
              {analytics?.averageMarginPercent ? `${analytics.averageMarginPercent.toFixed(1)}%` : '0%'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{analytics?.profitableProductsCount || 0} produk sehat</span>
              <span className="text-rose-600 font-medium">{analytics?.lowMarginProductsCount || 0} margin tipis</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <button
          onClick={() => setSelectedPerformance('ALL')}
          className={`p-3 rounded-lg border text-left transition-all ${selectedPerformance === 'ALL'
              ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
              : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Semua Produk</span>
            <Badge variant="secondary" className="font-bold">
              {analytics?.totalProductsCount || 0}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">Katalog lengkap produk aktif</p>
        </button>

        <button
          onClick={() => setSelectedPerformance('STAR')}
          className={`p-3 rounded-lg border text-left transition-all ${selectedPerformance === 'STAR'
              ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
              : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Produk Bintang (Star)
            </span>
            <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-bold">{starCount}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">Margin tinggi (&gt;40%) & omzet stabil</p>
        </button>

        <button
          onClick={() => setSelectedPerformance('VOLUME_DRIVER')}
          className={`p-3 rounded-lg border text-left transition-all ${selectedPerformance === 'VOLUME_DRIVER'
              ? 'border-blue-500 bg-blue-50/50 shadow-sm'
              : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-800 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              Volume Driver
            </span>
            <Badge className="bg-blue-600 hover:bg-blue-600 text-white font-bold">{volumeCount}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">Laris manis penggerak perputaran</p>
        </button>

        <button
          onClick={() => setSelectedPerformance('LOW_PERFORMER')}
          className={`p-3 rounded-lg border text-left transition-all ${selectedPerformance === 'LOW_PERFORMER'
              ? 'border-rose-500 bg-rose-50/50 shadow-sm'
              : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-800 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              Margin Tipis / Berisiko
            </span>
            <Badge className="bg-rose-600 hover:bg-rose-600 text-white font-bold">{lowCount}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">Margin &lt;15%, perlu revisi harga/HPP</p>
        </button>
      </div>

      {/* Main Table Card */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">
                Detail Profitabilitas Produk ({filteredProducts.length})
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Analisis mendalam per unit produk: HPP, harga jual, margin laba kotor, dan kontribusi omzet.
              </CardDescription>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Cari nama produk / SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-9 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="profit">Sort: Laba Kotor Terbanyak</option>
                  <option value="revenue">Sort: Omzet Terbesar</option>
                  <option value="margin">Sort: Margin % Tertinggi</option>
                  <option value="margin_asc">Sort: Margin % Terendah</option>
                  <option value="sold">Sort: Terjual Terbanyak</option>
                  <option value="stock">Sort: Stok Gudang Terbanyak</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
              <p className="text-sm">Menghitung analisis keuntungan & HPP persediaan...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-medium text-slate-800">Tidak ada produk ditemukan</h3>
              <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter performa.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Produk</th>
                    <th className="py-3 px-3 text-right">Stok</th>
                    <th className="py-3 px-3 text-right">HPP / Unit</th>
                    <th className="py-3 px-3 text-right">Harga Jual</th>
                    <th className="py-3 px-3 text-right">Laba / Unit</th>
                    <th className="py-3 px-3 text-center">Margin (%)</th>
                    <th className="py-3 px-3 text-right">Terjual</th>
                    <th className="py-3 px-3 text-right">Total Omzet</th>
                    <th className="py-3 px-3 text-right">Total Laba</th>
                    <th className="py-3 px-3 text-center">Performa</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const margin = p.marginPercent || 0;
                    return (
                      <tr key={p.productId} className="hover:bg-slate-50/60 transition-colors">
                        {/* Product Info */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3 max-w-[260px]">
                            {p.imageUrl ? (
                              <img
                                src={p.imageUrl}
                                alt={p.productName}
                                className="w-10 h-10 rounded-md object-cover border border-slate-200 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-400">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                            <div className="truncate">
                              <p className="font-semibold text-slate-900 truncate" title={p.productName}>
                                {p.productName}
                              </p>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                {p.sku && <span className="font-mono">{p.sku}</span>}
                                {p.category && (
                                  <>
                                    <span>•</span>
                                    <span>{p.category}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Stok */}
                        <td className="py-3 px-3 text-right font-medium text-slate-700">
                          {p.totalStock}
                        </td>

                        {/* HPP / Unit */}
                        <td className="py-3 px-3 text-right font-mono text-slate-600">
                          {formatIdr(p.hppPerUnit)}
                        </td>

                        {/* Harga Jual */}
                        <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                          {formatIdr(p.currentSellingPrice)}
                        </td>

                        {/* Laba / Unit */}
                        <td className="py-3 px-3 text-right font-mono text-emerald-700 font-medium">
                          {formatIdr(p.unitProfit)}
                        </td>

                        {/* Margin % */}
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full border text-[11px] ${getMarginBadgeClass(
                              margin
                            )}`}
                          >
                            {margin.toFixed(1)}%
                          </span>
                        </td>

                        {/* Terjual */}
                        <td className="py-3 px-3 text-right font-medium text-slate-800">
                          {p.unitsSold} pcs
                        </td>

                        {/* Total Omzet */}
                        <td className="py-3 px-3 text-right font-mono text-indigo-700 font-medium">
                          {formatIdr(p.revenue)}
                        </td>

                        {/* Total Laba */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                          {formatIdr(p.totalProfit)}
                        </td>

                        {/* Performa Label */}
                        <td className="py-3 px-3 text-center">
                          {getPerformanceBadge(p.performanceLabel)}
                        </td>

                        {/* Action: Kalkulasi Ulang */}
                        <td className="py-3 px-4 text-center">
                          <Link href={`/admin/pricing/calculator?productId=${p.productId}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-[11px] text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200"
                            >
                              <Calculator className="w-3 h-3 mr-1" />
                              Hitung
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Strategic Insight Box */}
      <div className="bg-linear-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80 rounded-xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-emerald-950">
              Panduan Manajemen Margin & Optimasi Harga Jual
            </h4>
            <p className="text-xs text-emerald-800 leading-relaxed">
              • <strong>Produk Bintang (Star)</strong>: Memiliki gross margin &gt; 40% dengan penjualan aktif. Jaga ketersediaan stok produk ini di gudang.<br />
              • <strong>Volume Driver</strong>: Menggerakkan perputaran modal secara cepat. Tetap pertahankan margin di atas 20% agar tidak tergerus biaya iklan.<br />
              • <strong>Margin Tipis (&lt; 15%)</strong>: Segera gunakan fitur <em>Kalkulator Harga</em> untuk mengecek komponen biaya kemasan/operasional atau sesuaikan target profit dan harga coret (strike price) promosi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

