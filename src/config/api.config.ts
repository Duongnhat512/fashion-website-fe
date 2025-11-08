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
      GET_ALL: '/users',
      FORGOT_PASSWORD: '/users/forgot-password',
      RESET_PASSWORD: '/users/reset-password',
      VERIFY_RESET_OTP: '/users/verify-reset-otp',
    },

    ORDERS: {
      CREATE: '/orders',
      GET_BY_ID: '/orders/:id',
      GET_ALL: '/orders',
      UPDATE: '/orders',
      DELETE: '/orders/delete/:id',
      CANCEL: '/orders/cancel/:id',
      MARK_AS_DELIVERED: '/orders/mark-as-delivered/:id',
      MARK_AS_READY_TO_SHIP: '/orders/mark-as-ready-to-ship/:id',
      CONFIRM_AS_COMPLETED: '/orders/confirm-as-completed/:id',
      MARK_AS_SHIPPING: '/orders/mark-as-shipping/:id',
      GET_USER_ORDERS: '/orders/user/:userId',
    },

    CART: {
      ADD_ITEM: '/carts/item',
      REMOVE_ITEM: '/carts/delete/item',
      GET_CART: '/carts',
      UPDATE_ITEM: '/carts/update/item',
    },
    WAREHOUSE: {
          GET_BY_ID: '/warehouses/:id',
          CREATE: '/warehouses',
          UPDATE: '/warehouses',
          GET_ALL: '/warehouses',
      },

    PAYMENTS: {
      CREATE_URL: '/payments/create-payment-url', 
      REDIRECT: '/payments/payment-redirect',     
    },
    STOCK_ENTRIES: {
      CREATE: '/stock-entries',
      SUBMIT: '/stock-entries/:id/submit',
      CANCEL: '/stock-entries/:id/cancel',
      UPDATE: '/stock-entries/:id',
    },
    INVENTORY: {
      GET_ALL: '/inventorys',
      GET_BY_ID: '/inventorys/:id',
      GET_BY_WAREHOUSE: '/inventorys/warehouse/:warehouseId',
      GET_BY_VARIANT: '/inventorys/variant/:variantId',
    },
  },

  DEFAULT_PAGINATION: {
    PAGE: 1,
    LIMIT: 10,
  },
};
