import { API_CONFIG } from '../config/api.config';
import type { ApiResponse } from '../types/product.types';

export const categoryService = {
  async getTree(): Promise<ApiResponse<any>> {
    const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES.TREE}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": "true"
      },
    });

    if (!res.ok) throw new Error('Không thể tải danh mục');
    return res.json();
  },

  async getAll(): Promise<ApiResponse<any>> {
    const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES.GET_ALL}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": "true"
      },
    });

    if (!res.ok) throw new Error('Không thể tải danh mục');
    return res.json();
  },

  async getById(id: string): Promise<ApiResponse<any>> {
    const res = await fetch(`${API_CONFIG.BASE_URL}/categories/get-by-id?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": "true"
      },
    });

    if (!res.ok) throw new Error('Không thể tải danh mục');
    return res.json();
  },

  async create(data: { name: string; slug: string; description?: string; iconUrl?: string; parent_id?: string | null }): Promise<ApiResponse<any>> {
    const token = localStorage.getItem('token');
    
    const payload: any = {
      name: data.name,
      slug: data.slug,
      iconUrl: data.iconUrl,
    };
    
    if (data.description) {
      payload.description = data.description;
    }
    
    if (data.parent_id) {
      payload.parent = { id: data.parent_id };
    }
    
    const res = await fetch(`${API_CONFIG.BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true"
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Không thể tạo danh mục');
    return res.json();
  },

  async update(data: { id: string; name: string; slug: string; description?: string; iconUrl?: string; parent_id?: string | null }): Promise<ApiResponse<any>> {
    const token = localStorage.getItem('token');
    
    const payload: any = {
      id: data.id,
      name: data.name,
      slug: data.slug,
      iconUrl: data.iconUrl,
    };
    
    if (data.description) {
      payload.description = data.description;
    }
    
    if (data.parent_id) {
      payload.parent = { id: data.parent_id };
    }
    
    const res = await fetch(`${API_CONFIG.BASE_URL}/categories`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true"
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Không thể cập nhật danh mục');
    return res.json();
  },

  async delete(id: string): Promise<ApiResponse<any>> {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_CONFIG.BASE_URL}/categories/delete/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true"
      },
      body: JSON.stringify({}),
    });

    if (!res.ok) throw new Error('Không thể xóa danh mục');
    return res.json();
  },
};
