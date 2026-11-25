'use client';

import React from 'react';
import { 
  AreaChart, Area, 
  BarChart, Bar, 
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  DailyRevenuePoint, 
  CategorySalesPoint, 
  ChannelPerformancePoint, 
  WeeklyPerformanceData 
} from '@/services/dashboard.service';

const COLORS = ['#ec4899', '#f43f5e', '#fb7185', '#e11d48', '#be123c', '#9f1239'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-white/20 p-3 rounded-xl shadow-xl text-xs">
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1.5">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-600 dark:text-slate-400">{entry.name}:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {typeof entry.value === 'number'
                ? `Rp ${entry.value.toLocaleString('id-ID')}`
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function SalesOverviewChart({ data }: { data?: DailyRevenuePoint[] }) {
  const chartData = data && data.length > 0 ? data : [
    { name: 'Min', revenue: 0, profit: 0 },
    { name: 'Sen', revenue: 0, profit: 0 },
    { name: 'Sel', revenue: 0, profit: 0 },
    { name: 'Rab', revenue: 0, profit: 0 },
    { name: 'Kam', revenue: 0, profit: 0 },
    { name: 'Jum', revenue: 0, profit: 0 },
    { name: 'Sab', revenue: 0, profit: 0 },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="revenue" name="Pendapatan" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
        <Area type="monotone" dataKey="profit" name="Estimasi Profit" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CategoryDistributionChart({ data }: { data?: CategorySalesPoint[] }) {
  const chartData = data && data.length > 0 ? data : [
    { name: 'Koleksi Zelvira', value: 1 }
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={100}
          paddingAngle={4}
          dataKey="value"
          nameKey="name"
          stroke="none"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="bottom" height={36} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function PerformanceChart({ data }: { data?: ChannelPerformancePoint[] }) {
  const chartData = data && data.length > 0 ? data : [
    { name: 'Minggu 1', organic: 0, paid: 0, social: 0 },
    { name: 'Minggu 2', organic: 0, paid: 0, social: 0 },
    { name: 'Minggu 3', organic: 0, paid: 0, social: 0 },
    { name: 'Minggu 4', organic: 0, paid: 0, social: 0 },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="organic" name="Web Storefront" stackId="a" fill="#ec4899" radius={[0, 0, 4, 4]} barSize={22} />
        <Bar dataKey="paid" name="Mobile App" stackId="a" fill="#f43f5e" />
        <Bar dataKey="social" name="Marketplace (TikTok/Shopee)" stackId="a" fill="#db2777" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function WeeklyActivityChart({ data }: { data?: WeeklyPerformanceData }) {
  const targetFormatted = data?.formattedTarget || 'Rp 5.000.000';
  const currentFormatted = data?.formattedCurrent || 'Rp 0';
  const percentage = data?.percentage ?? 0;

  // Circumference calculation for radius = 56
  const radius = 56;
  const circumference = 2 * Math.PI * radius; // ~351.86
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col h-full bg-linear-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 rounded-2xl p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl" />
      
      <div className="flex-1 flex items-center justify-center relative z-10 py-2">
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-slate-800" />
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="text-pink-500 transition-all duration-700 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">{percentage}%</span>
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-3">Target Mingguan Berjalan</p>
        </div>
      </div>
      
      <div className="mt-auto grid grid-cols-2 gap-3 relative z-10">
        <div className="bg-white/70 dark:bg-black/50 backdrop-blur-sm rounded-xl p-2.5 text-center border border-white/50 dark:border-white/10 shadow-sm">
          <p className="text-[11px] text-slate-500">Target</p>
          <p className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-0.5">{targetFormatted}</p>
        </div>
        <div className="bg-white/70 dark:bg-black/50 backdrop-blur-sm rounded-xl p-2.5 text-center border border-white/50 dark:border-white/10 shadow-sm">
          <p className="text-[11px] text-slate-500">Tercapai</p>
          <p className="font-bold text-xs text-pink-600 dark:text-pink-400 mt-0.5">{currentFormatted}</p>
        </div>
      </div>
    </div>
  );
}
