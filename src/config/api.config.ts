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
      CREATE: '/orders',                  // Tạo đơn hàng
      GET_BY_ID: '/orders/:id',           // Lấy đơn hàng theo ID
      GET_ALL: '/orders',                  // Lấy tất cả đơn hàng
      UPDATE: '/orders',                  // Cập nhật đơn hàng
      DELETE: '/orders/delete/:id',       // Xóa đơn hàng
      CANCEL: '/orders/cancel/:id',       // Hủy đơn hàng
      MARK_AS_DELIVERED: '/orders/mark-as-delivered',   // Đánh dấu là đã giao
      MARK_AS_READY_TO_SHIP: '/orders/mark-as-ready-to-ship', // Đánh dấu là sẵn sàng giao
      CONFIRM_AS_COMPLETED: '/orders/confirm-as-completed', // Xác nhận hoàn thành đơn hàng
    },

    CART: {
      ADD_ITEM: '/carts/item',           // Thêm sản phẩm vào giỏ
      REMOVE_ITEM: '/carts/delete/item', // Xóa sản phẩm khỏi giỏ
      GET_CART: '/carts',                // Lấy giỏ hàng
      UPDATE_ITEM: '/carts/update/item', // Cập nhật giỏ hàng
    },
  },

  DEFAULT_PAGINATION: {
    PAGE: 1,
    LIMIT: 10,
  },
} as const;
