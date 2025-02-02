export const environment = {
  production: true,
  apiUrl: '/api',
  defaultBranch: 'default-branch',
  defaultVatRate: 15,
  defaultCommissionRate: 10,
  imageBaseUrl: '/uploads',
  defaultCurrency: 'USD',
  pageSize: 12,
  maxImageSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  refreshTokenInterval: 5 * 60 * 1000, // 5 minutes
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  toastDuration: 3000,
  features: {
    wishlist: true,
    reviews: true,
    ratings: true,
    inventory: true,
    prescriptions: true,
    referrals: true,
    multiLanguage: false,
    darkMode: true
  },
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    userKey: 'user_data'
  },
  pagination: {
    defaultPageSize: 12,
    pageSizeOptions: [12, 24, 48, 96]
  },
  dateFormat: 'MMM d, y',
  timeFormat: 'h:mm a',
  dateTimeFormat: 'MMM d, y h:mm a',
  inventory: {
    lowStockThreshold: 5,
    criticalStockThreshold: 2,
    maxStockLevel: 1000,
    defaultUnit: 'pcs'
  },
  orders: {
    statuses: [
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled'
    ],
    paymentMethods: [
      'cash',
      'card',
      'bank_transfer'
    ]
  },
  validation: {
    minPasswordLength: 8,
    maxPasswordLength: 32,
    phonePattern: '^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$',
    emailPattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
  }
};
