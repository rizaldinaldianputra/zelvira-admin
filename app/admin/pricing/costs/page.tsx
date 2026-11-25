'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Package,
  Wrench,
  Megaphone,
  HelpCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { pricingService } from '@/services/pricing.service';
import { PricingCostItem, PricingCostItemRequest, PricingCategory, PricingCostType } from '@/types/pricing';

export default function MasterBiayaPage() {
  const { toast } = useToast();
  const [costItems, setCostItems] = useState<PricingCostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PricingCostItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<PricingCategory>('PACKAGING');
  const [costType, setCostType] = useState<PricingCostType>('FIXED_AMOUNT');
  const [defaultAmount, setDefaultAmount] = useState<number>(0);
  const [unit, setUnit] = useState('pcs');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const loadCostItems = async () => {
    setLoading(true);
    try {
      const data = await pricingService.getCostItems();
      setCostItems(data);
    } catch (err: any) {
      toast({
        title: 'Gagal memuat master biaya',
        description: err.message || 'Terjadi kesalahan saat memuat data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCostItems();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setCode('');
    setName('');
    setCategory('PACKAGING');
    setCostType('FIXED_AMOUNT');
    setDefaultAmount(0);
    setUnit('pcs');
    setDescription('');
    setIsActive(true);
    setShowModal(true);
  };

  const handleOpenEditModal = (item: PricingCostItem) => {
    setEditingItem(item);
    setCode(item.code);
    setName(item.name);
    setCategory(item.category);
    setCostType(item.costType);
    setDefaultAmount(item.defaultAmount);
    setUnit(item.unit || 'pcs');
    setDescription(item.description || '');
    setIsActive(item.isActive);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: 'Validasi Gagal', description: 'Nama biaya wajib diisi', variant: 'destructive' });
      return;
    }
    if (!code.trim()) {
      toast({ title: 'Validasi Gagal', description: 'Kode variabel biaya wajib diisi', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const payload: PricingCostItemRequest = {
        code: code.trim().toUpperCase().replaceAll(/\s+/g, '_'),
        name: name.trim(),
        category,
        costType,
        defaultAmount: Number(defaultAmount) || 0,
        unit: unit.trim() || 'pcs',
        description: description.trim() || undefined,
        isActive,
      };

      if (editingItem) {
        await pricingService.updateCostItem(editingItem.id, payload);
        toast({ title: 'Berhasil', description: 'Komponen biaya berhasil diperbarui' });
      } else {
        await pricingService.createCostItem(payload);
        toast({ title: 'Berhasil', description: 'Komponen biaya baru berhasil ditambahkan' });
      }
      setShowModal(false);
      loadCostItems();
    } catch (err: any) {
      toast({
        title: 'Gagal menyimpan',
        description: err.message || 'Terjadi kesalahan saat menyimpan data',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, itemName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus komponen biaya "${itemName}"?`)) return;
    try {
      await pricingService.deleteCostItem(id);
      toast({ title: 'Dihapus', description: `Komponen biaya "${itemName}" berhasil dihapus` });
      loadCostItems();
    } catch (err: any) {
      toast({
        title: 'Gagal menghapus',
        description: err.message || 'Terjadi kesalahan saat menghapus data',
        variant: 'destructive',
      });
    }
  };

  // Filtered items
  const filteredItems = costItems.filter((item) => {
    const matchCat = activeCategory === 'ALL' || item.category === activeCategory;
    const matchQuery =
      !search.trim() ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchQuery;
  });

  // Calculate Quick Stats
  const packagingTotal = costItems
    .filter((i) => i.isActive && i.category === 'PACKAGING' && i.costType === 'FIXED_AMOUNT')
    .reduce((sum, i) => sum + Number(i.defaultAmount), 0);

  const operationalTotal = costItems
    .filter((i) => i.isActive && i.category === 'OPERATIONAL' && i.costType === 'FIXED_AMOUNT')
    .reduce((sum, i) => sum + Number(i.defaultAmount), 0);

  const marketingTotal = costItems
    .filter((i) => i.isActive && i.category === 'MARKETING' && i.costType === 'FIXED_AMOUNT')
    .reduce((sum, i) => sum + Number(i.defaultAmount), 0);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'PACKAGING':
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200">
            <Package className="w-3 h-3 mr-1" /> Kemasan / Packing
          </Badge>
        );
      case 'OPERATIONAL':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200">
            <Wrench className="w-3 h-3 mr-1" /> Operasional / Handling
          </Badge>
        );
      case 'MARKETING':
        return (
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200">
            <Megaphone className="w-3 h-3 mr-1" /> Marketing / Ads
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-slate-600">
            <HelpCircle className="w-3 h-3 mr-1" /> Lainnya
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Master Biaya & Variabel Operasional
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kelola komponen biaya kemasan, handling operasional, dan alokasi promosi untuk kalkulasi HPP otomatis.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadCostItems}
            disabled={loading}
            className="rounded-xl text-xs font-bold gap-1.5 h-10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            type="button"
            onClick={handleOpenCreateModal}
            className="rounded-xl text-xs font-bold gap-1.5 h-10 bg-linear-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-600 hover:via-orange-600 hover:to-rose-700 text-white shadow-md shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" />
            Tambah Biaya Baru
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Variabel */}
        <Card className="relative overflow-hidden rounded-2xl border border-indigo-200/70 dark:border-indigo-500/20 bg-linear-to-br from-indigo-500/10 via-indigo-500/5 to-transparent dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900/60 shadow-xs hover:shadow-md transition-all duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-indigo-500 via-violet-500 to-indigo-600" />
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Total Variabel</span>
              <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/25 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{costItems.length}</p>
            <p className="text-[11px] text-indigo-600/80 dark:text-indigo-400/80 mt-0.5 font-medium">{costItems.filter((i) => i.isActive).length} komponen aktif</p>
          </CardContent>
        </Card>

        {/* Card 2: Standar Kemasan */}
        <Card className="relative overflow-hidden rounded-2xl border border-amber-200/80 dark:border-amber-500/20 bg-linear-to-br from-amber-500/15 via-orange-500/5 to-transparent dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900/60 shadow-xs hover:shadow-md transition-all duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-amber-400 via-orange-500 to-amber-600" />
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">Standar Kemasan</span>
              <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-amber-950 dark:text-amber-100 mt-2">
              Rp {packagingTotal.toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5 font-medium">Akumulasi biaya kemasan default</p>
          </CardContent>
        </Card>

        {/* Card 3: Handling & QC */}
        <Card className="relative overflow-hidden rounded-2xl border border-cyan-200/80 dark:border-cyan-500/20 bg-linear-to-br from-cyan-500/15 via-blue-500/5 to-transparent dark:from-cyan-950/40 dark:via-slate-900 dark:to-slate-900/60 shadow-xs hover:shadow-md transition-all duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-cyan-400 via-blue-500 to-cyan-600" />
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-cyan-700 dark:text-cyan-300 uppercase tracking-wider">Handling & QC</span>
              <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-blue-500/25 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-cyan-950 dark:text-cyan-100 mt-2">
              Rp {operationalTotal.toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-cyan-700/80 dark:text-cyan-400/80 mt-0.5 font-medium">Ongkos packing & steam uap</p>
          </CardContent>
        </Card>

        {/* Card 4: Alokasi Iklan/Ads */}
        <Card className="relative overflow-hidden rounded-2xl border border-pink-200/80 dark:border-pink-500/20 bg-linear-to-br from-pink-500/15 via-purple-500/5 to-transparent dark:from-pink-950/40 dark:via-slate-900 dark:to-slate-900/60 shadow-xs hover:shadow-md transition-all duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-pink-500 via-rose-500 to-purple-600" />
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-pink-700 dark:text-pink-300 uppercase tracking-wider">Alokasi Iklan/Ads</span>
              <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-pink-500 via-rose-500 to-purple-600 text-white shadow-md shadow-pink-500/25 flex items-center justify-center">
                <Megaphone className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-pink-950 dark:text-pink-100 mt-2">
              Rp {marketingTotal.toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-pink-700/80 dark:text-pink-400/80 mt-0.5 font-medium">Budget ads per unit terjual</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-slate-200 dark:border-white/10 shadow-sm rounded-2xl">
        <CardHeader className="p-4 sm:p-6 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Daftar Variabel Biaya</CardTitle>
              <CardDescription className="text-xs">
                Variabel dengan kode unik ini dapat dipanggil langsung dalam rumus kalkulasi harga dinamis.
              </CardDescription>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'ALL', label: 'Semua' },
                { id: 'PACKAGING', label: 'Kemasan' },
                { id: 'OPERATIONAL', label: 'Operasional' },
                { id: 'MARKETING', label: 'Marketing' },
                { id: 'OTHER', label: 'Lainnya' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeCategory === c.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="pt-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Cari berdasarkan nama biaya, kode variabel (contoh: PLASTIK), atau deskripsi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-xl text-xs h-10 border-slate-200 dark:border-white/10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
              <p className="text-xs font-medium">Memuat master biaya...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Receipt className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Tidak ada komponen biaya yang cocok</p>
              <p className="text-xs text-slate-400 mt-1">Coba sesuaikan pencarian atau tambahkan biaya baru</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-900/50 border-y border-slate-100 dark:border-white/5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 sm:px-6">Kode Variabel</th>
                    <th className="py-3 px-4">Nama Komponen Biaya</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4 text-right">Nilai Default</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 sm:px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-slate-900 dark:text-white">
                        <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-[11px]">
                          {item.code}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800 dark:text-slate-100">{item.name}</p>
                        {item.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{item.description}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">{getCategoryBadge(item.category)}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                        {item.costType === 'PERCENTAGE' ? (
                          <span className="text-purple-600 font-mono text-sm">{item.defaultAmount}%</span>
                        ) : (
                          <span>
                            <span className="text-slate-400 font-normal mr-1">Rp</span>
                            {Number(item.defaultAmount).toLocaleString('id-ID')}
                            <span className="text-[10px] text-slate-400 font-normal ml-1">/{item.unit}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {item.isActive ? (
                          <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 text-[10px]">
                            Aktif
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-400 text-[10px]">
                            Non-aktif
                          </Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditModal(item)}
                            className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit Biaya"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id, item.name)}
                            className="h-8 w-8 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            title="Hapus Biaya"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Dialog Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center text-orange-600">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {editingItem ? 'Edit Komponen Biaya' : 'Tambah Komponen Biaya Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Variabel biaya untuk kalkulasi HPP dan harga jual</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowModal(false)}
                className="h-8 w-8 rounded-full"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Kode Variabel (Unik)</Label>
                  <Input
                    type="text"
                    required
                    disabled={!!editingItem}
                    placeholder="Contoh: PLASTIK_ZIPPER"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replaceAll(/\s+/g, '_'))}
                    className="font-mono text-xs rounded-xl h-10 border-slate-200 dark:border-white/10"
                  />
                  <p className="text-[10px] text-slate-400">Huruf besar tanpa spasi (dipakai di formula rumus)</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Kategori</Label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PricingCategory)}
                    className="w-full text-xs rounded-xl h-10 border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 font-medium text-slate-800 dark:text-slate-200"
                  >
                    <option value="PACKAGING">Kemasan / Packaging</option>
                    <option value="OPERATIONAL">Operasional / Handling</option>
                    <option value="MARKETING">Marketing / Promosi</option>
                    <option value="OTHER">Lain-lain</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nama Biaya</Label>
                <Input
                  type="text"
                  required
                  placeholder="Contoh: Plastik Zipper Pouch 25x35"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs rounded-xl h-10 border-slate-200 dark:border-white/10"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5 col-span-1">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tipe Nilai</Label>
                  <select
                    value={costType}
                    onChange={(e) => setCostType(e.target.value as PricingCostType)}
                    className="w-full text-xs rounded-xl h-10 border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 font-medium text-slate-800 dark:text-slate-200"
                  >
                    <option value="FIXED_AMOUNT">Nominal Rp</option>
                    <option value="PERCENTAGE">Persentase (%)</option>
                  </select>
                </div>

                <div className="space-y-1.5 col-span-1">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {costType === 'PERCENTAGE' ? 'Nilai (%)' : 'Nominal (Rp)'}
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    required
                    placeholder="0"
                    value={defaultAmount}
                    onChange={(e) => setDefaultAmount(parseFloat(e.target.value) || 0)}
                    className="text-xs rounded-xl h-10 font-bold border-slate-200 dark:border-white/10 font-mono"
                  />
                </div>

                <div className="space-y-1.5 col-span-1">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Satuan</Label>
                  <Input
                    type="text"
                    placeholder="pcs / lembar"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="text-xs rounded-xl h-10 border-slate-200 dark:border-white/10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Keterangan / Catatan</Label>
                <textarea
                  rows={2}
                  placeholder="Keterangan kegunaan biaya ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs rounded-xl p-3 border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4"
                />
                <Label htmlFor="isActive" className="text-xs font-medium cursor-pointer text-slate-700 dark:text-slate-300">
                  Aktifkan komponen biaya ini untuk digunakan pada kalkulasi harga
                </Label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl text-xs font-bold h-10"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl text-xs font-bold h-10 bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900"
                >
                  {submitting ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Tambah Biaya'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

