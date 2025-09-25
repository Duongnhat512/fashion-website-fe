import type { ApiResponse, PaginatedProductsResponse, Product } from '../types/product.types';
import { API_CONFIG } from '../config/api.config';

class ProductService {
  private async makeRequest<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<T> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }

      return data.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getAllProducts(page: number = 1, limit: number = 10): Promise<PaginatedProductsResponse> {
    return this.makeRequest<PaginatedProductsResponse>(`${API_CONFIG.ENDPOINTS.PRODUCTS}?page=${page}&limit=${limit}`);
  }

  async getProductById(id: string): Promise<Product> {
    return this.makeRequest<Product>(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`);
  }
}

export const productService = new ProductService();
export default productService;