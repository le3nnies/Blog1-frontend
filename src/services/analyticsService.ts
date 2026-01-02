// Analytics service using relative URLs (proxied by Vite)
import { AnalyticsData, AnalyticsFilters, RealtimeMetrics, InsightsAndRecommendations, CommentsAnalytics, BackendAnalyticsData } from '@/types/analytics.types';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to get request options with cookie-based authentication
const getRequestOptions = (method: string = 'GET', body?: any) => {
  const options: RequestInit = {
    method,
    headers: {
    'Content-Type': 'application/json',
  },
    credentials: 'include',
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return options;
};

const getAnalytics = async (filters: AnalyticsFilters): Promise<BackendAnalyticsData> => {
  // Construct query parameters from the filters object
  const queryParams = new URLSearchParams({
    period: filters.period,
    startDate: filters.startDate,
    endDate: filters.endDate,
    compare: String(filters.compareWithPrevious || false),
  });

  const response = await fetch(`${API_URL}/api/analytics?${queryParams.toString()}`, getRequestOptions());

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch analytics data');
  }

  const result = await response.json();
  return result.data; // Extract the data from the response wrapper
};

const getRealtimeMetrics = async (): Promise<RealtimeMetrics> => {
  const response = await fetch(`${API_URL}/api/analytics/realtime`, getRequestOptions());

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch real-time metrics');
  }

  const result = await response.json();
  return result.data; // Extract the data from the response wrapper
};

const generateReport = async (filters: AnalyticsFilters, format: 'csv' | 'pdf' | 'excel'): Promise<Blob> => {
  const params: Record<string, string> = { format };
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params[key] = String(value);
    }
  });

  const queryParams = new URLSearchParams(params);
  const response = await fetch(`${API_URL}/api/analytics/report?${queryParams.toString()}`, getRequestOptions());

  if (!response.ok) {
    throw new Error('Failed to generate report');
  }
  return response.blob();
};

const getSubscriberCount = async (): Promise<number> => {
  const response = await fetch(`${API_URL}/api/newsletter/subscriber-count`, getRequestOptions());

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch subscriber count');
  }

  const result = await response.json();
  return result.data.totalSubscribers;
};

const getCommentsAnalytics = async (filters: AnalyticsFilters): Promise<CommentsAnalytics> => {
  // Construct query parameters from the filters object
  const queryParams = new URLSearchParams({
    period: filters.period,
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  const response = await fetch(`${API_URL}/api/analytics/comments?${queryParams.toString()}`, getRequestOptions());

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch comments analytics data');
  }

  const result = await response.json();
  return result.data; // Extract the data from the response wrapper
};

const getDashboardAnalytics = async (period: string) => {
  const response = await fetch(`${API_URL}/api/analytics/dashboard?period=${period}`, getRequestOptions());

  if (!response.ok) {
    let errorMessage = 'Failed to fetch dashboard analytics data';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(`${errorMessage} (${response.status})`);
  }

  const result = await response.json();
  return result.data; // Return the data object as the component expects it
};

const getActiveSessions = async (limit: number = 50) => {
  const response = await fetch(`${API_URL}/api/analytics/active-sessions?limit=${limit}`, getRequestOptions());

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch active sessions');
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
