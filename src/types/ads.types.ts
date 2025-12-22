// src/types/ads.types.ts
export interface AdCampaign {
  id: string;
  title: string;
  description: string;
  advertiser: string;
  advertiserEmail: string;
  advertiserPhone?: string;
  type: 'banner' | 'sidebar' | 'inline' | 'popup';
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'paused' | 'completed';
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  targetCategories: string[];
  targetPositions: string[];
  impressions: number;
  clicks: number;
  ctr: number;
  clickUrl: string;
  createdAt: string;
  updatedAt: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  revenue?: number;
  name?: string;
}

// Type guard to ensure arrays are always defined and have includes method
export type SafeArray<T> = T[] & {
  includes(searchElement: T, fromIndex?: number): boolean;
};

// Utility type for AdCampaign with guaranteed arrays
export type AdCampaignWithSafeArrays = Omit<AdCampaign, 'targetCategories' | 'targetPositions'> & {
  targetCategories: SafeArray<string>;
  targetPositions: SafeArray<string>;
};

export interface AdCreative {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  imageUrl: string;
  destinationUrl: string;
  altText: string;
  callToAction?: string;
  isActive: boolean;
}

export interface GoogleAdConfig {
  id: string;
  adUnit: string;
  adSlot: string;
  enabled: boolean;
  position: 'header' | 'sidebar' | 'footer' | 'inline' | 'between_posts';
  displayOn: ('home' | 'article' | 'category' | 'about' | 'contact' | 'search' | 'author')[];
  size: string;
  format: string;
  responsive: boolean;
  maxWidth?: string;
  customStyle?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyTrend {
  week?: string;
  weekKey?: string;
  startDate?: string;
  revenue: number;
  clicks: number;
  impressions: number;
  ctr: number;
}

export interface WeeklyAnalytics {
  weeklyTrends: WeeklyTrend[];
  weeklyGrowth: {
    revenueGrowth: number;
    clickGrowth: number;
    isPositive: boolean;
  };
  currentWeek: {
    revenue: number;
    clicks: number;
    weekNumber: string;
  };
}

export interface AdStats {
  totalRevenue: number;
  activeCampaigns: number;
  pendingApprovals: number;
  todayImpressions: number;
  todayClicks: number;
  todayRevenue?: number;
  monthlyRevenue: number;
  weeklyAnalytics?: WeeklyAnalytics;
  weeklyRevenue?: WeeklyTrend[];
  weeklyGrowth?: {
    revenueGrowth: number;
    clickGrowth: number;
    isPositive: boolean;
  };
  currentWeek?: {
    revenue: number;
    clicks: number;
    weekNumber: string;
  };
}

// src/types/ads.types.ts - Add this interface
export interface AdSettings {
  // General Settings
  siteName: string;
  adCurrency: string;
  autoApproveCampaigns: boolean;
  requireAdvertiserVerification: boolean;
  
  // Display Settings
  maxAdsPerPage: number;
  adDensity: 'low' | 'medium' | 'high';
  showAdsToSubscribers: boolean;
  
  // Payment & Billing
  paymentGateway: 'stripe' | 'paypal' | 'manual';
  stripePublicKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  paypalClientId: string;
  defaultCommissionRate: number;
  taxRate: number;
  
  
  // Notifications
  emailNotifications: boolean;
  notifyOnNewCampaign: boolean;
  notifyOnCampaignApproval: boolean;
  notifyOnLowBalance: boolean;
  adminEmail: string;
  
  // Privacy & Compliance
  enableGDPR: boolean;
  enableCCPA: boolean;
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
  
  // Google AdSense
  googleAdSenseEnabled: boolean;
  googleAdSenseClientId: string;
  autoAdsEnabled: boolean;
  
  // Advanced
  adRefreshInterval: number;
  enableAdBlockRecovery: boolean;
  customAdCSS: string;
  
  // Timestamps (from backend)
  createdAt?: string;
  updatedAt?: string;
}