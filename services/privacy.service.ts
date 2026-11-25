import { BaseService } from './base.service';
import { apiClient } from './api.client';

export interface PrivacyPolicy {
  id?: number;
  title: string;
  content: string;
  isActive: boolean;
  updatedAt?: string;
  createdAt?: string;
}

class PrivacyPolicyServiceClass extends BaseService<PrivacyPolicy> {
  constructor() {
    super('/v1/privacy-policy');
  }

  /**
   * Fetches the single current privacy policy document.
   */
  async getCurrent(): Promise<PrivacyPolicy | null> {
    try {
      const response = await apiClient.get<any>('/v1/privacy-policy/current', { silent: true });
      return response?.data ?? response ?? null;
    } catch {
      try {
        const fallback = await apiClient.get<any>('/v1/privacy-policy?includeDraft=true', { silent: true });
        const list = Array.isArray(fallback) ? fallback : fallback?.data ?? fallback?.content ?? [];
        if (Array.isArray(list) && list.length > 0) {
          return list[0];
        }
      } catch {}
      return null;
    }
  }

  /**
   * Upserts the single privacy policy document.
   */
  async saveCurrent(data: Partial<PrivacyPolicy>): Promise<PrivacyPolicy> {
    const payload = {
      ...data,
      isActive: Boolean(data.isActive),
    };
    const response = await apiClient.post<any>('/v1/privacy-policy', payload);
    return response?.data ?? response;
  }
}

export const PrivacyPolicyService = new PrivacyPolicyServiceClass();
