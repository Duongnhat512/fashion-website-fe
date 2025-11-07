import { API_CONFIG } from "../config/api.config";
import { authService } from "./authService";

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface User {
  id: string;
  fullname: string;
  email: string;
  dob: string;
  gender: string;
  phone: string;
  avt: string | null;
  role: string;
  status: boolean;
  refreshToken: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: User[];
}

export interface UpdateUserRequest {
  fullname?: string;
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  role?: string;
  status?: boolean;
}

export const userService = {
  // Lấy danh sách tất cả người dùng
  getAllUsers: async (): Promise<User[]> => {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Không thể lấy danh sách người dùng");
    }

    const result: UserResponse = await response.json();
    return result.data;
  },

  // Cập nhật thông tin người dùng (sử dụng authService)
  updateUser: async (
    userId: string,
    data: UpdateUserRequest
  ): Promise<void> => {
    // Sử dụng hàm updateUser từ authService
    await authService.updateUser({
      id: userId,
      ...data,
    });
  },

  // Vô hiệu hóa/kích hoạt người dùng
  toggleUserStatus: async (userId: string, status: boolean): Promise<void> => {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error("Không thể cập nhật trạng thái người dùng");
    }
  },
};
