export const API_CONFIG = {
  BASE_URL: '/api/v1',

  ENDPOINTS: {
    PRODUCTS: {
      GET_ALL: '/products',
      SEARCH: '/products/search',
    },

    CATEGORIES: {
      TREE: '/categories/tree', // 🆕 Lấy cây danh mục (có cấp con)
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
      GET_BY_USER: '/orders/user',
      GET_BY_ID: '/orders',
      UPDATE: '/orders',
    },
      CART: {
      ADD_ITEM: '/carts/item',         // Thêm sản phẩm vào giỏ
      REMOVE_ITEM: '/carts/delete/item', // Xóa sản phẩm khỏi giỏ
      GET_CART: '/carts',              // Lấy giỏ hàng
      UPDATE_ITEM: '/carts/update/item', // Cập nhật giỏ hàng
    },
  },

  DEFAULT_PAGINATION: {
    PAGE: 1,
    LIMIT: 10,
  },
} as const;
