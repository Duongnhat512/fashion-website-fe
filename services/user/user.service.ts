import { API_CONFIG } from "../../lib/api.config";
import { authService } from "../auth/auth.service";
import type { User, UserResponse, UpdateUserRequest } from './user.types';

class UserService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    };
  }

  private async makeRequest<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          "ngrok-skip-browser-warning": "true",
          ...(options?.headers || {}),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: UserResponse = await response.json() as any;
      
      if (!result.success) {
        throw new Error(result.message || 'API request failed');
      }

      return result.data as T;
    } catch (error) {
      console.error('User API request failed:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    return this.makeRequest<User[]>('/users', {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
        "ngrok-skip-browser-warning": "true",
      },
    });
  }

  async updateUser(userId: string, data: UpdateUserRequest): Promise<void> {
    await authService.updateUser({
      id: userId,
      ...data,
    });
  }

  async toggleUserStatus(userId: string, status: boolean): Promise<void> {
    await this.makeRequest<void>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
}

export const userService = new UserService();
export type { User } from './user.types';
