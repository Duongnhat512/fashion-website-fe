export const API_CONFIG = {
  BASE_URL: 'http://localhost:3636/api/v1',
  ENDPOINTS: {
    PRODUCTS: '/products',
    AUTH: {
      LOGIN: '/auth/login',
      SEND_OTP: '/auth/send-otp',
      VERIFY_OTP: '/auth/verify-otp',
    },
    USERS: {
      REGISTER: '/users/register',
      PROFILE: '/users',
      UPDATE: '/users/update',
    },
  },
  DEFAULT_PAGINATION: {
    PAGE: 1,
    LIMIT: 10,
  },
} as const;