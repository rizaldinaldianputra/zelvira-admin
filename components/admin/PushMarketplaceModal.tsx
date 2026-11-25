'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product';
import { Store, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

import { usePushMarketplace } from '@/hooks/use-push-marketplace';

interface PushMarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export function PushMarketplaceModal({ isOpen, onClose, product }: PushMarketplaceModalProps) {
  const { isPushing, handlePush } = usePushMarketplace(product, onClose);

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Push to Marketplace</DialogTitle>
          <DialogDescription>
            Select a marketplace to sync "{product.name}" to.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            className="flex items-center justify-start gap-3 h-14"
            disabled={!!isPushing}
            onClick={() => handlePush('tiktok')}
          >
            <div className="bg-black text-white p-2 rounded-full">
              <Store className="h-4 w-4" />
            </div>
            <div className="text-left flex-1">
              <div className="font-bold">TikTok Shop</div>
              <div className="text-xs text-slate-500">Sync product data and stock</div>
            </div>
            {isPushing === 'tiktok' && <span className="text-xs animate-pulse">Pushing...</span>}
          </Button>

          <Button
            variant="outline"
            className="flex items-center justify-start gap-3 h-14"
            disabled={!!isPushing}
            onClick={() => handlePush('shopee')}
          >
            <div className="bg-orange-500 text-white p-2 rounded-full">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div className="text-left flex-1">
              <div className="font-bold">Shopee</div>
              <div className="text-xs text-slate-500">Sync product data and stock</div>
            </div>
            {isPushing === 'shopee' && <span className="text-xs animate-pulse">Pushing...</span>}
          </Button>

          <Button
            variant="outline"
            className="flex items-center justify-start gap-3 h-14"
            disabled={!!isPushing}
            onClick={() => handlePush('tokopedia')}
          >
            <div className="bg-green-500 text-white p-2 rounded-full">
              <Store className="h-4 w-4" />
            </div>
            <div className="text-left flex-1">
              <div className="font-bold">Tokopedia</div>
              <div className="text-xs text-slate-500">Sync product data and stock</div>
            </div>
            {isPushing === 'tokopedia' && <span className="text-xs animate-pulse">Pushing...</span>}
          </Button>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={!!isPushing}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
