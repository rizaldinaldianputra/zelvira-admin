import { apiClient } from './api.client';
import { ApiResponse } from '@/types/api';
import {
  PricingCostItem,
  PricingCostItemRequest,
  PricingFormula,
  PricingFormulaRequest,
  PriceCalculationRequest,
  PriceCalculationResponse,
  ProductPricing,
  ApplyPriceRequest,
  PricingAnalytics,
} from '@/types/pricing';

class PricingService {
  private endpoint = '/v1/pricing';

  // 1. Master Biaya
  async getCostItems(): Promise<PricingCostItem[]> {
    const res = await apiClient.get<ApiResponse<PricingCostItem[]>>(`${this.endpoint}/costs`);
    return res.data || [];
  }

  async createCostItem(data: PricingCostItemRequest): Promise<PricingCostItem> {
    const res = await apiClient.post<ApiResponse<PricingCostItem>>(`${this.endpoint}/costs`, data);
    return res.data;
  }

  async updateCostItem(id: number, data: PricingCostItemRequest): Promise<PricingCostItem> {
    const res = await apiClient.put<ApiResponse<PricingCostItem>>(`${this.endpoint}/costs/${id}`, data);
    return res.data;
  }

  async deleteCostItem(id: number): Promise<boolean> {
    const res = await apiClient.delete<ApiResponse<void>>(`${this.endpoint}/costs/${id}`);
    return res.status === 200;
  }

  // 2. Master Formula & Dynamic Expression
  async getFormulas(): Promise<PricingFormula[]> {
    const res = await apiClient.get<ApiResponse<PricingFormula[]>>(`${this.endpoint}/formulas`);
    return res.data || [];
  }

  async createFormula(data: PricingFormulaRequest): Promise<PricingFormula> {
    const res = await apiClient.post<ApiResponse<PricingFormula>>(`${this.endpoint}/formulas`, data);
    return res.data;
  }

  async updateFormula(id: number, data: PricingFormulaRequest): Promise<PricingFormula> {
    const res = await apiClient.put<ApiResponse<PricingFormula>>(`${this.endpoint}/formulas/${id}`, data);
    return res.data;
  }

  async deleteFormula(id: number): Promise<boolean> {
    const res = await apiClient.delete<ApiResponse<void>>(`${this.endpoint}/formulas/${id}`);
    return res.status === 200;
  }

  // 3. Realtime Price Calculation & Simulator
  async calculatePrice(req: PriceCalculationRequest): Promise<PriceCalculationResponse> {
    const res = await apiClient.post<ApiResponse<PriceCalculationResponse>>(`${this.endpoint}/calculate`, req);
    return res.data;
  }

  // 4. Master Product Pricing & Apply
  async getProductPricingList(search?: string, categoryId?: number): Promise<ProductPricing[]> {
    const params: Record<string, string> = {};
    if (search && search.trim()) params.search = search.trim();
    if (categoryId) params.categoryId = categoryId.toString();
    const res = await apiClient.get<ApiResponse<ProductPricing[]>>(`${this.endpoint}/products`, { params });
    return res.data || [];
  }

  async applyPrice(data: ApplyPriceRequest): Promise<ProductPricing> {
    const res = await apiClient.post<ApiResponse<ProductPricing>>(`${this.endpoint}/apply`, data);
    return res.data;
  }

  async batchApplyPrices(requests: ApplyPriceRequest[]): Promise<number> {
    const res = await apiClient.post<ApiResponse<number>>(`${this.endpoint}/batch-apply`, requests);
    return res.data || 0;
  }

  // 5. Profitability Analytics
  async getPricingAnalytics(): Promise<PricingAnalytics> {
    const res = await apiClient.get<ApiResponse<PricingAnalytics>>(`${this.endpoint}/analytics`);
    return res.data;
  }
}

export const pricingService = new PricingService();

