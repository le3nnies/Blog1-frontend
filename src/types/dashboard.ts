// types/dashboard.ts
export interface DateRange {
  from: Date;
  to: Date;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  previousValue?: number;
}

export interface DemographicData {
  name: string;
  value: number;
  percentage: number;
}

export interface TopContentItem {
  id: string;
  title: string;
  views: number;
  visits: number;
  engagement: number;
  publishedAt: string;
}

export interface CommentAnalytics {
  id: string;
  articleTitle: string;
  authorName: string;
  content: string;
  likes: number;
  replies: number;
  timestamp: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface EngagementMetrics {
  bounceRate: number;
  pagesPerSession: number;
  avgTimeOnPage: number;
  returningVisitors: number;
  newVisitors: number;
}

export interface AudienceLocation {
  country: string;
  city: string;
  users: number;
  percentage: number;
}