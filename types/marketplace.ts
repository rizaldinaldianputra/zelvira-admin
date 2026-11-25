export interface TikTokShop {
  id: number;
  shopId: string;
  shopName: string;
  sellerName?: string;
  region: string;
  isActive: boolean;
  tokenExpiry?: string;
  createdAt?: string;
  updatedAt?: string;
  appKey?: string;
  shopCipher?: string;
}

export interface MarketplaceAuthUrlResponse {
  url: string;
}
