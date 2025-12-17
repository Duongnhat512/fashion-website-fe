export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1',

  ENDPOINTS: {
    PRODUCTS: {
      GET_ALL: '/products',
      SEARCH: '/products/search',
      CREATE: '/products',
      UPDATE: '/products',
      DELETE: '/products/delete/:id',
      GET_BY_ID: '/products/search/:id',
      IMPORT: '/products/import/products',
      IMPORT_VARIANTS: '/products/import/variants',
      RECOMMENDATIONS: '/products/recommendations',

    },

    CATEGORIES: {
      TREE: '/categories/tree',
      GET_ALL: '/categories',
      CREATE: '/categories',
      UPDATE: '/categories',
      DELETE: '/categories/delete/:id',
      GET_BY_ID: '/categories/get-by-id',
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
      UPDATE_AVATAR: '/users/update-avt',
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
      INVOICES_BATCH: '/orders/invoices/batch',
      INVOICES_BATCH_DOWNLOAD: '/orders/invoices/batch/download',
    },

    CART: {
      ADD_ITEM: '/carts/item',
      REMOVE_ITEM: '/carts/delete/item',
      GET_CART: '/carts',
      UPDATE_ITEM: '/carts/update/item',
    },

    WAREHOUSES: {
      GET_ALL: '/warehouses',
      GET_BY_ID: '/warehouses/:id',
      CREATE: '/warehouses',
      UPDATE: '/warehouses',
    },

    PAYMENTS: {
      CREATE_URL: '/payments/create-payment-url', 
      REDIRECT: '/payments/payment-redirect',     
    },

    STOCK_ENTRIES: {
      GET_ALL: '/stock-entries',
      CREATE: '/stock-entries',
      SUBMIT: '/stock-entries/:id/submit',
      CANCEL: '/stock-entries/:id/cancel',
      UPDATE: '/stock-entries/:id',
    },

    INVENTORIES: {
      GET_ALL: '/inventories',
      GET_BY_ID: '/inventories/:id',
      GET_BY_WAREHOUSE: '/inventories/warehouse/:warehouseId',
      GET_BY_VARIANT: '/inventories/variant/:variantId',
    },
    COLOR:{
      GET_ALL: '/colors',
    },
    REVIEWS: {
      GET_BY_PRODUCT: '/reviews/product/:productId',
      GET_ALL: '/reviews',
      CREATE: '/reviews',
      UPDATE: '/reviews/:id',
      DELETE: '/reviews/:id',
    },
    STATISTICS: {
      DASHBOARD: '/statistics/dashboard',
      REVENUE: '/statistics/revenue',
      REVENUE_BY_STATUS: '/statistics/revenue/by-status',
      REVENUE_TIME_SERIES: '/statistics/revenue/time-series',
      TOP_SELLING_PRODUCTS: '/statistics/products/top-selling',
      PRODUCTS_STATISTICS: '/statistics/products/statistics',
      SALES_DETAIL: '/statistics/products/sales-detail',
      TOP_BY_REVENUE: '/statistics/products/top-by-revenue',
      TOP_BY_VIEWS: '/statistics/products/top-by-views',
      REVENUE_HOURLY: '/statistics/revenue/hourly',
      REVENUE_COMPARISON: '/statistics/revenue/comparison',
      PROFIT_TIME_SERIES: '/statistics/profit/time-series',
      REVENUE_FORECAST: '/statistics/revenue/forecast',
      ORDERS_STATISTICS: '/statistics/orders',
    },
    CHAT_BOT: {
      SEND_MESSAGE: '/chatbot/chat',
    },
    CONVERSATIONS: {
      GET_ACTIVE: '/conversations/active',
      GET_ALL: '/conversations',
      GET_BY_ID: '/conversations/:id',
      GET_MESSAGES: '/conversations/:id/messages',
      SWITCH_TO_HUMAN: '/conversations/:id/switch-to-human',
      SWITCH_TO_BOT: '/conversations/:id/switch-to-bot',
      ASSIGN_AGENT: '/conversations/:id/assign-agent',
      GET_WAITING: '/conversations/waiting',
      GET_AGENT_CONVERSATIONS: '/conversations/agent/my-conversations',
      GET_ALL_ADMIN: '/conversations/admin/all',
      MARK_AS_READ: '/conversations/:id/mark-as-read',
      GET_STATS: '/conversations/:id/stats',
    },
    TAX_REPORTS: {
      VAT: '/reports/tax/vat',
      VAT_EXPORT: '/reports/tax/vat/export',
      CIT: '/reports/tax/cit',
      CIT_EXPORT: '/reports/tax/cit/export',
      FINANCIAL: '/reports/tax/financial',
      FINANCIAL_EXPORT: '/reports/tax/financial/export',
    },
    PROMOTIONS: {
      GET_ALL: '/promotions',
      CREATE: '/promotions',
      UPDATE: '/promotions/:id',
      DELETE: '/promotions/:id',
      SUBMIT: '/promotions/:id/submit',
      ACTIVATE: '/promotions/:id/activate',
      DEACTIVATE: '/promotions/:id/deactivate',
    },
    VOUCHERS: {
      GET_ALL: '/vouchers',
      GET_BY_ID: '/vouchers/:id',
      CREATE: '/vouchers',
      UPDATE: '/vouchers/:id',
      DELETE: '/vouchers/:id',
      TOGGLE: '/vouchers/:id/toggle',
    },
    ADDRESS: {
      GET_ALL: '/addresses',
      GET_BY_ID: (id: string) => `/addresses/${id}`,
      CREATE: '/addresses',
      UPDATE: (id: string) => `/addresses/${id}`,
      DELETE: (id: string) => `/addresses/${id}`,
      SET_DEFAULT: (id: string) => `/addresses/${id}/set-default`,
    },
  },

  DEFAULT_PAGINATION: {
    PAGE: 1,
    LIMIT: 10,
  },

};
