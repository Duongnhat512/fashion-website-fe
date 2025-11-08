import { API_CONFIG } from '../config/api.config';
import type { ApiResponse } from '../types/product.types';

export const colorService = {
  async getAll(): Promise<ApiResponse<any>> {
    const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COLOR.GET_ALL}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) throw new Error('Không thể tải danh sách màu sắc');
    return res.json();
  },
};

export default colorService;
