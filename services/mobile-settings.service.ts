import { apiClient } from './api.client';
import { MobileAppSetting } from '@/types/mobile-settings';

class MobileSettingsServiceClass {
  private endpoint = '/settings/mobile';

  async get(): Promise<MobileAppSetting> {
    const response = await apiClient.get<MobileAppSetting>(this.endpoint);
    return response;
  }

  async update(data: Partial<MobileAppSetting>): Promise<MobileAppSetting> {
    const response = await apiClient.post<MobileAppSetting>(this.endpoint, data);
    return response;
  }
}

export const MobileSettingsService = new MobileSettingsServiceClass();
