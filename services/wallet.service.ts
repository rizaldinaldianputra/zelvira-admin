import { apiClient } from './api.client';
import { ApiResponse } from '@/types/api';

export interface WalletTransaction {
  id: number;
  type: 'TOPUP' | 'PAYMENT' | 'POINTS_EARNED' | 'POINTS_REDEEMED';
  amount: number;
  points: number;
  description: string;
  referenceId: string;
  status: string;
  createdAt: string;
}

export interface WalletInfo {
  balance: number;
  points: number;
  recentTransactions: WalletTransaction[];
}

export const walletService = {
  getWalletInfo: async (): Promise<WalletInfo> => {
    const response = await apiClient.get<WalletInfo>('/v1/wallet');
    return response;
  },

  initiateTopup: async (amount: number): Promise<any> => {
    const response = await apiClient.post<any>('/v1/wallet/topup', { amount });
    return response;
  }
};
