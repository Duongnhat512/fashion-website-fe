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

export interface RevenueByStatus {
  status: string;
  revenue: number;
  count: string;
}

export interface RevenueTimeSeries {
  date: string;
  revenue: number;
  count: string;
}

export interface SalesDetail {
  totalProducts: number;
  activeProducts: number;
  inStockProducts: number;
  viewedProducts: number;
  productsOnSale: number;
  productsSold: number;
  productViews: number;
  productVisitors: number;
  stockRate: number;
  viewRate: number;
  saleRate: number;
}

export interface TopProductByRevenue {
  productId: string;
  productName: string;
  productImage: string;
  revenue: number;
  quantity: number;
  orders: number;
}

export interface TopProductByViews {
  productId: string;
  productName: string;
  productImage: string;
  views: number;
  visitors: number;
  conversionRate: number;
}

export interface HourlyRevenue {
  hour: number;
  revenue: number;
  orders: number;
  profit: number;
}

export interface RevenueComparison {
  current: {
    revenue: number;
    orders: number;
    profit: number;
  };
  previous: {
    revenue: number;
    orders: number;
    profit: number;
  };
  average: {
    revenue: number;
    orders: number;
    profit: number;
  };
  comparison: {
    vsYesterday: {
      percentage: number;
      trend: string;
    };
    vsAverage: {
      percentage: number;
      trend: string;
    };
  };
}

export interface ProfitTimeSeries {
  date: string;
  profit: number;
  revenue: number;
  cost: number;
}