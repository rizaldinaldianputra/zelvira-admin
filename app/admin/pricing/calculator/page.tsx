'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Calculator,
  Search,
  Package,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Percent,
  Sliders,
  ChevronRight,
  Check,
  Tag,
  DollarSign,
  ShieldCheck,
  Store,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { pricingService } from '@/services/pricing.service';
import {
  ProductPricing,
  VariantPricingDto,
  PricingCostItem,
  PricingFormula,
  PriceCalculationResponse,
  PricingRoundingRule
} from '@/types/pricing';

function KalkulasiHargaContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();

  // Data States
  const [products, setProducts] = useState<ProductPricing[]>([]);
  const [costItems, setCostItems] = useState<PricingCostItem[]>([]);
  const [formulas, setFormulas] = useState<PricingFormula[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected for Calculation
  const [selectedProduct, setSelectedProduct] = useState<ProductPricing | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<VariantPricingDto | null>(null);

  // Calculation Parameters
  const [selectedFormulaId, setSelectedFormulaId] = useState<number | undefined>(undefined);
  const [baseModal, setBaseModal] = useState<number>(0);
  const [profitPercent, setProfitPercent] = useState<number>(30);
  const [profitNominal, setProfitNominal] = useState<number>(0);
  const [adminFeePercent, setAdminFeePercent] = useState<number>(7.5);
  const [bufferDiskonPercent, setBufferDiskonPercent] = useState<number>(20);
  const [roundingRule, setRoundingRule] = useState<PricingRoundingRule>('ROUND_UP_1000');

  // Active Cost Items Map: code -> amount (or 0 if unchecked)
  const [activeCostMap, setActiveCostMap] = useState<Record<string, number>>({});
  const [checkedCosts, setCheckedCosts] = useState<Record<string, boolean>>({});

  // Realtime Result
  const [calcResult, setCalcResult] = useState<PriceCalculationResponse | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyToAllVariants, setApplyToAllVariants] = useState(true);

  // Load initial data
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [prods, costs, forms] = await Promise.all([
        pricingService.getProductPricingList(),
        pricingService.getCostItems(),
        pricingService.getFormulas(),
      ]);

      setProducts(prods);
      setCostItems(costs);
      setFormulas(forms);

      // Initialize default formula
      const defaultForm = forms.find((f) => f.isDefault) || forms[0];
      if (defaultForm) {
        setSelectedFormulaId(defaultForm.id);
        setProfitPercent(defaultForm.defaultProfitPercent);
        setProfitNominal(defaultForm.defaultProfitNominal || 0);
        setAdminFeePercent(defaultForm.defaultAdminFeePercent);
        setBufferDiskonPercent(defaultForm.defaultBufferDiskonPercent);
        setRoundingRule(defaultForm.roundingRule);
      }

      // Initialize active cost map from default active items
      const map: Record<string, number> = {};
      const checks: Record<string, boolean> = {};
      costs.forEach((c) => {
        if (c.isActive) {
          map[c.code] = c.defaultAmount;
          checks[c.code] = true;
        }
      });
      setActiveCostMap(map);
      setCheckedCosts(checks);

      // Select product from URL query if present, otherwise select first product
      const urlProductId = searchParams.get('productId');
      if (urlProductId) {
        const found = prods.find((p) => p.id === Number(urlProductId));
        if (found) {
          selectProductForCalc(found);
        } else if (prods.length > 0) {
          selectProductForCalc(prods[0]);
        }
      } else if (prods.length > 0) {
        selectProductForCalc(prods[0]);
      }
    } catch (err: any) {
      toast({
        title: 'Gagal memuat data',
        description: err.message || 'Terjadi kesalahan saat memuat data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const selectProductForCalc = (prod: ProductPricing) => {
    setSelectedProduct(prod);
    const firstVar = prod.variants && prod.variants.length > 0 ? prod.variants[0] : null;
    setSelectedVariant(firstVar);

    const initialModal = firstVar?.currentCostPrice || prod.currentCostPrice || 0;
    setBaseModal(Number(initialModal));
  };

  // Trigger calculation whenever parameters change
  useEffect(() => {
    if (!selectedProduct) return;

    const timeout = setTimeout(async () => {
      setCalculating(true);
      try {
        // Collect only checked cost overrides
        const costOverrides: Record<string, number> = {};
        costItems.forEach((c) => {
          if (checkedCosts[c.code]) {
            costOverrides[c.code] = activeCostMap[c.code] !== undefined ? activeCostMap[c.code] : c.defaultAmount;
          } else {
            costOverrides[c.code] = 0; // disabled for this calculation
          }
        });

        const res = await pricingService.calculatePrice({
          productId: selectedProduct.id,
          variantId: selectedVariant?.id,
          formulaId: selectedFormulaId,
          baseModal: Number(baseModal) || 0,
          profitPercent: Number(profitPercent) || 0,
          profitNominal: Number(profitNominal) || 0,
          adminFeePercent: Number(adminFeePercent) || 0,
          bufferDiskonPercent: Number(bufferDiskonPercent) || 0,
          roundingRule,
          costOverrides,
        });

        setCalcResult(res);
      } catch (err: any) {
        console.error('Calculation error', err);
      } finally {
        setCalculating(false);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [
    selectedProduct,
    selectedVariant,
    selectedFormulaId,
    baseModal,
    profitPercent,
    profitNominal,
    adminFeePercent,
    bufferDiskonPercent,
    roundingRule,
    checkedCosts,
    activeCostMap,
  ]);

  const handleApplyToShop = async () => {
    if (!selectedProduct || !calcResult) return;

    setApplying(true);
    try {
      await pricingService.applyPrice({
        productId: selectedProduct.id,
        variantId: applyToAllVariants ? undefined : selectedVariant?.id,
        sellingPrice: calcResult.roundedPrice,
        discountPrice: calcResult.strikePrice,
        costPrice: calcResult.totalHpp,
      });

      toast({
        title: 'Harga Berhasil Diterapkan ke Toko!',
        description: `Harga jual Rp ${calcResult.roundedPrice.toLocaleString('id-ID')} dan HPP Rp ${calcResult.totalHpp.toLocaleString('id-ID')} telah disimpan ke katalog produk.`,
      });

      // Reload products to reflect updated prices
      const prods = await pricingService.getProductPricingList(search);
      setProducts(prods);

      const updated = prods.find((p) => p.id === selectedProduct.id);
      if (updated) {
        setSelectedProduct(updated);
        if (selectedVariant) {
          const uv = updated.variants.find((v) => v.id === selectedVariant.id);
          if (uv) setSelectedVariant(uv);
        }
      }
    } catch (err: any) {
      toast({
        title: 'Gagal menerapkan harga',
        description: err.message || 'Terjadi kesalahan',
        variant: 'destructive',
      });
    } finally {
      setApplying(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Kalkulasi Harga & HPP Produk
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Hitung HPP presisi dari biaya kemasan, handling operasional, dan admin channel untuk menentukan harga jual aman.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadInitialData}
            disabled={loading}
            className="rounded-xl text-xs font-bold gap-1.5 h-10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Muat Ulang Produk
          </Button>
        </div>
      </div>

      {/* Grid Layout: Left Product Picker, Right Interactive Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Master Produk Existing (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="rounded-2xl border-slate-200 dark:border-white/10 shadow-xs">
            <CardHeader className="p-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-500" />
                    Pilih Produk Toko (Master Produk)
                  </CardTitle>
                  <CardDescription className="text-[11px]">
                    Gunakan produk katalog existing untuk disimulasikan HPP dan harga jualnya.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-mono font-bold">
                  {filteredProducts.length} Produk
                </Badge>
              </div>

              {/* Search */}
              <div className="pt-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="Cari nama produk atau SKU..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 text-xs rounded-xl h-9 border-slate-200 dark:border-white/10"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 max-h-[600px] overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                <div className="py-12 text-center text-slate-400 text-xs">Memuat katalog master produk...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">Produk tidak ditemukan</div>
              ) : (
                filteredProducts.map((prod) => {
                  const isSelected = selectedProduct?.id === prod.id;
                  return (
                    <div
                      key={prod.id}
                      onClick={() => selectProductForCalc(prod)}
                      className={`p-3.5 transition-all cursor-pointer flex items-center justify-between gap-3 ${isSelected
                          ? 'bg-blue-50/80 dark:bg-blue-950/30 border-l-4 border-blue-600'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200 dark:border-white/10">
                          {prod.imageUrl ? (
                            <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-slate-400" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-blue-900 dark:text-blue-200' : 'text-slate-800 dark:text-slate-200'}`}>
                            {prod.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                            <span>SKU: {prod.sku || '-'}</span>
                            <span>•</span>
                            <span>{prod.categoryName}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              Rp {prod.currentMinPrice?.toLocaleString('id-ID')}
                            </span>
                            {prod.currentCostPrice > 0 && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                (Modal: Rp {prod.currentCostPrice.toLocaleString('id-ID')})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center">
                        <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-300'}`} />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Interactive Calculator & Live Simulator (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedProduct ? (
            <>
              {/* Product Info Header Card */}
              <Card className="rounded-2xl border-slate-200 dark:border-white/10 shadow-xs bg-linear-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-600 text-[10px]">Produk Aktif</Badge>
                      <span className="text-xs font-mono text-slate-400">ID #{selectedProduct.id}</span>
                    </div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white mt-1">
                      {selectedProduct.name}
                    </h2>
                  </div>

                  {/* Varian Picker if multiple variants exist */}
                  {selectedProduct.variants && selectedProduct.variants.length > 1 && (
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 shrink-0">Varian:</Label>
                      <select
                        value={selectedVariant?.id || ''}
                        onChange={(e) => {
                          const v = selectedProduct.variants.find((item) => item.id === Number(e.target.value));
                          if (v) {
                            setSelectedVariant(v);
                            if (v.currentCostPrice && v.currentCostPrice > 0) setBaseModal(Number(v.currentCostPrice));
                          }
                        }}
                        className="text-xs rounded-xl h-9 border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 font-bold"
                      >
                        {selectedProduct.variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.sku} - {v.size ? `Size ${v.size}` : ''} {v.color ? `Color ${v.color}` : ''} (Stok: {v.stock})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </Card>

              {/* Calculator Panel */}
              <Card className="rounded-2xl border-slate-200 dark:border-white/10 shadow-sm">
                <CardHeader className="p-4 sm:p-5 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-orange-500" />
                      Parameter Biaya & Strategi Harga
                    </CardTitle>

                    {/* Formula Selector */}
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-bold text-slate-500">Formula:</Label>
                      <select
                        value={selectedFormulaId || ''}
                        onChange={(e) => {
                          const fid = Number(e.target.value);
                          setSelectedFormulaId(fid);
                          const f = formulas.find((item) => item.id === fid);
                          if (f) {
                            setProfitPercent(f.defaultProfitPercent);
                            setProfitNominal(f.defaultProfitNominal || 0);
                            setAdminFeePercent(f.defaultAdminFeePercent);
                            setBufferDiskonPercent(f.defaultBufferDiskonPercent);
                            setRoundingRule(f.roundingRule);
                          }
                        }}
                        className="text-xs rounded-xl h-8 border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-2.5 font-bold text-blue-600 dark:text-blue-400"
                      >
                        {formulas.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name} {f.isDefault ? '(Default)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-5 pt-0 space-y-4">
                  {/* Row 1: Modal Dasar */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <Label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        1. Modal Pokok Produk (Bahan / Jahit / Beli)
                      </Label>
                      <p className="text-[11px] text-slate-400 mt-0.5">Biaya dasar pokok produk dari konveksi atau supplier</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">Rp</span>
                      <Input
                        type="number"
                        step="any"
                        value={baseModal}
                        onChange={(e) => setBaseModal(parseFloat(e.target.value) || 0)}
                        className="w-36 rounded-xl text-right font-mono font-bold text-sm h-10 border-slate-300 dark:border-white/20 bg-white dark:bg-slate-950"
                      />
                    </div>
                  </div>

                  {/* Row 2: Komponen Biaya Kemasan & Operasional (Checklist with amounts) */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>2. Komponen Kemasan, Handling & Alokasi Iklan</span>
                      <span className="text-[11px] font-normal text-slate-400">Centang komponen yang digunakan produk ini</span>
                    </Label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto p-1 border rounded-xl border-slate-100 dark:border-white/5">
                      {costItems.map((item) => {
                        const isChecked = !!checkedCosts[item.code];
                        const amount = activeCostMap[item.code] !== undefined ? activeCostMap[item.code] : item.defaultAmount;

                        return (
                          <div
                            key={item.id}
                            className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${isChecked
                                ? 'bg-white dark:bg-slate-900 border-slate-300 dark:border-white/20 shadow-xs'
                                : 'bg-slate-50/50 dark:bg-slate-950/30 border-transparent opacity-60'
                              }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  setCheckedCosts((prev) => ({ ...prev, [item.code]: e.target.checked }));
                                }}
                                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-200">{item.name}</p>
                                <span className="text-[10px] text-slate-400 font-mono">{item.code}</span>
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center gap-1">
                              <span className="text-[10px] text-slate-400">Rp</span>
                              <input
                                type="number"
                                disabled={!isChecked}
                                value={amount}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setActiveCostMap((prev) => ({ ...prev, [item.code]: val }));
                                }}
                                className="w-20 rounded-lg text-right font-mono font-bold text-xs h-7 px-1.5 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 disabled:opacity-50"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Row 3: Target Margin, Admin Fee, Diskon Buffer */}
                  <div className="grid grid-cols-3 gap-3 pt-1">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Profit (%)</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="any"
                          value={profitPercent}
                          onChange={(e) => setProfitPercent(parseFloat(e.target.value) || 0)}
                          className="rounded-xl text-xs font-mono font-bold h-9 pr-6"
                        />
                        <span className="text-xs text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2">%</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Fee Admin Channel</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="any"
                          value={adminFeePercent}
                          onChange={(e) => setAdminFeePercent(parseFloat(e.target.value) || 0)}
                          className="rounded-xl text-xs font-mono font-bold h-9 pr-6"
                        />
                        <span className="text-xs text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2">%</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Markup Diskon Coret</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="any"
                          value={bufferDiskonPercent}
                          onChange={(e) => setBufferDiskonPercent(parseFloat(e.target.value) || 0)}
                          className="rounded-xl text-xs font-mono font-bold h-9 pr-6"
                        />
                        <span className="text-xs text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Rounding Rule */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="font-bold text-slate-600 dark:text-slate-400">Aturan Pembulatan:</span>
                    <select
                      value={roundingRule}
                      onChange={(e) => setRoundingRule(e.target.value as PricingRoundingRule)}
                      className="text-xs rounded-xl h-8 border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 font-medium text-slate-800 dark:text-slate-200"
                    >
                      <option value="ROUND_UP_1000">Bulatkan ke Atas Ribuan (e.g. Rp 88.000)</option>
                      <option value="CHARM_900">Charm Pricing Akhiran 900 (e.g. Rp 89.900)</option>
                      <option value="CHARM_999">Charm Pricing Akhiran 999 (e.g. Rp 89.999)</option>
                      <option value="ROUND_UP_500">Bulatkan ke Atas 500 (e.g. Rp 87.500)</option>
                      <option value="ROUND_UP_100">Bulatkan ke Atas 100 (e.g. Rp 87.300)</option>
                      <option value="NONE">Tanpa Pembulatan</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Realtime Calculation Result Card */}
              {calcResult && (
                <Card className="rounded-3xl border-2 border-emerald-500/60 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 dark:from-emerald-950/20 dark:via-slate-900 dark:to-teal-950/20 shadow-lg overflow-hidden animate-in fade-in duration-300">
                  <div className="p-5 sm:p-6 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-900/40">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                          ✓
                        </div>
                        <div>
                          <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                            Hasil Rekomendasi Harga Jual Otomatis
                          </h3>
                          <p className="text-[11px] text-slate-500">Dihitung otomatis berdasarkan formula dinamis SpEL</p>
                        </div>
                      </div>

                      {calculating && <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />}
                    </div>

                    {/* Breakdown 4 Key Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 shadow-xs">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total HPP Riil</span>
                        <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                          Rp {calcResult.totalHpp.toLocaleString('id-ID')}
                        </p>
                        <span className="text-[9px] text-slate-400">Modal + Pack + Ops</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 shadow-xs">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Batas Min (BEP)</span>
                        <p className="text-base sm:text-lg font-black text-orange-600 dark:text-orange-400 mt-0.5">
                          Rp {calcResult.minSellingPrice.toLocaleString('id-ID')}
                        </p>
                        <span className="text-[9px] text-slate-400">Harga impas pasca fee</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 col-span-2 sm:col-span-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">Harga Jual Toko</span>
                        <p className="text-lg sm:text-xl font-black mt-0.5">
                          Rp {calcResult.roundedPrice.toLocaleString('id-ID')}
                        </p>
                        <span className="text-[9px] opacity-80">Rekomendasi Aktif</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 shadow-xs">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Harga Coret (Promo)</span>
                        <p className="text-base sm:text-lg font-black text-purple-600 dark:text-purple-400 line-through mt-0.5">
                          Rp {calcResult.strikePrice.toLocaleString('id-ID')}
                        </p>
                        <span className="text-[9px] text-slate-400">Buffer Diskon Coret</span>
                      </div>
                    </div>

                    {/* Net Margin Box */}
                    <div className="p-3.5 rounded-2xl bg-emerald-100/50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <span className="font-bold text-emerald-900 dark:text-emerald-200">
                            Estimasi Laba Bersih per Pcs:
                          </span>
                          <span className="ml-2 font-black font-mono text-emerald-700 dark:text-emerald-300 text-sm">
                            Rp {calcResult.profitNominal.toLocaleString('id-ID')} ({calcResult.marginPercent}%)
                          </span>
                        </div>
                      </div>

                      <span className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                        Potongan Fee Admin Channel: Rp {calcResult.estimatedAdminFeeNominal.toLocaleString('id-ID')} ({adminFeePercent}%)
                      </span>
                    </div>

                    {/* Action Bar: Apply to Shop */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="applyAll"
                          checked={applyToAllVariants}
                          onChange={(e) => setApplyToAllVariants(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                        <Label htmlFor="applyAll" className="text-xs cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                          Terapkan sekaligus ke seluruh varian produk ini
                        </Label>
                      </div>

                      <Button
                        type="button"
                        onClick={handleApplyToShop}
                        disabled={applying}
                        className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-11 px-6 shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                      >
                        {applying ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Menerapkan ke Toko...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> Terapkan ke Katalog Toko Sekarang
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </>
          ) : (
            <div className="py-24 text-center text-slate-400 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 p-8">
              <Package className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Pilih Produk dari Daftar di Sebelah Kiri</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Pilih produk master katalog yang ingin Anda hitung HPP, margin profit, dan harga jual rekomendasinya.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KalkulasiHargaPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
          <p className="text-sm">Memuat kalkulator harga...</p>
        </div>
      }
    >
      <KalkulasiHargaContent />
    </Suspense>
  );
}
