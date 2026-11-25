export type SocialPlatform = 'TIKTOK' | 'INSTAGRAM' | 'FACEBOOK' | 'THREADS' | 'LINKEDIN' | 'X' | 'YOUTUBE' | 'ALL';
export type SocialPostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED';
export type SocialPostType = 'FEED' | 'STORY' | 'REEL' | 'SHORTS' | 'VIDEO';
export type SocialMediaType = 'VIDEO' | 'IMAGE' | 'CAROUSEL' | 'TEXT';

export interface SocialAccount {
  id: number;
  platform: SocialPlatform;
  accountName: string;
  accountId: string;
  avatarUrl?: string;
  isActive: boolean;
  hasToken: boolean;
  tokenExpiry?: string;
  clientKey?: string;
  createdAt?: string;
}

export interface SocialPost {
  id: number;
  productId?: number;
  title?: string;
  caption: string;
  mediaType: SocialMediaType;
  mediaUrls?: string;
  thumbnailUrl?: string;
  targetPlatforms: string;
  postType: SocialPostType;
  status: SocialPostStatus;
  scheduledAt?: string;
  publishedAt?: string;
  errorMessage?: string;
  tiktokPublishId?: string;
  instagramMediaId?: string;
  threadsMediaId?: string;
  facebookPostId?: string;
  linkedinPostUrn?: string;
  youtubeVideoId?: string;
  privacyLevel?: string;
  tiktokPostMode?: 'DIRECT_POST' | 'MEDIA_UPLOAD';
  createdAt: string;
  updatedAt?: string;
}

export interface SocialPostRequest {
  productId?: number;
  title?: string;
  caption: string;
  mediaType?: SocialMediaType;
  mediaUrls?: string;
  thumbnailUrl?: string;
  targetPlatforms: string;
  postType?: SocialPostType;
  status?: SocialPostStatus;
  scheduledAt?: string;
  privacyLevel?: string;
  tiktokPostMode?: 'DIRECT_POST' | 'MEDIA_UPLOAD';
  publishNow?: boolean;
}

export interface TikTokCreatorInfo {
  connected: boolean;
  accountName?: string;
  avatarUrl?: string;
  creatorUsername?: string;
  creatorNickname?: string;
  creatorAvatarUrl?: string;
  privacyLevelOptions: string[];
  commentDisabled?: boolean;
  duetDisabled?: boolean;
  stitchDisabled?: boolean;
  maxVideoPostDurationSec?: number;
  isSandboxRestricted?: boolean;
  warning?: string;
  error?: string;
}

export interface TikTokPublishStatusResult {
  publishId: string;
  status: string;
  failReason?: string;
  publiclyAvailablePostIds?: string[];
  message?: string;
  checkedAt?: string;
}

export interface SocialStats {
  totalPosts: number;
  publishedCount: number;
  scheduledCount: number;
  draftCount: number;
  failedCount: number;
  pendingComments?: number;
  tiktokCount?: number;
  instagramCount?: number;
}

export interface SocialComment {
  id: number;
  postId?: number;
  socialAccountId?: number;
  accountName?: string;
  platform: string;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl?: string;
  commentText: string;
  postTitle?: string;
  postThumbnailUrl?: string;
  externalCommentId?: string;
  externalPostId?: string;
  replyText?: string;
  isReplied: boolean;
  repliedAt?: string;
  status: string;
  createdAt: string;
}

export interface SocialFeedItem {
  id: number;
  caption: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  mediaType?: string;
  postType?: string;
  targetPlatforms: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  status: string;
  youtubeVideoId?: string;
  linkedinPostUrn?: string;
  tiktokPublishId?: string;
  instagramMediaId?: string;
  liveUrl?: string;
}
