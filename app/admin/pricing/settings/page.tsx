'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sliders,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Play,
  RotateCcw,
  Check,
  Code2,
  Layers,
  ArrowRight,
  TrendingUp,
  Percent,
  Calculator,
  ShieldCheck,
  AlertCircle,
  Info,
  CheckCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { pricingService } from '@/services/pricing.service';
import {
  PricingFormula,
  PricingFormulaRequest,
  PricingRoundingRule,
  PriceCalculationResponse,
  PricingCostItem
} from '@/types/pricing';

export default function PengaturanHargaPage() {
  const { toast } = useToast();

  // Data States
  const [formulas, setFormulas] = useState<PricingFormula[]>([]);
  const [costItems, setCostItems] = useState<PricingCostItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Add / Edit Formula
  const [showModal, setShowModal] = useState(false);
  const [editingFormula, setEditingFormula] = useState<PricingFormula | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [hppExpression, setHppExpression] = useState('MODAL + BIAYA_PACKING + BIAYA_OPERASIONAL + BIAYA_IKLAN');
  const [minPriceExpression, setMinPriceExpression] = useState('HPP / (1.0 - (ADMIN_FEE_PERCENT / 100.0))');
  const [sellingPriceExpression, setSellingPriceExpression] = useState(
    '(HPP + PROFIT_NOMINAL) / (1.0 - (ADMIN_FEE_PERCENT / 100.0) - (PROFIT_PERCENT / 100.0))'
  );
  const [strikePriceExpression, setStrikePriceExpression] = useState(
    'SELLING_PRICE * (1.0 + (BUFFER_DISKON_PERCENT / 100.0))'
  );
  const [roundingRule, setRoundingRule] = useState<PricingRoundingRule>('ROUND_UP_1000');
  const [defaultProfitPercent, setDefaultProfitPercent] = useState<number>(30);
  const [defaultProfitNominal, setDefaultProfitNominal] = useState<number>(0);
  const [defaultAdminFeePercent, setDefaultAdminFeePercent] = useState<number>(7.5);
  const [defaultBufferDiskonPercent, setDefaultBufferDiskonPercent] = useState<number>(20);
  const [isDefault, setIsDefault] = useState(false);

  // Active target expression input for chip insertion
  const [focusedField, setFocusedField] = useState<'hpp' | 'min' | 'selling' | 'strike'>('selling');

  // Simulator / Sandbox State
  const [testModal, setTestModal] = useState<number>(50000);
  const [testProfitPercent, setTestProfitPercent] = useState<number>(30);
  const [testProfitNominal, setTestProfitNominal] = useState<number>(0);
  const [testAdminFeePercent, setTestAdminFeePercent] = useState<number>(7.5);
  const [testBufferDiskonPercent, setTestBufferDiskonPercent] = useState<number>(20);
  const [testRoundingRule, setTestRoundingRule] = useState<PricingRoundingRule>('ROUND_UP_1000');
  const [testFormulaId, setTestFormulaId] = useState<number | undefined>(undefined);
  const [simResult, setSimResult] = useState<PriceCalculationResponse | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [forms, costs] = await Promise.all([
        pricingService.getFormulas(),
        pricingService.getCostItems(),
      ]);
      setFormulas(forms);
      setCostItems(costs);

      const defaultForm = forms.find((f) => f.isDefault) || forms[0];
      if (defaultForm && !testFormulaId) {
        setTestFormulaId(defaultForm.id);
        setTestProfitPercent(defaultForm.defaultProfitPercent);
        setTestProfitNominal(defaultForm.defaultProfitNominal || 0);
        setTestAdminFeePercent(defaultForm.defaultAdminFeePercent);
        setTestBufferDiskonPercent(defaultForm.defaultBufferDiskonPercent);
        setTestRoundingRule(defaultForm.roundingRule);
      }
    } catch (err: any) {
      toast({
        title: 'Gagal memuat pengaturan',
        description: err.message || 'Terjadi kesalahan saat memuat formula harga',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Run initial test calculation once formulas are loaded
  useEffect(() => {
    if (formulas.length > 0) {
      runSimulation();
    }
  }, [formulas]);

  const runSimulation = async () => {
    setSimulating(true);
    setSimError(null);
    try {
      const res = await pricingService.calculatePrice({
        baseModal: testModal,
        profitPercent: testProfitPercent,
        profitNominal: testProfitNominal,
        adminFeePercent: testAdminFeePercent,
        bufferDiskonPercent: testBufferDiskonPercent,
        roundingRule: testRoundingRule,
        formulaId: testFormulaId,
      });
      setSimResult(res);
    } catch (err: any) {
      setSimError(err.message || 'Gagal mengevaluasi formula matematika SpEL.');
    } finally {
      setSimulating(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingFormula(null);
    setName('');
    setCode(`FORMULA_${Date.now().toString().slice(-4)}`);
    setDescription('');
    setHppExpression('MODAL + BIAYA_PACKING + BIAYA_OPERASIONAL + BIAYA_IKLAN');
    setMinPriceExpression('HPP / (1.0 - (ADMIN_FEE_PERCENT / 100.0))');
    setSellingPriceExpression(
      '(HPP + PROFIT_NOMINAL) / (1.0 - (ADMIN_FEE_PERCENT / 100.0) - (PROFIT_PERCENT / 100.0))'
    );
    setStrikePriceExpression('SELLING_PRICE * (1.0 + (BUFFER_DISKON_PERCENT / 100.0))');
    setRoundingRule('ROUND_UP_1000');
    setDefaultProfitPercent(30);
    setDefaultProfitNominal(0);
    setDefaultAdminFeePercent(7.5);
    setDefaultBufferDiskonPercent(20);
    setIsDefault(formulas.length === 0);
    setShowModal(true);
  };

  const handleOpenEdit = (formula: PricingFormula) => {
    setEditingFormula(formula);
    setName(formula.name);
    setCode(formula.code);
    setDescription(formula.description || '');
    setHppExpression(formula.hppExpression);
    setMinPriceExpression(formula.minPriceExpression);
    setSellingPriceExpression(formula.sellingPriceExpression);
    setStrikePriceExpression(formula.strikePriceExpression);
    setRoundingRule(formula.roundingRule);
    setDefaultProfitPercent(formula.defaultProfitPercent);
    setDefaultProfitNominal(formula.defaultProfitNominal || 0);
    setDefaultAdminFeePercent(formula.defaultAdminFeePercent);
    setDefaultBufferDiskonPercent(formula.defaultBufferDiskonPercent);
    setIsDefault(formula.isDefault);
    setShowModal(true);
  };

  const insertVariable = (varName: string) => {
    if (focusedField === 'hpp') {
      setHppExpression((prev) => `${prev} + ${varName}`);
    } else if (focusedField === 'min') {
      setMinPriceExpression((prev) => `${prev} + ${varName}`);
    } else if (focusedField === 'selling') {
      setSellingPriceExpression((prev) => `${prev} + ${varName}`);
    } else if (focusedField === 'strike') {
      setStrikePriceExpression((prev) => `${prev} + ${varName}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      toast({
        title: 'Form tidak lengkap',
        description: 'Nama formula dan kode unik wajib diisi',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload: PricingFormulaRequest = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
        hppExpression: hppExpression.trim(),
        minPriceExpression: minPriceExpression.trim(),
        sellingPriceExpression: sellingPriceExpression.trim(),
        strikePriceExpression: strikePriceExpression.trim(),
        roundingRule,
        defaultProfitPercent,
        defaultProfitNominal,
        defaultAdminFeePercent,
        defaultBufferDiskonPercent,
        isDefault,
      };

      if (editingFormula) {
        await pricingService.updateFormula(editingFormula.id, payload);
        toast({
          title: 'Formula berhasil diperbarui',
          description: `Formula ${name} telah disimpan`,
        });
      } else {
        await pricingService.createFormula(payload);
        toast({
          title: 'Formula berhasil ditambahkan',
          description: `Formula baru ${name} siap digunakan di kalkulator`,
        });
      }

      setShowModal(false);
      loadData();
    } catch (err: any) {
      toast({
        title: 'Gagal menyimpan formula',
        description: err.message || 'Terjadi kesalahan saat menyimpan ke database',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, formulaName: string) => {
    if (!confirm(`Hapus formula "${formulaName}"? Formula yang terhapus tidak dapat dikembalikan.`)) {
      return;
    }

    try {
      await pricingService.deleteFormula(id);
      toast({
        title: 'Formula dihapus',
        description: `Formula ${formulaName} berhasil dihapus`,
      });
      loadData();
    } catch (err: any) {
      toast({
        title: 'Gagal menghapus formula',
        description: err.message || 'Formula mungkin sedang digunakan sebagai default',
        variant: 'destructive',
      });
    }
  };

  const formatIdr = (num?: number) => {
    if (num === undefined || num === null) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getRoundingLabel = (rule: PricingRoundingRule) => {
    switch (rule) {
      case 'ROUND_UP_1000':
        return 'Bulat ke Atas Rp 1.000 (cth: 124.200 → 125.000)';
      case 'CHARM_900':
        return 'Charm Pricing .900 (cth: 124.200 → 124.900)';
      case 'ROUND_UP_500':
        return 'Bulat ke Atas Rp 500 (cth: 124.200 → 124.500)';
      case 'ROUND_UP_100':
        return 'Bulat ke Atas Rp 100 (cth: 124.230 → 124.300)';
      case 'CHARM_999':
        return 'Charm Pricing .999 (cth: 124.200 → 124.999)';
      default:
        return 'Tanpa Pembulatan (Eksak)';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-100 text-indigo-800">
              <Sliders className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Pengaturan Harga & Formula Dinamis</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Konfigurasi rumus matematika Spring SpEL untuk HPP, harga minimum, margin profit, dan strategi pembulatan harga tanpa coding.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/pricing/calculator">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Buka Kalkulator
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={handleOpenAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Formula Baru
          </Button>
        </div>
      </div>

      {/* Grid: Formulas List (Left 7) & Live Formula Sandbox / Simulator (Right 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Formulas List & Cheat Sheet */}
        <div className="lg:col-span-7 space-y-6">
          {/* Formulas List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-600" />
                Daftar Formula Aktif ({formulas.length})
              </h2>
              <span className="text-xs text-slate-500">Ekspresi dievaluasi secara dinamis oleh backend</span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 bg-white border rounded-xl">
                <RotateCcw className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
                <p className="text-xs">Memuat konfigurasi formula...</p>
              </div>
            ) : formulas.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-white border rounded-xl">
                <p className="text-sm font-medium">Belum ada formula harga yang terdaftar.</p>
                <Button size="sm" onClick={handleOpenAdd} className="mt-3 bg-indigo-600 text-white text-xs">
                  Buat Formula Pertama
                </Button>
              </div>
            ) : (
              formulas.map((f) => (
                <Card
                  key={f.id}
                  className={`border transition-all ${f.isDefault
                      ? 'border-indigo-400 bg-gradient-to-br from-indigo-50/40 via-white to-white shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base font-bold text-slate-900">{f.name}</CardTitle>
                          {f.isDefault && (
                            <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white text-[10px] font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Formula Utama Toko
                            </Badge>
                          )}
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {f.code}
                          </span>
                        </div>
                        {f.description && (
                          <CardDescription className="text-xs text-slate-500 mt-1">
                            {f.description}
                          </CardDescription>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(f)}
                          className="h-8 w-8 p-0 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                          title="Edit Formula"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        {!f.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(f.id, f.name)}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Hapus Formula"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    {/* Expressions display */}
                    <div className="bg-slate-900 rounded-lg p-3 text-white font-mono text-[11px] space-y-1.5 shadow-inner">
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-400 shrink-0 select-none">HPP =</span>
                        <span className="text-slate-200 break-all">{f.hppExpression}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-amber-400 shrink-0 select-none">MIN =</span>
                        <span className="text-slate-200 break-all">{f.minPriceExpression}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-cyan-400 shrink-0 select-none">SELL =</span>
                        <span className="text-slate-100 font-semibold break-all">{f.sellingPriceExpression}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-purple-400 shrink-0 select-none">STRIKE =</span>
                        <span className="text-slate-300 break-all">{f.strikePriceExpression}</span>
                      </div>
                    </div>

                    {/* Metadata pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                      <div className="p-2 rounded bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block text-[10px]">Target Profit:</span>
                        <span className="font-semibold text-slate-800">
                          {f.defaultProfitPercent}%
                          {f.defaultProfitNominal > 0 && ` + ${formatIdr(f.defaultProfitNominal)}`}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block text-[10px]">Admin Fee:</span>
                        <span className="font-semibold text-slate-800">{f.defaultAdminFeePercent}%</span>
                      </div>
                      <div className="p-2 rounded bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block text-[10px]">Buffer Promo:</span>
                        <span className="font-semibold text-slate-800">+{f.defaultBufferDiskonPercent}%</span>
                      </div>
                      <div className="p-2 rounded bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block text-[10px]">Pembulatan:</span>
                        <span className="font-semibold text-slate-800 truncate block">
                          {f.roundingRule.replace('ROUND_UP_', '↑').replace('CHARM_', 'Charm ')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Variables & Cheat Sheet Card */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                Daftar Variabel Matematika (SpEL Engine)
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Variabel yang dapat Anda pakai di rumus HPP, harga minimum, harga jual, dan harga coret:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/75">
                  <div className="font-mono font-bold text-indigo-700">MODAL</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Harga modal beli atau ongkos jahit dari varian/master produk
                  </div>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/75">
                  <div className="font-mono font-bold text-emerald-700">HPP</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Hasil penjumlahan MODAL + biaya aktif sebelum margin & admin
                  </div>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/75">
                  <div className="font-mono font-bold text-amber-700">BIAYA_PACKING</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Total seluruh komponen kemasan aktif (polymailer, zipper, label)
                  </div>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/75">
                  <div className="font-mono font-bold text-purple-700">BIAYA_OPERASIONAL</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Total operasional gudang, QC, upah packing, dll.
                  </div>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/75">
                  <div className="font-mono font-bold text-blue-700">BIAYA_IKLAN</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Alokasi biaya marketing/iklan per unit produk
                  </div>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/75">
                  <div className="font-mono font-bold text-rose-700">PROFIT_PERCENT</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Target laba bersih dalam persen (cth: 30 untuk 30%)
                  </div>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/75">
                  <div className="font-mono font-bold text-slate-800">ADMIN_FEE_PERCENT</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Potongan fee Midtrans / marketplace (cth: 7.5 untuk 7.5%)
                  </div>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/75">
                  <div className="font-mono font-bold text-teal-700">SELLING_PRICE</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Harga jual rekomendasi (dipakai untuk rumus harga coret promo)
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-lg text-xs text-blue-900 leading-relaxed">
                <span className="font-bold flex items-center gap-1 mb-1 text-blue-950">
                  <Info className="w-3.5 h-3.5" /> Rumus Perlindungan Potongan Admin:
                </span>
                Gunakan pembagi desimal seperti{' '}
                <code className="bg-white px-1.5 py-0.5 rounded font-mono text-indigo-700">
                  (HPP) / (1.0 - (ADMIN_FEE_PERCENT / 100.0) - (PROFIT_PERCENT / 100.0))
                </code>{' '}
                agar keuntungan bersih tidak berkurang saat dipotong biaya payment gateway atau marketplace.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Formula Sandbox & Simulator */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-indigo-200 shadow-md bg-white sticky top-6">
            <CardHeader className="bg-linear-to-r from-indigo-50 to-blue-50/40 border-b border-indigo-100 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                    <Play className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      Sandbox & Simulasi Formula
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Uji coba formula dengan angka simulasi langsung
                    </CardDescription>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={runSimulation}
                  disabled={simulating}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8"
                >
                  <RotateCcw className={`w-3.5 h-3.5 mr-1.5 ${simulating ? 'animate-spin' : ''}`} />
                  Uji Rumus
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Formula Selector */}
              <div>
                <Label className="text-xs font-semibold text-slate-700">Pilih Formula yang Diuji:</Label>
                <select
                  value={testFormulaId || ''}
                  onChange={(e) => {
                    const fid = Number(e.target.value);
                    setTestFormulaId(fid);
                    const found = formulas.find((f) => f.id === fid);
                    if (found) {
                      setTestProfitPercent(found.defaultProfitPercent);
                      setTestProfitNominal(found.defaultProfitNominal || 0);
                      setTestAdminFeePercent(found.defaultAdminFeePercent);
                      setTestBufferDiskonPercent(found.defaultBufferDiskonPercent);
                      setTestRoundingRule(found.roundingRule);
                    }
                  }}
                  className="w-full mt-1.5 h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-xs text-slate-800 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {formulas.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} {f.isDefault ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Simulation Inputs */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <Label className="text-slate-600 text-[11px]">Harga Modal (Rp):</Label>
                  <Input
                    type="number"
                    value={testModal}
                    onChange={(e) => setTestModal(Number(e.target.value))}
                    className="h-8 mt-1 text-xs font-mono"
                  />
                </div>

                <div>
                  <Label className="text-slate-600 text-[11px]">Target Profit (%):</Label>
                  <Input
                    type="number"
                    value={testProfitPercent}
                    onChange={(e) => setTestProfitPercent(Number(e.target.value))}
                    className="h-8 mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-slate-600 text-[11px]">Laba Tetap (Rp):</Label>
                  <Input
                    type="number"
                    value={testProfitNominal}
                    onChange={(e) => setTestProfitNominal(Number(e.target.value))}
                    className="h-8 mt-1 text-xs font-mono"
                  />
                </div>

                <div>
                  <Label className="text-slate-600 text-[11px]">Fee Admin (%):</Label>
                  <Input
                    type="number"
                    value={testAdminFeePercent}
                    onChange={(e) => setTestAdminFeePercent(Number(e.target.value))}
                    className="h-8 mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-slate-600 text-[11px]">Buffer Promo (%):</Label>
                  <Input
                    type="number"
                    value={testBufferDiskonPercent}
                    onChange={(e) => setTestBufferDiskonPercent(Number(e.target.value))}
                    className="h-8 mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-slate-600 text-[11px]">Strategi Pembulatan:</Label>
                  <select
                    value={testRoundingRule}
                    onChange={(e) => setTestRoundingRule(e.target.value as any)}
                    className="w-full mt-1 h-8 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 shadow-sm"
                  >
                    <option value="ROUND_UP_1000">Bulat 1.000</option>
                    <option value="CHARM_900">Charm .900</option>
                    <option value="ROUND_UP_500">Bulat 500</option>
                    <option value="ROUND_UP_100">Bulat 100</option>
                    <option value="CHARM_999">Charm .999</option>
                    <option value="NONE">Tanpa Bulat</option>
                  </select>
                </div>
              </div>

              {/* Error Alert */}
              {simError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Kesalahan Ekspresi Rumus:</span>
                    <p className="mt-0.5 font-mono text-[11px]">{simError}</p>
                  </div>
                </div>
              )}

              {/* Result Preview Box */}
              {simResult && !simError && (
                <div className="border border-indigo-100 rounded-xl bg-slate-50/70 p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-semibold text-slate-600">Hasil Evaluasi Rumus</span>
                    <Badge variant="outline" className="text-[10px] bg-white border-indigo-200 text-indigo-700">
                      Rule: {simResult.roundingRule}
                    </Badge>
                  </div>

                  {/* Summary Numbers */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Total Biaya Modal (Base):</span>
                      <span className="font-mono">{formatIdr(simResult.baseModal)}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span>Total Biaya Tambahan (Packing+Ops+Ads):</span>
                      <span className="font-mono">
                        {formatIdr(
                          (simResult.packagingCost || 0) +
                          (simResult.operationalCost || 0) +
                          (simResult.marketingCost || 0) +
                          (simResult.otherCost || 0)
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between items-center font-bold text-slate-900 pt-1 border-t border-dashed border-slate-200">
                      <span>Total HPP Produk:</span>
                      <span className="font-mono text-emerald-700">{formatIdr(simResult.totalHpp)}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span>Harga Jual Minimum (Break Even):</span>
                      <span className="font-mono text-amber-700">{formatIdr(simResult.minSellingPrice)}</span>
                    </div>

                    <div className="flex justify-between items-center font-bold text-sm text-indigo-900 bg-indigo-50/80 p-2 rounded-lg">
                      <span>Harga Jual Rekomendasi:</span>
                      <span className="font-mono text-indigo-700 text-base">{formatIdr(simResult.roundedPrice)}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span>Harga Coret Promosi (Strike Price):</span>
                      <span className="font-mono line-through text-slate-400">{formatIdr(simResult.strikePrice)}</span>
                    </div>

                    <div className="flex justify-between items-center font-semibold text-emerald-700 pt-1 border-t border-dashed border-slate-200">
                      <span>Estimasi Laba Bersih / Pcs:</span>
                      <span className="font-mono">+{formatIdr(simResult.profitNominal)}</span>
                    </div>

                    <div className="flex justify-between items-center font-semibold text-slate-700">
                      <span>Persentase Gross Margin:</span>
                      <span className="font-mono text-emerald-600">{simResult.marginPercent.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Dialog: Add / Edit Formula */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingFormula ? 'Edit Formula Harga Dinamis' : 'Buat Formula Harga Baru'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gunakan variabel dan operator matematika standar (SpEL Engine)
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Formula Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-700 font-semibold">Nama Formula *</Label>
                  <Input
                    placeholder="misal: Standar Toko Online, Flash Sale, Grosir"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 h-9 text-xs"
                    required
                  />
                </div>

                <div>
                  <Label className="text-slate-700 font-semibold">Kode Unik *</Label>
                  <Input
                    placeholder="misal: STANDAR_V2, GROSIR_30"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="mt-1 h-9 text-xs font-mono uppercase"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-slate-700 font-semibold">Deskripsi Formula</Label>
                <Input
                  placeholder="Penjelasan kapan formula ini digunakan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 h-9 text-xs"
                />
              </div>

              {/* Quick Variable Insert Chips */}
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Klik untuk Menambahkan Variabel ke Field Aktif ({focusedField.toUpperCase()}):
                  </span>
                  <span className="text-[10px] text-slate-400">Pilih field di bawah untuk mengarahkan insert</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['MODAL', 'BIAYA_PACKING', 'BIAYA_OPERASIONAL', 'BIAYA_IKLAN', 'HPP', 'PROFIT_PERCENT', 'PROFIT_NOMINAL', 'ADMIN_FEE_PERCENT', 'BUFFER_DISKON_PERCENT', 'SELLING_PRICE'].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => insertVariable(v)}
                      className="px-2 py-1 rounded bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-[10px] font-mono text-slate-700 hover:text-indigo-700 transition-colors shadow-2xs"
                    >
                      +{v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Expression Inputs */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-700 font-semibold">1. Rumus HPP (Harga Pokok Produksi):</Label>
                    <span className="text-[10px] text-slate-400">Komponen modal & biaya pendukung</span>
                  </div>
                  <Input
                    value={hppExpression}
                    onFocus={() => setFocusedField('hpp')}
                    onChange={(e) => setHppExpression(e.target.value)}
                    className="mt-1 h-9 text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-700 font-semibold">2. Rumus Harga Jual Minimum (Break Even):</Label>
                    <span className="text-[10px] text-slate-400">Batas bawah agar tidak rugi terpotong admin fee</span>
                  </div>
                  <Input
                    value={minPriceExpression}
                    onFocus={() => setFocusedField('min')}
                    onChange={(e) => setMinPriceExpression(e.target.value)}
                    className="mt-1 h-9 text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-700 font-semibold">3. Rumus Harga Jual Rekomendasi (Selling Price):</Label>
                    <span className="text-[10px] text-indigo-600 font-semibold">Harga jual utama toko</span>
                  </div>
                  <Input
                    value={sellingPriceExpression}
                    onFocus={() => setFocusedField('selling')}
                    onChange={(e) => setSellingPriceExpression(e.target.value)}
                    className="mt-1 h-9 text-xs font-mono border-indigo-300 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-700 font-semibold">4. Rumus Harga Coret Promosi (Strike Price):</Label>
                    <span className="text-[10px] text-slate-400">Harga sebelum diskon promo</span>
                  </div>
                  <Input
                    value={strikePriceExpression}
                    onFocus={() => setFocusedField('strike')}
                    onChange={(e) => setStrikePriceExpression(e.target.value)}
                    className="mt-1 h-9 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              {/* Default Parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t">
                <div>
                  <Label className="text-slate-600 text-[11px]">Default Target Profit (%):</Label>
                  <Input
                    type="number"
                    value={defaultProfitPercent}
                    onChange={(e) => setDefaultProfitPercent(Number(e.target.value))}
                    className="mt-1 h-8 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-slate-600 text-[11px]">Default Laba Tetap (Rp):</Label>
                  <Input
                    type="number"
                    value={defaultProfitNominal}
                    onChange={(e) => setDefaultProfitNominal(Number(e.target.value))}
                    className="mt-1 h-8 text-xs font-mono"
                  />
                </div>

                <div>
                  <Label className="text-slate-600 text-[11px]">Default Admin Fee (%):</Label>
                  <Input
                    type="number"
                    value={defaultAdminFeePercent}
                    onChange={(e) => setDefaultAdminFeePercent(Number(e.target.value))}
                    className="mt-1 h-8 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-slate-600 text-[11px]">Default Buffer Diskon (%):</Label>
                  <Input
                    type="number"
                    value={defaultBufferDiskonPercent}
                    onChange={(e) => setDefaultBufferDiskonPercent(Number(e.target.value))}
                    className="mt-1 h-8 text-xs"
                  />
                </div>
              </div>

              {/* Rounding Strategy & Default Switch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <Label className="text-slate-700 font-semibold">Strategi Pembulatan Harga</Label>
                  <select
                    value={roundingRule}
                    onChange={(e) => setRoundingRule(e.target.value as any)}
                    className="w-full mt-1 h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-xs text-slate-800 shadow-sm"
                  >
                    <option value="ROUND_UP_1000">Bulat ke Atas Rp 1.000 (124.200 → 125.000)</option>
                    <option value="CHARM_900">Charm Pricing .900 (124.200 → 124.900)</option>
                    <option value="ROUND_UP_500">Bulat ke Atas Rp 500 (124.200 → 124.500)</option>
                    <option value="ROUND_UP_100">Bulat ke Atas Rp 100 (124.230 → 124.300)</option>
                    <option value="CHARM_999">Charm Pricing .999 (124.200 → 124.999)</option>
                    <option value="NONE">Tanpa Pembulatan</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <Label htmlFor="isDefault" className="text-slate-800 font-semibold cursor-pointer">
                    Jadikan Formula Utama Toko
                  </Label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                >
                  {submitting && <RotateCcw className="w-3.5 h-3.5 animate-spin" />}
                  {editingFormula ? 'Simpan Perubahan' : 'Buat Formula'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

