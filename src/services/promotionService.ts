import { API_CONFIG } from "../config/api.config";
import type { ApiResponse } from "../types/product.types";

export interface Promotion {
  id: string;
  productIds: string[];
  products?: {
    id: string;
    name: string;
    slug: string;
    shortDescription: string;
    imageUrl: string;
    brand: string | null;
    status: string;
    tags: string;
    ratingAverage: number;
    ratingCount: number;
    createdAt: string;
    updatedAt: string;
  }[];
  categoryId: string | null;
  categoryName: string | null;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  name: string;
  startDate: string;
  endDate: string;
  active: boolean;
  note: string;
  createdAt: string;
  updatedAt: string;
  status: "draft" | "submitted" | "active" | "inactive";
}

export interface PromotionListResponse {
  data: Promotion[];
  total: number;
  page: number;
  limit: number;
}

export interface CreatePromotionRequest {
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  name: string;
  note: string;
  startDate: string;
  endDate: string;
  productIds?: string[];
  categoryId?: string;
}

class PromotionService {
  private getAuthHeaders() {
    const token = localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    };
  }

  async getAll(
    page: number = 1,
    limit: number = 10
  ): Promise<PromotionListResponse> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROMOTIONS.GET_ALL}?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<PromotionListResponse> = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Lấy danh sách khuyến mãi thất bại");
    }

    return data.data;
  }

  async create(promotion: CreatePromotionRequest): Promise<Promotion> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROMOTIONS.CREATE}`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(promotion),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<Promotion> = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Tạo khuyến mãi thất bại");
    }

    return data.data;
  }

  async update(id: string, promotion: Partial<CreatePromotionRequest>): Promise<Promotion> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROMOTIONS.UPDATE.replace(":id", id)}`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(promotion),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<Promotion> = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Cập nhật khuyến mãi thất bại");
    }

    return data.data;
  }

  async activate(id: string): Promise<void> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROMOTIONS.ACTIVATE.replace(":id", id)}`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({}),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<void> = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Kích hoạt khuyến mãi thất bại");
    }
  }

  async deactivate(id: string): Promise<void> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROMOTIONS.DEACTIVATE.replace(":id", id)}`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({}),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<void> = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Hủy kích hoạt khuyến mãi thất bại");
    }
  }

  async submit(id: string): Promise<void> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROMOTIONS.SUBMIT.replace(":id", id)}`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({}),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<void> = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Gửi duyệt khuyến mãi thất bại");
    }
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROMOTIONS.DELETE.replace(":id", id)}`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<void> = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Xóa khuyến mãi thất bại");
    }
  }
}

export const promotionService = new PromotionService();
export default promotionService;
