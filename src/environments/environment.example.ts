export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  defaultLanguage: 'en',
  supportedLanguages: ['en'],
  defaultCurrency: 'USD',
  defaultDateFormat: 'MM/dd/yyyy',
  defaultTimeFormat: 'hh:mm a',
  sessionTimeout: 3600, // 1 hour in seconds
  maxUploadSize: 5242880, // 5MB in bytes
  imageFormats: ['jpg', 'jpeg', 'png', 'gif'],
  paginationSize: 10,
  maxSearchResults: 50,
  debounceTime: 300, // milliseconds
  toastDuration: 3000, // milliseconds
  refreshTokenInterval: 300000, // 5 minutes in milliseconds
  features: {
    darkMode: true,
    notifications: true,
    analytics: false,
    multiLanguage: false,
    fileUpload: true,
    printReceipts: true,
    exportData: true,
    importData: true
  },
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    tokenPrefix: 'Bearer',
    loginEndpoint: '/auth/login',
    logoutEndpoint: '/auth/logout',
    refreshEndpoint: '/auth/refresh',
    registerEndpoint: '/auth/register',
    verifyEndpoint: '/auth/verify'
  },
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
    endpoints: {
      users: '/admin/users',
      branches: '/admin/branches',
      inventory: '/admin/inventory',
      products: '/products',
      categories: '/admin/categories',
      sales: '/pos/sales',
      orders: '/store/orders',
      referees: '/admin/referees',
      settings: '/admin/settings'
    }
  }
};
