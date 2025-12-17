import type { ApiResponse, PaginatedProductsResponse, Product } from "./product.types";
import { API_CONFIG } from "../../lib/api.config";
import type { SearchParams } from "./product.types";

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


  async getAllProducts(page: number = API_CONFIG.DEFAULT_PAGINATION.PAGE, limit: number = API_CONFIG.DEFAULT_PAGINATION.LIMIT): Promise<PaginatedProductsResponse> {
    const url = `${API_CONFIG.ENDPOINTS.PRODUCTS.GET_ALL}?page=${page}&limit=${limit}`;
    return this.makeRequest<PaginatedProductsResponse>(url);
  }


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

  return res[0]; 
}


  async getRecommendations(token: string): Promise<Product[]> {
    return this.makeRequest<Product[]>(API_CONFIG.ENDPOINTS.PRODUCTS.RECOMMENDATIONS, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  }


  async createProduct(formData: FormData, token: string): Promise<Product> {
    const endpoint = API_CONFIG.ENDPOINTS.PRODUCTS.CREATE;
    
    if (!endpoint) {
      console.error('❌ CREATE endpoint is undefined!', API_CONFIG.ENDPOINTS.PRODUCTS);
      throw new Error('API endpoint not configured');
    }
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
        
        },
        body: formData,
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Lỗi khi tạo sản phẩm");
        } else {
          const errorText = await response.text();
          throw new Error(errorText || "Lỗi khi tạo sản phẩm");
        }
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server trả về response không phải JSON");
      }

      const data: ApiResponse<Product> = await response.json();
      if (!data.success) throw new Error(data.message || "API request failed");
      return data.data;
    } catch (error) {
      console.error("❌ Create product failed:", error);
      throw error;
    }
  }


  async deleteProduct(productId: string, token: string): Promise<any> {
    const endpoint = API_CONFIG.ENDPOINTS.PRODUCTS.DELETE.replace(':id', productId);
    
    return this.makeRequest<any>(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  }

 
  async updateProduct(formData: FormData, token: string): Promise<Product> {
    const endpoint = API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE;
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
        
        },
        body: formData,
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Lỗi khi cập nhật sản phẩm");
        } else {
          const errorText = await response.text();
          throw new Error(errorText || "Lỗi khi cập nhật sản phẩm");
        }
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server trả về response không phải JSON");
      }

      const data: ApiResponse<Product> = await response.json();
      if (!data.success) throw new Error(data.message || "API request failed");
      return data.data;
    } catch (error) {
      console.error("❌ Update product failed:", error);
      throw error;
    }
  }
  
}

export const productService = new ProductService();
export default productService;
