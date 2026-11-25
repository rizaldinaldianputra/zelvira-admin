import { apiClient } from './api.client';

export interface WhatsAppStatus {
  status: string;
  provider?: string;
  service?: string;
  deviceNumber?: string;
  brand?: string;
  userkey?: string;
  rawUserkey?: string;
  passkey?: string;
  apiUrl?: string;
  configured?: boolean;
  wabaVerified?: boolean;
}

export interface SendTestOtpResult {
  success: boolean;
  status?: string;
  text?: string;
  messageId?: string;
  cost?: number;
  to?: string;
  sentOtp?: string;
}

export interface ZenzivaConfigPayload {
  apiUrl?: string;
  userkey?: string;
  passkey?: string;
  brand?: string;
}

export const whatsappService = {
  getStatus: async (): Promise<WhatsAppStatus> => {
    const response = await apiClient.get<any>('/v1/admin/whatsapp/status');
    return response.data;
  },

  sendTestOtp: async (phoneNumber: string, otp?: string, brand?: string): Promise<SendTestOtpResult> => {
    const response = await apiClient.post<any>('/v1/admin/whatsapp/test', {
      phoneNumber,
      otp,
      brand,
    });
    return response.data;
  },

  updateConfig: async (payload: ZenzivaConfigPayload): Promise<WhatsAppStatus> => {
    const response = await apiClient.post<any>('/v1/admin/whatsapp/config', payload);
    return response.data;
  },

  // Backward compatibility helpers
  fetchQrCodeBlob: async (): Promise<string | null> => {
    return null;
  },

  logoutSession: async (): Promise<void> => {
    await apiClient.post('/v1/admin/whatsapp/logout', {});
  },

  sendMessage: async (phoneNumber: string, message: string): Promise<void> => {
    await apiClient.post('/v1/chat/send', { phoneNumber, message });
  },
};
