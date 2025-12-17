import { API_CONFIG } from '../../lib/api.config';
import type {
  CreateAddressRequest,
  UpdateAddressRequest,
  AddressResponse,
} from './address.types';

export const addressService = {
  getAuthToken() {
    return localStorage.getItem('authToken');
  },

  // Lấy tất cả địa chỉ của user
  async getAllAddresses(): Promise<AddressResponse> {
    const token = this.getAuthToken();
    
    if (!token) {
      throw new Error('Vui lòng đăng nhập');
    }

    const res = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADDRESS.GET_ALL}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      }
    );

    if (!res.ok) throw new Error('Không thể lấy danh sách địa chỉ');
    return res.json();
  },

  // Lấy địa chỉ theo ID
  async getAddressById(id: string): Promise<AddressResponse> {
    const token = this.getAuthToken();

    const res = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADDRESS.GET_BY_ID(id)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
          'ngrok-skip-browser-warning': 'true',
        },
      }
    );

    if (!res.ok) throw new Error('Không thể lấy thông tin địa chỉ');
    return res.json();
  },

  // Tạo địa chỉ mới
  async createAddress(
    address: CreateAddressRequest
  ): Promise<AddressResponse> {
    const token = this.getAuthToken();
    
    if (!token) {
      throw new Error('Vui lòng đăng nhập để thêm địa chỉ');
    }

    const res = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADDRESS.CREATE}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(address),
      }
    );

    if (!res.ok) throw new Error('Không thể tạo địa chỉ');
    return res.json();
  },

  // Cập nhật địa chỉ
  async updateAddress(
    id: string,
    address: Partial<UpdateAddressRequest>
  ): Promise<AddressResponse> {
    const token = this.getAuthToken();
    
    if (!token) {
      throw new Error('Vui lòng đăng nhập');
    }

    const res = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADDRESS.UPDATE(id)}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(address),
      }
    );

    if (!res.ok) throw new Error('Không thể cập nhật địa chỉ');
    return res.json();
  },

  // Xóa địa chỉ
  async deleteAddress(id: string): Promise<AddressResponse> {
    const token = this.getAuthToken();
    
    if (!token) {
      throw new Error('Vui lòng đăng nhập');
    }

    const res = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADDRESS.DELETE(id)}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      }
    );

    if (!res.ok) throw new Error('Không thể xóa địa chỉ');
    return res.json();
  },

  // Đặt địa chỉ mặc định
  async setDefaultAddress(id: string): Promise<AddressResponse> {
    const token = this.getAuthToken();
    
    if (!token) {
      throw new Error('Vui lòng đăng nhập');
    }

    const res = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADDRESS.SET_DEFAULT(id)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      }
    );

    if (!res.ok) throw new Error('Không thể đặt địa chỉ mặc định');
    return res.json();
  },
};
