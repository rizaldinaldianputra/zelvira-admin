'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { MobileSettingsService } from '@/services/mobile-settings.service';
import { MobileAppSetting } from '@/types/mobile-settings';

export function useSettingsMobile() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [settings, setSettings] = useState<MobileAppSetting>({
    latestVersion: '1.0.0',
    minVersion: '1.0.0',
    title: 'Pembaruan Aplikasi Tersedia',
    message: 'Versi terbaru aplikasi Zelvira telah tersedia. Dapatkan fitur terbaru dan pengalaman belanja terbaik.',
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.zelvira.ecommerce',
    forceUpdate: false,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setFetching(true);
        const data = await MobileSettingsService.get();
        if (data) {
          setSettings({
            id: data.id,
            latestVersion: data.latestVersion || '1.0.0',
            minVersion: data.minVersion || '1.0.0',
            title: data.title || 'Pembaruan Aplikasi Tersedia',
            message: data.message || 'Versi terbaru aplikasi Zelvira telah tersedia.',
            downloadUrl: data.downloadUrl || 'https://play.google.com/store/apps/details?id=com.zelvira.ecommerce',
            forceUpdate: Boolean(data.forceUpdate),
          });
        }
      } catch (error) {
        console.error('Failed to fetch mobile settings:', error);
      } finally {
        setFetching(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updated = await MobileSettingsService.update(settings);
      if (updated) {
        setSettings({
          id: updated.id,
          latestVersion: updated.latestVersion,
          minVersion: updated.minVersion,
          title: updated.title,
          message: updated.message,
          downloadUrl: updated.downloadUrl,
          forceUpdate: updated.forceUpdate,
        });
      }
      toast.success('Pengaturan versi aplikasi mobile berhasil disimpan!');
    } catch (err: any) {
      console.error('Save mobile settings error:', err);
      toast.error(err?.message || 'Gagal menyimpan pengaturan aplikasi mobile');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetching,
    settings,
    setSettings,
    handleSave,
  };
}
