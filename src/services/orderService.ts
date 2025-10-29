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
  };
  variant: {
    id: string;
  };
  quantity: number;
  rate: number;
}

export interface CreateOrderRequest {
  user: {
    id: string;
  };
  status: 'unpaid' | 'paid' | 'shipped' | 'delivered' | 'completed' | 'canceled';
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

    const body = {
      status: orderData.status,
      discount: orderData.discount,
      shippingFee: orderData.shippingFee,
      isCOD: orderData.isCOD,
      items: orderData.items.map(item => ({
        product: { id: item.product.id },
        variant: { id: item.variant.id },
        quantity: item.quantity,
        rate: item.rate,
      })),
      shippingAddress: {
        fullName: orderData.shippingAddress.fullName,
        phone: orderData.shippingAddress.phone,
        fullAddress: orderData.shippingAddress.fullAddress,
        city: orderData.shippingAddress.city,
        district: orderData.shippingAddress.district,
        ward: orderData.shippingAddress.ward,
      },
      user: {
        id: orderData.user.id,
      },
    };

    try {
      // Gọi API để tạo đơn hàng
      return this.makeRequest<OrderResponse>(API_CONFIG.ENDPOINTS.ORDERS.CREATE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),  // Gửi body đơn hàng lên API
      });
    } catch (error) {
      throw new Error('Đặt hàng thất bại. Vui lòng thử lại!');
    }
  }

  async getUserOrders(userId: string): Promise<OrderResponse[]> {
    const token = localStorage.getItem('authToken');
    
    return this.makeRequest<OrderResponse[]>(API_CONFIG.ENDPOINTS.ORDERS.GET_ALL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getOrderById(orderId: string): Promise<OrderResponse> {
    const token = localStorage.getItem('authToken');
    
    return this.makeRequest<OrderResponse>(API_CONFIG.ENDPOINTS.ORDERS.GET_BY_ID.replace(':id', orderId), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async updateOrder(orderData: CreateOrderRequest): Promise<OrderResponse> {
    const token = localStorage.getItem('authToken');
    
    return this.makeRequest<OrderResponse>(API_CONFIG.ENDPOINTS.ORDERS.UPDATE, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
  }

  async deleteOrder(orderId: string): Promise<void> {
    const token = localStorage.getItem('authToken');
    
    return this.makeRequest<void>(API_CONFIG.ENDPOINTS.ORDERS.DELETE.replace(':id', orderId), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async cancelOrder(orderId: string): Promise<void> {
    const token = localStorage.getItem('authToken');
    
    return this.makeRequest<void>(API_CONFIG.ENDPOINTS.ORDERS.CANCEL.replace(':id', orderId), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async markOrderAsDelivered(orderId: string): Promise<void> {
    const token = localStorage.getItem('authToken');
    
    return this.makeRequest<void>(API_CONFIG.ENDPOINTS.ORDERS.MARK_AS_DELIVERED, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async markOrderAsReadyToShip(orderId: string): Promise<void> {
    const token = localStorage.getItem('authToken');
    
    return this.makeRequest<void>(API_CONFIG.ENDPOINTS.ORDERS.MARK_AS_READY_TO_SHIP, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async confirmOrderAsCompleted(orderId: string): Promise<void> {
    const token = localStorage.getItem('authToken');
    
    return this.makeRequest<void>(API_CONFIG.ENDPOINTS.ORDERS.CONFIRM_AS_COMPLETED, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}

export const orderService = new OrderService();
export default orderService;
