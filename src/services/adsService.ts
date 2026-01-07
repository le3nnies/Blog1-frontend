// src/services/adsService.ts
import { AdCampaign, AdCreative, GoogleAdConfig, AdStats, AdSettings } from '@/types/ads.types';
const BACKEND_URL = import.meta.env.REACT_APP_API_BASE_URL;

class AdsService {
  private baseURL = `${BACKEND_URL}/api`;

  // Helper to get request options with cookie-based authentication
  private getRequestOptions(method: string = 'GET', body?: any, isFormData: boolean = false): RequestInit {
    const headers: Record<string, string> = {};
    
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const options: RequestInit = {
      method,
      credentials: 'include', // Include cookies for authentication
      headers,
    };

    if (body) {
      options.body = isFormData ? body : JSON.stringify(body);
    }

    return options;
  }

  // Simplified request method using cookies
  private async makeRequest(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  try {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    // Merge default options with provided options
    const defaultOptions = this.getRequestOptions(options.method || 'GET');
    
    const finalOptions: RequestInit = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      },
      credentials: 'include' // Ensure this is always set
    };

    console.log(`🌐 Making request to: ${fullUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(fullUrl, {
      ...finalOptions,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.status === 401) {
      console.warn('🔐 Authentication failed after retries');
      throw new Error('Session expired. Please login again.');
    }

    return response;

  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    
    console.error('Request failed:', error);
    throw new Error(`Network error: ${error.message}`);
  }
}

// Token health check utility
public async checkTokenHealth(): Promise<{
  isValid: boolean;
  isExpired: boolean;
  expiresIn?: number;
  needsRefresh?: boolean;
}> {
  // With cookies, we assume valid until 401
  return {
    isValid: true,
    isExpired: false
  };
}

// Manual token refresh for UI components
public async manualRefreshToken(): Promise<boolean> {
  console.log('🔄 Manual token refresh requested');
  // No-op for cookie auth
  return true;
}

  /**
   * Enhanced HTTP response handler with better error handling
   */
  private async handleResponse(response: Response): Promise<any> {
  console.log('📨 adsService - Response status:', response.status);
  
  // Handle authentication errors
  if (response.status === 401) {
    throw new Error('Session expired. Please login again.');
  }

  if (response.status === 403) {
    throw new Error('Access denied. Insufficient permissions.');
  }

  if (!response.ok) {
    // Check content type before trying to parse JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const errorData = await response.json().catch(() => ({
        error: `Request failed: ${response.status} ${response.statusText}`
      }));
      throw new Error(errorData?.error || `Request failed: ${response.status}`);
    } else {
      // Handle non-JSON error responses (like HTML error pages)
      const text = await response.text();
      console.error('❌ Error response (non-JSON):', text.substring(0, 200));

      if (text.toLowerCase().includes('<!doctype') || text.toLowerCase().includes('<html')) {
        const titleMatch = text.match(/<title>(.*?)<\/title>/i);
        const errorTitle = titleMatch ? titleMatch[1] : 'Server Error';
        throw new Error(`Server error: ${errorTitle}. Status: ${response.status} ${response.statusText}`);
      }

      throw new Error(`Request failed: ${response.status} ${response.statusText}. Server returned: ${contentType || 'unknown'}`);
    }
  }

  // Validate content type is JSON
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    console.error('❌ Expected JSON but received:', text.substring(0, 200));

    // Check if this is an HTML error page (common server error)
    if (text.toLowerCase().includes('<!doctype') || text.toLowerCase().includes('<html')) {
      console.warn('🔄 Received HTML error page, attempting to extract error info...');

      // Try to extract error information from HTML
      const titleMatch = text.match(/<title>(.*?)<\/title>/i);
      const errorTitle = titleMatch ? titleMatch[1] : 'Server Error';

      throw new Error(`Server returned HTML page: ${errorTitle}. Status: ${response.status} ${response.statusText}`);
    }

    throw new Error(`Invalid API response: ${response.status} ${response.statusText}. Expected JSON but received: ${contentType || 'unknown'}`);
  }

  const data = await response.json();
  console.log('📥 adsService - Raw response data:', data);
  console.log('🎯 adsService - Response targetCategories:', data.data?.targetCategories || data.targetCategories);
  console.log('📍 adsService - Response targetPositions:', data.data?.targetPositions || data.targetPositions);

  // Better data normalization that preserves arrays
  let resultData = data;

  // If the response has a success field and data field, preserve the structure
  if (data.success !== undefined && data.data !== undefined) {
    // Map _id → id in the data field, handling both arrays and objects
    const mappedData = Array.isArray(data.data)
      ? data.data.map(item => this.mapIdField(item))
      : this.mapIdField(data.data);
    resultData = { ...data, data: mappedData };
    console.log('🔄 Using data.data from response with mapping');
  }
  // If the response has a success field but no data field, use the entire response
  else if (data.success !== undefined) {
    resultData = data;
    console.log('🔄 Using entire response (has success field)');
  }
  // Otherwise, use whatever was returned
  else {
    console.log('🔄 Using response as-is');
  }

  console.log('📦 adsService - Normalized resultData:', resultData);
  console.log('🎯 Normalized categories:', resultData.data?.targetCategories || resultData.targetCategories);
  console.log('📍 Normalized positions:', resultData.data?.targetPositions || resultData.targetPositions);

  console.log('✅ adsService - Final result:', resultData);
  return resultData;
}

  private mapIdField(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  console.log('🔄 mapIdField input:', obj);
  
  const mapped = { ...obj };
  
  // Map _id to id
  if (mapped._id && !mapped.id) {
    mapped.id = mapped._id;
    delete mapped._id;
  }
  
  // Preserve arrays
  if (Array.isArray(mapped.targetCategories)) {
    mapped.targetCategories = [...mapped.targetCategories];
  }
  if (Array.isArray(mapped.targetPositions)) {
    mapped.targetPositions = [...mapped.targetPositions];
  }
  
  console.log('🔄 mapIdField output:', mapped);
  return mapped;
}

  // ======================================================
  // 📊 Enhanced Analytics Methods with Robust Error Handling
  // ======================================================

  async getDetailedAnalytics(dateRange: string = '7d'): Promise<{ 
    data: any; 
    success: boolean; 
    isFallback?: boolean; 
    message?: string;
    timestamp?: string;
  }> {
    try {
      console.log('📊 Fetching analytics for period:', dateRange);
      
        const response = await fetch(
          `${this.baseURL}/ads/analytics/detailed?period=${dateRange}`,
          this.getRequestOptions('GET')
        );

        // Handle other HTTP errors
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ HTTP error! status: ${response.status}`, errorText);
          throw new Error(`Server error: ${response.status}`);
        }

        // Parse successful response
        try {
          const result = await response.json();
          console.log('✅ Analytics data fetched successfully');
          return {
            ...result,
            success: true,
            isFallback: false
          };
        } catch (parseError) {
          console.error('❌ JSON parse error:', parseError);
          throw new Error('Invalid response format from server');
        }

    } catch (error: any) {
      console.error('❌ Final error fetching analytics:', error);
      
      // Generate and return fallback data
      return this.handleAnalyticsError(dateRange, error);
    }
  }

  // Enhanced error handling with fallback data
  private handleAnalyticsError(dateRange: string, error: any): any {
    console.log('🔄 Generating fallback analytics data due to error:', error.message);
    
    const fallbackData = this.generateRealisticFallbackData(dateRange);
    
    return {
      success: true,
      data: fallbackData,
      isFallback: true,
      message: `Using demo data - ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }

  // Improved realistic fallback data generator
  private generateRealisticFallbackData(dateRange: string): any {
    const days = this.getDaysFromRange(dateRange);
    const baseMetrics = this.getBaseMetrics(dateRange);
    
    const performanceTrends = this.generatePerformanceTrends(days, baseMetrics);
    const summary = this.calculateSummary(performanceTrends, dateRange);
    
    return {
      performanceTrends,
      deviceBreakdown: this.generateDeviceBreakdown(summary.totalRevenue),
      geographicData: this.generateGeographicData(summary.totalClicks, summary.totalRevenue),
      engagementMetrics: this.generateEngagementMetrics(),
      summary,
      generatedAt: new Date().toISOString()
    };
  }

  private getDaysFromRange(dateRange: string): number {
    const ranges: { [key: string]: number } = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90
    };
    return ranges[dateRange] || 7;
  }

  private getBaseMetrics(dateRange: string): { revenue: number; clicks: number; impressions: number } {
    const bases = {
      '1d': { revenue: 50, clicks: 15, impressions: 700 },
      '7d': { revenue: 350, clicks: 120, impressions: 5000 },
      '30d': { revenue: 1500, clicks: 500, impressions: 20000 },
      '90d': { revenue: 4500, clicks: 1500, impressions: 60000 }
    };
    return bases[dateRange] || bases['7d'];
  }

  private generatePerformanceTrends(days: number, baseMetrics: any): any[] {
    const trends = [];
    let cumulativeRevenue = 0;
    let cumulativeClicks = 0;
    let cumulativeImpressions = 0;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });

      // Realistic daily variations with some trend
      const trendFactor = 0.9 + (i / days) * 0.4; // Gradual improvement
      const randomFactor = 0.7 + Math.random() * 0.6;
      
      const dailyRevenue = (baseMetrics.revenue / days) * trendFactor * randomFactor;
      const dailyClicks = Math.floor((baseMetrics.clicks / days) * trendFactor * randomFactor);
      const dailyImpressions = Math.floor((baseMetrics.impressions / days) * trendFactor * randomFactor);

      cumulativeRevenue += dailyRevenue;
      cumulativeClicks += dailyClicks;
      cumulativeImpressions += dailyImpressions;

      trends.push({
        date: dateStr,
        revenue: Math.round(dailyRevenue * 100) / 100,
        clicks: dailyClicks,
        impressions: dailyImpressions,
        ctr: dailyImpressions > 0 ? (dailyClicks / dailyImpressions) * 100 : 0,
        cpc: dailyClicks > 0 ? dailyRevenue / dailyClicks : 0
      });
    }

    return trends;
  }

  private calculateSummary(trends: any[], dateRange: string): any {
    const totalRevenue = trends.reduce((sum, day) => sum + day.revenue, 0);
    const totalClicks = trends.reduce((sum, day) => sum + day.clicks, 0);
    const totalImpressions = trends.reduce((sum, day) => sum + day.impressions, 0);
    const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const averageCPC = totalClicks > 0 ? totalRevenue / totalClicks : 0;

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalClicks,
      totalImpressions,
      averageCTR: Math.round(averageCTR * 100) / 100,
      averageCPC: Math.round(averageCPC * 100) / 100,
      period: dateRange
    };
  }

  private generateDeviceBreakdown(totalRevenue: number): any[] {
    return [
      { name: 'Desktop', value: 58, revenue: totalRevenue * 0.58 },
      { name: 'Mobile', value: 35, revenue: totalRevenue * 0.35 },
      { name: 'Tablet', value: 7, revenue: totalRevenue * 0.07 }
    ];
  }

  private generateGeographicData(totalClicks: number, totalRevenue: number): any[] {
    return [
      { country: 'United States', clicks: Math.floor(totalClicks * 0.55), revenue: totalRevenue * 0.55 },
      { country: 'United Kingdom', clicks: Math.floor(totalClicks * 0.15), revenue: totalRevenue * 0.15 },
      { country: 'Canada', clicks: Math.floor(totalClicks * 0.12), revenue: totalRevenue * 0.12 },
      { country: 'Australia', clicks: Math.floor(totalClicks * 0.08), revenue: totalRevenue * 0.08 },
      { country: 'Germany', clicks: Math.floor(totalClicks * 0.06), revenue: totalRevenue * 0.06 },
      { country: 'Other', clicks: Math.floor(totalClicks * 0.04), revenue: totalRevenue * 0.04 }
    ];
  }

  private generateEngagementMetrics(): any {
    return {
      conversionRate: {
        current: 2.8,
        previous: 2.5,
        trend: 'up'
      },
      avgSessionDuration: {
        current: 2.45,
        previous: 2.30,
        trend: 'up'
      },
      bounceRate: {
        current: 38.2,
        previous: 41.5,
        trend: 'down'
      },
      pagesPerSession: {
        current: 3.8,
        previous: 3.5,
        trend: 'up'
      }
    };
  }

  // ======================================================
  // 📁 File Upload Methods (Keep existing)
  // ======================================================

  async uploadAdMedia(file: File, campaignId?: string): Promise<{ url: string; fileName: string; fileType: string; fileSize: number; mediaType: string; cloudinaryPublicId: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('fileType', file.type);
    formData.append('fileSize', file.size.toString());

    // Include campaignId if provided to save media URL directly to database
    if (campaignId) {
      formData.append('campaignId', campaignId);
    }

    const response = await fetch(`${this.baseURL}/ads/upload-media`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `Upload failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  async uploadMultipleAdMedia(
    files: File[]
  ): Promise<{ url: string; fileName: string; fileType: string; fileSize: number }[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const response = await fetch(`${this.baseURL}/ads/upload-multiple-media`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `Upload failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  async deleteAdMedia(fileUrl: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/ads/delete-media`, {
      method: 'DELETE',
      ...this.getRequestOptions('DELETE'),
      body: JSON.stringify({ fileUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `Delete failed: ${response.status}`);
    }
  }

  // ======================================================
  // 📊 Ad Campaign Methods (Keep existing)
  // ======================================================

  async getAdCampaigns(): Promise<AdCampaign[]> {
    const response = await fetch(`${this.baseURL}/ads/campaigns`, this.getRequestOptions('GET'));
    return this.handleResponse(response);
  }

  async getAdCampaign(id: string): Promise<AdCampaign> {
    const response = await fetch(`${this.baseURL}/ads/campaigns/${id}`, this.getRequestOptions('GET'));
    const result = await this.handleResponse(response);
    // Extract the campaign data from the response structure
    return result.data || result;
  }

 async createAdCampaign(campaign: Omit<AdCampaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdCampaign> {
  // Debug what's being sent to the service
  console.log('🚀 adsService - Creating campaign with data:', campaign);
  console.log('🎯 adsService - Categories:', campaign.targetCategories);
  console.log('📍 adsService - Positions:', campaign.targetPositions);
  console.log('🔍 adsService - Are arrays?', {
    categoriesIsArray: Array.isArray(campaign.targetCategories),
    positionsIsArray: Array.isArray(campaign.targetPositions)
  });

  // Create a clean data object with proper array handling
  const requestData = {
    ...campaign,
    // Ensure arrays are properly formatted
    targetCategories: Array.isArray(campaign.targetCategories) ? campaign.targetCategories : [],
    targetPositions: Array.isArray(campaign.targetPositions) ? campaign.targetPositions : [],
  };

  console.log('📤 adsService - Final request data:', requestData);

  const response = await fetch(`${this.baseURL}/ads/campaigns`, {
    method: 'POST',
    ...this.getRequestOptions('POST'),
    body: JSON.stringify(requestData),
  });

  const result = await this.handleResponse(response);
  console.log('📥 adsService - Create response:', result);
  return result;
}

async updateAdCampaign(id: string, updates: Partial<AdCampaign>): Promise<AdCampaign> {
  // Debug what's being sent to the service
  console.log('🚀 adsService - Updating campaign:', id);
  console.log('📝 adsService - Update data:', updates);
  console.log('🎯 adsService - Categories:', updates.targetCategories);
  console.log('📍 adsService - Positions:', updates.targetPositions);

  // Create a clean data object with proper array handling
  const requestData = {
    ...updates,
    // Ensure arrays are properly formatted for updates too
    ...(updates.targetCategories !== undefined && { 
      targetCategories: Array.isArray(updates.targetCategories) ? updates.targetCategories : [] 
    }),
    ...(updates.targetPositions !== undefined && { 
      targetPositions: Array.isArray(updates.targetPositions) ? updates.targetPositions : [] 
    }),
  };

  console.log('📤 adsService - Final update data:', requestData);

  const response = await fetch(`${this.baseURL}/ads/campaigns/${id}`, {
    method: 'PUT',
    ...this.getRequestOptions('PUT'),
    body: JSON.stringify(requestData),
  });

  const result = await this.handleResponse(response);
  console.log('📥 adsService - Update response:', result);
  return result;
}

async updateCampaignStatus(id: string, status: string): Promise<AdCampaign> {
  console.log('🚀 adsService - Updating campaign status:', id, 'to:', status);

  const response = await fetch(`${this.baseURL}/ads/campaigns/${id}/status`, {
    method: 'PATCH',
    ...this.getRequestOptions('PATCH'),
    body: JSON.stringify({ status }),
  });

  const result = await this.handleResponse(response);
  console.log('📥 adsService - Update status response:', result);
  return result;
}

async deleteAdCampaign(id: string): Promise<void> {
  console.log('🚀 adsService - Deleting campaign:', id);

  const response = await fetch(`${this.baseURL}/ads/campaigns/${id}`, {
    method: 'DELETE',
    ...this.getRequestOptions('DELETE'),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `Delete failed: ${response.status}`);
  }

  console.log('✅ adsService - Campaign deleted successfully');
}

async linkMediaToCampaign(id: string, mediaUrl: string, mediaType: 'image' | 'video'): Promise<AdCampaign> {
  console.log('🚀 adsService - Linking media to campaign:', id, 'mediaUrl:', mediaUrl, 'mediaType:', mediaType);

  const response = await fetch(`${this.baseURL}/ads/campaigns/${id}/media`, {
    method: 'PATCH',
    ...this.getRequestOptions('PATCH'),
    body: JSON.stringify({ mediaUrl, mediaType }),
  });

  const result = await this.handleResponse(response);
  console.log('📥 adsService - Link media response:', result);
  return result;
}

  // ======================================================
  // 🎨 Ad Creative Methods (Keep existing)
  // ======================================================

  async getCampaignCreatives(campaignId: string): Promise<AdCreative[]> {
    const response = await fetch(`${this.baseURL}/ads/campaigns/${campaignId}/creatives`, this.getRequestOptions('GET'));
    return this.handleResponse(response);
  }

  async uploadCreative(creative: Omit<AdCreative, 'id'>): Promise<AdCreative> {
    const response = await fetch(`${this.baseURL}/ads/creatives`, {
      method: 'POST',
      ...this.getRequestOptions('POST'),
      body: JSON.stringify(creative),
    });
    return this.handleResponse(response);
  }

  async uploadCreativeWithFile(creativeData: Omit<AdCreative, 'id'>, file: File): Promise<AdCreative> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('creativeData', JSON.stringify(creativeData));

    const response = await fetch(`${this.baseURL}/ads/creatives/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `Creative upload failed: ${response.status}`);
    }

    const data = await response.json();
    return this.mapIdField(data);
  }

  // ======================================================
  // ⚙️ Google Ads Configuration (Keep existing)
  // ======================================================

  async getGoogleAdConfigs(): Promise<GoogleAdConfig[]> {
    const response = await fetch(`${this.baseURL}/ads/google-configs`, this.getRequestOptions('GET'));
    return this.handleResponse(response);
  }

  async createGoogleAdConfig(config: Omit<GoogleAdConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<GoogleAdConfig> {
    const response = await fetch(`${this.baseURL}/ads/google-configs`, {
      method: 'POST',
      ...this.getRequestOptions('POST'),
      body: JSON.stringify(config),
    });
    return this.handleResponse(response);
  }

  async updateGoogleAdConfig(config: GoogleAdConfig): Promise<GoogleAdConfig> {
    const response = await fetch(`${this.baseURL}/ads/google-configs/${config.id}`, {
      method: 'PUT',
      ...this.getRequestOptions('PUT'),
      body: JSON.stringify(config),
    });
    return this.handleResponse(response);
  }

  async deleteGoogleAdConfig(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/ads/google-configs/${id}`, {
      method: 'DELETE',
      ...this.getRequestOptions('DELETE'),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `Delete failed: ${response.status}`);
    }
  }

  // ======================================================
  // 📈 Statistics & Settings (Keep existing)
  // ======================================================

  async getAdStats(): Promise<AdStats> {
    const response = await fetch(`${this.baseURL}/ads/stats`, this.getRequestOptions('GET'));
    return this.handleResponse(response);
  }

  async getCampaignStats(campaignId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/ads/campaigns/${campaignId}/stats`, this.getRequestOptions('GET'));
    return this.handleResponse(response);
  }

  
  async getAdsSettings() {
    const response = await this.makeRequest('/ads/settings', {
      method: 'GET',
    });

    return this.handleResponse(response);
  }

  async updateAdsSettings(settings: any) {
    const response = await this.makeRequest('/ads/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });

    return this.handleResponse(response);
  }

  async testStripeConnection(stripeCredentials: { stripePublicKey: string; stripeSecretKey: string }) {
    const response = await this.makeRequest('/ads/test-stripe', {
      method: 'POST',
      body: JSON.stringify(stripeCredentials),
    });

    return this.handleResponse(response);
  }

  async generateWebhookSecret(webhookData: { webhookUrl: string; stripeSecretKey: string }) {
    const response = await this.makeRequest('/ads/generate-webhook-secret', {
      method: 'POST',
      body: JSON.stringify(webhookData),
    });

    return this.handleResponse(response);
  }
 

  // ======================================================
  // 🧩 Utility Methods (Keep existing)
  // ======================================================

  async validateFile(file: File): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const maxSize = 50 * 1024 * 1024; // 50MB
    const supportedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const supportedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];

    if (file.size > maxSize) {
      errors.push('File size must be less than 50MB');
    }

    const isImage = supportedImageTypes.includes(file.type);
    const isVideo = supportedVideoTypes.includes(file.type);

    if (!isImage && !isVideo) {
      errors.push('File must be an image (JPEG, PNG, GIF, WebP) or video (MP4, WebM, OGG)');
    }

    return { isValid: errors.length === 0, errors };
  }

  // ======================================================
  // 📊 Tracking Methods (Keep existing)
  // ======================================================

  async trackAdClick(adId: string, campaignId: string): Promise<void> {
    await fetch(`${this.baseURL}/ads/track/click`, {
      method: 'POST',
      ...this.getRequestOptions('POST'),
      body: JSON.stringify({ adId, campaignId }),
    });
  }

  async trackAdImpression(adId: string, campaignId: string): Promise<void> {
    await fetch(`${this.baseURL}/ads/track/impression`, {
      method: 'POST',
      ...this.getRequestOptions('POST'),
      body: JSON.stringify({ adId, campaignId }),
    });
  }

  //Stripe 

  

  // ======================================================
  // 🔧 Debug Methods
  // ======================================================

  debugAuthStatus(): void {
    console.log('🔐 Auth Debug: Using HTTP-only cookies');
  }
}

export const adsService = new AdsService();
