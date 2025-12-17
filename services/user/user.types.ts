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