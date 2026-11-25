'use client';

import React, { useEffect, useState } from 'react';
import { 
  SalesOverviewChart, 
  CategoryDistributionChart, 
  PerformanceChart, 
  WeeklyActivityChart 
} from '@/components/admin/DashboardCharts';
import { DashboardIntegrations } from '@/components/admin/DashboardIntegrations';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  LayoutDashboard,
  RefreshCw,
  Clock,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardService, DashboardOverviewData } from '@/services/dashboard.service';

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const res = await DashboardService.getOverview();
      setData(res);
    } catch (err) {
      console.error('Failed to fetch dashboard overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const stats = [
    {
      name: 'Total Pendapatan',
      value: data ? data.formattedTotalRevenue : 'Rp 0',
      change: data ? `${data.revenueGrowth >= 0 ? '+' : ''}${data.revenueGrowth}%` : '0%',
      trend: data ? data.revenueGrowthTrend : 'up',
      icon: DollarSign,
      color: 'from-pink-400 to-pink-600',
      lightColor: 'bg-pink-50 text-pink-600 dark:bg-pink-500/10'
    },
    {
      name: 'Total Pesanan',
      value: data ? data.totalOrders.toLocaleString('id-ID') : '0',
      change: data ? `${data.ordersGrowth >= 0 ? '+' : ''}${data.ordersGrowth}%` : '0%',
      trend: data ? data.ordersGrowthTrend : 'up',
      icon: ShoppingCart,
      color: 'from-rose-400 to-rose-600',
      lightColor: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'
    },
    {
      name: 'Pelanggan Aktif',
      value: data ? data.activeCustomers.toLocaleString('id-ID') : '0',
      change: data ? `${data.customersGrowth >= 0 ? '+' : ''}${data.customersGrowth}%` : '0%',
      trend: data ? data.customersGrowthTrend : 'up',
      icon: Users,
      color: 'from-blue-400 to-blue-600',
      lightColor: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10'
    },
    {
      name: 'Tingkat Konversi',
      value: data ? `${data.conversionRate}%` : '0%',
      change: data ? `${data.conversionRateGrowth >= 0 ? '+' : ''}${data.conversionRateGrowth}%` : '0%',
      trend: data ? data.conversionRateTrend : 'up',
      icon: TrendingUp,
      color: 'from-amber-400 to-amber-600',
      lightColor: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">Dashboard Overview</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Ringkasan performa penjualan harian, tren pendapatan, dan aktivitas toko.</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchOverview}
          disabled={isLoading}
          className="rounded-xl border-slate-200 dark:border-white/10 text-xs font-semibold"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
          Segarkan Data
        </Button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-black/40 group hover:shadow-md transition-all">
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-linear-to-br ${stat.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.name}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {isLoading ? (
                    <span className="inline-block h-7 w-24 bg-slate-200 dark:bg-zinc-800 animate-pulse rounded-lg" />
                  ) : (
                    stat.value
                  )}
                </h3>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.lightColor}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${stat.trend === 'up' ? 'text-pink-700 bg-pink-100/50 dark:text-pink-400 dark:bg-pink-900/30' : 'text-rose-700 bg-rose-100/50 dark:text-rose-400 dark:bg-rose-900/30'}`}>
                {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {stat.change}
              </span>
              <span className="text-xs text-slate-500">vs 30 hari sebelumnya</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-white/40 bg-white/60 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tren Penjualan 7 Hari Terakhir</h3>
            <p className="text-xs text-slate-500">Ringkasan pendapatan harian dan estimasi keuntungan bersih</p>
          </div>
          <div className="h-75 w-full">
            <SalesOverviewChart data={data?.revenueTrend} />
          </div>
        </div>
        
        <div className="rounded-2xl border border-white/40 bg-white/60 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Kategori Terlaris</h3>
            <p className="text-xs text-slate-500">Distribusi produk yang terjual berdasarkan kategori</p>
          </div>
          <div className="h-75 w-full">
            <CategoryDistributionChart data={data?.categoryDistribution} />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-white/40 bg-white/60 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pencapaian Target Mingguan</h3>
            <p className="text-xs text-slate-500">Progress target pendapatan toko minggu ini</p>
          </div>
          <div className="h-75 w-full">
            <WeeklyActivityChart data={data?.weeklyPerformance} />
          </div>
        </div>
        
        <div className="lg:col-span-2 rounded-2xl border border-white/40 bg-white/60 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Kinerja Saluran Penjualan</h3>
            <p className="text-xs text-slate-500">Perbandingan transaksi dari Web Storefront, Mobile App, dan Marketplace</p>
          </div>
          <div className="h-75 w-full">
            <PerformanceChart data={data?.acquisitionChannels} />
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      {data?.recentOrders && data.recentOrders.length > 0 && (
        <div className="rounded-2xl border border-white/40 bg-white/60 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Aktivitas Pesanan Terbaru</h3>
              <p className="text-xs text-slate-500">Daftar transaksi pesanan masuk secara real-time</p>
            </div>
            <Badge variant="outline" className="text-xs">
              {data.recentOrders.length} Pesanan Terkini
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="pb-3 font-semibold">No. Pesanan</th>
                  <th className="pb-3 font-semibold">Pelanggan</th>
                  <th className="pb-3 font-semibold">Waktu Transaksi</th>
                  <th className="pb-3 font-semibold">Total Pembayaran</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {data.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 font-bold text-slate-900 dark:text-slate-100">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300 font-medium">
                      {order.customerName}
                    </td>
                    <td className="py-3 text-slate-500 flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {order.createdAt}
                    </td>
                    <td className="py-3 font-bold text-pink-600 dark:text-pink-400">
                      Rp {order.totalAmount.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3">
                      <Badge
                        className={
                          order.status === 'COMPLETED' || order.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400'
                            : order.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400'
                            : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-slate-300'
                        }
                      >
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Connected Integrations & Channels Section */}
      <DashboardIntegrations />
    </div>
  );
}
