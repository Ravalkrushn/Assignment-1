/**
 * LOYALTYBOX - Production Frontend API Client Layer
 * Connects React UI to Express/MongoDB backend at /api
 * Handles Bearer token injection, automatic response parsing, and error formatting.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Core HTTP Request Wrapper
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = localStorage.getItem('loyaltybox_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);

    // Handle CSV or non-JSON downloads
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/csv')) {
      const blob = await response.blob();
      return blob;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      // Network/Server offline error
      const offlineError = new Error('Backend server is unreachable. Please ensure the backend is running at http://localhost:5000');
      offlineError.isOffline = true;
      throw offlineError;
    }
    throw error;
  }
}

export const api = {
  // Base configuration
  getBaseUrl: () => API_BASE_URL,
  
  // Health
  health: {
    check: () => request('/health'),
  },

  // Authentication
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
    register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
    getMe: () => request('/auth/me', { method: 'GET' }),
    updateProfile: (profileData) => request('/auth/profile', { method: 'PUT', body: profileData }),
    forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: { email } }),
    resetPassword: (payload) => request('/auth/reset-password', { method: 'POST', body: payload }),
    logout: () => request('/auth/logout', { method: 'POST' }),
  },

  // Products Catalog
  products: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/products${query ? `?${query}` : ''}`, { method: 'GET' });
    },
    getById: (id) => request(`/products/${id}`, { method: 'GET' }),
    create: (data) => request('/products', { method: 'POST', body: data }),
    update: (id, data) => request(`/products/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  },

  // Product Security Codes
  codes: {
    redeem: (code) => request('/codes/redeem', { method: 'POST', body: { code } }),
    generate: (data) => request('/codes/generate', { method: 'POST', body: data }),
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/codes${query ? `?${query}` : ''}`, { method: 'GET' });
    },
    getBatches: () => request('/codes/batches', { method: 'GET' }),
    exportBatchCSV: (batchId) => request(`/codes/batches/${batchId}/export`, { method: 'GET' }),
    block: (id) => request(`/codes/${id}/block`, { method: 'POST' }),
  },

  // Rewards Store
  rewards: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/rewards${query ? `?${query}` : ''}`, { method: 'GET' });
    },
    getById: (id) => request(`/rewards/${id}`, { method: 'GET' }),
    claim: (id) => request(`/rewards/${id}/redeem`, { method: 'POST' }),
    create: (data) => request('/rewards', { method: 'POST', body: data }),
    update: (id, data) => request(`/rewards/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/rewards/${id}`, { method: 'DELETE' }),
  },

  // Points Ledger & Balances
  points: {
    getBalance: () => request('/points/balance', { method: 'GET' }),
    getHistory: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/points/history${query ? `?${query}` : ''}`, { method: 'GET' });
    },
    getSummary: () => request('/points/summary', { method: 'GET' }),
    getOverview: () => request('/points/overview', { method: 'GET' }),
    adjust: (data) => request('/points/adjust', { method: 'POST', body: data }),
  },

  // Reward Redemptions & Fulfillment
  redemptions: {
    getMy: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/redemptions/my${query ? `?${query}` : ''}`, { method: 'GET' });
    },
    getById: (id) => request(`/redemptions/${id}`, { method: 'GET' }),
    getAdmin: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/redemptions${query ? `?${query}` : ''}`, { method: 'GET' });
    },
    updateFulfillment: (id, data) => 
      request(`/redemptions/${id}/fulfillment`, { method: 'PATCH', body: data }),
  },

  // Fraud Monitoring & Investigation
  fraud: {
    getLogs: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/fraud${query ? `?${query}` : ''}`, { method: 'GET' });
    },
    getLogById: (id) => request(`/admin/fraud/${id}`, { method: 'GET' }),
    updateStatus: (id, status, note = '') => 
      request(`/admin/fraud/${id}/status`, { method: 'PATCH', body: { status, note } }),
    addNote: (id, note) =>
      request(`/admin/fraud/${id}/notes`, { method: 'POST', body: { note } }),
    blockCustomer: (userId, reason = '') =>
      request('/admin/fraud/block-customer', { method: 'POST', body: { userId, reason } }),
    unblockCustomer: (userId) =>
      request('/admin/fraud/unblock-customer', { method: 'POST', body: { userId } }),
    blockIp: (ipAddress, reason = '') => 
      request('/admin/fraud/block-ip', { method: 'POST', body: { ipAddress, reason } }),
    unblockIp: (ipAddress) => 
      request('/admin/fraud/unblock-ip', { method: 'POST', body: { ipAddress } }),
  },

  // Campaigns & Promotions
  campaigns: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/campaigns${query ? `?${query}` : ''}`, { method: 'GET' });
    },
    getById: (id) => request(`/campaigns/${id}`, { method: 'GET' }),
    create: (data) => request('/campaigns', { method: 'POST', body: data }),
    update: (id, data) => request(`/campaigns/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/campaigns/${id}`, { method: 'DELETE' }),
  },

  // Support Tickets & Disputes
  support: {
    createTicket: (data) => request('/support', { method: 'POST', body: data }),
    getMyTickets: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/support/my${query ? `?${query}` : ''}`, { method: 'GET' });
    },
    getTicketById: (id) => request(`/support/${id}`, { method: 'GET' }),
    replyTicket: (id, data) => request(`/support/${id}/reply`, { method: 'POST', body: data }),
    getAllTickets: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/support${query ? `?${query}` : ''}`, { method: 'GET' });
    },
    updateTicketStatus: (id, data) => request(`/support/${id}/status`, { method: 'PATCH', body: data }),
  },

  // Admin Audit Trail
  audit: {
    getLogs: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/audit-logs${query ? `?${query}` : ''}`, { method: 'GET' });
    },
  },

  // Admin Analytics & CRM Directory
  analytics: {
    getDashboard: () => request('/admin/analytics/dashboard', { method: 'GET' }),
    getCustomers: () => request('/admin/analytics/customers', { method: 'GET' }),
    getPoints: () => request('/admin/analytics/points', { method: 'GET' }),
    getRedemptions: () => request('/admin/analytics/redemptions', { method: 'GET' }),
    getProducts: () => request('/admin/analytics/products', { method: 'GET' }),
    getDirectory: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/analytics/directory${query ? `?${query}` : ''}`, { method: 'GET' });
    },
    getCustomerDetails: (id) => request(`/admin/analytics/directory/${id}`, { method: 'GET' }),
    getCustomerHistory: (id) => request(`/admin/analytics/directory/${id}/history`, { method: 'GET' }),
  },

  // Admin Settings
  settings: {
    get: () => request('/admin/settings', { method: 'GET' }),
    update: (data) => request('/admin/settings', { method: 'PUT', body: data }),
  },
};

export default api;
