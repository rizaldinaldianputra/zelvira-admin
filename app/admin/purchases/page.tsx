'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, PackageCheck, Plus, Trash2 } from 'lucide-react';
import { CrudTable } from '@/components/admin/crud-table';
import { usePurchases } from '@/hooks/use-purchases';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PurchaseOrderService } from '@/services/purchase-order.service';
import { GoodsReceiptService } from '@/services/goods-receipt.service';
import { SupplierService } from '@/services/supplier.service';
import { ProductService } from '@/services/product.service';
import { Supplier } from '@/types/supplier';
import { Product, ProductVariant } from '@/types/product';

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val || 0);
};

export default function PurchasesPage() {
  const {
    orders,
    stats,
    isLoading,
    columns,
    isCreateOpen,
    setIsCreateOpen,
    isReceiptOpen,
    setIsReceiptOpen,
    selectedPO,
    handleAdd,
    handleView,
    handleDelete,
    handleOpenReceipt,
    fetchOrders,
  } = usePurchases();

  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Create PO Form state
  const [isSubmittingPO, setIsSubmittingPO] = useState(false);
  const [poForm, setPoForm] = useState<{
    supplierId: number | null;
    orderDate: string;
    expectedDeliveryDate: string;
    paymentTerm: string;
    taxAmount: number;
    shippingCost: number;
    discountAmount: number;
    notes: string;
    items: { variantId: number; quantity: number; unitCost: number; notes: string }[];
  }>({
    supplierId: null,
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    paymentTerm: 'CASH',
    taxAmount: 0,
    shippingCost: 0,
    discountAmount: 0,
    notes: '',
    items: [],
  });

  // Goods Receipt Form state
  const [isSubmittingReceipt, setIsSubmittingReceipt] = useState(false);
  const [receiptForm, setReceiptForm] = useState<{
    doNumber: string;
    receiptDate: string;
    notes: string;
    updateCostPrice: boolean;
    items: {
      purchaseOrderItemId: number;
      variantId: number;
      sku: string;
      productName: string;
      orderedQty: number;
      receivedSoFar: number;
      remainingQty: number;
      quantityReceived: number;
      quantityRejected: number;
      unitCost: number;
    }[];
  }>({
    doNumber: '',
    receiptDate: new Date().toISOString().split('T')[0],
    notes: '',
    updateCostPrice: true,
    items: [],
  });

  const loadDependencies = async () => {
    try {
      const [supRes, prodRes] = await Promise.all([
        SupplierService.getSuppliers(0, 100, undefined, true),
        ProductService.getAll(0, 100),
      ]);
      setSuppliers(supRes.content || []);
      setProducts(prodRes.content || []);
    } catch (err) {
      console.error('Error loading dependencies', err);
    }
  };

  useEffect(() => {
    loadDependencies();
  }, []);

  const allVariants = React.useMemo(() => {
    const list: { variant: ProductVariant; product: Product }[] = [];
    products.forEach((p) => {
      (p.variants || []).forEach((v) => {
        list.push({ variant: v, product: p });
      });
    });
    return list;
  }, [products]);

  // When opening create PO
  useEffect(() => {
    if (isCreateOpen) {
      const defaultVar = allVariants[0]?.variant;
      setPoForm({
        supplierId: suppliers[0]?.id || null,
        orderDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: '',
        paymentTerm: suppliers[0]?.paymentTerm || 'CASH',
        taxAmount: 0,
        shippingCost: 0,
        discountAmount: 0,
        notes: '',
        items: [
          {
            variantId: defaultVar?.id || 0,
            quantity: 1,
            unitCost: Number(defaultVar?.costPrice || defaultVar?.price || 0),
            notes: '',
          },
        ],
      });
    }
  }, [isCreateOpen, suppliers, allVariants]);

  // When opening receipt
  useEffect(() => {
    if (isReceiptOpen && selectedPO) {
      const items = selectedPO.items
        .filter((i) => i.remainingQuantity > 0)
        .map((i) => ({
          purchaseOrderItemId: i.id,
          variantId: i.variantId,
          sku: i.sku,
          productName: i.productName,
          orderedQty: i.quantity,
          receivedSoFar: i.receivedQuantity,
          remainingQty: i.remainingQuantity,
          quantityReceived: i.remainingQuantity,
          quantityRejected: 0,
          unitCost: i.unitCost,
        }));

      setReceiptForm({
        doNumber: '',
        receiptDate: new Date().toISOString().split('T')[0],
        notes: '',
        updateCostPrice: true,
        items,
      });
    }
  }, [isReceiptOpen, selectedPO]);

  const handleAddItemRow = () => {
    const defaultVar = allVariants[0]?.variant;
    setPoForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          variantId: defaultVar?.id || 0,
          quantity: 1,
          unitCost: Number(defaultVar?.costPrice || defaultVar?.price || 0),
          notes: '',
        },
      ],
    }));
  };

  const handleRemoveItemRow = (index: number) => {
    setPoForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setPoForm((prev) => {
      const updated = [...prev.items];
      if (field === 'variantId') {
        const found = allVariants.find((av) => av.variant.id === Number(value));
        updated[index] = {
          ...updated[index],
          variantId: Number(value),
          unitCost: Number(found?.variant.costPrice || found?.variant.price || 0),
        };
      } else {
        updated[index] = {
          ...updated[index],
          [field]: value,
        };
      }
      return { ...prev, items: updated };
    });
  };

  const calculateSubtotal = () => {
    return poForm.items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  };

  const calculateTotal = () => {
    const sub = calculateSubtotal();
    return Math.max(0, sub + Number(poForm.taxAmount || 0) + Number(poForm.shippingCost || 0) - Number(poForm.discountAmount || 0));
  };

  const handleSubmitPO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poForm.supplierId) {
      toast({ title: 'Validasi', description: 'Silakan pilih supplier.', variant: 'destructive' });
      return;
    }
    if (poForm.items.length === 0) {
      toast({ title: 'Validasi', description: 'Minimal harus ada 1 item produk.', variant: 'destructive' });
      return;
    }

    try {
      setIsSubmittingPO(true);
      await PurchaseOrderService.create({
        supplierId: poForm.supplierId,
        orderDate: poForm.orderDate,
        expectedDeliveryDate: poForm.expectedDeliveryDate || undefined,
        paymentTerm: poForm.paymentTerm,
        taxAmount: Number(poForm.taxAmount || 0),
        shippingCost: Number(poForm.shippingCost || 0),
        discountAmount: Number(poForm.discountAmount || 0),
        notes: poForm.notes,
        status: 'ORDERED',
        items: poForm.items.map((i) => ({
          variantId: i.variantId,
          quantity: Number(i.quantity),
          unitCost: Number(i.unitCost),
          notes: i.notes,
        })),
      });

      toast({ title: 'Sukses', description: 'Purchase Order baru berhasil dibuat.' });
      setIsCreateOpen(false);
      fetchOrders();
    } catch (err: any) {
      toast({
        title: 'Gagal Membuat PO',
        description: err?.message || 'Terjadi kesalahan sistem.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingPO(false);
    }
  };

  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;

    const validItems = receiptForm.items.filter((i) => i.quantityReceived > 0);
    if (validItems.length === 0) {
      toast({
        title: 'Validasi',
        description: 'Setidaknya 1 item harus memiliki kuantitas diterima > 0.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmittingReceipt(true);
      await GoodsReceiptService.create({
        purchaseOrderId: selectedPO.id,
        supplierId: selectedPO.supplierId,
        receiptDate: receiptForm.receiptDate,
        doNumber: receiptForm.doNumber,
        notes: receiptForm.notes,
        updateCostPrice: receiptForm.updateCostPrice,
        items: validItems.map((i) => ({
          purchaseOrderItemId: i.purchaseOrderItemId,
          variantId: i.variantId,
          quantityReceived: Number(i.quantityReceived),
          quantityRejected: Number(i.quantityRejected || 0),
          unitCost: Number(i.unitCost),
        })),
      });

      toast({
        title: 'Penerimaan Disimpan!',
        description: `Stok produk bertambah dan tercatat di mutasi inventaris.`,
      });
      setIsReceiptOpen(false);
      fetchOrders();
    } catch (err: any) {
      toast({
        title: 'Gagal Menyimpan Penerimaan',
        description: err?.message || 'Terjadi kesalahan sistem.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingReceipt(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              Purchase Orders (Pesanan Pembelian)
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Kelola pesanan barang ke pemasok, pantau penerimaan fisik gudang, dan sinkronisasi stok.
            </p>
          </div>
        </div>

        <Link href="/admin/receipts">
          <Button variant="outline" className="rounded-2xl border-slate-200 font-bold gap-2 text-xs uppercase">
            <PackageCheck className="h-4 w-4 text-emerald-600" /> Riwayat Penerimaan (GR)
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total PO</p>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</h3>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xs">
          <p className="text-[11px] font-semibold text-blue-500 uppercase tracking-wider">Menunggu</p>
          <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.ordered}</h3>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xs">
          <p className="text-[11px] font-semibold text-amber-500 uppercase tracking-wider">Sebagian</p>
          <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.partiallyReceived}</h3>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xs">
          <p className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">Lengkap</p>
          <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.received}</h3>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Draf / Batal</p>
          <h3 className="text-xl font-bold text-slate-400 mt-1">{stats.draft + stats.cancelled}</h3>
        </div>
      </div>

      {/* Crud Table */}
      <CrudTable
        data={orders}
        columns={columns}
        searchKey="purchases"
        onAdd={handleAdd}
        onView={handleView}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {/* CREATE PURCHASE ORDER DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-pink-600" />
              Buat Purchase Order Baru
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitPO} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Pilih Supplier <span className="text-rose-500">*</span>
                </label>
                <Select
                  value={poForm.supplierId ? String(poForm.supplierId) : ''}
                  onValueChange={(val) => {
                    const sup = suppliers.find((s) => s.id === Number(val));
                    setPoForm((prev) => ({
                      ...prev,
                      supplierId: Number(val),
                      paymentTerm: sup?.paymentTerm || prev.paymentTerm,
                    }));
                  }}
                >
                  <SelectTrigger className="rounded-xl border-slate-200">
                    <SelectValue placeholder="Pilih Supplier Rekanan" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name} ({s.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tanggal Order <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="date"
                  required
                  value={poForm.orderDate}
                  onChange={(e) => setPoForm({ ...poForm, orderDate: e.target.value })}
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Estimasi Tiba (Delivery Date)
                </label>
                <Input
                  type="date"
                  value={poForm.expectedDeliveryDate}
                  onChange={(e) => setPoForm({ ...poForm, expectedDeliveryDate: e.target.value })}
                  className="rounded-xl border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Termin Pembayaran
                </label>
                <Select
                  value={poForm.paymentTerm}
                  onValueChange={(val) => setPoForm({ ...poForm, paymentTerm: val })}
                >
                  <SelectTrigger className="rounded-xl border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">CASH</SelectItem>
                    <SelectItem value="NET_7">NET 7 Hari</SelectItem>
                    <SelectItem value="NET_14">NET 14 Hari</SelectItem>
                    <SelectItem value="NET_30">NET 30 Hari</SelectItem>
                    <SelectItem value="NET_60">NET 60 Hari</SelectItem>
                    <SelectItem value="TEMPO">TEMPO / Khusus</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Catatan PO
                </label>
                <Input
                  value={poForm.notes}
                  onChange={(e) => setPoForm({ ...poForm, notes: e.target.value })}
                  placeholder="Instruksi pengiriman, lokasi gudang, atau no referensi..."
                  className="rounded-xl border-slate-200"
                />
              </div>
            </div>

            {/* Item Rows Section */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Daftar Produk & Varian yang Dipesan
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItemRow}
                  className="rounded-xl text-xs font-semibold gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah Baris
                </Button>
              </div>

              <div className="space-y-2">
                {poForm.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-white/5 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                  >
                    <div className="sm:col-span-5 space-y-1">
                      <label className="text-[11px] font-semibold text-slate-500">
                        Pilih Varian Produk
                      </label>
                      <Select
                        value={String(item.variantId)}
                        onValueChange={(val) => handleItemChange(idx, 'variantId', val)}
                      >
                        <SelectTrigger className="rounded-xl border-slate-200 text-xs">
                          <SelectValue placeholder="Pilih produk..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {allVariants.map(({ variant, product }) => (
                            <SelectItem key={variant.id} value={String(variant.id)}>
                              {product.name} - {variant.sku} {variant.size ? `(${variant.size})` : ''} [Stok: {variant.stock || 0}]
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[11px] font-semibold text-slate-500">
                        Kuantitas (Pcs)
                      </label>
                      <Input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                        className="rounded-xl border-slate-200 text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[11px] font-semibold text-slate-500">
                        Harga Beli Satuan (Rp)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        required
                        value={item.unitCost}
                        onChange={(e) => handleItemChange(idx, 'unitCost', Number(e.target.value))}
                        className="rounded-xl border-slate-200 text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[11px] font-semibold text-slate-500">Subtotal</label>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 py-2">
                        {formatRupiah(item.quantity * item.unitCost)}
                      </div>
                    </div>

                    <div className="sm:col-span-1 flex justify-end">
                      {poForm.items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="h-8 w-8 text-rose-500 hover:text-rose-600 rounded-xl"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-white/5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500">Ongkos Kirim (Rp)</label>
                  <Input
                    type="number"
                    min="0"
                    value={poForm.shippingCost}
                    onChange={(e) => setPoForm({ ...poForm, shippingCost: Number(e.target.value) })}
                    className="rounded-xl border-slate-200 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500">Pajak / PPN (Rp)</label>
                  <Input
                    type="number"
                    min="0"
                    value={poForm.taxAmount}
                    onChange={(e) => setPoForm({ ...poForm, taxAmount: Number(e.target.value) })}
                    className="rounded-xl border-slate-200 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500">Potongan / Diskon (Rp)</label>
                  <Input
                    type="number"
                    min="0"
                    value={poForm.discountAmount}
                    onChange={(e) => setPoForm({ ...poForm, discountAmount: Number(e.target.value) })}
                    className="rounded-xl border-slate-200 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Total Nilai PO
                  </label>
                  <div className="text-lg font-bold text-pink-600 dark:text-pink-400 py-1">
                    {formatRupiah(calculateTotal())}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl font-semibold"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingPO}
                className="rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold shadow-md shadow-pink-600/20"
              >
                {isSubmittingPO ? 'Memproses PO...' : 'Simpan & Terbitkan PO'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* QUICK GOODS RECEIPT MODAL */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-emerald-600" />
              Penerimaan Barang Masuk (Goods Receipt)
            </DialogTitle>
          </DialogHeader>

          {selectedPO && (
            <form onSubmit={handleSubmitReceipt} className="space-y-4 pt-2">
              <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex flex-wrap justify-between items-center text-xs gap-2">
                <div>
                  <span className="text-slate-500">Nomor PO:</span>{' '}
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPO.poNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500">Supplier:</span>{' '}
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPO.supplierName}</span>
                </div>
                <div>
                  <span className="text-slate-500">Total Dipesan:</span>{' '}
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPO.totalOrderedQty} Pcs</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    No. Surat Jalan Supplier <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    value={receiptForm.doNumber}
                    onChange={(e) => setReceiptForm({ ...receiptForm, doNumber: e.target.value })}
                    placeholder="Contoh: SJ-2026/10/008"
                    className="rounded-xl border-slate-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tanggal Diterima di Gudang <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="date"
                    required
                    value={receiptForm.receiptDate}
                    onChange={(e) => setReceiptForm({ ...receiptForm, receiptDate: e.target.value })}
                    className="rounded-xl border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Verifikasi Kuantitas Fisik Barang Masuk
                </h4>

                <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-500">
                      <tr>
                        <th className="p-3">Produk & Varian</th>
                        <th className="p-3 text-center">Dipesan</th>
                        <th className="p-3 text-center">Masuk</th>
                        <th className="p-3 text-center">Sisa</th>
                        <th className="p-3 w-32">Qty Diterima</th>
                        <th className="p-3 w-28">Qty Ditolak</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {receiptForm.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-3">
                            <div className="font-bold text-slate-800 dark:text-slate-200">{item.productName}</div>
                            <div className="font-mono text-slate-400 text-[11px]">{item.sku}</div>
                          </td>
                          <td className="p-3 text-center font-semibold text-slate-600">{item.orderedQty}</td>
                          <td className="p-3 text-center font-semibold text-emerald-600">{item.receivedSoFar}</td>
                          <td className="p-3 text-center font-bold text-amber-600">{item.remainingQty}</td>
                          <td className="p-3">
                            <Input
                              type="number"
                              min="0"
                              max={item.remainingQty}
                              value={item.quantityReceived}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setReceiptForm((prev) => {
                                  const updated = [...prev.items];
                                  updated[idx].quantityReceived = val;
                                  return { ...prev, items: updated };
                                });
                              }}
                              className="rounded-xl border-slate-200 h-8 text-xs font-bold"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              min="0"
                              value={item.quantityRejected}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setReceiptForm((prev) => {
                                  const updated = [...prev.items];
                                  updated[idx].quantityRejected = val;
                                  return { ...prev, items: updated };
                                });
                              }}
                              placeholder="0"
                              className="rounded-xl border-slate-200 h-8 text-xs"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Catatan Penerimaan / Kondisi Barang
                </label>
                <Textarea
                  rows={2}
                  value={receiptForm.notes}
                  onChange={(e) => setReceiptForm({ ...receiptForm, notes: e.target.value })}
                  placeholder="Kondisi kemasan rapi, lolos QC awal, atau ada item rusak..."
                  className="rounded-xl border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60">
                <input
                  type="checkbox"
                  id="updateCostPrice"
                  checked={receiptForm.updateCostPrice}
                  onChange={(e) => setReceiptForm({ ...receiptForm, updateCostPrice: e.target.checked })}
                  className="rounded border-slate-300 text-pink-600 focus:ring-pink-500 h-4 w-4"
                />
                <label htmlFor="updateCostPrice" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  Perbarui harga modal produk (Cost Price) varian dengan harga beli di PO ini
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsReceiptOpen(false)}
                  className="rounded-xl font-semibold"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingReceipt}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/20"
                >
                  {isSubmittingReceipt ? 'Menyimpan & Mutasi Stok...' : 'Konfirmasi Penerimaan Barang'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
