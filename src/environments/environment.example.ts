// Copy this file to environment.ts and environment.production.ts
// and update the values according to your setup

export const environment = {
  production: false, // Set to true in environment.production.ts
  
  // API Configuration
  apiUrl: 'http://localhost:8000/api', // Production: '/api'
  imageBaseUrl: 'http://localhost:8000/uploads', // Production: '/uploads'
  
  // Business Configuration
  defaultBranch: 'default-branch',
  defaultVatRate: 15, // Percentage
  defaultCommissionRate: 10, // Percentage
  defaultCurrency: 'USD',
  
  // Pagination
  pageSize: 12,
  pagination: {
    defaultPageSize: 12,
    pageSizeOptions: [12, 24, 48, 96]
  },

  // File Upload
  maxImageSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],

  // Authentication
  refreshTokenInterval: 5 * 60 * 1000, // 5 minutes
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    userKey: 'user_data'
  },

  // UI Configuration
  toastDuration: 3000, // milliseconds
  dateFormat: 'MMM d, y',
  timeFormat: 'h:mm a',
  dateTimeFormat: 'MMM d, y h:mm a',

  // Feature Flags
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

  // Inventory Settings
  inventory: {
    lowStockThreshold: 5,
    criticalStockThreshold: 2,
    maxStockLevel: 1000,
    defaultUnit: 'pcs'
  },

  // Order Configuration
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

  // Validation Rules
  validation: {
    minPasswordLength: 8,
    maxPasswordLength: 32,
    phonePattern: '^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$',
    emailPattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
  }
};
