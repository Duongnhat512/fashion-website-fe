import type { ApiResponse, PaginatedProductsResponse, Product } from "../types/product.types";
import { API_CONFIG } from "../config/api.config";

interface SearchParams {
  search?: string;
  categoryId?: string;
  slug?: string;
  sort?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

class ProductService {
  private async makeRequest<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
        headers: { "Content-Type": "application/json", ...options?.headers, "ngrok-skip-browser-warning": "true" },
        ...options,
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data: ApiResponse<T> = await response.json();

      if (!data.success) throw new Error(data.message || "API request failed");

      return data.data;
    } catch (error) {
      console.error("❌ API request failed:", error);
      throw error;
    }
  }

  /**
   * 🧩 Lấy danh sách sản phẩm (có phân trang)
   */
  async getAllProducts(page: number = API_CONFIG.DEFAULT_PAGINATION.PAGE, limit: number = API_CONFIG.DEFAULT_PAGINATION.LIMIT): Promise<PaginatedProductsResponse> {
    const url = `${API_CONFIG.ENDPOINTS.PRODUCTS.GET_ALL}?page=${page}&limit=${limit}`;
    return this.makeRequest<PaginatedProductsResponse>(url);
  }

  /**
   * 🔍 Tìm kiếm sản phẩm (có hỗ trợ categoryId, slug, sort, sortBy)
   */
  async searchProducts(params: SearchParams): Promise<PaginatedProductsResponse> {
    const query = new URLSearchParams();

    if (params.search) query.append("search", params.search);
    if (params.categoryId) query.append("categoryId", params.categoryId);
    if (params.slug) query.append("slug", params.slug);
    if (params.sort) query.append("sort", params.sort);
    if (params.sortBy) query.append("sortBy", params.sortBy);
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));

    const url = `${API_CONFIG.ENDPOINTS.PRODUCTS.SEARCH}?${query.toString()}`;
    return this.makeRequest<PaginatedProductsResponse>(url);
  }

  /**
   * 🧩 Lấy chi tiết sản phẩm theo ID
   */
 async getProductById(id: string, token: string): Promise<Product> {
  const url = `${API_CONFIG.ENDPOINTS.PRODUCTS.GET_BY_ID.replace(':id', id)}`;
  const res = await this.makeRequest<any>(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // 🔥 FIX: API trả về data: [product]
  return res[0]; 
}

  /**
   * 🎯 Lấy sản phẩm gợi ý cho người dùng
   */
  async getRecommendations(token: string): Promise<Product[]> {
    return this.makeRequest<Product[]>(API_CONFIG.ENDPOINTS.PRODUCTS.RECOMMENDATIONS, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  }

  /**
   * ➕ Tạo sản phẩm mới
   */
  async createProduct(productData: any, token: string): Promise<Product> {
    const endpoint = API_CONFIG.ENDPOINTS.PRODUCTS.CREATE;
    
    if (!endpoint) {
      console.error('❌ CREATE endpoint is undefined!', API_CONFIG.ENDPOINTS.PRODUCTS);
      throw new Error('API endpoint not configured');
    }
    

    
    return this.makeRequest<Product>(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(productData),
    });
  }

  /**
   * 🗑️ Xóa sản phẩm theo ID
   */
  async deleteProduct(productId: string, token: string): Promise<any> {
    const endpoint = API_CONFIG.ENDPOINTS.PRODUCTS.DELETE.replace(':id', productId);
    
    console.log('🗑️ Delete Product Endpoint:', endpoint);
    
    return this.makeRequest<any>(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  }

  /**
   * ✏️ Cập nhật sản phẩm
   */
  async updateProduct(productData: any, token: string): Promise<Product> {
    const endpoint = API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE;
    
    console.log('✏️ Update Product Endpoint:', endpoint);
    console.log('✏️ Update Data:', productData);
    
    return this.makeRequest<Product>(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(productData),
    });
  }
  
}

export const productService = new ProductService();
export default productService;
