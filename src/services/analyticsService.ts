// Analytics service using relative URLs (proxied by Vite)  
import { AnalyticsData, AnalyticsFilters, RealtimeMetrics, InsightsAndRecommendations, CommentsAnalytics, BackendAnalyticsData } from '@/types/analytics.types';  
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;  
  
// Helper function to get request options with cookie-based authentication  
const getRequestOptions = (method: string = 'GET', body?: any) => {  
  const headers: Record<string, string> = {  
    'Content-Type': 'application/json',  
  };  
  
  const options: RequestInit = {  
    method,  
    credentials: 'include', // Include cookies for authentication  
    headers,  
  };  
  
  if (body) {  
    options.body = JSON.stringify(body);  
  }  
  
  return options;  
};  
  
// Helper to check if response is JSON and handle errors  
const handleErrorResponse = async (response: Response, defaultMessage: string) => {  
  const contentType = response.headers.get("content-type");  
  if (!contentType || !contentType.includes("application/json")) {  
    throw new Error(`${defaultMessage}: Server returned non-JSON response (${contentType || 'unknown'})`);  
  }  
    
  try {  
    const errorData = await response.json();  
    throw new Error(errorData.message || defaultMessage);  
  } catch (e) {  
    if (e instanceof SyntaxError) {  
      throw new Error(`${defaultMessage}: Invalid JSON response`);  
    }  
    throw e;  
  }  
};  
  
const getAnalytics = async (filters: AnalyticsFilters): Promise<BackendAnalyticsData> => {  
  const queryParams = new URLSearchParams({  
    period: filters.period,  
    startDate: filters.startDate,  
    endDate: filters.endDate,  
    compare: String(filters.compareWithPrevious || false),  
  });  
  
  const response = await fetch(`${API_BASE_URL}/api/analytics?${queryParams.toString()}`, getRequestOptions());  
  
  if (!response.ok) {  
    await handleErrorResponse(response, 'Failed to fetch analytics data');  
  }  
  
  const result = await response.json();  
  return result.data;  
};  
  
const getRealtimeMetrics = async (): Promise<RealtimeMetrics> => {  
  const response = await fetch(`${API_BASE_URL}/api/analytics/realtime`, getRequestOptions());  
  
  if (!response.ok) {  
    await handleErrorResponse(response, 'Failed to fetch real-time metrics');  
  }  
  
  const result = await response.json();  
  return result.data;  
};  
  
const generateReport = async (filters: AnalyticsFilters, format: 'csv' | 'pdf' | 'excel'): Promise<Blob> => {  
  const params: Record<string, string> = { format };  
  Object.entries(filters).forEach(([key, value]) => {  
    if (value !== undefined && value !== null) {  
      params[key] = String(value);  
    }  
  });  
  
  const queryParams = new URLSearchParams(params);  
  const response = await fetch(`${API_BASE_URL}/api/analytics/report?${queryParams.toString()}`, getRequestOptions());  
  
  if (!response.ok) {  
    throw new Error('Failed to generate report');  
  }  
  return response.blob();  
};  
  
const getSubscriberCount = async (): Promise<number> => {  
  const response = await fetch(`${API_BASE_URL}/api/newsletter/subscriber-count`, getRequestOptions());  
  
  if (!response.ok) {  
    await handleErrorResponse(response, 'Failed to fetch subscriber count');  
  }  
  
  const result = await response.json();  
  return result.data.totalSubscribers;  
};  
  
const getCommentsAnalytics = async (filters: AnalyticsFilters): Promise<CommentsAnalytics> => {  
  const queryParams = new URLSearchParams({  
    period: filters.period,  
    startDate: filters.startDate,  
    endDate: filters.endDate,  
  });  
  
  const response = await fetch(`${API_BASE_URL}/api/analytics/comments?${queryParams.toString()}`, getRequestOptions());  
  
  if (!response.ok) {  
    await handleErrorResponse(response, 'Failed to fetch comments analytics data');  
  }  
  
  const result = await response.json();  
  return result.data;  
};  
  
const getDashboardAnalytics = async (period: string) => {  
  const response = await fetch(`${API_BASE_URL}/api/analytics/dashboard?period=${period}`, getRequestOptions());  
  
  if (!response.ok) {  
    await handleErrorResponse(response, 'Failed to fetch dashboard analytics data');  
  }  
  
  const result = await response.json();  
  return result.data;  
};  
  
const getActiveSessions = async (limit: number = 50) => {  
  const response = await fetch(`${API_BASE_URL}/api/analytics/active-sessions?limit=${limit}`, getRequestOptions());  
  
  if (!response.ok) {  
    await handleErrorResponse(response, 'Failed to fetch active sessions');  
  }  
  
  const result = await response.json();  
  return result.data;  
};  
  
export const analyticsService = {  
  getAnalytics,  
  getRealtimeMetrics,  
  generateReport,  
  getSubscriberCount,  
  getCommentsAnalytics,  
  getDashboardAnalytics,  
  getActiveSessions,  
};
