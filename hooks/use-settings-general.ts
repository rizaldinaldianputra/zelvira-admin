'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export function useSettingsGeneral() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    googleAnalyticsId: 'G-XXXXXXXXXX',
    fcmServerKey: 'AAAA...',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    settings,
    setSettings,
    handleSave,
  };
}
