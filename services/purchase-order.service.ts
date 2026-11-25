import { PurchaseOrder, PurchaseOrderStats, CreatePurchaseOrderInput } from '@/types/purchase-order';
import { GoodsReceipt } from '@/types/goods-receipt';
import { BaseService } from './base.service';
import { apiClient } from './api.client';
import { PaginatedResponse } from '@/types/api';

class PurchaseOrderServiceClass extends BaseService<PurchaseOrder> {
  constructor() {
    super('/v1/purchase-orders');
  }

  async getPurchaseOrders(
    page = 0,
    size = 10,
    search?: string,
    supplierId?: number,
    status?: string,
    startDate?: string,
    endDate?: string,
    sortBy = 'createdAt',
    sortDir = 'DESC'
  ): Promise<PaginatedResponse<PurchaseOrder>> {
    let url = `${this.endpoint}?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`;
    if (search && search.trim()) {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    if (supplierId) {
      url += `&supplierId=${supplierId}`;
    }
    if (status && status !== 'ALL') {
      url += `&status=${status}`;
    }
    if (startDate) {
      url += `&startDate=${startDate}`;
    }
    if (endDate) {
      url += `&endDate=${endDate}`;
    }
    const response = await apiClient.get<any>(url);
    const data = response?.data ?? response;
    return data?.content ? data : response;
  }

  override async create(data: CreatePurchaseOrderInput | Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const response = await apiClient.post<any>(this.endpoint, data);
    return response?.data ?? response;
  }

  async getStats(): Promise<PurchaseOrderStats> {
    const response = await apiClient.get<any>(`${this.endpoint}/stats`);
    return response?.data ?? response;
  }

  async updateStatus(id: number, status: string): Promise<PurchaseOrder> {
    const response = await apiClient.patch<any>(`${this.endpoint}/${id}/status`, { status });
    return response?.data ?? response;
  }

  async approve(id: number): Promise<PurchaseOrder> {
    const response = await apiClient.post<any>(`${this.endpoint}/${id}/approve`, {});
    return response?.data ?? response;
  }

  async getApproved(): Promise<PurchaseOrder[]> {
    const response = await apiClient.get<any>(`${this.endpoint}/approved`);
    return response?.data ?? response;
  }

  async getByPoNumber(poNumber: string): Promise<PurchaseOrder> {
    const response = await apiClient.get<any>(`${this.endpoint}/by-number/${encodeURIComponent(poNumber)}`);
    return response?.data ?? response;
  }

  async getReceipts(id: number): Promise<GoodsReceipt[]> {
    const response = await apiClient.get<any>(`${this.endpoint}/${id}/receipts`);
    return response?.data ?? response;
  }
}

export const PurchaseOrderService = new PurchaseOrderServiceClass();
