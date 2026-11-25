'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PrivacyPolicyService, PrivacyPolicy } from '@/services/privacy.service';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const privacySchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter'),
  content: z.string().min(10, 'Konten kebijakan minimal 10 karakter'),
  isActive: z.boolean().default(true),
});

export type PrivacyFormValues = z.infer<typeof privacySchema>;

export const DEFAULT_PRIVACY_TEMPLATE = `<h2>Komitmen Perlindungan Privasi Zelvira</h2>
<p>Privasi Anda adalah prioritas utama kami di <strong>Zelvira</strong>. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi Anda saat menggunakan layanan website dan aplikasi mobile kami.</p>

<h3>1. Data yang Kami Kumpulkan</h3>
<p>Kami mengumpulkan data yang Anda berikan secara langsung saat mendaftar akun atau melakukan transaksi:</p>
<ul>
  <li><strong>Informasi Akun:</strong> Nama lengkap, alamat email, nomor telepon/WhatsApp, dan kata sandi terenkripsi.</li>
  <li><strong>Informasi Pengiriman:</strong> Alamat tujuan pengantaran, nama penerima, nomor kontak aktif, dan catatan khusus pengiriman.</li>
  <li><strong>Informasi Transaksi:</strong> Riwayat pembelian, metode pembayaran, invoice, dan status pesanan.</li>
</ul>

<h3>2. Penggunaan Informasi Pribadi</h3>
<p>Data Anda kami gunakan semata-mata untuk kepentingan operasional dan kenyamanan berbelanja:</p>
<ul>
  <li>Memproses pembayaran, pengemasan produk, dan pengiriman pesanan ke alamat Anda.</li>
  <li>Mengirimkan konfirmasi transaksi, pembaruan status nomor resi pengiriman, dan pemberitahuan penting.</li>
  <li>Memberikan respon dan bantuan cepat melalui Customer Service Zelvira.</li>
  <li>Menyediakan program promo khusus, voucher diskon, dan rekomendasi produk yang relevan.</li>
</ul>

<h3>3. Kerahasiaan Data & Pihak Ketiga</h3>
<p><strong>Zelvira tidak pernah dan tidak akan pernah menjual atau menyewakan informasi pribadi Anda kepada pihak manapun.</strong> Data hanya dibagikan kepada mitra operasional resmi:</p>
<ul>
  <li><strong>Mitra Ekspedisi Logistik:</strong> JNE, J&T, SiCepat, dll. untuk pengantaran barang ke alamat Anda.</li>
  <li><strong>Payment Gateway Berizin BI:</strong> Midtrans, Xendit, QRIS untuk pemrosesan pembayaran yang aman dan tersertifikasi PCI-DSS.</li>
</ul>

<h3>4. Keamanan Data</h3>
<p>Kami menerapkan standar enkripsi SSL/TLS tingkat tinggi dan sistem penyimpanan aman untuk melindungi data pribadi Anda dari akses tanpa izin, kebocoran, atau perubahan yang tidak sah.</p>

<h3>5. Hak Pengguna & Penghapusan Akun</h3>
<p>Anda berhak memperbarui data profil atau meminta penghapusan akun beserta seluruh riwayat data pribadi Anda kapan saja melalui menu Pengaturan Profil di aplikasi atau website Zelvira.</p>`;

export function useSupportPrivacyForm(id?: string) {
  const router = useRouter();
  const { toast } = useToast();
  const [currentPolicy, setCurrentPolicy] = useState<PrivacyPolicy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<PrivacyFormValues>({
    resolver: zodResolver(privacySchema) as any,
    defaultValues: {
      title: 'Kebijakan Privasi Zelvira',
      content: '',
      isActive: true,
    },
  });

  const loadPolicy = useCallback(async () => {
    try {
      setIsFetching(true);
      const data = (id && id !== 'singleton' && id !== 'new')
        ? await PrivacyPolicyService.getById(id)
        : await PrivacyPolicyService.getCurrent();

      if (data) {
        setCurrentPolicy(data);
        form.reset({
          title: data.title || 'Kebijakan Privasi Zelvira',
          content: data.content || DEFAULT_PRIVACY_TEMPLATE,
          isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        });
      } else {
        form.reset({
          title: 'Kebijakan Privasi Zelvira',
          content: DEFAULT_PRIVACY_TEMPLATE,
          isActive: true,
        });
      }
    } catch {
      toast({
        title: 'Peringatan',
        description: 'Gagal memuat dari server, menggunakan draf default.',
        variant: 'destructive',
      });
      form.reset({
        title: 'Kebijakan Privasi Zelvira',
        content: DEFAULT_PRIVACY_TEMPLATE,
        isActive: true,
      });
    } finally {
      setIsFetching(false);
    }
  }, [id, form, toast]);

  useEffect(() => {
    loadPolicy();
  }, [loadPolicy]);

  const onSubmit = async (data: PrivacyFormValues) => {
    setIsLoading(true);
    try {
      const payload: Partial<PrivacyPolicy> = {
        id: currentPolicy?.id,
        title: data.title.trim(),
        content: data.content,
        isActive: Boolean(data.isActive),
      };

      const saved = await PrivacyPolicyService.saveCurrent(payload);
      setCurrentPolicy(saved);
      form.reset({
        title: saved.title,
        content: saved.content || '',
        isActive: Boolean(saved.isActive),
      });

      toast({
        title: 'Berhasil Disimpan',
        description: 'Kebijakan privasi telah diperbarui dan langsung tersinkronkan ke Web & Mobile.',
      });
      router.refresh();
    } catch {
      toast({
        title: 'Gagal Menyimpan',
        description: 'Terjadi kesalahan saat menyimpan kebijakan privasi',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetToTemplate = () => {
    form.setValue('content', DEFAULT_PRIVACY_TEMPLATE, { shouldDirty: true });
    toast({
      title: 'Template Standar Dimuat',
      description: 'Silakan sesuaikan teks dan klik Simpan Perubahan.',
    });
  };

  return {
    form,
    currentPolicy,
    isLoading,
    isFetching,
    isNew: !currentPolicy?.id,
    onSubmit,
    loadPolicy,
    resetToTemplate,
  };
}
