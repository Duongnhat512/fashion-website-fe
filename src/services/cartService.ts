import { API_CONFIG } from '../config/api.config';
import type { ApiResponse } from '../types/product.types';

interface CartItemRequest {
  productId: string;
  variantId: string;
  quantity: number;
}

export const cartService = {
  getAuthToken() {
    return localStorage.getItem("authToken");
  },

  async addItemToCart(item: CartItemRequest): Promise<ApiResponse<any>> {
    const token = this.getAuthToken();

    const variantId = item.variantId || "";

    const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CART.ADD_ITEM}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        productId: item.productId,
        variantId: variantId,
        quantity: item.quantity,
      }),
    });

    if (!res.ok) throw new Error('Không thể thêm sản phẩm vào giỏ hàng');
    return res.json();
  },

  async removeItemFromCart(item: CartItemRequest): Promise<ApiResponse<any>> {
    const token = this.getAuthToken();

    const variantId = item.variantId || "";

    const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CART.REMOVE_ITEM}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        productId: item.productId,
        variantId: variantId,
        quantity: item.quantity,
      }),
    });

    if (!res.ok) throw new Error('Không thể xóa sản phẩm khỏi giỏ hàng');
    return res.json();
  },

  async updateCartItem(item: CartItemRequest): Promise<ApiResponse<any>> {
    const token = this.getAuthToken();

    const variantId = item.variantId || "";

    const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CART.UPDATE_ITEM}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        productId: item.productId,
        variantId: variantId,
        quantity: item.quantity,
      }),
    });

    if (!res.ok) throw new Error('Không thể cập nhật sản phẩm trong giỏ hàng');
    return res.json();
  },

  async getCart(): Promise<ApiResponse<any>> {
    const token = this.getAuthToken();

    const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CART.GET_CART}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!res.ok) throw new Error('Không thể lấy giỏ hàng');
    return res.json();
  },
};
