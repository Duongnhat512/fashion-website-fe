import { API_CONFIG } from '../config/api.config';

export interface CreateOrderShippingAddressRequest {
  fullName: string;
  phone: string;
  fullAddress: string;
  city: string;
  district: string;
  ward: string;
}

export interface CreateOrderItemRequest {
  product: {
    id: string;
    name: string;
    price: number;
  };
  variant: {
    id: string;
    size: string;
    color: string;
    sku: string;
  };
  quantity: number;
  rate: number;
}

export interface CreateOrderRequest {
  user: {
    id: string;
    fullname: string;
    email: string;
  };
  status: 'UNPAID' | 'PAID' | 'CANCELLED' | 'SHIPPING' | 'DELIVERED';
  discount: number;
  isCOD: boolean;
  shippingFee: number;
  shippingAddress: CreateOrderShippingAddressRequest;
  items: CreateOrderItemRequest[];
}

export interface OrderResponse {
  id: string;
  user: any;
  status: string;
  subTotal: number;
  discount: number;
  totalAmount: number;
  shippingFee: number;
  createdAt: string;
  updatedAt: string;
  items: any[];
  shippingAddress: any;
}

class OrderService {
  private async makeRequest<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      
      if (data && data.success === false) {
        throw new Error(data.message || 'API request failed');
      }

      return data.data || data;
    } catch (error) {
      console.error('❌ Order API request failed:', error);
      throw error;
    }
  }

  async createOrder(orderData: CreateOrderRequest): Promise<OrderResponse> {
    const token = localStorage.getItem('authToken');
    
    return this.makeRequest<OrderResponse>('/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
  }

  async getUserOrders(userId: string): Promise<OrderResponse[]> {
    const token = localStorage.getItem('authToken');
    
    return this.makeRequest<OrderResponse[]>(`/orders/user/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getOrderById(orderId: string): Promise<OrderResponse> {
    const token = localStorage.getItem('authToken');
    
    return this.makeRequest<OrderResponse>(`/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}

export const orderService = new OrderService();
export default orderService;