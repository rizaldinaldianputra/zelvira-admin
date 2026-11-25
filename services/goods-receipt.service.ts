import { GoodsReceipt, CreateGoodsReceiptInput } from '@/types/goods-receipt';
import { BaseService } from './base.service';
import { apiClient } from './api.client';
import { PaginatedResponse } from '@/types/api';

class GoodsReceiptServiceClass extends BaseService<GoodsReceipt> {
  constructor() {
    super('/v1/goods-receipts');
  }

  async getGoodsReceipts(
    page = 0,
    size = 10,
    search?: string,
    supplierId?: number,
    poId?: number,
    startDate?: string,
    endDate?: string,
    sortBy = 'createdAt',
    sortDir = 'DESC'
  ): Promise<PaginatedResponse<GoodsReceipt>> {
    let url = `${this.endpoint}?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`;
    if (search && search.trim()) {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    if (supplierId) {
      url += `&supplierId=${supplierId}`;
    }
    if (poId) {
      url += `&poId=${poId}`;
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

  override async create(data: CreateGoodsReceiptInput | Partial<GoodsReceipt>): Promise<GoodsReceipt> {
    const response = await apiClient.post<any>(this.endpoint, data);
    return response?.data ?? response;
  }

  async approve(id: number): Promise<GoodsReceipt> {
    const response = await apiClient.post<any>(`${this.endpoint}/${id}/approve`, {});
    return response?.data ?? response;
  }
}

export const GoodsReceiptService = new GoodsReceiptServiceClass();
