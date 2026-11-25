import { useState } from 'react';
import { toast } from 'sonner';
import { Product } from '@/types/product';
import { MarketplaceService } from '@/services/marketplace.service';

export function usePushMarketplace(product: Product | null, onClose: () => void) {
  const [isPushing, setIsPushing] = useState<string | null>(null);

  const handlePush = async (marketplace: string) => {
    if (!product) return;
    
    try {
      setIsPushing(marketplace);
      const res = await MarketplaceService.pushProduct(marketplace, product.id);
      toast.success(res?.message || `Produk "${product.name}" berhasil diproses ke ${marketplace.toUpperCase()}!`);
      setTimeout(() => {
        onClose();
        setIsPushing(null);
      }, 1000);
    } catch (error: any) {
      toast.error(error?.message || `Gagal melakukan push ke ${marketplace}`);
      setIsPushing(null);
    }
  };

  return {
    isPushing,
    handlePush,
  };
}
