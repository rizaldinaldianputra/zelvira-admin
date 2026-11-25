'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CrudForm } from '@/components/admin/crud-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SupplierService } from '@/services/supplier.service';
import { useToast } from '@/hooks/use-toast';
import { Building2, User, Phone, Mail, MapPin, CreditCard, Clock, FileText } from 'lucide-react';

export default function NewSupplierPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    picName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    taxNumber: '',
    paymentTerm: 'NET30',
    bankName: '',
    bankAccountNumber: '',
    bankAccountHolder: '',
    notes: '',
    isActive: true,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: 'Validasi Gagal',
        description: 'Nama supplier wajib diisi.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        ...formData,
        code: formData.code.trim() || undefined,
      };
      await SupplierService.create(payload);
      toast({
        title: 'Berhasil',
        description: `Supplier "${formData.name}" berhasil ditambahkan.`,
      });
      router.push('/admin/suppliers');
    } catch (error: any) {
      toast({
        title: 'Gagal Menyimpan',
        description: error?.message || 'Terjadi kesalahan saat menambahkan supplier.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CrudForm
      title="Tambah Supplier Baru"
      subtitle="Input profil mitra supplier, informasi kontak, termin pembayaran, dan rekening bank"
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitLabel="Simpan Supplier"
      maxWidth="max-w-5xl"
    >
      <div className="space-y-8">
        {/* Section 1: Profil Supplier */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-white/10">
            <Building2 className="w-5 h-5 text-pink-600" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Profil Supplier &amp; PIC
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


            <div>
              <label className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300 block mb-2">
                Nama Supplier / Perusahaan <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. PT Textile Indah Jaya / CV Busana Mandiri"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="rounded-xl border-slate-200"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300 block mb-2">
                Nama Kontak PIC
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="e.g. Ibu Dewi / Pak Rudi"
                  value={formData.picName}
                  onChange={(e) => handleChange('picName', e.target.value)}
                  className="rounded-xl border-slate-200 pl-9"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300 block mb-2">
                Nomor Telepon / WhatsApp
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="08123456789"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="rounded-xl border-slate-200 pl-9"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300 block mb-2">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  placeholder="order@supplier.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="rounded-xl border-slate-200 pl-9"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Alamat & Lokasi */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-white/10">
            <MapPin className="w-5 h-5 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Alamat Gudang / Kantor
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300 block mb-2">
                Alamat Lengkap
              </label>
              <Textarea
                placeholder="Jl. Raya Industri No. 45, Kawasan Pergudangan Blok B"
                rows={2}
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300 block mb-2">
                Kota / Kabupaten
              </label>
              <Input
                placeholder="Bandung / Jakarta Barat"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="rounded-xl border-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300 block mb-2">
                Kode Pos
              </label>
              <Input
                placeholder="40123"
                value={formData.postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
                className="rounded-xl border-slate-200"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300 block mb-2">
                NPWP Perusahaan
              </label>
              <Input
                placeholder="01.234.567.8-901.000"
                value={formData.taxNumber}
                onChange={(e) => handleChange('taxNumber', e.target.value)}
                className="rounded-xl border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Termin & Informasi Keuangan */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-white/10">
            <CreditCard className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Termin Pembayaran &amp; Rekening Bank
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300 block mb-2">
                Termin Pembayaran (Term of Payment)
              </label>
              <Select
                value={formData.paymentTerm}
                onValueChange={(val) => handleChange('paymentTerm', val)}
              >
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="Pilih Termin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">CASH (Bayar di Muka / Tunai)</SelectItem>
                  <SelectItem value="COD">COD (Cash on Delivery)</SelectItem>
                  <SelectItem value="NET7">NET 7 (Jatuh Tempo 7 Hari)</SelectItem>
                  <SelectItem value="NET14">NET 14 (Jatuh Tempo 14 Hari)</SelectItem>
                  <SelectItem value="NET30">NET 30 (Jatuh Tempo 30 Hari)</SelectItem>
                  <SelectItem value="NET60">NET 60 (Jatuh Tempo 60 Hari)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300 block mb-2">
                Nama Bank
              </label>
              <Input
                placeholder="BCA / Mandiri / BNI / BRI"
                value={formData.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
                className="rounded-xl border-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300 block mb-2">
                Nomor Rekening
              </label>
              <Input
                placeholder="1234567890"
                value={formData.bankAccountNumber}
                onChange={(e) => handleChange('bankAccountNumber', e.target.value)}
                className="rounded-xl border-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300 block mb-2">
                Nama Pemilik Rekening
              </label>
              <Input
                placeholder="PT Textile Indah Jaya"
                value={formData.bankAccountHolder}
                onChange={(e) => handleChange('bankAccountHolder', e.target.value)}
                className="rounded-xl border-slate-200"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300 block mb-2">
                Catatan Tambahan
              </label>
              <Input
                placeholder="Syarat pengiriman, PIC khusus, minimum order, dsb."
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="rounded-xl border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Status */}
        <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between rounded-2xl border border-slate-200 dark:border-white/10 p-5 bg-slate-50/50 dark:bg-slate-800/20">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Status Kemitraan Supplier</h4>
            <p className="text-xs text-slate-500">
              Supplier aktif dapat dipilih saat pembuatan Purchase Order (PO) dan Penerimaan Barang (GR).
            </p>
          </div>
          <Switch
            checked={formData.isActive}
            onCheckedChange={(checked) => handleChange('isActive', checked)}
          />
        </div>
      </div>
    </CrudForm>
  );
}
