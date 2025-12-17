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

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyResetOtpRequest {
  email: string;
  otp: number; 
}

export interface VerifyResetOtpResponse {
  resetToken: string; 
}

export interface ResetPasswordRequest {
  token: string; 
  password: string;
  confirmPassword: string; 
}