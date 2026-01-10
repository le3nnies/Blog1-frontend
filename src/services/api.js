// src/services/api.ts  
import axios from 'axios';  
  
// Use absolute URLs to bypass Vite proxy issues  
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;  
  
const api = axios.create({  
  baseURL: API_BASE_URL,  
  timeout: 10000,  
  headers: {  
    'Content-Type': 'application/json',  
  },  
  withCredentials: true,  
});  
  
// Request interceptor - no longer needed for auth since we use cookies  
// Keeping for potential future use  
api.interceptors.request.use(  
  (config) => {  
    return config;  
  },  
  (error) => {  
    return Promise.reject(error);  
  }  
);  
  
// Response interceptor to handle errors  
api.interceptors.response.use(  
  (response) => response,  
  (error) => {  
    // Instead of redirecting on 401, reject the promise  
    // The component can catch this and handle logout via AuthContext  
    return Promise.reject(error);  
  }  
);  
  
// API service methods  
export const apiService = {  
  // Auth endpoints  
  auth: {  
    login: (credentials) => api.post('/api/auth/login', credentials),  
    register: (userData) => api.post('/api/auth/admin/register', userData),  
    logout: () => api.post('/api/auth/logout'),  
    getProfile: () => api.get('/api/auth/me'),  
    updateProfile: (data) => api.put('/api/auth/profile', data),  
    changePassword: (data) => api.put('/api/auth/change-password', data),  
  },  
  
  // Article endpoints  
  articles: {  
    getAll: (params = {}) => api.get('/api/articles', { params }),  
    getTrending: (limit = 10) => api.get(`/api/articles/trending?limit=${limit}`),  
    getBySlug: (slug) => api.get(`/api/articles/${slug}`),  
    getByCategory: (category, params = {}) =>  
      api.get(`/api/articles/category/${category}`, { params }),  
    create: (articleData) => api.post('/api/articles', articleData),  
    //update: (id, articleData) => api.put(`/api/articles/${id}`, articleData),  
    delete: (id) => api.delete(`/api/articles/${id}`),  
    like: (id) => api.post(`/api/articles/${id}/like`),  
    addComment: (id, comment) => api.post(`/api/articles/${id}/comment`, { content: comment }),  
    incrementView: (id) => api.post(`/api/articles/${id}/view`),  
  },  
  
  // Admin endpoints  
  admin: {  
    // User management  
    getUsers: (params = {}) => api.get('/api/admin/users', { params }),  
    getUser: (id) => api.get(`/api/admin/users/${id}`),  
    updateUser: (id, data) => api.put(`/api/admin/users/${id}`, data),  
    updateUserRole: (id, role) => api.put(`/api/admin/users/${id}/role`, { role }),  
    deleteUser: (id) => api.delete(`/api/admin/users/${id}`),  
  
    // Article management  
    getAllArticles: (params = {}) => api.get('/api/admin/articles', { params }),  
    getArticleStats: () => api.get('/api/admin/articles/stats'),  
    updateArticleStatus: (id, status) => api.put(`/api/admin/articles/${id}/status`, { status }),  
  
    // Analytics  
    getDashboardStats: () => api.get('/api/admin/dashboard/stats'),  
    getRevenueAnalytics: () => api.get('/api/admin/ads/revenue'),  
  
    // System  
    getSystemHealth: () => api.get('/api/admin/system/health'),  
  },  
  
  // Newsletter endpoints  
  newsletter: {  
    subscribe: (email) => api.post('/api/newsletter/subscribe', { email }),  
    unsubscribe: (email, token) => api.post('/api/newsletter/unsubscribe', { email, token }),  
  },  
  
  // Ad endpoints  
  ads: {  
    // Ad Units  
    getUnits: () => api.get('/api/ads/units'),  
    trackImpression: (adUnitId, articleId = null) =>  
      api.post(`/api/ads/impression/${adUnitId}`, { articleId }),  
    trackClick: (adUnitId, articleId = null) =>  
      api.post(`/api/ads/click/${adUnitId}`, { articleId }),  
  
    // Campaign Management  
    getCampaigns: (params = {}) => api.get('/api/ads/campaigns', { params }),  
    getCampaign: (id) => api.get(`/api/ads/campaigns/${id}`),  
    createCampaign: (campaignData) => api.post('/api/ads/campaigns', campaignData),  
    updateCampaign: (id, campaignData) => api.put(`/api/ads/campaigns/${id}`, campaignData),  
    deleteCampaign: (id) => api.delete(`/api/ads/campaigns/${id}`),  
    approveCampaign: (id) => api.post(`/api/ads/campaigns/${id}/approve`),  
    rejectCampaign: (id, reason) => api.post(`/api/ads/campaigns/${id}/reject`, { reason }),  
    pauseCampaign: (id) => api.post(`/api/ads/campaigns/${id}/pause`),  
    resumeCampaign: (id) => api.post(`/api/ads/campaigns/${id}/resume`),  
  
    // Settings  
    getAdsSettings: () => api.get('/api/ads/settings'),  
    updateAdsSettings: (settings) => api.put('/api/ads/settings', settings),  
  
    // Stripe Integration  
    stripe: {  
      // Test Stripe connection  
      testConnection: (data) => api.post('/api/ads/stripe/test-connection', data),  
  
      // Generate webhook secret  
      generateWebhook: (data) => api.post('/api/ads/stripe/generate-webhook', data),  
  
      // Create payment intent  
      createPaymentIntent: (data) => api.post('/api/ads/stripe/create-payment-intent', data),  
  
      // Get transaction history  
      getTransactions: (limit = 10) => api.get(`/api/ads/stripe/transactions?limit=${limit}`),  
  
      // Get specific transaction  
      getTransaction: (transactionId) => api.get(`/api/ads/stripe/transactions/${transactionId}`),  
  
      // Check payment status  
      checkPaymentStatus: (paymentIntentId) => api.get(`/api/ads/stripe/payment-status/${paymentIntentId}`),  
  
      // Refund payment  
      refundPayment: (paymentIntentId, amount = null) =>  
        api.post(`/api/ads/stripe/refund/${paymentIntentId}`, { amount }),  
  
      // Get Stripe dashboard link  
      getDashboardLink: () => api.get('/api/ads/stripe/dashboard-link'),  
    },  
  
    // Advertiser Management  
    advertisers: {  
      getAll: (params = {}) => api.get('/api/ads/advertisers', { params }),  
      getAdvertiser: (id) => api.get(`/api/ads/advertisers/${id}`),  
      updateAdvertiser: (id, data) => api.put(`/api/ads/advertisers/${id}`, data),  
      getAdvertiserCampaigns: (id) => api.get(`/api/ads/advertisers/${id}/campaigns`),  
      getAdvertiserStats: (id) => api.get(`/api/ads/advertisers/${id}/stats`),  
    },  
  
    // Analytics & Reports  
    analytics: {  
      getOverview: (params = {}) => api.get('/api/ads/analytics/overview', { params }),  
      getCampaignPerformance: (campaignId, params = {}) =>  
        api.get(`/api/ads/analytics/campaigns/${campaignId}`, { params }),  
      getRevenueReports: (params = {}) => api.get('/api/ads/analytics/revenue', { params }),  
      getGeographicData: (params = {}) => api.get('/api/ads/analytics/geographic', { params }),  
      exportReports: (params = {}) => api.get('/api/ads/analytics/export', {  
        params,  
        responseType: 'blob'  
      }),  
    },  
  },  
  
  // File upload endpoints  
  upload: {  
    image: (formData) => api.post('/api/upload/image', formData, {  
      headers: { 'Content-Type': 'multipart/form-data' },  
    }),  
    document: (formData) => api.post('/api/upload/document', formData, {  
      headers: { 'Content-Type': 'multipart/form-data' },  
    }),  
    deleteFile: (fileId) => api.delete(`/api/upload/files/${fileId}`),  
  },  
  
  // Category endpoints  
  categories: {  
    getAll: () => api.get('/api/categories'),  
    create: (categoryData) => api.post('/api/categories', categoryData),  
    update: (id, categoryData) => api.put(`/api/categories/${id}`, categoryData),  
    delete: (id) => api.delete(`/api/categories/${id}`),  
  },  
};  
  
export default api;
