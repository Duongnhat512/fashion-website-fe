import { API_CONFIG } from "../../lib/api.config";
import type { ApiResponse } from "../../types/product.types";
import type { Voucher, VoucherListResponse, CreateVoucherRequest } from './voucher.types';

class VoucherService {
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
    limit: number = 10,
    search?: string,
    isActive?: boolean,
    includeExpired?: boolean
  ): Promise<VoucherListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append("search", search);
    if (isActive !== undefined) params.append("isActive", isActive.toString());
    if (includeExpired !== undefined) params.append("includeExpired", includeExpired.toString());

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VOUCHERS.GET_ALL}?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<VoucherListResponse> = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Lấy danh sách voucher thất bại");
    }

    return data.data;
  }

  async getAllVouchers(
    search?: string,
    isActive?: boolean,
    includeExpired?: boolean
  ): Promise<Voucher[]> {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (isActive !== undefined) params.append("isActive", isActive.toString());
    if (includeExpired !== undefined) params.append("includeExpired", includeExpired.toString());

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VOUCHERS.GET_ALL}?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<VoucherListResponse> = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Lấy danh sách voucher thất bại");
    }

    return data.data.data; 
  }

  async getById(id: string): Promise<Voucher> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VOUCHERS.GET_BY_ID.replace(":id", id)}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<Voucher> = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Lấy voucher thất bại");
    }

    return data.data;
  }

  async create(voucher: CreateVoucherRequest): Promise<Voucher> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VOUCHERS.CREATE}`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(voucher),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<Voucher> = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Tạo voucher thất bại");
    }

    return data.data;
  }

  async update(id: string, voucher: Partial<CreateVoucherRequest>): Promise<Voucher> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VOUCHERS.UPDATE.replace(":id", id)}`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(voucher),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<Voucher> = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Cập nhật voucher thất bại");
    }

    return data.data;
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VOUCHERS.DELETE.replace(":id", id)}`,
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
      throw new Error(data.message || "Xóa voucher thất bại");
    }
  }

  async toggle(id: string, isActive: boolean): Promise<void> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VOUCHERS.TOGGLE.replace(":id", id)}`,
      {
        method: "PATCH",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ isActive }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<void> = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Toggle voucher thất bại");
    }
  }
}

export const voucherService = new VoucherService();
export default voucherService;
export type { Voucher, CreateVoucherRequest } from './voucher.types';