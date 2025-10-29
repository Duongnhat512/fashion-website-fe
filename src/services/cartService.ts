import { API_CONFIG } from '../config/api.config';
import type { ApiResponse } from '../types/product.types';

interface CartItemRequest {
  productId: string;
  variantId: string;
  quantity: number;
}

export const cartService = {
  // Lấy token từ localStorage (hoặc có thể lấy từ context, cookies, etc.)
  getAuthToken() {
    return localStorage.getItem("authToken"); // Ví dụ lấy token từ localStorage
  },

  // Thêm sản phẩm vào giỏ hàng
  async addItemToCart(item: CartItemRequest): Promise<ApiResponse<any>> {
    const token = this.getAuthToken(); // Lấy token xác thực

    const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CART.ADD_ITEM}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '', // Thêm token vào header nếu có
      },
      body: JSON.stringify(item),
    });

    if (!res.ok) throw new Error('Không thể thêm sản phẩm vào giỏ hàng');
    return res.json();
  },

  // Xóa sản phẩm khỏi giỏ hàng
  async removeItemFromCart(item: CartItemRequest): Promise<ApiResponse<any>> {
    const token = this.getAuthToken(); // Lấy token xác thực

    const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CART.REMOVE_ITEM}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '', // Thêm token vào header nếu có
      },
      body: JSON.stringify(item),
    });

    if (!res.ok) throw new Error('Không thể xóa sản phẩm khỏi giỏ hàng');
    return res.json();
  },

  // Cập nhật giỏ hàng
  async updateCartItem(item: CartItemRequest): Promise<ApiResponse<any>> {
    const token = this.getAuthToken(); // Lấy token xác thực

    const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CART.UPDATE_ITEM}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '', // Thêm token vào header nếu có
      },
      body: JSON.stringify(item),
    });

    if (!res.ok) throw new Error('Không thể cập nhật sản phẩm trong giỏ hàng');
    return res.json();
  },

  // Lấy giỏ hàng của người dùng
  async getCart(): Promise<ApiResponse<any>> {
    const token = this.getAuthToken(); // Lấy token xác thực

    const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CART.GET_CART}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '', // Thêm token vào header nếu có
      },
    });

    if (!res.ok) throw new Error('Không thể lấy giỏ hàng');
    return res.json();
  },
};
