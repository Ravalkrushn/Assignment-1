/**
 * LOYALTYBOX - Production Frontend API Client Layer
 * Connects React UI to Express/MongoDB backend at /api
 * Handles Bearer token injection, automatic response parsing, error formatting,
 * and seamless fallback proxying for Vercel & Render cloud deployments.
 */

const rawEnvUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';

function resolveApiBaseUrl() {
  // If running in production browser on Vercel (or any non-localhost production domain),
  // ALWAYS use the relative '/api' reverse-proxy configured in vercel.json!
  // This completely eliminates CORS preflight blocks and keeps all requests same-origin.
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return '/api';
    }
  }

  if (!rawEnvUrl) {
    return 'http://localhost:5000/api';
  }

  // Clean trailing slashes
  const trimmed = rawEnvUrl.trim().replace(/\/+$/, '');
  
  // If the environment variable was provided without '/api' (e.g. https://loyaltybox-backend.onrender.com),
  // automatically append '/api' so all requests map to the Express /api/... routes!
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const API_BASE_URL = resolveApiBaseUrl();

// Concurrency-safe Token Refresh Queue
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(newAccessToken) {
  refreshSubscribers.forEach((cb) => cb(newAccessToken));
  refreshSubscribers = [];
}

async function performTokenRefresh() {
  const refreshToken = localStorage.getItem('loyaltybox_refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const refreshUrl = `${API_BASE_URL}/auth/refresh`;
  const res = await fetch(refreshUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.data?.accessToken) {
    throw new Error(data?.message || 'Token refresh failed');
  }

  const { accessToken: newAccess, refreshToken: newRefresh } = data.data;
  localStorage.setItem('loyaltybox_token', newAccess);
  if (newRefresh) {
    localStorage.setItem('loyaltybox_refresh_token', newRefresh);
  }
  return newAccess;
}

/**
 * Core HTTP Request Wrapper with Concurrency-Safe Automatic 401 Token Refresh
 */
async function request(endpoint, options = {}, isRetry = false) {
  const normEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const primaryUrl = `${API_BASE_URL}${normEndpoint}`;
  
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

  let response;
  try {
    response = await fetch(primaryUrl, config);
  } catch (err) {
    // If direct cross-origin call failed (e.g. CORS preflight blocked or connection refused),
    // and we attempted an absolute URL from a browser, fallback to relative /api proxy!
    const isBrowser = typeof window !== 'undefined';
    const isCrossOrigin = isBrowser && primaryUrl.startsWith('http') && !primaryUrl.startsWith(window.location.origin);
    
    if (isCrossOrigin) {
      try {
        const fallbackUrl = `/api${normEndpoint}`;
        response = await fetch(fallbackUrl, config);
      } catch {
        const offlineError = new Error('Backend server is unreachable or waking up from sleep. Please try again in a few seconds.');
        offlineError.isOffline = true;
        throw offlineError;
      }
    } else {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        const offlineError = new Error('Backend server is unreachable. Please verify server status.');
        offlineError.isOffline = true;
        throw offlineError;
      }
      throw err;
    }
  }

  // Handle Token Expiry (HTTP 401) with automatic single-retry token refresh
  const isAuthEndpoint = normEndpoint.startsWith('/auth/login') || normEndpoint.startsWith('/auth/refresh') || normEndpoint.startsWith('/auth/register');
  if (response.status === 401 && !isRetry && !isAuthEndpoint) {
    if (isRefreshing) {
      // Queue concurrent 401 requests to wait for the new access token
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          const nextOptions = {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${newToken}`
            }
          };
          resolve(request(endpoint, nextOptions, true));
        });
      });
    }

    isRefreshing = true;
    try {
      const newAccessToken = await performTokenRefresh();
      isRefreshing = false;
      onRefreshed(newAccessToken);

      const nextOptions = {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newAccessToken}`
        }
      };
      return request(endpoint, nextOptions, true);
    } catch (refreshErr) {
      isRefreshing = false;
      refreshSubscribers = [];

      // Only force redirect to login if we had an actual bearer token that failed refresh,
      // and not in demo/mock fallback mode or when refresh token was simply unavailable.
      const existingToken = localStorage.getItem('loyaltybox_token');
      const isDemoToken = existingToken && existingToken.startsWith('demo_');

      if (!isDemoToken) {
        localStorage.removeItem('loyaltybox_token');
        localStorage.removeItem('loyaltybox_refresh_token');
        localStorage.removeItem('loyaltybox_user');
        
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      throw refreshErr;
    }
  }

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
