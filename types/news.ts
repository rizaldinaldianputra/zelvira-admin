export interface News {
  id?: number;
  title: string;
  slug: string;
  content: string;
  imageUrl?: string;
  isActive: boolean;
  targetUserId?: number;
  publishedAt?: string;
  createdAt?: string;
}
