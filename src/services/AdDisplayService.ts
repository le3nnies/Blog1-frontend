// src/services/adDisplayService.ts
import { AdCampaign } from '@/types/ads.types';
const BACKEND_URL = import.meta.env.REACT_APP_API_BASE_URL;

class AdDisplayService {
  private baseURL = `${BACKEND_URL}/api`;

  async getActiveAds(category?: string, position?: string, limit: number = 4): Promise<AdCampaign[]> {
    const params = new URLSearchParams();
    
    if (category) params.append('category', category);
    if (position) params.append('position', position);
    params.append('limit', limit.toString());

    const response = await fetch(`${this.baseURL}/ads/active?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch active ads');
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error('❌ Expected JSON but received:', text.substring(0, 200));
      throw new Error('Invalid API response: Expected JSON but received HTML. Check proxy config or backend URL.');
    }
    
    const data = await response.json();
    
    // FIX: Map _id to id and ensure IDs are valid
    const ads = data.data || [];
    return ads.map((ad: any) => this.mapIdField(ad)).filter((ad: AdCampaign) => ad.id && ad.id !== 'undefined');
  }

  // Helper method to map _id to id
  private mapIdField(data: any): any {
    if (!data) return data;
    
    // If data has _id but no id, map _id to id
    if (data._id && !data.id) {
      return {
        ...data,
        id: data._id.toString()
      };
    }
    
    return data;
  }

  // Get ads for specific positions
  async getSidebarAds(category?: string): Promise<AdCampaign[]> {
    return this.getActiveAds(category, 'sidebar', 2);
  }

  async getInlineAds(category?: string): Promise<AdCampaign[]> {
    return this.getActiveAds(category, 'inline', 2);
  }

  async getHeaderAds(): Promise<AdCampaign[]> {
    return this.getActiveAds(undefined, 'header', 1);
  }

  async getBetweenPostsAds(category?: string): Promise<AdCampaign[]> {
    return this.getActiveAds(category, 'between_posts', 1);
  }

  // ADD THESE TRACKING METHODS
  async trackAdClick(campaignId: string): Promise<any> {
    // FIX: Check for valid campaignId
    if (!campaignId || campaignId === 'undefined') {
      console.warn('Invalid campaign ID for click tracking:', campaignId);
      return;
    }
    
    const response = await fetch(`${this.baseURL}/ads/${campaignId}/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error('Failed to track ad click');
    }
    
    return response.json();
  }

  async trackAdImpression(campaignId: string): Promise<any> {
    // FIX: Check for valid campaignId
    if (!campaignId || campaignId === 'undefined') {
      console.warn('Invalid campaign ID for impression tracking:', campaignId);
      return;
    }
    
    const response = await fetch(`${this.baseURL}/ads/${campaignId}/impression`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error('Failed to track ad impression');
    }
    
    return response.json();
  }
}

export const adDisplayService = new AdDisplayService();
