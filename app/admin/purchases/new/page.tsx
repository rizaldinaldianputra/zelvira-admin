'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CrudForm } from '@/components/admin/crud-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PurchaseOrderService } from '@/services/purchase-order.service';
import { SupplierService } from '@/services/supplier.service';
import { ProductService } from '@/services/product.service';
import { Supplier } from '@/types/supplier';
import { Product, ProductVariant } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { formatRupiah } from '@/services/utils';
import {
  ShoppingBag,
  Plus,
  Trash2,
  Calendar,
  CreditCard,
  Package,
  Layers,
  Calculator,
  Info
} from 'lucide-react';

interface FormItem {
  variantId: number;
  productName: string;
  sku: string;
  size?: string;
  color?: string;
  currentStock?: number;
  quantity: number;
  unitCost: number;
  subtotal: number;
  notes?: string;
}

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [flatVariants, setFlatVariants] = useState<
    { variant: ProductVariant; product: Product; label: string }[]
  >([]);

  // Form State
  const [poNumber, setPoNumber] = useState('');
  const [supplierId, setSupplierId] = useState<number | ''>('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [paymentTerm, setPaymentTerm] = useState('NET30');
  const [taxAmount, setTaxAmount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState('');

  // Line items
  const [items, setItems] = useState<FormItem[]>([]);

  // Fetch Suppliers and Products
  useEffect(() => {
    const loadData = async () => {
      try {
        const [supRes, prodRes] = await Promise.all([
          SupplierService.getSuppliers(0, 100),
          ProductService.getAll(0, 100),
        ]);
        setSuppliers(supRes.content || []);
        const prods: Product[] = prodRes.content || [];
        setProducts(prods);

        // Flatten variants for easy dropdown selection
        const variantsList: { variant: ProductVariant; product: Product; label: string }[] = [];
        prods.forEach((p) => {
          if (p.variants && p.variants.length > 0) {
            p.variants.forEach((v) => {
              variantsList.push({
                variant: v,
                product: p,
                label: `${p.name} - SKU: ${v.sku} ${v.color ? `[${v.color}]` : ''} ${v.size ? `(${v.size})` : ''} (Stok: ${v.stock || 0})`,
              });
            });
          }
        });
        setFlatVariants(variantsList);
      } catch (err) {
        console.error('Failed to load suppliers/products', err);
      }
    };
    loadData();
  }, []);

  const handleSupplierChange = (idStr: string) => {
    const sId = Number(idStr);
    setSupplierId(sId);
    const sup = suppliers.find((s) => s.id === sId);
    if (sup && sup.paymentTerm) {
      setPaymentTerm(sup.paymentTerm);
    }
  };

  const handleAddItem = () => {
    if (flatVariants.length === 0) {
      toast({
        title: 'Perhatian',
        description: 'Belum ada produk atau varian yang tersedia.',
        variant: 'destructive',
      });
      return;
    }
    const defaultVariant = flatVariants[0];
    setItems((prev) => [
      ...prev,
      {
        variantId: defaultVariant.variant.id,
        productName: defaultVariant.product.name,
        sku: defaultVariant.variant.sku,
        size: defaultVariant.variant.size,
        color: defaultVariant.variant.color,
        currentStock: defaultVariant.variant.stock || 0,
        quantity: 10,
        unitCost: defaultVariant.variant.costPrice || defaultVariant.variant.price || 50000,
        subtotal: 10 * (defaultVariant.variant.costPrice || defaultVariant.variant.price || 50000),
        notes: '',
      },
    ]);
  };

  const handleVariantChange = (index: number, variantIdStr: string) => {
    const variantId = Number(variantIdStr);
    const itemMatch = flatVariants.find((fv) => fv.variant.id === variantId);
    if (!itemMatch) return;

    setItems((prev) => {
      const copy = [...prev];
      const cur = copy[index];
      const cost = itemMatch.variant.costPrice || itemMatch.variant.price || 50000;
      copy[index] = {
        ...cur,
        variantId,
        productName: itemMatch.product.name,
        sku: itemMatch.variant.sku,
        size: itemMatch.variant.size,
        color: itemMatch.variant.color,
        currentStock: itemMatch.variant.stock || 0,
        unitCost: cost,
        subtotal: cur.quantity * cost,
      };
      return copy;
    });
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const validQty = Math.max(1, qty || 1);
    setItems((prev) => {
      const copy = [...prev];
      const cur = copy[index];
      copy[index] = {
        ...cur,
        quantity: validQty,
        subtotal: validQty * cur.unitCost,
      };
      return copy;
    });
  };

  const handleUnitCostChange = (index: number, cost: number) => {
    const validCost = Math.max(0, cost || 0);
    setItems((prev) => {
      const copy = [...prev];
      const cur = copy[index];
      copy[index] = {
        ...cur,
        unitCost: validCost,
        subtotal: cur.quantity * validCost,
      };
      return copy;
    });
  };

  const handleItemNotesChange = (index: number, notesVal: string) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], notes: notesVal };
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Computations
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalAmount = Math.max(0, subtotal + (Number(taxAmount) || 0) + (Number(shippingCost) || 0) - (Number(discountAmount) || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierId) {
      toast({
        title: 'Validasi Gagal',
        description: 'Silakan pilih supplier tujuan pengadaan.',
        variant: 'destructive',
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: 'Validasi Gagal',
        description: 'Mohon tambahkan minimal 1 item produk ke dalam Purchase Order.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        poNumber: poNumber.trim() || undefined,
        supplierId: Number(supplierId),
        orderDate,
        expectedDeliveryDate: expectedDeliveryDate || undefined,
        status: 'DRAFT',
        paymentStatus: 'UNPAID',
        paymentTerm,
        taxAmount: Number(taxAmount) || 0,
        shippingCost: Number(shippingCost) || 0,
        discountAmount: Number(discountAmount) || 0,
        notes,
        items: items.map((it) => ({
          variantId: it.variantId,
          quantity: it.quantity,
          unitCost: it.unitCost,
          notes: it.notes,
        })),
      };

      const result = await PurchaseOrderService.create(payload);
      toast({
        title: 'PO Dibuat (DRAFT)',
        description: `Purchase Order ${result.poNumber} berhasil dibuat dan workflow Camunda dimulai.`,
      });
      router.push(`/admin/purchases/${result.id}`);
    } catch (error: any) {
      toast({
        title: 'Gagal Menyimpan PO',
        description: error?.message || 'Terjadi kesalahan saat membuat Purchase Order.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CrudForm
      title="Buat Purchase Order (PO) Baru"
      subtitle="Input pengadaan barang ke supplier. PO akan disimpan sebagai DRAFT dan menunggu persetujuan Camunda Workflow Engine."
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitLabel="Simpan & Buat Draft PO"
      maxWidth="max-w-6xl"
    >
      <div className="space-y-8">
        {/* Banner Workflow Engine */}
        <div className="p-4 rounded-2xl bg-linear-to-r from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 border border-pink-200 dark:border-pink-900/50 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-pink-500 text-white shrink-0 mt-0.5">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-pink-950 dark:text-pink-200">
              Camunda Workflow Engine: Tahap Pengajuan (Draft)
            </h4>
            <p className="text-xs text-pink-800 dark:text-pink-300 mt-0.5 leading-relaxed">
              PO ini akan otomatis masuk ke antrian approval. Setelah berstatus <strong>APPROVED</strong>, PO siap dipanggil saat penerimaan barang gudang (Goods Receipt) untuk penambahan stok fisik.
            </p>
          </div>
        </div>

        {/* Section 1: Informasi Dasar PO & Supplier */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-white/10">
            <ShoppingBag className="w-5 h-5 text-pink-600" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Informasi Pemesanan &amp; Supplier
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


            <div>
              <label className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300 block mb-2">
                Pilih Supplier <span className="text-rose-500">*</span>
              </label>
              <Select
                value={supplierId ? supplierId.toString() : ''}
                onValueChange={handleSupplierChange}
              >
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="-- Pilih Mitra Supplier --" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.code} - {s.name} ({s.city || 'Kota'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300 block mb-2">
                Tanggal Order <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="rounded-xl border-slate-200 pl-9"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300 block mb-2">
                Estimasi Pengiriman (Expected Date)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  className="rounded-xl border-slate-200 pl-9"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300 block mb-2">
                Termin Pembayaran
              </label>
              <Select value={paymentTerm} onValueChange={setPaymentTerm}>
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="Pilih Termin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">CASH (Bayar Tunai / Di Muka)</SelectItem>
                  <SelectItem value="COD">COD (Cash on Delivery)</SelectItem>
                  <SelectItem value="NET7">NET 7 (Tempo 7 Hari)</SelectItem>
                  <SelectItem value="NET14">NET 14 (Tempo 14 Hari)</SelectItem>
                  <SelectItem value="NET30">NET 30 (Tempo 30 Hari)</SelectItem>
                  <SelectItem value="NET60">NET 60 (Tempo 60 Hari)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300 block mb-2">
                Catatan / Instruksi Pengadaan
              </label>
              <Input
                placeholder="Spesifikasi warna, packaging dus, dsb."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-xl border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Line Items Produk */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/10">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                Daftar Produk Pesanan ({items.length} Item)
              </h3>
            </div>
            <Button
              type="button"
              onClick={handleAddItem}
              className="rounded-full bg-pink-600 hover:bg-pink-700 text-white text-xs gap-1.5 shadow-sm"
              size="sm"
            >
              <Plus className="w-4 h-4" /> Tambah Baris Produk
            </Button>
          </div>

          {items.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/10">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Belum ada item produk</p>
              <p className="text-xs text-slate-400 mb-4">Klik tombol di bawah untuk menambahkan varian produk ke PO.</p>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddItem}
                className="rounded-full gap-1.5 text-pink-600 border-pink-200 hover:bg-pink-50"
              >
                <Plus className="w-4 h-4" /> Tambah Item Pertama
              </Button>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/10 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 w-8">#</th>
                      <th className="py-3 px-4 min-w-[280px]">Varian Produk Master</th>
                      <th className="py-3 px-4 w-28 text-center">Qty Dipesan</th>
                      <th className="py-3 px-4 w-40 text-right">Harga Beli Satuan (Rp)</th>
                      <th className="py-3 px-4 w-36 text-right">Subtotal</th>
                      <th className="py-3 px-4 min-w-[150px]">Catatan Item</th>
                      <th className="py-3 px-3 w-12 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <Select
                            value={item.variantId.toString()}
                            onValueChange={(val) => handleVariantChange(idx, val)}
                          >
                            <SelectTrigger className="rounded-xl border-slate-200 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                              {flatVariants.map((fv) => (
                                <SelectItem key={fv.variant.id} value={fv.variant.id.toString()}>
                                  {fv.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                            <span>SKU: <span className="font-mono text-slate-600 dark:text-slate-300">{item.sku}</span></span>
                            <span>•</span>
                            <span>Stok Gudang: <span className="font-bold text-slate-700 dark:text-slate-200">{item.currentStock || 0}</span> pcs</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value))}
                            className="rounded-xl border-slate-200 text-center font-bold"
                          />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Input
                            type="number"
                            min={0}
                            step={1000}
                            value={item.unitCost}
                            onChange={(e) => handleUnitCostChange(idx, parseFloat(e.target.value))}
                            className="rounded-xl border-slate-200 text-right font-mono"
                          />
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                          {formatRupiah(item.subtotal)}
                        </td>
                        <td className="py-3 px-4">
                          <Input
                            placeholder="Keterangan item (opsional)"
                            value={item.notes || ''}
                            onChange={(e) => handleItemNotesChange(idx, e.target.value)}
                            className="rounded-xl border-slate-200 text-xs"
                          />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-slate-400 hover:text-rose-600 rounded-full h-8 w-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Ringkasan Biaya PO */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2 pb-2">
            <Calculator className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Kalkulasi Biaya &amp; Pajak
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300 block mb-2">
                  PPN / Pajak (Rp)
                </label>
                <Input
                  type="number"
                  min={0}
                  value={taxAmount}
                  onChange={(e) => setTaxAmount(parseFloat(e.target.value) || 0)}
                  className="rounded-xl border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300 block mb-2">
                  Biaya Ongkir (Rp)
                </label>
                <Input
                  type="number"
                  min={0}
                  value={shippingCost}
                  onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                  className="rounded-xl border-slate-200 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300 block mb-2">
                  Diskon Supplier (Rp)
                </label>
                <Input
                  type="number"
                  min={0}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  className="rounded-xl border-slate-200 font-mono text-rose-500"
                />
              </div>
            </div>

            {/* Total Box */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-5 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Subtotal Items ({items.reduce((s, i) => s + i.quantity, 0)} pcs):</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Pajak (PPN):</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{formatRupiah(taxAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Ongkir:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{formatRupiah(shippingCost || 0)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-xs text-rose-500">
                  <span>Diskon:</span>
                  <span className="font-mono">- {formatRupiah(discountAmount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                  Total Nilai PO:
                </span>
                <span className="text-xl font-black text-pink-600 font-mono">
                  {formatRupiah(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CrudForm>
  );
}
