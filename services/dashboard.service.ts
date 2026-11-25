import { apiClient } from './api.client';

export interface DailyRevenuePoint {
  name: string;
  date: string;
  revenue: number;
  profit: number;
}

export interface CategorySalesPoint {
  name: string;
  value: number;
}

export interface WeeklyPerformanceData {
  target: number;
  current: number;
  percentage: number;
  formattedTarget: string;
  formattedCurrent: string;
}

export interface ChannelPerformancePoint {
  name: string;
  organic: number;
  paid: number;
  social: number;
}

export interface RecentOrderPoint {
  id: number;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface DashboardOverviewData {
  totalRevenue: number;
  formattedTotalRevenue: string;
  revenueGrowth: number;
  revenueGrowthTrend: 'up' | 'down';

  totalOrders: number;
  ordersGrowth: number;
  ordersGrowthTrend: 'up' | 'down';

  activeCustomers: number;
  customersGrowth: number;
  customersGrowthTrend: 'up' | 'down';

  conversionRate: number;
  conversionRateGrowth: number;
  conversionRateTrend: 'up' | 'down';

  revenueTrend: DailyRevenuePoint[];
  categoryDistribution: CategorySalesPoint[];
  weeklyPerformance: WeeklyPerformanceData;
  acquisitionChannels: ChannelPerformancePoint[];
  recentOrders: RecentOrderPoint[];
}

class DashboardServiceClass {
  private endpoint = '/api/v1/dashboard';

  async getOverview(): Promise<DashboardOverviewData> {
    return apiClient.get<DashboardOverviewData>(`${this.endpoint}/overview`);
  }
}

export const DashboardService = new DashboardServiceClass();
