import { API_CONFIG } from '../../lib/api.config';
import type {
  DashboardStats,
  TopSellingProduct,
  ProductStats,
  OrderStats,
  RevenueStats,
  RevenueByStatus,
  RevenueTimeSeries,
  SalesDetail,
  TopProductByRevenue,
  TopProductByViews,
  HourlyRevenue,
  RevenueComparison,
  ProfitTimeSeries,
} from './statistics.types';

class StatisticsService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    };
  }

  private async makeRequest<T>(url: string): Promise<T> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
        },
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

  async getRevenueByStatus(): Promise<RevenueByStatus[]> {
    return this.makeRequest<RevenueByStatus[]>(
      API_CONFIG.ENDPOINTS.STATISTICS.REVENUE_BY_STATUS
    );
  }

  async getRevenueTimeSeries(startDate?: string, endDate?: string): Promise<RevenueTimeSeries[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return this.makeRequest<RevenueTimeSeries[]>(
      `${API_CONFIG.ENDPOINTS.STATISTICS.REVENUE_TIME_SERIES}${query ? `?${query}` : ''}`
    );
  }

  async getSalesDetail(): Promise<SalesDetail> {
    return this.makeRequest<SalesDetail>(
      API_CONFIG.ENDPOINTS.STATISTICS.SALES_DETAIL
    );
  }

  async getTopProductsByRevenue(limit: number = 10): Promise<TopProductByRevenue[]> {
    return this.makeRequest<TopProductByRevenue[]>(
      `${API_CONFIG.ENDPOINTS.STATISTICS.TOP_BY_REVENUE}?limit=${limit}`
    );
  }

  async getTopProductsByViews(limit: number = 10): Promise<TopProductByViews[]> {
    return this.makeRequest<TopProductByViews[]>(
      `${API_CONFIG.ENDPOINTS.STATISTICS.TOP_BY_VIEWS}?limit=${limit}`
    );
  }

  async getRevenueHourly(date?: string): Promise<HourlyRevenue[]> {
    const query = date ? `?date=${date}` : '';
    return this.makeRequest<HourlyRevenue[]>(
      `${API_CONFIG.ENDPOINTS.STATISTICS.REVENUE_HOURLY}${query}`
    );
  }

  async getRevenueComparison(date?: string): Promise<RevenueComparison> {
    const query = date ? `?date=${date}` : '';
    return this.makeRequest<RevenueComparison>(
      `${API_CONFIG.ENDPOINTS.STATISTICS.REVENUE_COMPARISON}${query}`
    );
  }

  async getProfitTimeSeries(startDate?: string, endDate?: string): Promise<ProfitTimeSeries[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return this.makeRequest<ProfitTimeSeries[]>(
      `${API_CONFIG.ENDPOINTS.STATISTICS.PROFIT_TIME_SERIES}${query ? `?${query}` : ''}`
    );
  }

  async getRevenueForecast(period: 'week' | 'month' | 'quarter' | 'year' = 'month', startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams({ period });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return this.makeRequest<any>(
      `${API_CONFIG.ENDPOINTS.STATISTICS.REVENUE_FORECAST}?${query}`
    );
  }
}

export const statisticsService = new StatisticsService();
export default statisticsService;
export type {
  DashboardStats,
  TopSellingProduct,
  ProductStats,
  OrderStats,
  RevenueStats,
  RevenueByStatus,
  RevenueTimeSeries,
  SalesDetail,
  TopProductByRevenue,
  TopProductByViews,
  HourlyRevenue,
  RevenueComparison,
  ProfitTimeSeries,
} from './statistics.types';
