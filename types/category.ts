export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  pointsReward?: number;
  isActive: boolean;
}
