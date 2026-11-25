import { BaseService } from './base.service';
import { apiClient } from './api.client';

export interface DigitalProduct {
  id: number;
  sku: string;
  productName: string;
  category: string;
  brand: string;
  type: string;
  sellerName: string;
  price: number;
  buyerSkuCode: string;
  buyerProductStatus: boolean;
  sellerProductStatus: boolean;
  unlimitedStock: boolean;
  stock: number;
  multi: boolean;
  faultTolerant: boolean;
  cutOff: boolean;
  desc: string;
  isActive: boolean;
}

export interface DigitalCategory {
  id: number;
  code: string;
  name: string;
  isPostpaid: boolean;
  isActive: boolean;
  iconName?: string;
  iconUrl?: string;
  colorHex?: string;
  sortOrder: number;
}

export interface DigitalProductConfig {
  enabled: boolean;
  title: string;
  iconUrl: string;
  activeCount: number;
  hasActiveProducts: boolean;
}

export class DigitalProductService extends BaseService<DigitalProduct> {
  constructor() {
    super('/api/products/digital');
  }

  async getAllProducts(category?: string, includeInactive: boolean = true): Promise<DigitalProduct[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (includeInactive) params.append('includeInactive', 'true');

    const url = `${this.endpoint}?${params.toString()}`;
    const response = await apiClient.get<any>(url);
    return Array.isArray(response) ? response : (response.data || []);
  }

  async getCategoriesList(isPostpaid?: boolean, onlyActive?: boolean): Promise<DigitalCategory[]> {
    const params = new URLSearchParams();
    if (isPostpaid !== undefined) params.append('isPostpaid', String(isPostpaid));
    if (onlyActive !== undefined) params.append('onlyActive', String(onlyActive));

    const url = `${this.endpoint}/categories-list?${params.toString()}`;
    const response = await apiClient.get<any>(url);
    return Array.isArray(response) ? response : (response.data || []);
  }

  async getConfig(): Promise<DigitalProductConfig> {
    const response = await apiClient.get<any>(`${this.endpoint}/config`);
    return response.data || response;
  }

  async updateConfig(data: Partial<DigitalProductConfig>): Promise<DigitalProductConfig> {
    const response = await apiClient.put<any>(`${this.endpoint}/config`, data);
    return response.data || response;
  }

  async toggleProductStatus(id: number, active?: boolean): Promise<DigitalProduct> {
    const response = await apiClient.put<any>(`${this.endpoint}/${id}/toggle`, active !== undefined ? { active } : {});
    return response.data || response;
  }

  async toggleCategoryStatus(id: number, active?: boolean): Promise<DigitalCategory> {
    const response = await apiClient.put<any>(`${this.endpoint}/categories/${id}/toggle`, active !== undefined ? { active } : {});
    return response.data || response;
  }

  async updateCategory(id: number, data: Partial<DigitalCategory>): Promise<DigitalCategory> {
    const response = await apiClient.put<any>(`${this.endpoint}/categories/${id}`, data);
    return response.data || response;
  }

  async syncProducts(type: 'prepaid' | 'pasca' | 'all'): Promise<{ message: string; count?: number }> {
    const response = await apiClient.post<any>(`${this.endpoint}/sync`, { type });
    return response.data || response;
  }
}

export const digitalProductService = new DigitalProductService();
