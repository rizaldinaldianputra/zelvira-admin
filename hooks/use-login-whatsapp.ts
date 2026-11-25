'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth.service';

export function useLoginWhatsapp() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      toast({ title: 'Error', description: 'Silakan masukkan nomor WhatsApp Anda', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      await authService.requestOtp(cleanPhone);
      setStep('OTP');
      setCountdown(60);
      toast({ 
        title: 'OTP Terkirim!', 
        description: 'Silakan cek pesan WhatsApp Anda untuk kode verifikasi.',
      });
    } catch (err: any) {
      toast({ 
        title: 'Gagal Mengirim OTP', 
        description: err?.response?.data?.message || 'Pastikan nomor WhatsApp Anda benar.',
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      toast({ title: 'Error', description: 'Masukkan 6 digit kode OTP', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      const res = await authService.loginWithOtp(cleanPhone, otpCode);
      toast({ title: 'Berhasil!', description: `Selamat datang kembali, ${res.fullName}` });
      
      if (res.roles.includes('ROLE_ADMIN')) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      toast({ 
        title: 'Verifikasi Gagal', 
        description: err?.response?.data?.message || 'Kode OTP salah atau sudah kedaluwarsa.',
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    step,
    setStep,
    phoneNumber,
    setPhoneNumber,
    otpCode,
    setOtpCode,
    isLoading,
    countdown,
    handleRequestOtp,
    handleVerifyOtp,
  };
}
