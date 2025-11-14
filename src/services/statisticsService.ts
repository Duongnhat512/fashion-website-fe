import { API_CONFIG } from '../config/api.config';

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  recentOrders: number;
}

export interface TopSellingProduct {
  productId: string;
  productName: string;
  totalQuantity: string;
  totalRevenue: number;
  orderCount: string;
}

export interface ProductStats {
  totalProducts: number;
  totalSold: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface OrderStats {
  totalOrders: number;
  ordersByStatus: Array<{
    status: string;
    count: number;
  }>;
  cancelledRate: number;
  averageOrderValue: number;
}

export interface RevenueStats {
  revenue: number;
}

class StatisticsService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  private async makeRequest<T>(url: string): Promise<T> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'API request failed');
      }

      return result.data;
    } catch (error) {
      console.error('Statistics API request failed:', error);
      throw error;
    }
  }

  async getDashboard(startDate: string, endDate: string): Promise<DashboardStats> {
    return this.makeRequest<DashboardStats>(
      `${API_CONFIG.ENDPOINTS.STATISTICS.DASHBOARD}?startDate=${startDate}&endDate=${endDate}`
    );
  }

  async getTopSellingProducts(): Promise<TopSellingProduct[]> {
    return this.makeRequest<TopSellingProduct[]>(
      API_CONFIG.ENDPOINTS.STATISTICS.TOP_SELLING_PRODUCTS
    );
  }

  async getProductsStatistics(): Promise<ProductStats> {
    return this.makeRequest<ProductStats>(
      API_CONFIG.ENDPOINTS.STATISTICS.PRODUCTS_STATISTICS
    );
  }

  async getOrdersStatistics(): Promise<OrderStats> {
    return this.makeRequest<OrderStats>(
      API_CONFIG.ENDPOINTS.STATISTICS.ORDERS_STATISTICS
    );
  }

  async getRevenue(): Promise<RevenueStats> {
    return this.makeRequest<RevenueStats>(
      API_CONFIG.ENDPOINTS.STATISTICS.REVENUE
    );
  }
}

export const statisticsService = new StatisticsService();
export default statisticsService;
