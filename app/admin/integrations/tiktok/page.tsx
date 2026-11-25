'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Store,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  Key,
  ShieldCheck,
  Search,
  Sparkles,
  ShoppingBag,
  Edit3,
  Globe,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Upload,
  Image as ImageIcon,
  X,
  Crown,
  Package,
  Clock,
  Truck,
  Copy,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { MarketplaceService } from '@/services/marketplace.service';
import { TikTokShop } from '@/types/marketplace';
import { ProductService } from '@/services/product.service';
import { FileUploadService } from '@/services/file-upload.service';
import { Product } from '@/types/product';
import { formatImageUrl } from '@/lib/url-utils';

function extractSkuPrice(sku: any): number {
  if (!sku) return 0;
  if (typeof sku.price === 'number') return sku.price;
  if (typeof sku.price === 'string') {
    const num = parseFloat(sku.price.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  }
  if (typeof sku.price === 'object' && sku.price !== null) {
    const p = sku.price.amount ?? sku.price.sale_price ?? sku.price.price ?? sku.price.tax_exclusive_price;
    if (typeof p === 'number') return p;
    if (typeof p === 'string') {
      const num = parseFloat(p.replace(/[^0-9.]/g, ''));
      return isNaN(num) ? 0 : num;
    }
  }
  return 0;
}

function getCatalogImageUrl(p: any): string | null {
  if (!p) return null;
  let raw: any = p.thumbnailUrl || p.imageUrl;
  if (!raw && p.banners && p.banners.length > 0) {
    raw = p.banners[0];
  }
  if (!raw && p.images && p.images.length > 0) {
    const first = p.images[0];
    raw = typeof first === 'string' ? first : (first?.url || first?.imageUrl || null);
  }
  if (!raw && p.variants && p.variants.length > 0) {
    const vWithImg = p.variants.find((v: any) => v.imageUrl);
    if (vWithImg) raw = vWithImg.imageUrl;
  }
  if (!raw && p.img) {
    raw = p.img;
  }
  if (!raw || typeof raw !== 'string') return null;
  return formatImageUrl(raw);
}

function getTiktokImageUrl(p: any): string | null {
  if (!p) return null;
  let raw: any = p.image_url
    || (p.main_images && p.main_images.length > 0
      ? (p.main_images[0].urls?.[0] || p.main_images[0].thumb_urls?.[0] || p.main_images[0].url_list?.[0] || p.main_images[0].url || p.main_images[0].uri)
      : null)
    || (p.skus && p.skus.length > 0 && p.skus[0].sales_attributes
      ? p.skus[0].sales_attributes.find((a: any) => a.sku_img?.urls?.[0])?.sku_img?.urls?.[0]
      : null);

  if (!raw || typeof raw !== 'string') return null;
  if (raw.startsWith('tos-')) {
    return "https://p16-oec-va.ibyteimg.com/" + raw;
  }
  return formatImageUrl(raw);
}

interface TiktokPhotoItem {
  id: string;
  uri?: string;
  url: string;
}

function getTiktokAllImages(p: any): TiktokPhotoItem[] {
  if (!p) return [];
  const results: TiktokPhotoItem[] = [];
  const seenUrls = new Set<string>();

  if (p.main_images && Array.isArray(p.main_images) && p.main_images.length > 0) {
    p.main_images.forEach((item: any, idx: number) => {
      if (!item) return;
      let uri: string | undefined = undefined;
      let rawUrl = '';

      if (typeof item === 'string') {
        if (item.startsWith('tos-')) {
          uri = item;
          rawUrl = `https://p16-oec-va.ibyteimg.com/${item}`;
        } else {
          rawUrl = item;
        }
      } else if (typeof item === 'object') {
        if (item.uri && typeof item.uri === 'string') {
          uri = item.uri;
        }
        if (item.url && typeof item.url === 'string') {
          rawUrl = item.url;
        } else if (item.urls && Array.isArray(item.urls) && item.urls.length > 0) {
          rawUrl = item.urls[0];
        } else if (item.thumb_urls && Array.isArray(item.thumb_urls) && item.thumb_urls.length > 0) {
          rawUrl = item.thumb_urls[0];
        } else if (item.url_list && Array.isArray(item.url_list) && item.url_list.length > 0) {
          rawUrl = item.url_list[0];
        } else if (uri) {
          rawUrl = uri.startsWith('http') ? uri : `https://p16-oec-va.ibyteimg.com/${uri}`;
        }
      }

      const formatted = rawUrl.startsWith('tos-')
        ? `https://p16-oec-va.ibyteimg.com/${rawUrl}`
        : formatImageUrl(rawUrl);

      if (formatted && !seenUrls.has(formatted)) {
        seenUrls.add(formatted);
        results.push({
          id: `tt-${p.id || 'p'}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
          uri,
          url: formatted,
        });
      }
    });
  }

  // Fallback to single image if main_images was empty
  if (results.length === 0) {
    const single = getTiktokImageUrl(p);
    if (single) {
      results.push({
        id: `tt-${p.id || 'p'}-0`,
        uri: p.main_images?.[0]?.uri,
        url: single,
      });
    }
  }

  return results;
}

function ProductImageThumbnail({ src, alt }: { src?: string | null; alt: string }) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  if (!src || error) {
    return (
      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
        <ShoppingBag className="w-4 h-4 text-slate-400" />
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setError(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export default function TikTokManagementPage() {
  const [shops, setShops] = useState<TikTokShop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tiktokProducts, setTiktokProducts] = useState<any[]>([]);
  const [isLoadingShops, setIsLoadingShops] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingTiktokProducts, setIsLoadingTiktokProducts] = useState(false);
  const [isPushingId, setIsPushingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);
  const [showManualConnect, setShowManualConnect] = useState(false);
  const [appKey] = useState('6llmr75bjccch');
  const [isSyncingCipher, setIsSyncingCipher] = useState<string | null>(null);

  // Quick edit modal states
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editPhotos, setEditPhotos] = useState<TiktokPhotoItem[]>([]);
  const [originalPhotos, setOriginalPhotos] = useState<TiktokPhotoItem[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUpdatingRemote, setIsUpdatingRemote] = useState(false);
  const [isUpdatingStatusId, setIsUpdatingStatusId] = useState<string | null>(null);
  const editImageInputRef = useRef<HTMLInputElement>(null);

  // Bulk selection states
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [isBulkPushing, setIsBulkPushing] = useState(false);
  const [bulkPushProgress, setBulkPushProgress] = useState<{ current: number; total: number; currentName: string } | null>(null);

  const loadShops = async () => {
    setIsLoadingShops(true);
    try {
      const data = await MarketplaceService.getAuthorizedShops('tiktok');
      setShops(data || []);
    } catch (error: any) {
      console.warn('Could not load TikTok shops:', error);
      setShops([]);
    } finally {
      setIsLoadingShops(false);
    }
  };

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await ProductService.getAll(0, 20);
      const items = res?.content || (Array.isArray(res) ? res : []);
      setProducts(items);
    } catch (error) {
      console.warn('Could not load products:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const loadTiktokProducts = async () => {
    setIsLoadingTiktokProducts(true);
    try {
      const res = await MarketplaceService.getRemoteProducts('tiktok', 20);
      if (res?.products) {
        // Filter out DELETED products: only active and inactive should be shown
        const validProducts = res.products.filter((p: any) => {
          const status = (p.status || '').toUpperCase();
          return status !== 'DELETED' && !status.includes('DELETE');
        });
        setTiktokProducts(validProducts);
      } else {
        setTiktokProducts([]);
      }
    } catch (err: any) {
      console.warn('Could not load TikTok products:', err);
      setTiktokProducts([]);
    } finally {
      setIsLoadingTiktokProducts(false);
    }
  };

  // TikTok Orders & Stock Sync states
  const [tiktokOrders, setTiktokOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isSyncingOrders, setIsSyncingOrders] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [isDeductingOrderId, setIsDeductingOrderId] = useState<string | null>(null);
  const [isSyncingAllStocks, setIsSyncingAllStocks] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  const loadTiktokOrders = async (statusFilter?: string) => {
    setIsLoadingOrders(true);
    try {
      const filter = statusFilter !== undefined ? statusFilter : orderStatusFilter;
      const res = await MarketplaceService.getRemoteOrders(
        'tiktok',
        50,
        undefined,
        filter === 'ALL' ? undefined : filter
      );
      if (res?.orders) {
        setTiktokOrders(res.orders);
      }
    } catch (error) {
      console.warn('Could not load TikTok orders:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleSyncOrdersAndDeductStock = async () => {
    setIsSyncingOrders(true);
    try {
      const res = await MarketplaceService.syncRemoteOrders('tiktok');
      toast.success(res.message || 'Sinkronisasi pesanan TikTok dan potong stok berhasil!');
      await loadTiktokOrders();
      await loadProducts(); // Refresh master products stock
    } catch (err: any) {
      toast.error(err.message || 'Gagal sinkronisasi pesanan TikTok');
    } finally {
      setIsSyncingOrders(false);
    }
  };

  const handleDeductOrderStockManual = async (orderId: string) => {
    setIsDeductingOrderId(orderId);
    try {
      const res = await MarketplaceService.deductStockForOrder('tiktok', orderId);
      toast.success(res.message || 'Stok berhasil dipotong untuk pesanan ini');
      await loadTiktokOrders();
      await loadProducts();
    } catch (err: any) {
      toast.error(err.message || 'Gagal memotong stok pesanan');
    } finally {
      setIsDeductingOrderId(null);
    }
  };

  const handleSyncAllStocksToTiktok = async () => {
    setIsSyncingAllStocks(true);
    try {
      const res = await MarketplaceService.syncAllProductStocks('tiktok');
      toast.success(res.message || 'Semua stok master berhasil disinkronkan ke TikTok Shop');
    } catch (err: any) {
      toast.error(err.message || 'Gagal sinkronisasi stok ke TikTok Shop');
    } finally {
      setIsSyncingAllStocks(false);
    }
  };

  const handleCopyOrderId = (orderId: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(orderId);
      setCopiedOrderId(orderId);
      toast.success('ID Pesanan disalin ke clipboard');
      setTimeout(() => setCopiedOrderId(null), 2000);
    }
  };

  useEffect(() => {
    loadShops();
    loadProducts();
    loadTiktokProducts();
    loadTiktokOrders();
  }, []);

  const handleOpenEdit = (p: any) => {
    const allImgs = getTiktokAllImages(p);
    setEditingProduct(p);
    setEditTitle(p.title || '');
    setEditPhotos(allImgs);
    setOriginalPhotos([...allImgs]);
    const firstSku = p.skus?.[0];
    const priceNum = extractSkuPrice(firstSku);
    setEditPrice(priceNum > 0 ? String(priceNum) : (firstSku?.price ? String(firstSku.price) : ''));
    setEditStock(firstSku?.quantity !== undefined ? String(firstSku.quantity) : '10');
  };

  const handleDirectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (editPhotos.length + files.length > 9) {
      toast.error('Maksimal 9 foto untuk satu produk di TikTok Shop');
      return;
    }

    setIsUploadingImage(true);
    try {
      toast.loading(`Mengupload ${files.length} foto ke TikTok Shop...`, { id: 'upload-tiktok-img' });

      const newUploadedItems: TiktokPhotoItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let uri: string | undefined = undefined;
        let url: string = '';

        try {
          const res = await MarketplaceService.uploadImage('tiktok', file);
          if (res && (res.uri || res.url)) {
            uri = res.uri;
            url = res.url || (res.uri ? `https://p16-oec-va.ibyteimg.com/${res.uri}` : '');
          }
        } catch (apiErr) {
          console.warn('Direct TikTok upload failed, fallback to file upload service...', apiErr);
        }

        if (!url) {
          url = await FileUploadService.upload(file);
        }

        newUploadedItems.push({
          id: `new-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
          uri,
          url,
        });
      }

      setEditPhotos((prev) => [...prev, ...newUploadedItems]);
      toast.success(`${newUploadedItems.length} foto berhasil ditambahkan!`, { id: 'upload-tiktok-img' });
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengupload foto', { id: 'upload-tiktok-img' });
    } finally {
      setIsUploadingImage(false);
      if (editImageInputRef.current) {
        editImageInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    if (editPhotos.length <= 1) {
      toast.error('TikTok Shop memerlukan minimal 1 foto produk');
      return;
    }
    setEditPhotos((prev) => prev.filter((_, idx) => idx !== index));
    toast.info('Foto dihapus dari daftar. Klik "Simpan ke TikTok Shop" untuk memperbarui.');
  };

  const handleSetPrimaryPhoto = (index: number) => {
    if (index === 0) return;
    setEditPhotos((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
    toast.success('Foto utama berhasil diubah!');
  };

  const handleResetPhotos = () => {
    setEditPhotos([...originalPhotos]);
    toast.info('Foto dikembalikan ke foto awal TikTok');
  };

  const handleSaveRemoteEdit = async () => {
    if (!editingProduct) return;
    if (editPhotos.length === 0) {
      toast.error('Minimal harus ada 1 foto produk di TikTok Shop');
      return;
    }

    setIsUpdatingRemote(true);
    try {
      toast.loading('Menyimpan perubahan ke TikTok Shop...', { id: 'remote-edit' });

      const payload: any = {};
      if (editTitle.trim()) {
        payload.title = editTitle.trim();
      }

      // Send the entire main_images array with both uri and url
      payload.main_images = editPhotos.map((item) => {
        if (item.uri && item.uri.trim()) {
          return { uri: item.uri.trim() };
        }
        return { url: item.url };
      });

      if (editingProduct.skus && editingProduct.skus.length > 0) {
        const skuId = editingProduct.skus[0].id;
        const skuItem: any = { id: skuId };
        if (editPrice) {
          skuItem.price = { amount: editPrice, currency: 'IDR' };
        }
        if (editStock) {
          const warehouseId = editingProduct.skus[0]?.warehouse_id;
          const invObj: any = { quantity: parseInt(editStock, 10) || 0 };
          if (warehouseId) {
            invObj.warehouse_id = warehouseId;
          }
          skuItem.inventory = [invObj];
        }
        payload.skus = [skuItem];
      }

      await MarketplaceService.updateRemoteProduct('tiktok', editingProduct.id, payload);
      toast.success('Produk di TikTok Shop berhasil diperbarui!', { id: 'remote-edit' });
      setEditingProduct(null);
      loadTiktokProducts();
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui produk di TikTok Shop', { id: 'remote-edit' });
    } finally {
      setIsUpdatingRemote(false);
    }
  };

  const handleConnectTikTok = async () => {
    try {
      toast.loading('Mempersiapkan link otorisasi TikTok Shop...', { id: 'tiktok-auth' });
      const res = await MarketplaceService.getAuthUrl('tiktok');
      toast.dismiss('tiktok-auth');
      if (res?.url) {
        window.location.href = res.url;
      } else {
        // Direct OAuth authorization URL using App Key
        window.location.href = `https://auth.tiktok-shops.com/oauth/authorize?app_key=${appKey}`;
      }
    } catch (error: any) {
      toast.dismiss('tiktok-auth');
      toast.error('Gagal mengambil URL otorisasi, mengalihkan langsung...');
      window.location.href = `https://auth.tiktok-shops.com/oauth/authorize?app_key=${appKey}`;
    }
  };

  const handleManualConnect = async () => {
    if (!manualCode.trim()) {
      toast.error('Masukkan Authorization Code terlebih dahulu');
      return;
    }
    setIsSubmittingCode(true);
    try {
      toast.loading('Menghubungkan toko via Authorization Code...', { id: 'manual-auth' });
      let codeToUse = manualCode.trim();
      // If user pasted a redirect URL (e.g. https://.../callback?code=xxx), parse it
      if (codeToUse.includes('code=')) {
        const match = codeToUse.match(/code=([^&]+)/);
        if (match) codeToUse = match[1];
      }
      await MarketplaceService.processCallback('tiktok', codeToUse);
      toast.success('Toko TikTok Shop berhasil dihubungkan!', { id: 'manual-auth' });
      setManualCode('');
      setShowManualConnect(false);
      loadShops();
    } catch (err: any) {
      toast.error(err.message || 'Gagal memproses kode otorisasi', { id: 'manual-auth' });
    } finally {
      setIsSubmittingCode(false);
    }
  };

  const handleDisconnect = async (shopId: string, shopName: string) => {
    if (!confirm(`Apakah Anda yakin ingin memutuskan koneksi toko "${shopName}"?`)) {
      return;
    }

    try {
      toast.loading('Memutuskan koneksi toko...', { id: 'disconnect' });
      await MarketplaceService.disconnectShop('tiktok', shopId);
      toast.success('Koneksi toko TikTok Shop berhasil diputuskan.', { id: 'disconnect' });
      loadShops();
    } catch (error: any) {
      toast.error('Gagal memutuskan koneksi toko', { id: 'disconnect' });
    }
  };

  const handlePushProduct = async (product: Product) => {
    if (shops.length === 0) {
      toast.error('Hubungkan toko TikTok terlebih dahulu sebelum melakukan push produk.');
      return;
    }

    try {
      setIsPushingId(product.id);
      toast.loading(`Sedang memproses sinkronisasi "${product.name}" ke TikTok Shop...`, { id: `push-${product.id}` });
      await MarketplaceService.pushProduct('tiktok', product.id);
      toast.success(`Produk "${product.name}" berhasil diproses ke katalog TikTok Shop!`, { id: `push-${product.id}` });
      await loadTiktokProducts();
    } catch (error: any) {
      toast.error(error.message || 'Gagal push produk ke TikTok Shop', { id: `push-${product.id}` });
    } finally {
      setIsPushingId(null);
    }
  };

  const handleSyncCipher = async (shopId: string) => {
    setIsSyncingCipher(shopId);
    try {
      toast.loading('Menghubungi TikTok Open API untuk sinkronisasi shop cipher...', { id: 'sync-cipher' });
      const res = await MarketplaceService.syncShopCipher('tiktok', shopId);
      toast.success(res.message || 'Shop cipher berhasil disinkronkan!', { id: 'sync-cipher' });
      await loadShops();
      await loadTiktokProducts();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyinkronkan cipher dari TikTok API', { id: 'sync-cipher' });
    } finally {
      setIsSyncingCipher(null);
    }
  };

  const handleActivateProduct = async (remoteProductId: string) => {
    setIsUpdatingStatusId(remoteProductId);
    try {
      toast.loading('Mengaktifkan produk di TikTok Shop...', { id: 'status-change' });
      const res = await MarketplaceService.activateRemoteProduct('tiktok', remoteProductId);
      if (res?.success) {
        toast.success(res.message || 'Produk berhasil diaktifkan!', { id: 'status-change' });
      } else {
        toast.error(res?.message || 'Gagal mengaktifkan produk', { id: 'status-change' });
      }
      await loadTiktokProducts();
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengaktifkan produk', { id: 'status-change' });
    } finally {
      setIsUpdatingStatusId(null);
    }
  };

  const handleDeactivateProduct = async (remoteProductId: string) => {
    setIsUpdatingStatusId(remoteProductId);
    try {
      toast.loading('Menonaktifkan produk di TikTok Shop...', { id: 'status-change' });
      const res = await MarketplaceService.deactivateRemoteProduct('tiktok', remoteProductId);
      if (res?.success) {
        toast.success(res.message || 'Produk berhasil dinonaktifkan!', { id: 'status-change' });
      } else {
        toast.error(res?.message || 'Gagal menonaktifkan produk', { id: 'status-change' });
      }
      await loadTiktokProducts();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menonaktifkan produk', { id: 'status-change' });
    } finally {
      setIsUpdatingStatusId(null);
    }
  };

  const handleDeleteRemoteProduct = async (remoteProductId: string, productTitle?: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus produk "${productTitle || remoteProductId}" dari TikTok Shop?`)) {
      return;
    }
    setIsUpdatingStatusId(remoteProductId);
    try {
      toast.loading('Menghapus produk dari TikTok Shop...', { id: 'delete-remote' });
      const res = await MarketplaceService.deleteRemoteProduct('tiktok', remoteProductId);
      if (res?.success) {
        toast.success(res.message || 'Produk berhasil dihapus dari TikTok Shop!', { id: 'delete-remote' });
        // Immediately remove from list state
        setTiktokProducts(prev => prev.filter(p => p.id !== remoteProductId));
      } else {
        toast.error(res?.message || 'Gagal menghapus produk', { id: 'delete-remote' });
      }
      await loadTiktokProducts();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus produk dari TikTok Shop', { id: 'delete-remote' });
    } finally {
      setIsUpdatingStatusId(null);
    }
  };

  const handleToggleSelectAll = () => {
    if (filteredProducts.length === 0) return;
    const allSelected = filteredProducts.every(p => selectedProductIds.includes(p.id));
    if (allSelected) {
      const filteredIdSet = new Set(filteredProducts.map(p => p.id));
      setSelectedProductIds(prev => prev.filter(id => !filteredIdSet.has(id)));
    } else {
      const newIds = new Set([...selectedProductIds, ...filteredProducts.map(p => p.id)]);
      setSelectedProductIds(Array.from(newIds));
    }
  };

  const handleToggleSelectProduct = (id: number) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkPushProducts = async () => {
    if (shops.length === 0) {
      toast.error('Hubungkan toko TikTok terlebih dahulu sebelum melakukan push produk.');
      return;
    }
    const productsToPush = products.filter(p => selectedProductIds.includes(p.id));
    if (productsToPush.length === 0) {
      toast.error('Pilih minimal 1 produk untuk di-push ke TikTok.');
      return;
    }

    setIsBulkPushing(true);
    let successCount = 0;
    let failCount = 0;
    const total = productsToPush.length;

    toast.loading(`Memulai push massal ${total} produk ke TikTok Shop...`, { id: 'bulk-push' });

    for (let i = 0; i < total; i++) {
      const p = productsToPush[i];
      setBulkPushProgress({ current: i + 1, total, currentName: p.name });
      toast.loading(`[${i + 1}/${total}] Sinkronisasi "${p.name}" ke TikTok Shop...`, { id: 'bulk-push' });

      try {
        await MarketplaceService.pushProduct('tiktok', p.id);
        successCount++;
      } catch (err: any) {
        failCount++;
        console.error(`Failed to push product ${p.name}:`, err);
      }
    }

    if (failCount === 0) {
      toast.success(`Berhasil push ${successCount} produk ke etalase TikTok Shop!`, { id: 'bulk-push' });
    } else {
      toast.warning(`Push selesai: ${successCount} berhasil, ${failCount} gagal.`, { id: 'bulk-push', duration: 5000 });
    }

    setSelectedProductIds([]);
    setIsBulkPushing(false);
    setBulkPushProgress(null);
    await loadTiktokProducts();
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/admin/integrations">
            <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-slate-500 hover:text-pink-600 rounded-full">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Kembali ke Integrasi
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                TikTok Shop Management
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Kelola otorisasi toko TikTok Shop Anda dan sinkronisasi push produk katalog Zelvira.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={loadShops}
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200"
            disabled={isLoadingShops}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoadingShops ? 'animate-spin' : ''}`} />
            Refresh
          </Button>



          <Button
            onClick={handleConnectTikTok}
            className="rounded-xl bg-black hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider shadow-md"
          >
            <Plus className="w-4 h-4 mr-1.5 text-pink-500" />
            Hubungkan Toko TikTok
          </Button>
        </div>
      </div>

      {/* Manual Auth Code Input Card (Collapsible) */}
      {showManualConnect && (
        <Card className="border-pink-200 bg-pink-50/40 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-pink-600" />
              Sambungkan Toko via Authorization Code Manual
            </CardTitle>
            <CardDescription className="text-xs text-slate-600">
              Jika Anda membuka link otorisasi langsung di tab browser lain atau dari TikTok Partner Center, paste URL callback atau parameter <code>code</code> di sini.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Paste code di sini, contoh: TTP_xxx atau URL https://.../callback?code=xxx"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="bg-white border-pink-200 rounded-xl text-xs font-mono"
              />
              <Button
                onClick={handleManualConnect}
                disabled={isSubmittingCode || !manualCode.trim()}
                className="bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-xl uppercase tracking-wider shrink-0"
              >
                {isSubmittingCode ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-1.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" />
                )}
                Verifikasi & Sambungkan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}



      {/* SECTION 1: TOKO SAYA (MY TIKTOK SHOPS) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-slate-700" />
            <h2 className="text-lg font-bold tracking-tight text-slate-800">
              Toko Saya (TikTok Shop)
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {shops.length} toko terotorisasi
          </span>
        </div>

        {isLoadingShops ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
            <RefreshCw className="w-6 h-6 animate-spin text-pink-500 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-medium">Memuat data toko TikTok...</p>
          </div>
        ) : shops.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Store className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">Belum Ada Toko TikTok yang Terhubung</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                Klik tombol di bawah untuk mengotorisasi akun TikTok Shop Seller Anda ke aplikasi partner Zelvira.
              </p>
              <Button
                onClick={handleConnectTikTok}
                className="bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-lg px-6 uppercase tracking-wider"
              >
                <Plus className="w-4 h-4 mr-2 text-pink-500" />
                Hubungkan Toko TikTok Sekarang
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shops.map((shop) => (
              <Card key={shop.id || shop.shopId} className="border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-pink-500 via-rose-500 to-black" />
                <CardHeader className="pb-3 pt-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm">
                        TT
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-slate-900">
                          {shop.shopName || 'Zelvira TikTok Store'}
                        </CardTitle>
                        <CardDescription className="text-xs font-mono text-slate-500">
                          ID: {shop.shopId}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Aktif
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 text-xs text-slate-600 border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Region:</span>
                      <span className="font-bold text-slate-800">{shop.region || 'ID - Indonesia 🇮🇩'}</span>
                    </div>
                    {shop.sellerName && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Seller:</span>
                        <span className="font-medium text-slate-800">{shop.sellerName}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400">Masa Token:</span>
                      <span className="font-medium text-emerald-600">Valid</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                      <span className="text-slate-400">Shop Cipher:</span>
                      {shop.shopCipher ? (
                        <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200" title={shop.shopCipher}>
                          {shop.shopCipher.length > 14 ? `${shop.shopCipher.substring(0, 12)}...` : shop.shopCipher}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Belum Sinkron
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      onClick={() => handleSyncCipher(shop.shopId)}
                      variant="outline"
                      size="sm"
                      disabled={isSyncingCipher === shop.shopId}
                      className="rounded-xl text-xs font-semibold border-slate-200 hover:border-pink-300 hover:bg-pink-50 text-slate-700"
                      title="Sinkronkan Shop Cipher dari TikTok API"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 mr-1 text-pink-600 ${isSyncingCipher === shop.shopId ? 'animate-spin' : ''}`} />
                      {shop.shopCipher ? 'Refresh Cipher' : 'Sinkronkan Toko'}
                    </Button>
                    <a
                      href="https://seller-id.tiktok.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full rounded-xl text-xs">
                        <ExternalLink className="w-3.5 h-3.5 mr-1" /> Seller Center
                      </Button>
                    </a>
                    <Button
                      onClick={() => handleDisconnect(shop.shopId, shop.shopName)}
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl text-xs"
                      title="Putuskan Hubungan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: MANAGEMENT PRODUK (TABS: PUSH KATALOG & PRODUK TIKTOK LIVE) */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <Tabs defaultValue="zelvira_catalog" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <TabsList className="bg-slate-100 p-1 rounded-2xl h-11 border border-slate-200">
              <TabsTrigger
                value="zelvira_catalog"
                className="rounded-xl font-bold text-xs data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm px-4"
              >
                <UploadCloud className="w-3.5 h-3.5 mr-1.5 text-pink-500" />
                Push Katalog Zelvira
                <Badge variant="secondary" className="ml-2 text-[10px] bg-slate-200/60 font-mono">
                  {products.length}
                </Badge>
              </TabsTrigger>

              <TabsTrigger
                value="tiktok_live"
                className="rounded-xl font-bold text-xs data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm px-4"
              >
                <Globe className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                Produk di TikTok Shop (Live)
                <Badge variant="secondary" className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 font-mono">
                  {tiktokProducts.filter((p) => !p.status?.toUpperCase().includes('DELETE')).length}
                </Badge>
              </TabsTrigger>

              <TabsTrigger
                value="tiktok_orders"
                className="rounded-xl font-bold text-xs data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm px-4"
              >
                <Package className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                Pesanan TikTok & Stok
                <Badge variant="secondary" className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 font-mono">
                  {tiktokOrders.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 rounded-xl text-xs bg-white"
                />
              </div>

              <Button
                onClick={loadTiktokProducts}
                variant="outline"
                size="sm"
                className="rounded-xl h-9 border-slate-200"
                disabled={isLoadingTiktokProducts}
                title="Sync & Muat Ulang Produk TikTok"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTiktokProducts ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* TAB 1: KATALOG ZELVIRA (PUSH KE TIKTOK) */}
          <TabsContent value="zelvira_catalog" className="mt-0 space-y-3">
            {/* BULK ACTION BAR */}
            {selectedProductIds.length > 0 && (
              <div className="bg-linear-to-r from-pink-50 via-rose-50 to-slate-50 border border-pink-200/80 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {selectedProductIds.length}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {selectedProductIds.length} produk katalog dipilih
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Siap di-push secara massal ke etalase TikTok Shop.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    onClick={() => setSelectedProductIds([])}
                    variant="ghost"
                    size="sm"
                    disabled={isBulkPushing}
                    className="rounded-xl text-xs text-slate-600 hover:text-slate-800"
                  >
                    Batal Pilihan
                  </Button>
                  <Button
                    onClick={handleBulkPushProducts}
                    disabled={isBulkPushing || shops.length === 0}
                    size="sm"
                    className="rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-md shadow-pink-500/20 px-4"
                  >
                    <UploadCloud className={`w-4 h-4 mr-1.5 ${isBulkPushing ? 'animate-bounce' : ''}`} />
                    {isBulkPushing
                      ? `Pushing (${bulkPushProgress?.current || 0}/${bulkPushProgress?.total || selectedProductIds.length})...`
                      : `Push ke TikTok (${selectedProductIds.length} Produk)`}
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                      <th className="py-3 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={filteredProducts.length > 0 && filteredProducts.every(p => selectedProductIds.includes(p.id))}
                          onChange={handleToggleSelectAll}
                          className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 border-slate-300 cursor-pointer accent-pink-600"
                          title="Pilih Semua Produk"
                        />
                      </th>
                      <th className="py-3 px-4">Produk Katalog</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Harga</th>
                      <th className="py-3 px-4">Varian & Stok</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoadingProducts ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-1 text-pink-500" />
                          Memuat katalog produk...
                        </td>
                      </tr>
                    ) : filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Tidak ada produk ditemukan.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const rawPrice = p.variants?.[0]?.price ?? p.price ?? 0;
                        const price = Number(rawPrice) || 0;
                        const stock = p.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;
                        const isPushing = isPushingId === p.id;
                        const isSelected = selectedProductIds.includes(p.id);

                        return (
                          <tr key={p.id} className={`transition-colors ${isSelected ? 'bg-pink-50/40 hover:bg-pink-50/70' : 'hover:bg-slate-50/60'}`}>
                            <td className="py-3 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectProduct(p.id)}
                                className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 border-slate-300 cursor-pointer accent-pink-600"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <ProductImageThumbnail
                                  src={getCatalogImageUrl(p)}
                                  alt={p.name}
                                />
                                <div>
                                  <p className="font-bold text-slate-900">{p.name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">ID: #{p.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="outline" className="text-[10px] font-semibold text-slate-600 bg-slate-50">
                                {p.category?.name || 'General'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-900">
                              Rp {price.toLocaleString('id-ID')}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`font-bold ${stock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                {stock} unit
                              </span>
                              <span className="text-slate-400 text-[10px] ml-1">({p.variants?.length || 0} varian)</span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                onClick={() => handlePushProduct(p)}
                                disabled={isPushing || isBulkPushing || shops.length === 0}
                                size="sm"
                                className="h-8 rounded-xl bg-black hover:bg-slate-900 text-white text-xs font-bold shadow-sm"
                              >
                                <UploadCloud className={`w-3.5 h-3.5 mr-1 text-pink-400 ${isPushing ? 'animate-bounce' : ''}`} />
                                {isPushing ? 'Pushing...' : 'Push ke TikTok'}
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: PRODUK DI TIKTOK SHOP (LIVE & EDIT) */}
          <TabsContent value="tiktok_live" className="mt-0">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                      <th className="py-3 px-4">Produk TikTok</th>
                      <th className="py-3 px-4">Status TikTok</th>
                      <th className="py-3 px-4">Harga Live</th>
                      <th className="py-3 px-4">Stok Live</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoadingTiktokProducts ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-1 text-emerald-500" />
                          Mengambil data produk live dari TikTok Shop...
                        </td>
                      </tr>
                    ) : tiktokProducts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                            <Globe className="w-6 h-6" />
                          </div>
                          <p className="font-bold text-slate-700 mb-1">Belum Ada Produk di Toko TikTok</p>
                          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                            Gunakan tab &quot;Push Katalog Zelvira&quot; untuk mengunggah produk pertama Anda ke TikTok Shop.
                          </p>
                          <Button
                            onClick={loadTiktokProducts}
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-slate-200 text-xs"
                          >
                            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh Produk TikTok
                          </Button>
                        </td>
                      </tr>
                    ) : (
                      tiktokProducts
                        .filter((p) => {
                          const status = (p.status || '').toUpperCase();
                          if (status === 'DELETED' || status.includes('DELETE')) return false;
                          return p.title?.toLowerCase().includes(searchQuery.toLowerCase());
                        })
                        .map((p) => {
                          const firstSku = p.skus?.[0];
                          const price = extractSkuPrice(firstSku);
                          const totalStock = p.skus?.reduce((acc: number, s: any) => acc + (s.quantity || 0), 0) || 0;

                          return (
                            <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <ProductImageThumbnail
                                    src={getTiktokImageUrl(p)}
                                    alt={p.title || 'TikTok Product'}
                                  />
                                  <div>
                                    <p className="font-bold text-slate-900 line-clamp-1">{p.title}</p>
                                    <p className="text-[10px] text-slate-400 font-mono">TikTok ID: {p.id}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <Badge
                                  className={`text-[10px] font-black uppercase tracking-wider ${p.status === 'ACTIVATE'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : p.status === 'SELLER_DEACTIVATED'
                                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                                      : 'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}
                                >
                                  {p.status === 'ACTIVATE'
                                    ? 'AKTIF'
                                    : p.status === 'SELLER_DEACTIVATED'
                                      ? 'NONAKTIF'
                                      : p.status || 'UNKNOWN'}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 font-bold text-slate-900">
                                Rp {price.toLocaleString('id-ID')}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`font-bold ${totalStock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                  {totalStock} unit
                                </span>
                                <span className="text-slate-400 text-[10px] ml-1">({p.skus?.length || 0} SKU)</span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button
                                    onClick={() => handleOpenEdit(p)}
                                    size="sm"
                                    variant="outline"
                                    className="h-8 rounded-xl border-slate-200 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-300 text-xs font-bold shadow-sm"
                                    title="Edit Harga & Stok di TikTok"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 mr-1" />
                                    Edit
                                  </Button>

                                  {p.status === 'ACTIVATE' ? (
                                    <Button
                                      onClick={() => handleDeactivateProduct(p.id)}
                                      size="sm"
                                      variant="outline"
                                      disabled={isUpdatingStatusId === p.id}
                                      className="h-8 rounded-xl border-amber-200 hover:bg-amber-50 text-amber-700 text-xs font-bold shadow-sm"
                                      title="Nonaktifkan produk dari TikTok Shop"
                                    >
                                      <EyeOff className={`w-3.5 h-3.5 mr-1 ${isUpdatingStatusId === p.id ? 'animate-spin' : ''}`} />
                                      Nonaktifkan
                                    </Button>
                                  ) : (
                                    <Button
                                      onClick={() => handleActivateProduct(p.id)}
                                      size="sm"
                                      variant="outline"
                                      disabled={isUpdatingStatusId === p.id}
                                      className="h-8 rounded-xl border-emerald-200 hover:bg-emerald-50 text-emerald-700 text-xs font-bold shadow-sm"
                                      title="Aktifkan kembali produk di TikTok Shop"
                                    >
                                      <Eye className={`w-3.5 h-3.5 mr-1 ${isUpdatingStatusId === p.id ? 'animate-spin' : ''}`} />
                                      Aktifkan
                                    </Button>
                                  )}

                                  <Button
                                    onClick={() => handleDeleteRemoteProduct(p.id, p.title)}
                                    size="sm"
                                    variant="ghost"
                                    disabled={isUpdatingStatusId === p.id}
                                    className="h-8 w-8 p-0 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                    title="Hapus produk dari TikTok Shop"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: PESANAN TIKTOK SHOP & SINKRONISASI STOK */}
          <TabsContent value="tiktok_orders" className="mt-0 space-y-4">
            {/* STATS OVERVIEW CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="rounded-2xl border-slate-200 bg-white shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Pesanan</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{tiktokOrders.length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
              </Card>

              <Card className="rounded-2xl border-slate-200 bg-white shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Siap Dikirim</p>
                    <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
                      {tiktokOrders.filter((o) => (o.orderStatus || o.status || '').toUpperCase() === 'AWAITING_SHIPMENT').length}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
              </Card>

              <Card className="rounded-2xl border-slate-200 bg-white shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pesanan Selesai</p>
                    <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
                      {tiktokOrders.filter((o) => (o.orderStatus || o.status || '').toUpperCase() === 'COMPLETED').length}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
              </Card>

              <Card className="rounded-2xl border-slate-200 bg-white shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Stok Terpotong</p>
                    <p className="text-xl sm:text-2xl font-black text-blue-600 mt-1">
                      {tiktokOrders.filter((o) => o.stockDeducted).length}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            </div>

            {/* ACTION TOOLBAR & FILTERS */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Filter Status:</span>
                {['ALL', 'AWAITING_SHIPMENT', 'COMPLETED', 'CANCELLED'].map((st) => (
                  <Button
                    key={st}
                    variant={orderStatusFilter === st ? 'default' : 'outline'}
                    size="sm"
                    className={`h-8 rounded-xl text-xs font-bold ${orderStatusFilter === st
                        ? 'bg-slate-900 text-white'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    onClick={() => {
                      setOrderStatusFilter(st);
                      loadTiktokOrders(st);
                    }}
                  >
                    {st === 'ALL'
                      ? 'Semua'
                      : st === 'AWAITING_SHIPMENT'
                        ? 'Siap Dikirim'
                        : st === 'COMPLETED'
                          ? 'Selesai'
                          : 'Dibatalkan'}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  onClick={handleSyncAllStocksToTiktok}
                  variant="outline"
                  size="sm"
                  className="rounded-xl h-9 text-xs font-bold border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 gap-1.5"
                  disabled={isSyncingAllStocks}
                  title="Kirim stok master Zelvira saat ini ke etalase TikTok Shop"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAllStocks ? 'animate-spin' : ''}`} />
                  {isSyncingAllStocks ? 'Pushing Stok...' : 'Push Stok Master ke TikTok'}
                </Button>

                <Button
                  onClick={handleSyncOrdersAndDeductStock}
                  size="sm"
                  className="rounded-xl h-9 text-xs font-bold bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-sm shadow-pink-500/20 gap-1.5"
                  disabled={isSyncingOrders}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingOrders ? 'animate-spin' : ''}`} />
                  {isSyncingOrders ? 'Menyinkronkan...' : 'Tarik Pesanan & Sinkron Stok'}
                </Button>
              </div>
            </div>

            {/* ORDERS TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">No. Pesanan TikTok</th>
                      <th className="py-3 px-4">Pembeli & Alamat</th>
                      <th className="py-3 px-4">Item & SKU Dipesan</th>
                      <th className="py-3 px-4 text-right">Total Tagihan</th>
                      <th className="py-3 px-4 text-center">Status Pesanan</th>
                      <th className="py-3 px-4 text-center">Potong Stok Master</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoadingOrders ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-pink-500 mb-2" />
                          <p className="text-xs text-slate-500 font-medium">Memuat pesanan TikTok Shop...</p>
                        </td>
                      </tr>
                    ) : tiktokOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-16">
                          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-3">
                            <ShoppingBag className="w-8 h-8" />
                          </div>
                          <p className="font-bold text-sm text-slate-800">Belum Ada Pesanan Masuk</p>
                          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
                            Saat pembeli melakukan order di TikTok Shop, pesanan akan otomatis tercatat di sini dan memotong kuantitas stok master produk Zelvira.
                          </p>
                          <Button
                            onClick={handleSyncOrdersAndDeductStock}
                            variant="outline"
                            size="sm"
                            className="rounded-xl text-xs font-bold border-slate-200"
                            disabled={isSyncingOrders}
                          >
                            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncingOrders ? 'animate-spin' : ''}`} />
                            Tarik Pesanan Sekarang
                          </Button>
                        </td>
                      </tr>
                    ) : (
                      tiktokOrders.map((order: any) => {
                        const orderId = order.marketplaceOrderId || order.id || '-';
                        const status = (order.orderStatus || order.status || 'UNKNOWN').toUpperCase();
                        let items: any[] = [];
                        try {
                          if (typeof order.lineItemsJson === 'string' && order.lineItemsJson.startsWith('[')) {
                            items = JSON.parse(order.lineItemsJson);
                          } else if (Array.isArray(order.line_items)) {
                            items = order.line_items;
                          }
                        } catch (e) {
                          items = [];
                        }

                        const createdAt = order.orderCreatedAt || (order.create_time ? new Date(order.create_time * 1000).toISOString() : order.createdAt);

                        return (
                          <tr key={orderId} className="hover:bg-slate-50/70 transition-colors">
                            {/* NO PESANAN */}
                            <td className="py-3 px-4 align-top">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-slate-900">{orderId}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyOrderId(orderId)}
                                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
                                  title="Salin ID Pesanan"
                                >
                                  {copiedOrderId === orderId ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-1">
                                {createdAt ? new Date(createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                              </p>
                            </td>

                            {/* PEMBELI */}
                            <td className="py-3 px-4 align-top max-w-[200px]">
                              <p className="font-bold text-slate-800 truncate">{order.buyerName || order.buyer_name || 'Pelanggan TikTok'}</p>
                              {(order.buyerPhone || order.buyer_phone) && (
                                <p className="text-[11px] text-slate-500">{order.buyerPhone || order.buyer_phone}</p>
                              )}
                              {(order.shippingAddress || order.shipping_address) && (
                                <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5" title={order.shippingAddress || order.shipping_address}>
                                  {order.shippingAddress || order.shipping_address}
                                </p>
                              )}
                            </td>

                            {/* ITEMS & SKU */}
                            <td className="py-3 px-4 align-top">
                              <div className="space-y-1.5">
                                {items.length > 0 ? (
                                  items.map((it: any, idx: number) => (
                                    <div key={idx} className="flex flex-col text-[11px]">
                                      <div className="font-semibold text-slate-800 line-clamp-1">
                                        {it.product_name || it.productName || 'Produk TikTok'}
                                      </div>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        {(it.seller_sku || it.sellerSku) ? (
                                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono bg-slate-50 text-slate-600 border-slate-200">
                                            SKU: {it.seller_sku || it.sellerSku}
                                          </Badge>
                                        ) : (
                                          <span className="text-[10px] text-slate-400">Tanpa SKU</span>
                                        )}
                                        {it.sku_name && (
                                          <span className="text-[10px] text-slate-500">({it.sku_name})</span>
                                        )}
                                        <span className="font-bold text-pink-600">x{it.quantity || 1}</span>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-slate-400 text-[11px]">Detail item tidak tersedia</span>
                                )}
                              </div>
                            </td>

                            {/* TOTAL TAGIHAN */}
                            <td className="py-3 px-4 align-top text-right font-mono font-bold text-slate-900">
                              Rp {((order.totalAmount || order.total_amount || 0) as number).toLocaleString('id-ID')}
                            </td>

                            {/* STATUS ORDER */}
                            <td className="py-3 px-4 align-top text-center">
                              {status === 'AWAITING_SHIPMENT' ? (
                                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 font-bold border-purple-200">
                                  Siap Kirim
                                </Badge>
                              ) : status === 'COMPLETED' ? (
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 font-bold border-emerald-200">
                                  Selesai
                                </Badge>
                              ) : status === 'IN_TRANSIT' ? (
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 font-bold border-blue-200">
                                  Dikirim
                                </Badge>
                              ) : status === 'CANCELLED' ? (
                                <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 font-bold border-rose-200">
                                  Dibatalkan
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="font-bold">
                                  {status}
                                </Badge>
                              )}
                            </td>

                            {/* STATUS POTONG STOK */}
                            <td className="py-3 px-4 align-top text-center">
                              {order.stockDeducted ? (
                                <div className="flex flex-col items-center">
                                  <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white font-bold gap-1 text-[10px]">
                                    <Check className="w-3 h-3" /> Terpotong
                                  </Badge>
                                  {order.stockDeductedAt && (
                                    <span className="text-[9px] text-slate-400 mt-0.5">
                                      {new Date(order.stockDeductedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 font-bold text-[10px]">
                                  Belum Dipotong
                                </Badge>
                              )}
                            </td>

                            {/* AKSI */}
                            <td className="py-3 px-4 align-top text-right">
                              {!order.stockDeducted && status !== 'CANCELLED' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeductOrderStockManual(orderId)}
                                  disabled={isDeductingOrderId === orderId}
                                  className="h-7 text-[11px] rounded-lg font-bold border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-700"
                                >
                                  {isDeductingOrderId === orderId ? (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                  ) : (
                                    'Potong Stok'
                                  )}
                                </Button>
                              ) : (
                                <span className="text-[11px] text-slate-400 font-medium">Tersinkron</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* QUICK EDIT MODAL (EDIT PRODUK TIKTOK SHOP) */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="sm:max-w-xl w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-3xl bg-white shadow-2xl">
          <DialogHeader className="p-6 pb-4 border-b border-slate-100 shrink-0">
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-pink-500" />
              Edit Produk di TikTok Shop
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 break-words">
              Perubahan judul, foto utama, harga, atau stok akan langsung disinkronkan ke etalase TikTok Shop Anda.
            </DialogDescription>
          </DialogHeader>

          {editingProduct && (
            <div className="overflow-y-auto flex-1 p-6 space-y-5 min-w-0">
              {/* Product Info Header */}
              <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 min-w-0">
                <div className="relative w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                  {editPhotos.length > 0 ? (
                    <img
                      src={formatImageUrl(editPhotos[0].url)}
                      alt={editingProduct.title || 'TikTok Product'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate" title={editingProduct.title}>
                    {editingProduct.title}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono break-all mt-0.5">
                    ID: {editingProduct.id}
                  </p>
                </div>
              </div>

              {/* Photo Gallery Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                      Galeri Foto TikTok
                    </label>
                    <Badge variant="outline" className="text-[10px] font-mono font-bold bg-pink-50 text-pink-700 border-pink-200">
                      {editPhotos.length} / 9 Foto
                    </Badge>
                  </div>
                  {JSON.stringify(editPhotos) !== JSON.stringify(originalPhotos) && (
                    <button
                      type="button"
                      onClick={handleResetPhotos}
                      className="text-[11px] text-pink-600 hover:text-pink-700 font-semibold underline underline-offset-2"
                    >
                      Kembalikan Foto Awal
                    </button>
                  )}
                </div>

                <input
                  ref={editImageInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleDirectImageUpload}
                  disabled={isUploadingImage || isUpdatingRemote || editPhotos.length >= 9}
                />

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                  {editPhotos.map((photo, idx) => (
                    <div
                      key={photo.id}
                      className={`relative aspect-square rounded-2xl overflow-hidden border-2 bg-white group shadow-sm transition-all ${idx === 0
                          ? 'border-pink-500 ring-2 ring-pink-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <img
                        src={formatImageUrl(photo.url)}
                        alt={`TikTok Foto ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />

                      {/* Primary / Cover Badge */}
                      {idx === 0 ? (
                        <div className="absolute top-1.5 left-1.5 bg-pink-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                          <Crown className="w-2.5 h-2.5" />
                          Utama
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryPhoto(idx)}
                          className="absolute top-1.5 left-1.5 bg-black/70 hover:bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow"
                          title="Jadikan foto sampul utama"
                        >
                          Pilih Utama
                        </button>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        disabled={editPhotos.length <= 1}
                        className={`absolute top-1.5 right-1.5 p-1 rounded-lg text-white shadow transition-all ${editPhotos.length <= 1
                            ? 'bg-slate-300 cursor-not-allowed opacity-0'
                            : 'bg-rose-500 hover:bg-rose-600 opacity-90 group-hover:opacity-100'
                          }`}
                        title={editPhotos.length <= 1 ? 'Minimal 1 foto' : 'Hapus foto ini dari TikTok Shop'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Photo Index indicator */}
                      <div className="absolute bottom-1 right-1.5 text-[9px] font-mono text-white/90 drop-shadow-md">
                        #{idx + 1}
                      </div>
                    </div>
                  ))}

                  {/* Add New Photo Card */}
                  {editPhotos.length < 9 && (
                    <button
                      type="button"
                      onClick={() => editImageInputRef.current?.click()}
                      disabled={isUploadingImage || isUpdatingRemote}
                      className="aspect-square flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 hover:border-pink-500 bg-white hover:bg-pink-50/20 transition-all p-2 text-center group cursor-pointer"
                    >
                      {isUploadingImage ? (
                        <>
                          <RefreshCw className="w-5 h-5 text-pink-500 animate-spin mb-1" />
                          <span className="text-[10px] font-bold text-slate-600">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                            <Plus className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 group-hover:text-pink-600">
                            Tambah Foto
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {9 - editPhotos.length} slot tersisa
                          </span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Semua foto di atas adalah foto yang tersimpan di TikTok Shop. Foto <strong className="text-pink-600">#1 (Utama)</strong> akan tampil sebagai sampul di etalase katalog. Klik tombol hapus pada foto lama untuk menghapusnya secara permanen dari TikTok Shop saat disimpan.
                </p>
              </div>

              {/* Title Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Judul Produk</label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Judul produk di TikTok Shop"
                  className="rounded-xl text-xs bg-slate-50"
                />
              </div>

              {/* Price & Stock Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Harga (IDR)</label>
                  <Input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder="100000"
                    className="rounded-xl text-xs bg-slate-50 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Stok (Unit)</label>
                  <Input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    placeholder="10"
                    className="rounded-xl text-xs bg-slate-50 font-mono"
                  />
                </div>
              </div>

              {/* Info Details */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-[11px] text-slate-500 space-y-1 min-w-0">
                <p className="break-all"><span className="font-semibold text-slate-700">ID Produk TikTok:</span> {editingProduct.id}</p>
                <p><span className="font-semibold text-slate-700">Jumlah SKU:</span> {editingProduct.skus?.length || 0} varian</p>
                {editingProduct.skus?.[0]?.id && (
                  <p className="break-all font-mono text-[10px] text-slate-400">SKU ID: {editingProduct.skus[0].id}</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="p-4 px-6 border-t border-slate-100 bg-slate-50/50 shrink-0 flex flex-row justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setEditingProduct(null)}
              className="rounded-xl text-xs font-bold border-slate-200"
              disabled={isUpdatingRemote || isUploadingImage}
            >
              Batal
            </Button>
            <Button
              onClick={handleSaveRemoteEdit}
              disabled={isUpdatingRemote || isUploadingImage}
              className="rounded-xl bg-black hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider"
            >
              {isUpdatingRemote ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Menyimpan ke TikTok...
                </>
              ) : (
                'Simpan ke TikTok Shop'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
