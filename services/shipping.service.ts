import { apiClient } from './api.client';
import { ApiResponse } from '@/types/api';

export interface LocationItem {
  id?: number | string;
  name?: string;
  province_id?: number | string;
  province?: string;
  city_id?: number | string;
  city_name?: number | string;
  city?: string;
  type?: string;
  postal_code?: string;
  district_id?: number | string;
  district_name?: string;
  subdistrict_id?: number | string;
  subdistrict_name?: string;
}

export interface ShippingCostRequest {
  origin: string;
  destination: string;
  weight: number;
  courier: string;
}

export interface CourierResult {
  code: string;
  name: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
}

class ShippingServiceClass {
  async getProvinces(): Promise<LocationItem[]> {
    const res = await apiClient.get<ApiResponse<LocationItem[]>>('/v1/shipping/provinces');
    return res.data || [];
  }

  async getCities(provinceId: string): Promise<LocationItem[]> {
    const res = await apiClient.get<ApiResponse<LocationItem[]>>(`/v1/shipping/cities?provinceId=${provinceId}`);
    return res.data || [];
  }

  async getDistricts(cityId: string): Promise<LocationItem[]> {
    const res = await apiClient.get<ApiResponse<LocationItem[]>>(`/v1/shipping/districts?cityId=${cityId}`);
    return res.data || [];
  }

  async getSubdistricts(districtId: string): Promise<LocationItem[]> {
    const res = await apiClient.get<ApiResponse<LocationItem[]>>(`/v1/shipping/sub-districts?districtId=${districtId}`);
    return res.data || [];
  }

  async calculateCost(request: ShippingCostRequest): Promise<CourierResult[]> {
    const res = await apiClient.post<ApiResponse<CourierResult[]>>('/v1/shipping/cost', request);
    return res.data || [];
  }

  async syncLocations(): Promise<any> {
    const res = await apiClient.post<ApiResponse<any>>('/v1/shipping/sync', {});
    return res.data;
  }

  async getLocationStats(): Promise<{ total_provinces: number; total_cities: number }> {
    const res = await apiClient.get<ApiResponse<{ total_provinces: number; total_cities: number }>>('/v1/shipping/stats');
    return res.data || { total_provinces: 0, total_cities: 0 };
  }

  async getAllProvinces(): Promise<any[]> {
    const res = await apiClient.get<ApiResponse<any[]>>('/v1/shipping/all-provinces');
    return res.data || [];
  }

  async getAllCities(): Promise<any[]> {
    const res = await apiClient.get<ApiResponse<any[]>>('/v1/shipping/all-cities');
    return res.data || [];
  }
}

export const ShippingService = new ShippingServiceClass();
