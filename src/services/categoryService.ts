import { API_CONFIG } from '../config/api.config';
import type { ApiResponse } from '../types/product.types';

export const categoryService = {
  async getTree(): Promise<ApiResponse<any>> {
    const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES.TREE}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) throw new Error('Không thể tải danh mục');
    return res.json();
  },
};
