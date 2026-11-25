import { Supplier, SupplierStats } from '@/types/supplier';
import { BaseService } from './base.service';
import { apiClient } from './api.client';
import { PaginatedResponse } from '@/types/api';

class SupplierServiceClass extends BaseService<Supplier> {
  constructor() {
    super('/v1/suppliers');
  }

  async getSuppliers(
    page = 0,
    size = 10,
    search?: string,
    isActive?: boolean,
    sortBy = 'createdAt',
    sortDir = 'DESC'
  ): Promise<PaginatedResponse<Supplier>> {
    let url = `${this.endpoint}?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`;
    if (search && search.trim()) {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    if (isActive !== undefined && isActive !== null) {
      url += `&isActive=${isActive}`;
    }
    const response = await apiClient.get<any>(url);
    const data = response?.data ?? response;
    return data?.content ? data : response;
  }

  async getStats(): Promise<SupplierStats> {
    const response = await apiClient.get<any>(`${this.endpoint}/stats`);
    return response?.data ?? response;
  }

  async toggleStatus(id: number): Promise<Supplier> {
    const response = await apiClient.patch<any>(`${this.endpoint}/${id}/toggle-status`, {});
    return response?.data ?? response;
  }
}

export const SupplierService = new SupplierServiceClass();
