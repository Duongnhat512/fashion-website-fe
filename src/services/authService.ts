import { API_CONFIG } from '../config/api.config';
import type { ApiResponse } from '../types/product.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    fullname: string;
    email: string;
    role: string;
    avt?: string;
    phone?: string;
    dob?: string;
    gender?: 'male' | 'female' | 'other';
  };
  accessToken: string;
  refreshToken?: string;
}

export interface RegisterRequest {
  fullname: string;
  email: string;
  password: string;
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  avt?: string;
  verificationToken: string;
}

export interface OtpRequest {
  email: string;
}

export interface OtpVerifyRequest {
  email: string;
  otp: string;
}

export interface OtpVerifyResponse {
  verificationToken: string;
}

export interface UserProfileResponse {
  id: string;
  fullname: string;
  email: string;
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  avt?: string;
  role: string;
}

export interface UpdateUserRequest {
  id: string;
  fullname?: string;
  email?: string;
  password?: string;
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  avt?: string;
  role?: string;
}

export interface UpdateUserResponse {
  id: string;
  fullname: string;
  email: string;
  role: string;
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  avt?: string;
}

class AuthService {
  private async makeRequest<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json', // luôn ưu tiên JSON
        ...(options?.headers || {}),
      },
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


  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Backend route is GET but controller expects req.body
    // Try POST method instead
    return this.makeRequest<LoginResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async sendOtp(request: OtpRequest): Promise<void> {
    return this.makeRequest<void>(API_CONFIG.ENDPOINTS.AUTH.SEND_OTP, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async verifyOtp(request: OtpVerifyRequest): Promise<OtpVerifyResponse> {
    return this.makeRequest<OtpVerifyResponse>(API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async register(userData: RegisterRequest): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>(API_CONFIG.ENDPOINTS.USERS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userData: UpdateUserRequest): Promise<UpdateUserResponse> {
    const token = this.getToken();
    if (!token) {
        throw new Error('Chưa đăng nhập');
    }

    // Filter data tránh gửi rỗng
    const cleanData: any = { id: userData.id };

    if (userData.fullname?.trim()) cleanData.fullname = userData.fullname.trim();
    if (userData.email?.trim()) cleanData.email = userData.email.trim();
    if (userData.phone?.trim()) cleanData.phone = userData.phone.trim();
    if (userData.dob) cleanData.dob = userData.dob;
    if (userData.gender) cleanData.gender = userData.gender;
    if (userData.avt?.trim()) cleanData.avt = userData.avt.trim();

    console.log("FE gửi update:", cleanData);

    return this.makeRequest<UpdateUserResponse>(API_CONFIG.ENDPOINTS.USERS.UPDATE, {
        method: 'PUT',
        headers: {
        'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(cleanData),
    });
 }


  async getUserProfile(userId: string): Promise<UserProfileResponse> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    return this.makeRequest<UserProfileResponse>(`${API_CONFIG.ENDPOINTS.USERS.PROFILE}/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Local storage helpers
  saveToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    const token = localStorage.getItem('authToken');
    console.log('Getting token from localStorage:', token);
    return token;
  }

  saveUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
export default authService;