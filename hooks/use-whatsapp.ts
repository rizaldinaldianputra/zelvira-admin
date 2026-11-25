'use client';

import { useState, useEffect, useCallback } from 'react';
import { whatsappService, WhatsAppStatus, SendTestOtpResult } from '@/services/whatsapp.service';
import { useToast } from '@/hooks/use-toast';

export function useWhatsapp() {
  const { toast } = useToast();
  const [statusData, setStatusData] = useState<WhatsAppStatus | null>(null);
  const [status, setStatus] = useState<string>('INITIALIZING');
  const [deviceNumber, setDeviceNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Zenziva Config state
  const [apiUrl, setApiUrl] = useState('https://console.zenziva.net/waofficial/api/sendWAOfficial/');
  const [userkey, setUserkey] = useState('4d5abda6cd03');
  const [passkey, setPasskey] = useState('3a008c4d87001c6aa7d0b4b3');
  const [brand, setBrand] = useState('Zelvira');

  // Test OTP state
  const [testPhone, setTestPhone] = useState<string | undefined>();
  const [testOtp, setTestOtp] = useState<string>('865978');
  const [isSending, setIsSending] = useState(false);
  const [testResult, setTestResult] = useState<SendTestOtpResult | null>(null);

  const generateRandomOtp = useCallback(() => {
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setTestOtp(randomCode);
    return randomCode;
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await whatsappService.getStatus();
      setStatusData(data);
      setStatus(data.status || 'READY');
      setDeviceNumber(data.deviceNumber || 'Official WhatsApp Business API');
      if (data.apiUrl) setApiUrl(data.apiUrl);
      if (data.rawUserkey) setUserkey(data.rawUserkey);
      if (data.brand) setBrand(data.brand);
    } catch (error) {
      console.error('Failed to fetch WhatsApp status', error);
      setStatus('OFFLINE');
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    generateRandomOtp();
  }, [fetchStatus, generateRandomOtp]);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const updated = await whatsappService.updateConfig({
        apiUrl,
        userkey,
        passkey,
        brand,
      });
      setStatusData(updated);
      toast({
        title: 'Konfigurasi Tersimpan',
        description: 'Kredensial WhatsApp Official Zenziva berhasil diperbarui.',
      });
    } catch (error: any) {
      toast({
        title: 'Gagal Menyimpan',
        description: error?.response?.data?.message || error?.message || 'Gagal menyimpan konfigurasi.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testPhone) {
      toast({
        title: 'Nomor Ponsel Kosong',
        description: 'Silakan masukkan nomor WhatsApp tujuan pengujian.',
        variant: 'destructive',
      });
      return;
    }

    const currentOtp = testOtp || generateRandomOtp();
    setIsSending(true);
    setTestResult(null);

    try {
      const cleanPhone = testPhone.replace(/[^0-9]/g, '');
      const result = await whatsappService.sendTestOtp(cleanPhone, currentOtp, brand);
      setTestResult(result);

      if (result.success || result.status === '1') {
        toast({
          title: 'OTP WhatsApp Terkirim! 🎉',
          description: `Pesan OTP resmi berhasil dikirim ke +${cleanPhone}. Status: ${result.text || 'Success'}`,
        });
      } else {
        toast({
          title: 'Pengiriman Gagal',
          description: result.text || 'Zenziva API mengembalikan respon gagal.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || error?.message || 'Gagal mengirim pesan pengujian via Zenziva.';
      setTestResult({
        success: false,
        text: errMsg,
      });
      toast({
        title: 'Gagal Terhubung',
        description: errMsg,
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  // Compatibility helpers
  const handleLogout = async () => {
    toast({
      title: 'Info',
      description: 'Zenziva Official API adalah gateway HTTP stateless, tidak memerlukan logout sesi.',
    });
  };

  const fetchQr = async () => {};

  return {
    statusData,
    status,
    deviceNumber,
    apiUrl,
    setApiUrl,
    userkey,
    setUserkey,
    passkey,
    setPasskey,
    brand,
    setBrand,
    isLoading,
    isSaving,
    testPhone,
    setTestPhone,
    testOtp,
    setTestOtp,
    isSending,
    testResult,
    generateRandomOtp,
    handleSaveConfig,
    handleSendTest,
    fetchStatus,
    // Legacy compatibility fields
    qrUrl: null,
    qrLoading: false,
    handleLogout,
    fetchQr,
  };
}
