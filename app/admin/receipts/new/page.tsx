'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CrudForm } from '@/components/admin/crud-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GoodsReceiptService } from '@/services/goods-receipt.service';
import { PurchaseOrderService } from '@/services/purchase-order.service';
import { PurchaseOrder, PurchaseOrderItem } from '@/types/purchase-order';
import { useToast } from '@/hooks/use-toast';
import {
  PackageCheck,
  ShoppingBag,
  Building2,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle2,
  Layers,
  Search,
  Loader2
} from 'lucide-react';

interface GRFormItem {
  purchaseOrderItemId?: number;
  variantId: number;
  productName: string;
  sku: string;
  size?: string;
  color?: string;
  orderedQty: number;
  alreadyReceivedQty: number;
  remainingQty: number;
  quantityReceived: number;
  quantityRejected: number;
  unitCost: number;
  notes?: string;
}

function NewGoodsReceiptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillPoNumber = searchParams.get('poNumber') || '';

  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isPoLoading, setIsPoLoading] = useState(false);

  const [approvedPOs, setApprovedPOs] = useState<PurchaseOrder[]>([]);
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);

  // Form Fields
  const [receiptNumber, setReceiptNumber] = useState('');
  const [selectedPoNumber, setSelectedPoNumber] = useState(prefillPoNumber);
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);
  const [doNumber, setDoNumber] = useState(''); // Surat jalan
  const [notes, setNotes] = useState('');

  // Table items auto-populated from PO
  const [items, setItems] = useState<GRFormItem[]>([]);

  // Load approved POs list
  useEffect(() => {
    const fetchApproved = async () => {
      try {
        const pos = await PurchaseOrderService.getApproved();
        setApprovedPOs(pos || []);
      } catch (err) {
        console.error('Failed to load approved POs', err);
      }
    };
    fetchApproved();
  }, []);

  // When PO is selected or prefilled, fetch PO details with items
  const loadPoDetails = async (poNum: string) => {
    if (!poNum.trim()) return;
    try {
      setIsPoLoading(true);
      const po = await PurchaseOrderService.getByPoNumber(poNum.trim());
      setSelectedPo(po);

      // Auto-populate items table with remaining quantities
      const grItems: GRFormItem[] = po.items.map((pi: PurchaseOrderItem) => {
        const received = pi.receivedQuantity || 0;
        const remaining = Math.max(0, pi.quantity - received);

        return {
          purchaseOrderItemId: pi.id,
          variantId: pi.variantId,
          productName: pi.productName,
          sku: pi.sku,
          size: pi.size,
          color: pi.color,
          orderedQty: pi.quantity,
          alreadyReceivedQty: received,
          remainingQty: remaining,
          quantityReceived: remaining, // default to remaining
          quantityRejected: 0,
          unitCost: pi.unitCost,
          notes: '',
        };
      });

      setItems(grItems);
    } catch (err: any) {
      toast({
        title: 'PO Tidak Ditemukan',
        description: err?.message || `Purchase Order "${poNum}" tidak ditemukan atau belum disetujui.`,
        variant: 'destructive',
      });
      setSelectedPo(null);
      setItems([]);
    } finally {
      setIsPoLoading(false);
    }
  };

  useEffect(() => {
    if (prefillPoNumber) {
      setSelectedPoNumber(prefillPoNumber);
      loadPoDetails(prefillPoNumber);
    }
  }, [prefillPoNumber]);

  const handlePoSelect = (val: string) => {
    setSelectedPoNumber(val);
    loadPoDetails(val);
  };

  const handleReceivedQtyChange = (index: number, val: number) => {
    const qty = Math.max(0, val || 0);
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], quantityReceived: qty };
      return copy;
    });
  };

  const handleRejectedQtyChange = (index: number, val: number) => {
    const qty = Math.max(0, val || 0);
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], quantityRejected: qty };
      return copy;
    });
  };

  const handleItemNotesChange = (index: number, note: string) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], notes: note };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPo) {
      toast({
        title: 'Validasi Gagal',
        description: 'Silakan pilih atau masukkan nomor Purchase Order yang valid.',
        variant: 'destructive',
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: 'Validasi Gagal',
        description: 'Tidak ada item yang dapat diterima pada PO ini.',
        variant: 'destructive',
      });
      return;
    }

    const totalToReceive = items.reduce((sum, item) => sum + item.quantityReceived, 0);
    if (totalToReceive === 0) {
      toast({
        title: 'Validasi Gagal',
        description: 'Jumlah barang yang diterima minimal 1 pcs.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        receiptNumber: receiptNumber.trim() || undefined,
        purchaseOrderId: selectedPo.id,
        supplierId: selectedPo.supplierId,
        receiptDate,
        doNumber: doNumber.trim() || undefined,
        notes,
        updateCostPrice: true,
        items: items
          .filter((it) => it.quantityReceived > 0 || it.quantityRejected > 0)
          .map((it) => ({
            purchaseOrderItemId: it.purchaseOrderItemId,
            variantId: it.variantId,
            quantityReceived: it.quantityReceived,
            quantityRejected: it.quantityRejected,
            unitCost: it.unitCost,
            notes: it.notes,
          })),
      };

      const result = await GoodsReceiptService.create(payload);
      toast({
        title: 'Draft Goods Receipt Dibuat!',
        description: `Nomor ${result.receiptNumber} disimpan sebagai DRAFT. Silakan periksa fisik dan klik Approve untuk mutasi stok.`,
      });
      router.push(`/admin/receipts/${result.id}`);
    } catch (err: any) {
      toast({
        title: 'Gagal Menyimpan GR',
        description: err?.message || 'Terjadi kesalahan saat membuat formulir penerimaan barang.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalReceivedQty = items.reduce((sum, i) => sum + (i.quantityReceived || 0), 0);
  const totalRejectedQty = items.reduce((sum, i) => sum + (i.quantityRejected || 0), 0);

  return (
    <CrudForm
      title="Penerimaan Barang (Goods Receipt)"
      subtitle="Input nomor Purchase Order yang disetujui. Formulir akan otomatis memunculkan tabel produk di bawahnya untuk diverifikasi."
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitLabel="Simpan Sebagai Draft GR"
      maxWidth="max-w-6xl"
    >
      <div className="space-y-8">
        {/* Banner Petunjuk Alur */}
        <div className="p-4 rounded-2xl bg-linear-to-r from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 border border-teal-200 dark:border-teal-900/50 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-teal-600 text-white shrink-0 mt-0.5">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-teal-950 dark:text-teal-200">
              Alur Penerimaan Barang (Goods Receipt Workflow)
            </h4>
            <p className="text-xs text-teal-800 dark:text-teal-300 mt-0.5 leading-relaxed">
              1. Pilih nomor PO yang telah disetujui (APPROVED). Tabel produk dan sisa pesanan akan otomatis tampil.<br />
              2. Simpan formulir sebagai <strong>DRAFT</strong>.<br />
              3. Setelah verifikasi fisik barang di gudang selesai, klik tombol <strong>Approve</strong> untuk mutasi stok otomatis ke inventaris dan memperbarui status PO (PARTIAL / COMPLETED).
            </p>
          </div>
        </div>

        {/* Section 1: Pemilihan PO & Data Dokumen */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-white/10">
            <ShoppingBag className="w-5 h-5 text-pink-600" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Referensi Purchase Order (PO)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300 block mb-2">
                Pilih Purchase Order yang Telah Disetujui (APPROVED) <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <Select
                  value={selectedPoNumber}
                  onValueChange={handlePoSelect}
                >
                  <SelectTrigger className="rounded-xl border-slate-200">
                    <SelectValue placeholder="-- Pilih Nomor Purchase Order --" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {approvedPOs.map((p) => (
                      <SelectItem key={p.id} value={p.poNumber}>
                        {p.poNumber} — {p.supplierName} (Status: {p.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-1 shrink-0">
                  <Input
                    placeholder="Ketik No PO..."
                    value={selectedPoNumber}
                    onChange={(e) => setSelectedPoNumber(e.target.value)}
                    className="w-36 rounded-xl uppercase font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => loadPoDetails(selectedPoNumber)}
                    className="rounded-xl px-3"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Hanya PO dengan status APPROVED atau PARTIAL yang dapat dipilih.
              </p>
            </div>



            <div>
              <label className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300 block mb-2">
                Tanggal Penerimaan Fisik <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  type="date"
                  value={receiptDate}
                  onChange={(e) => setReceiptDate(e.target.value)}
                  className="rounded-xl border-slate-200 pl-9"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300 block mb-2">
                Nomor Surat Jalan (DO Supplier)
              </label>
              <Input
                placeholder="e.g. SJ-2026/X/0091"
                value={doNumber}
                onChange={(e) => setDoNumber(e.target.value)}
                className="rounded-xl border-slate-200 font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300 block mb-2">
                Catatan Gudang / Penerimaan
              </label>
              <Input
                placeholder="Kondisi kemasan dus, kurir pengantar, dsb."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-xl border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Selected PO Summary Card */}
        {selectedPo && (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400">Supplier:</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">{selectedPo.supplierName}</p>
            </div>
            <div>
              <span className="text-slate-400">Tanggal Order PO:</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedPo.orderDate}</p>
            </div>
            <div>
              <span className="text-slate-400">Status PO:</span>
              <p className="font-bold text-pink-600 mt-0.5">{selectedPo.status}</p>
            </div>
            <div>
              <span className="text-slate-400">Progres Penerimaan:</span>
              <p className="font-bold text-emerald-600 mt-0.5">
                {selectedPo.totalReceivedQty} / {selectedPo.totalOrderedQty} pcs
              </p>
            </div>
          </div>
        )}

        {/* Section 2: Tabel Produk Otomatis Muncul */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/10">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                Verifikasi Produk Fisik ({items.length} Baris Produk)
              </h3>
            </div>
            <div className="text-xs font-semibold text-slate-500">
              Total Diterima: <span className="font-bold text-emerald-600 font-mono">{totalReceivedQty} pcs</span> | Ditolak: <span className="font-bold text-rose-500 font-mono">{totalRejectedQty} pcs</span>
            </div>
          </div>

          {isPoLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-pink-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Mengambil daftar produk dari Purchase Order...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/10">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Belum ada data produk</p>
              <p className="text-xs text-slate-400">Pilih Purchase Order di atas untuk memunculkan daftar produk.</p>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/10 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 w-8">#</th>
                      <th className="py-3 px-4 min-w-[240px]">Produk &amp; Varian</th>
                      <th className="py-3 px-4 w-24 text-center">Dipesan PO</th>
                      <th className="py-3 px-4 w-24 text-center">Sisa Pesanan</th>
                      <th className="py-3 px-4 w-32 text-center text-emerald-600">Qty Diterima (Pcs)</th>
                      <th className="py-3 px-4 w-28 text-center text-rose-500">Qty Ditolak</th>
                      <th className="py-3 px-4 min-w-[180px]">Catatan / Kondisi Barang</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{item.productName}</div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="font-mono">SKU: {item.sku}</span>
                            {item.color && <span>• {item.color}</span>}
                            {item.size && <span>• Size {item.size}</span>}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                          {item.orderedQty} pcs
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`font-mono font-bold px-2 py-0.5 rounded-md ${item.remainingQty === 0 ? 'bg-slate-100 text-slate-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40'
                            }`}>
                            {item.remainingQty} pcs
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Input
                            type="number"
                            min={0}
                            value={item.quantityReceived}
                            onChange={(e) => handleReceivedQtyChange(idx, parseInt(e.target.value))}
                            className="rounded-xl border-emerald-300 dark:border-emerald-800 text-center font-bold text-emerald-700 dark:text-emerald-400 font-mono bg-emerald-50/30"
                          />
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Input
                            type="number"
                            min={0}
                            value={item.quantityRejected}
                            onChange={(e) => handleRejectedQtyChange(idx, parseInt(e.target.value))}
                            className="rounded-xl border-slate-200 text-center font-mono"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <Input
                            placeholder="Kondisi baik / cacat jahit / dsb."
                            value={item.notes || ''}
                            onChange={(e) => handleItemNotesChange(idx, e.target.value)}
                            className="rounded-xl border-slate-200 text-xs"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </CrudForm>
  );
}

export default function NewGoodsReceiptPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Memuat formulir...</div>}>
      <NewGoodsReceiptContent />
    </Suspense>
  );
}
