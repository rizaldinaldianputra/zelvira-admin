'use client';

import React, { useState, useEffect } from 'react';
import { Store, Building2, CheckCircle2, XCircle } from 'lucide-react';
import { CrudTable } from '@/components/admin/crud-table';
import { useSuppliers } from '@/hooks/use-suppliers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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
import { SupplierService } from '@/services/supplier.service';

export default function SuppliersPage() {
  const {
    suppliers,
    stats,
    isLoading,
    columns,
    isDialogOpen,
    setIsDialogOpen,
    editingSupplier,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
    fetchSuppliers,
  } = useSuppliers();

  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    picName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    bankName: '',
    bankAccountNumber: '',
    bankAccountHolder: '',
    paymentTerm: 'CASH',
    notes: '',
    isActive: true,
  });

  useEffect(() => {
    if (editingSupplier) {
      setFormData({
        code: editingSupplier.code || '',
        name: editingSupplier.name || '',
        picName: editingSupplier.picName || '',
        phone: editingSupplier.phone || '',
        email: editingSupplier.email || '',
        address: editingSupplier.address || '',
        city: editingSupplier.city || '',
        bankName: editingSupplier.bankName || '',
        bankAccountNumber: editingSupplier.bankAccountNumber || '',
        bankAccountHolder: editingSupplier.bankAccountHolder || '',
        paymentTerm: editingSupplier.paymentTerm || 'CASH',
        notes: editingSupplier.notes || '',
        isActive: editingSupplier.isActive ?? true,
      });
    } else {
      setFormData({
        code: '',
        name: '',
        picName: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        bankName: '',
        bankAccountNumber: '',
        bankAccountHolder: '',
        paymentTerm: 'CASH',
        notes: '',
        isActive: true,
      });
    }
  }, [editingSupplier, isDialogOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ title: 'Validasi', description: 'Nama supplier wajib diisi.', variant: 'destructive' });
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingSupplier) {
        await SupplierService.update(editingSupplier.id, formData);
        toast({ title: 'Sukses', description: `Supplier ${formData.name} berhasil diperbarui.` });
      } else {
        await SupplierService.create(formData);
        toast({ title: 'Sukses', description: `Supplier ${formData.name} berhasil ditambahkan.` });
      }
      setIsDialogOpen(false);
      fetchSuppliers();
    } catch (error: any) {
      toast({
        title: 'Gagal Menyimpan',
        description: error?.message || 'Terjadi kesalahan saat menyimpan data supplier.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              Suppliers & Pemasok
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Kelola daftar rekanan supplier, PIC, termin pembayaran, serta rekening transaksi pengadaan.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Supplier</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.total}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
            <Building2 className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Aktif</p>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.active}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Nonaktif</p>
            <h3 className="text-2xl font-bold text-slate-400 mt-0.5">{stats.inactive}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <XCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Crud Table */}
      <CrudTable
        data={suppliers}
        columns={columns}
        searchKey="suppliers"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
      />

      {/* Dialog Form for Add & Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Store className="h-5 w-5 text-pink-600" />
              {editingSupplier ? 'Ubah Data Supplier' : 'Tambah Supplier Baru'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">


              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nama Supplier / Perusahaan <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="PT Zelvira Tekstil Makmur"
                  className="rounded-xl border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nama PIC
                </label>
                <Input
                  value={formData.picName}
                  onChange={(e) => setFormData({ ...formData, picName: e.target.value })}
                  placeholder="Ibu Sarah"
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Telepon / WA
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="08123456789"
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="supplier@domain.com"
                  className="rounded-xl border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Alamat</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Jl. Industri Raya No. 45"
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Kota</label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Bandung"
                  className="rounded-xl border-slate-200"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Informasi Rekening & Pembayaran
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Nama Bank
                  </label>
                  <Input
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="BCA / Mandiri / BNI"
                    className="rounded-xl border-slate-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Nomor Rekening
                  </label>
                  <Input
                    value={formData.bankAccountNumber}
                    onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                    placeholder="1234567890"
                    className="rounded-xl border-slate-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Atas Nama
                  </label>
                  <Input
                    value={formData.bankAccountHolder}
                    onChange={(e) => setFormData({ ...formData, bankAccountHolder: e.target.value })}
                    placeholder="PT Zelvira Tekstil"
                    className="rounded-xl border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Termin Pembayaran (Payment Term)
                </label>
                <Select
                  value={formData.paymentTerm}
                  onValueChange={(val) => setFormData({ ...formData, paymentTerm: val })}
                >
                  <SelectTrigger className="rounded-xl border-slate-200">
                    <SelectValue placeholder="Pilih Termin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">CASH (Bayar Tunai)</SelectItem>
                    <SelectItem value="NET_7">NET 7 Hari</SelectItem>
                    <SelectItem value="NET_14">NET 14 Hari</SelectItem>
                    <SelectItem value="NET_30">NET 30 Hari</SelectItem>
                    <SelectItem value="NET_60">NET 60 Hari</SelectItem>
                    <SelectItem value="TEMPO">TEMPO / Konsinyasi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Catatan</label>
              <Textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Catatan tambahan..."
                className="rounded-xl border-slate-200"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(val) => setFormData({ ...formData, isActive: val })}
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Supplier Aktif
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-xl font-semibold"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold shadow-md shadow-pink-600/20"
                >
                  {isSubmitting ? 'Menyimpan...' : editingSupplier ? 'Simpan Perubahan' : 'Tambah Supplier'}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
