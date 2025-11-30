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
  product: { id: string };
  variant: { id: string };
  quantity: number;
  rate: number;
}

export interface CreateOrderRequest {
  user: { id: string };
  status: 'unpaid' | 'pending' | 'ready_to_ship' | 'shipping' | 'delivered' | 'completed' | 'cancelled';
  discount: number;
  isCOD: boolean;
  shippingFee: number;
  shippingAddress: CreateOrderShippingAddressRequest;
  items: CreateOrderItemRequest[];
  voucherCode?: string;
}

export interface OrderResponse {
  id: string;
  user: any;
  status: string;
  isCOD: boolean;
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
          "ngrok-skip-browser-warning": "true",
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

  // 🟢 Tạo đơn hàng
  async createOrder(orderData: CreateOrderRequest): Promise<OrderResponse> {
    const token = localStorage.getItem('authToken');
    const body = {
      ...orderData,
      items: orderData.items.map(item => ({
        product: { id: item.product.id },
        variant: { id: item.variant.id },
        quantity: item.quantity,
        rate: item.rate,
      })),
    };

    return this.makeRequest<OrderResponse>(API_CONFIG.ENDPOINTS.ORDERS.CREATE, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  }

  // 🟢 Lấy tất cả đơn hàng (Admin)
  async getAllOrders(limit?: number, page?: number): Promise<{orders: OrderResponse[], pagination?: any}> {
    const token = localStorage.getItem('authToken');
    let url = API_CONFIG.ENDPOINTS.ORDERS.GET_ALL;

    const params = new URLSearchParams();
    if (limit !== undefined) params.append('limit', limit.toString());
    if (page !== undefined) params.append('page', page.toString());

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const result = await this.makeRequest<any>(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" },
    });

    // API trả về {orders: OrderResponse[], pagination: {...}}
    return result;
  }

  // 🟢 Lấy danh sách đơn hàng của user (đã sửa đúng)
  async getUserOrders(userId: string, limit?: number, page?: number): Promise<{orders: OrderResponse[], pagination?: any}> {
    const token = localStorage.getItem('authToken');
    let url = API_CONFIG.ENDPOINTS.ORDERS.GET_USER_ORDERS.replace(':userId', userId);

    const params = new URLSearchParams();
    if (limit !== undefined) params.append('limit', limit.toString());
    if (page !== undefined) params.append('page', page.toString());

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const result = await this.makeRequest<any>(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" },
    });

    // API trả về {orders: OrderResponse[], pagination: {...}}
    return result;
  }

  // 🟢 Lấy chi tiết đơn hàng
  async getOrderById(orderId: string): Promise<OrderResponse> {
    const token = localStorage.getItem('authToken');
    const url = API_CONFIG.ENDPOINTS.ORDERS.GET_BY_ID.replace(':id', orderId);

    return this.makeRequest<OrderResponse>(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" },
    });
  }

  // 🟢 Cập nhật đơn hàng
  async updateOrder(orderData: CreateOrderRequest): Promise<OrderResponse> {
    const token = localStorage.getItem('authToken');

    return this.makeRequest<OrderResponse>(API_CONFIG.ENDPOINTS.ORDERS.UPDATE, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(orderData),
    });
  }

  // 🟢 Xóa đơn hàng
  async deleteOrder(orderId: string): Promise<void> {
    const token = localStorage.getItem('authToken');
    const url = API_CONFIG.ENDPOINTS.ORDERS.DELETE.replace(':id', orderId);

    return this.makeRequest<void>(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // 🟢 Hủy đơn hàng
async cancelOrder(orderId: string): Promise<void> {
  const token = localStorage.getItem('authToken');
  const url = API_CONFIG.ENDPOINTS.ORDERS.CANCEL.replace(':id', orderId);

  return this.makeRequest<void>(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ reason: 'User cancelled the order' }), // ✅ gửi body JSON
  });
}


  // 🟢 Đánh dấu đã giao
  async markOrderAsDelivered(orderId: string): Promise<void> {
    const token = localStorage.getItem('authToken');
    const url = API_CONFIG.ENDPOINTS.ORDERS.MARK_AS_DELIVERED.replace(':id', orderId);

    return this.makeRequest<void>(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({}), // ✅ Thêm body JSON rỗng
    });
  }

  // 🟢 Sẵn sàng giao hàng
  async markOrderAsReadyToShip(orderId: string): Promise<void> {
    const token = localStorage.getItem('authToken');
    const url = API_CONFIG.ENDPOINTS.ORDERS.MARK_AS_READY_TO_SHIP.replace(':id', orderId);

    return this.makeRequest<void>(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({}), // ✅ Thêm body JSON rỗng
    });
  }

  // 🟢 Xác nhận hoàn thành đơn hàng
  async confirmOrderAsCompleted(orderId: string): Promise<void> {
    const token = localStorage.getItem('authToken');
    const url = API_CONFIG.ENDPOINTS.ORDERS.CONFIRM_AS_COMPLETED.replace(':id', orderId);

    return this.makeRequest<void>(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({}), // ✅ Thêm body JSON rỗng
    });
  }
  // 🟢 Đánh dấu đơn hàng đang giao
  async markOrderAsShipping(orderId: string): Promise<void> {
    const token = localStorage.getItem('authToken');
    const endpoint = API_CONFIG.ENDPOINTS.ORDERS.MARK_AS_SHIPPING;
    if (!endpoint) {
      throw new Error('MARK_AS_SHIPPING endpoint not found');
    }
    const url = endpoint.replace(':id', orderId);

    return this.makeRequest<void>(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({}), // ✅ Thêm body JSON rỗng
    });
  }

  // 🟢 Lấy thông tin hóa đơn hàng loạt (JSON)
async getInvoicesData(orderIds: string[]): Promise<Blob> {
  const token = localStorage.getItem('authToken');

  const response = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDERS.INVOICES_BATCH}`,
    {
      method: "POST",
      headers: {
              "Content-Type": "application/json",  

        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ orderIds }),
    }
  );

  if (!response.ok) {
    throw new Error("API failed");
  }

  return await response.blob(); // ❗ Trả về BLOB chứ không parse JSON
}


  // 🟢 Lấy thông tin hóa đơn cho một đơn hàng
  async getInvoice(orderId: string): Promise<any> {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDERS.INVOICES_BATCH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ orderIds: [orderId] }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('Single invoice API response:', data);

    if (data && data.success === false) {
      throw new Error(data.message || 'API request failed');
    }

    const result = data.data || data;
    return Array.isArray(result) ? result[0] : result;
  }

  // 🟢 Tải xuống hóa đơn hàng loạt
  async downloadInvoicesBatch(orderIds: string[]): Promise<Blob> {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDERS.INVOICES_BATCH_DOWNLOAD}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ orderIds }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }

  // 🟢 Tải xuống hóa đơn cho một đơn hàng
  async downloadInvoice(orderId: string): Promise<Blob> {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDERS.INVOICES_BATCH_DOWNLOAD}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ orderIds: [orderId] }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }
}

export const orderService = new OrderService();
export default orderService;
