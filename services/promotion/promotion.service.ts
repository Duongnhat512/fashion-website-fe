import { API_CONFIG } from "../../lib/api.config";
import type { ApiResponse } from "../../types/product.types";
import type { Promotion, PromotionListResponse, CreatePromotionRequest } from "./promotion.types";

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
export type { Promotion, CreatePromotionRequest } from './promotion.types';
