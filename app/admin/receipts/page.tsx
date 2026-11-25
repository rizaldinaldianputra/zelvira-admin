'use client';

import React from 'react';
import Link from 'next/link';
import { PackageCheck, FileText, CheckCircle2, Boxes } from 'lucide-react';
import { CrudTable } from '@/components/admin/crud-table';
import { useReceipts } from '@/hooks/use-receipts';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const formatRupiah = (val?: number) => {
  if (!val) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
};

export default function GoodsReceiptsPage() {
  const {
    receipts,
    isLoading,
    columns,
    selectedReceipt,
    isDetailOpen,
    setIsDetailOpen,
    handleAdd,
    handleView,
  } = useReceipts();

  const totalReceivedPcs = receipts.reduce((sum, r) => sum + (r.totalReceivedQty || 0), 0);
  const totalRejectedPcs = receipts.reduce((sum, r) => sum + (r.totalRejectedQty || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
            <PackageCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              Goods Receipts (Penerimaan Barang)
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Riwayat dokumen tanda terima barang masuk ke gudang dari supplier dan mutasi inventaris.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/purchases">
            <Button variant="outline" className="rounded-2xl border-slate-200 font-bold gap-2 text-xs uppercase">
              <FileText className="h-4 w-4 text-pink-600" /> Buka Purchase Orders
            </Button>
          </Link>
          <Button
            onClick={handleAdd}
            className="rounded-2xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold gap-2 text-xs uppercase shadow-sm"
          >
            <PackageCheck className="h-4 w-4" /> Buat Penerimaan (GR)
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Surat Penerimaan
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {receipts.length} Dokumen
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
              Barang Diterima (Lolos QC)
            </p>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              +{totalReceivedPcs} Pcs
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider">
              Barang Ditolak (Reject)
            </p>
            <h3 className="text-2xl font-bold text-rose-500 mt-0.5">
              {totalRejectedPcs} Pcs
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-500">
            <Boxes className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Crud Table */}
      <CrudTable
        data={receipts}
        columns={columns}
        searchKey="receipts"
        onView={handleView}
        isLoading={isLoading}
      />

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-emerald-600" />
              Bukti Penerimaan Barang #{selectedReceipt?.receiptNumber}
            </DialogTitle>
          </DialogHeader>

          {selectedReceipt && (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Tanggal Terima</span>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {selectedReceipt.receiptDate}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">No. Surat Jalan</span>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {selectedReceipt.doNumber || '-'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Supplier</span>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {selectedReceipt.supplierName}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Penerima</span>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {selectedReceipt.receivedBy || 'Staff Gudang'}
                  </div>
                </div>
              </div>

              {selectedReceipt.notes && (
                <div className="text-xs text-slate-600 dark:text-slate-400 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Catatan:</span>{' '}
                  {selectedReceipt.notes}
                </div>
              )}

              {/* Items Table */}
              <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-500">
                    <tr>
                      <th className="p-3">Produk & Varian</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3 text-center">Kuantitas Masuk</th>
                      <th className="p-3 text-center">Ditolak</th>
                      <th className="p-3 text-right">Harga Beli Satuan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {selectedReceipt.items.map((item) => (
                      <tr key={item.id}>
                        <td className="p-3">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{item.productName}</div>
                          <div className="text-slate-400 text-[11px]">
                            {item.size && `Ukuran: ${item.size} `}
                            {item.color && `• Warna: ${item.color}`}
                          </div>
                        </td>
                        <td className="p-3 font-mono font-medium text-slate-500">{item.sku}</td>
                        <td className="p-3 text-center font-bold text-emerald-600">
                          +{item.quantityReceived} Pcs
                        </td>
                        <td className="p-3 text-center font-medium text-rose-500">
                          {item.quantityRejected > 0 ? `${item.quantityRejected} Pcs` : '-'}
                        </td>
                        <td className="p-3 text-right font-medium text-slate-700 dark:text-slate-300">
                          {formatRupiah(item.unitCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailOpen(false)}
                  className="rounded-xl font-semibold"
                >
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
