export const API_CONFIG = {
  BASE_URL: '/api/v1',

  ENDPOINTS: {
    PRODUCTS: {
      GET_ALL: '/products',
      SEARCH: '/products/search',
    },

    CATEGORIES: {
      TREE: '/categories/tree',
      GET_ALL: '/categories',
    },

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

    ORDERS: {
      CREATE: '/orders',
      GET_BY_ID: '/orders/:id',
      GET_ALL: '/orders',
      UPDATE: '/orders',
      DELETE: '/orders/delete/:id',
      CANCEL: '/orders/cancel/:id',
      MARK_AS_DELIVERED: '/orders/mark-as-delivered',
      MARK_AS_READY_TO_SHIP: '/orders/mark-as-ready-to-ship',
      CONFIRM_AS_COMPLETED: '/orders/confirm-as-completed',
      GET_USER_ORDERS: '/orders/user/:userId',
    },

    CART: {
      ADD_ITEM: '/carts/item',
      REMOVE_ITEM: '/carts/delete/item',
      GET_CART: '/carts',
      UPDATE_ITEM: '/carts/update/item',
    },

    // 🆕 Thêm nhóm Payment
    PAYMENTS: {
      CREATE_URL: '/payments/create-payment-url', // Tạo link thanh toán
      REDIRECT: '/payments/payment-redirect',     // Callback trả về sau khi thanh toán
    },
  },

  DEFAULT_PAGINATION: {
    PAGE: 1,
    LIMIT: 10,
  },
} as const;
