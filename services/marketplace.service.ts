import { apiClient } from './api.client';
import { TikTokShop, MarketplaceAuthUrlResponse } from '@/types/marketplace';

class MarketplaceServiceClass {
  private endpoint = '/v1/marketplace';

  /**
   * Get OAuth authorization URL for the specified marketplace (e.g. 'tiktok')
   */
  async getAuthUrl(type: string = 'tiktok'): Promise<MarketplaceAuthUrlResponse> {
    return apiClient.get<MarketplaceAuthUrlResponse>(`${this.endpoint}/auth-url/${type}`);
  }

  /**
   * Process OAuth callback code from TikTok
   */
  async processCallback(type: string = 'tiktok', code: string, shopId?: string): Promise<{ success: boolean; message: string }> {
    const params: Record<string, string> = { code };
    if (shopId) params.shopId = shopId;
    return apiClient.post(`${this.endpoint}/callback/${type}`, {}, { params });
  }

  /**
   * Get list of authorized shops (Toko Saya)
   */
  async getAuthorizedShops(type: string = 'tiktok'): Promise<TikTokShop[]> {
    return apiClient.get<TikTokShop[]>(`${this.endpoint}/shops/${type}`);
  }

  /**
   * Disconnect a shop
   */
  async disconnectShop(type: string = 'tiktok', shopId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`${this.endpoint}/shops/${type}/${shopId}`);
  }

  /**
   * Sync shop cipher from TikTok API
   */
  async syncShopCipher(type: string = 'tiktok', shopId?: string): Promise<{ success: boolean; message: string; shopCipher?: string; shopId?: string; shopName?: string }> {
    const params: Record<string, string> = {};
    if (shopId) params.shopId = shopId;
    return apiClient.post(`${this.endpoint}/shops/${type}/sync`, {}, { params });
  }

  /**
   * Push a product to marketplace (Step 2)
   */
  async pushProduct(type: string = 'tiktok', productId: number | string): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`${this.endpoint}/push/${type}/${productId}`, {});
  }

  /**
   * Get products from marketplace (View live products in TikTok Shop)
   */
  async getRemoteProducts(type: string = 'tiktok', pageSize: number = 20, pageToken?: string): Promise<{
    success: boolean;
    products: any[];
    total_count: number;
    next_page_token?: string;
    message?: string;
  }> {
    const params: Record<string, any> = { pageSize };
    if (pageToken) params.pageToken = pageToken;
    return apiClient.get(`${this.endpoint}/products/${type}`, { params });
  }

  /**
   * Update a product in marketplace (Edit live product in TikTok Shop)
   */
  async updateRemoteProduct(type: string = 'tiktok', remoteProductId: string, payload: any): Promise<{ success: boolean; message: string }> {
    return apiClient.put(`${this.endpoint}/products/${type}/${remoteProductId}`, payload);
  }

  /**
   * Activate a product in TikTok Shop
   */
  async activateRemoteProduct(type: string = 'tiktok', remoteProductId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`${this.endpoint}/products/${type}/${remoteProductId}/activate`, {});
  }

  /**
   * Deactivate a product in TikTok Shop
   */
  async deactivateRemoteProduct(type: string = 'tiktok', remoteProductId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`${this.endpoint}/products/${type}/${remoteProductId}/deactivate`, {});
  }

  /**
   * Delete / Delist a product in TikTok Shop
   */
  async deleteRemoteProduct(type: string = 'tiktok', remoteProductId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`${this.endpoint}/products/${type}/${remoteProductId}`);
  }

  /**
   * Upload an image directly to TikTok Shop
   */
  async uploadImage(type: string = 'tiktok', file: File): Promise<{ success: boolean; uri?: string; url?: string; message?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`${this.endpoint}/upload-image/${type}`, formData);
  }

  /**
   * Get orders from marketplace (TikTok Shop Orders)
   */
  async getRemoteOrders(type: string = 'tiktok', pageSize: number = 20, pageToken?: string, orderStatus?: string): Promise<{
    success: boolean;
    orders: any[];
    total_count: number;
    next_page_token?: string;
    message?: string;
    fallback?: boolean;
  }> {
    const params: Record<string, any> = { pageSize };
    if (pageToken) params.pageToken = pageToken;
    if (orderStatus) params.orderStatus = orderStatus;
    return apiClient.get(`${this.endpoint}/orders/${type}`, { params });
  }

  /**
   * Trigger manual sync of orders from marketplace and auto-deduct stock
   */
  async syncRemoteOrders(type: string = 'tiktok'): Promise<{ success: boolean; message: string; data?: any }> {
    return apiClient.post(`${this.endpoint}/orders/${type}/sync`, {});
  }

  /**
   * Deduct stock manually for a specific marketplace order
   */
  async deductStockForOrder(type: string = 'tiktok', orderId: string): Promise<{ success: boolean; message: string; alreadyDeducted?: boolean }> {
    return apiClient.post(`${this.endpoint}/orders/${type}/${orderId}/deduct-stock`, {});
  }

  /**
   * Synchronize stock of a single product to marketplace
   */
  async syncSingleProductStock(type: string = 'tiktok', productId: number | string): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`${this.endpoint}/products/${type}/${productId}/sync-stock`, {});
  }

  /**
   * Synchronize all active master product stocks to marketplace
   */
  async syncAllProductStocks(type: string = 'tiktok'): Promise<{ success: boolean; message: string; synced_products?: number; total_links?: number }> {
    return apiClient.post(`${this.endpoint}/products/${type}/sync-all-stocks`, {});
  }

  /**
   * Get customer service chat conversations from marketplace
   */
  async getChatConversations(type: string = 'tiktok', pageSize: number = 20, pageToken?: string): Promise<{
    success: boolean;
    connected?: boolean;
    conversations?: any[];
    permission_required?: boolean;
    message?: string;
    next_page_token?: string;
    total_count?: number;
  }> {
    const params: Record<string, any> = { pageSize };
    if (pageToken) params.pageToken = pageToken;
    return apiClient.get(`${this.endpoint}/chat/${type}/conversations`, { params });
  }

  /**
   * Get messages for a conversation
   */
  async getChatMessages(type: string = 'tiktok', conversationId: string, pageSize: number = 50, pageToken?: string): Promise<{
    success: boolean;
    messages?: any[];
    message?: string;
    next_page_token?: string;
  }> {
    const params: Record<string, any> = { pageSize };
    if (pageToken) params.pageToken = pageToken;
    return apiClient.get(`${this.endpoint}/chat/${type}/conversations/${conversationId}/messages`, { params });
  }

  /**
   * Send a message to a conversation
   */
  async sendChatMessage(type: string = 'tiktok', conversationId: string, content: string, messageType: string = 'TEXT'): Promise<{
    success: boolean;
    message?: string;
    data?: any;
  }> {
    return apiClient.post(`${this.endpoint}/chat/${type}/conversations/${conversationId}/messages`, {
      content,
      type: messageType
    });
  }
}

export const MarketplaceService = new MarketplaceServiceClass();
