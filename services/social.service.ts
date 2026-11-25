import { apiClient } from './api.client';
import { SocialAccount, SocialPost, SocialPostRequest, SocialStats, SocialComment, SocialFeedItem, TikTokCreatorInfo, TikTokPublishStatusResult } from '@/types/social';
import { ApiResponse } from '@/types/api';

class SocialService {
  private endpoint = '/v1/social';

  async getAccounts(): Promise<SocialAccount[]> {
    const res = await apiClient.get<ApiResponse<SocialAccount[]>>(`${this.endpoint}/accounts`);
    return res.data || [];
  }

  async getAuthUrl(platform: string): Promise<string> {
    const res = await apiClient.get<ApiResponse<{ url: string }>>(`${this.endpoint}/auth-url/${platform}`);
    return res.data?.url || '';
  }

  async saveManualToken(payload: {
    platform: string;
    accountId?: string;
    accountName?: string;
    accessToken: string;
    expiresIn?: number;
  }): Promise<{ success: boolean; message?: string }> {
    const res = await apiClient.post<ApiResponse<string>>(`${this.endpoint}/accounts/manual-token`, payload);
    return { success: res.status === 200, message: res.message };
  }

  async disconnectAccount(id: number): Promise<{ success: boolean; message?: string }> {
    const res = await apiClient.post<ApiResponse<string>>(`${this.endpoint}/accounts/${id}/disconnect`, {});
    return { success: res.status === 200, message: res.message };
  }

  async getPosts(status?: string, platform?: string): Promise<SocialPost[]> {
    const params: Record<string, string> = {};
    if (status && status !== 'ALL') params.status = status;
    if (platform && platform !== 'ALL') params.platform = platform;
    const res = await apiClient.get<ApiResponse<SocialPost[]>>(`${this.endpoint}/posts`, { params });
    return res.data || [];
  }

  async getPost(id: number): Promise<SocialPost | null> {
    const res = await apiClient.get<ApiResponse<SocialPost>>(`${this.endpoint}/posts/${id}`);
    return res.data || null;
  }

  async createPost(data: SocialPostRequest): Promise<SocialPost> {
    const res = await apiClient.post<ApiResponse<SocialPost>>(`${this.endpoint}/posts`, data);
    return res.data;
  }

  async updatePost(id: number, data: SocialPostRequest): Promise<SocialPost> {
    const res = await apiClient.put<ApiResponse<SocialPost>>(`${this.endpoint}/posts/${id}`, data);
    return res.data;
  }

  async deletePost(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<string>>(`${this.endpoint}/posts/${id}`);
  }

  async publishPostNow(id: number): Promise<SocialPost> {
    const res = await apiClient.post<ApiResponse<SocialPost>>(`${this.endpoint}/posts/${id}/publish`, {});
    return res.data;
  }

  async getCalendarPosts(start?: string, end?: string): Promise<SocialPost[]> {
    const params: Record<string, string> = {};
    if (start) params.start = start;
    if (end) params.end = end;
    const res = await apiClient.get<ApiResponse<SocialPost[]>>(`${this.endpoint}/calendar`, { params });
    return res.data || [];
  }

  async getStats(): Promise<SocialStats> {
    const res = await apiClient.get<ApiResponse<SocialStats>>(`${this.endpoint}/stats`);
    return res.data || {
      totalPosts: 0,
      publishedCount: 0,
      scheduledCount: 0,
      draftCount: 0,
      failedCount: 0,
      tiktokCount: 0,
      instagramCount: 0,
    };
  }

  async getComments(platform?: string, search?: string): Promise<SocialComment[]> {
    const params: Record<string, string> = {};
    if (platform && platform !== 'ALL') params.platform = platform;
    if (search && search.trim()) params.search = search.trim();
    const res = await apiClient.get<ApiResponse<SocialComment[]>>(`${this.endpoint}/comments`, { params });
    return res.data || [];
  }

  async replyComment(id: number, replyText: string): Promise<SocialComment> {
    const res = await apiClient.post<ApiResponse<SocialComment>>(`${this.endpoint}/comments/${id}/reply`, { replyText });
    return res.data;
  }

  async hideComment(id: number): Promise<void> {
    await apiClient.post<ApiResponse<string>>(`${this.endpoint}/comments/${id}/hide`, {});
  }

  async syncComments(): Promise<{ newCommentsCount: number }> {
    const res = await apiClient.post<ApiResponse<{ newCommentsCount: number }>>(`${this.endpoint}/comments/sync`, {});
    return res.data || { newCommentsCount: 0 };
  }

  async getFeed(platform?: string): Promise<SocialFeedItem[]> {
    const params: Record<string, string> = {};
    if (platform && platform !== 'ALL') params.platform = platform;
    const res = await apiClient.get<ApiResponse<SocialFeedItem[]>>(`${this.endpoint}/feed`, { params });
    return res.data || [];
  }

  async getTikTokCreatorInfo(): Promise<TikTokCreatorInfo> {
    const res = await apiClient.get<ApiResponse<TikTokCreatorInfo>>(`${this.endpoint}/tiktok/creator-info`);
    return res.data;
  }

  async checkTikTokStatus(publishId: string): Promise<TikTokPublishStatusResult> {
    const res = await apiClient.post<ApiResponse<TikTokPublishStatusResult>>(
      `${this.endpoint}/tiktok/status/${encodeURIComponent(publishId)}`,
      {}
    );
    return res.data;
  }
}

export const socialService = new SocialService();
