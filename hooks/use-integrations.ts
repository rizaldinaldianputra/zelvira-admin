'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { DigiflazzService } from '@/services/digiflazz.service';
import { digitalProductService } from '@/services/digital-product.service';

export function useIntegrations() {
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [digiflazzBalance, setDigiflazzBalance] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  const handleConnect = async (marketplace: string) => {
    setIsConnecting(marketplace);
    try {
      const res = await fetch(`/api/marketplace/auth-url/${marketplace}`);
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          toast.success(`Redirecting to ${marketplace} authorization...`);
        }
      }
    } catch {
      toast.error(`Failed to connect to ${marketplace}`);
    } finally {
      setTimeout(() => setIsConnecting(null), 1000);
    }
  };

  const checkDigiflazzBalance = async () => {
    try {
      toast.loading('Checking balance...', { id: 'balance' });
      const res = await DigiflazzService.checkBalance();
      setDigiflazzBalance(res.deposit);
      toast.success(`Balance: Rp ${res.deposit.toLocaleString()}`, { id: 'balance' });
    } catch {
      toast.error('Failed to get Digiflazz balance', { id: 'balance' });
    }
  };

  const handleSyncProducts = async (type: 'prepaid' | 'pasca') => {
    setIsSyncing(type);
    toast.loading(`Syncing ${type} products...`, { id: 'sync' });
    try {
      await digitalProductService.syncProducts(type);
      toast.success(`Successfully triggered ${type} product sync`, { id: 'sync' });
    } catch {
      toast.error(`Failed to sync ${type} products`, { id: 'sync' });
    } finally {
      setIsSyncing(null);
    }
  };

  return {
    isConnecting,
    digiflazzBalance,
    isSyncing,
    handleConnect,
    checkDigiflazzBalance,
    handleSyncProducts,
  };
}
