export interface AnalyticsData {
  totalViews: number;
  totalArticles: number;
  totalUsers: number;
  avgSessionDuration: number;
  totalLikes?: number;
  totalComments?: number;
  totalBookmarks?: number;
  topPages: Array<{
    title: string;
    views?: number;
  }>;
  overview?: {
    totalViews: number;
    totalUsers: number;
    totalArticles: number;
    returningVisitors?: number;
    bounceRate?: number;
  };
  comparison?: {
    previousTotalArticles: number;
    totalArticlesChange: number;
  };
  content?: {
    topArticles: Array<{
      id: string;
      title: string;
      views: number;
      likes: number;
      category: string;
      publishedAt?: string;
    }>;
  };
  topArticles: Array<{
    id: string;
    title: string;
    views: number;
    category: string;
    publishedAt?: string;
    likes?: number;
  }>;
  viewsByDate: Array<{
    date: string;
    views: number;
    uniqueVisitors: number;
    formattedDate?: string;
  }>;
  categoryStats: Array<{
    category: string;
    views: number;
    articles: number;
  }>;
  userEngagement: Array<{
    metric: string;
    value: number;
    change: number;
  }>;
  trafficSources?: Array<{
    name: string;
    value: number;
    _id?: string;
    count?: number;
  }>;
  engagementTrends?: Array<{
    date: string;
    likes: number;
    comments: number;
    shares: number;
  }>;
  devices?: {
    types: Array<{
      device: string;
      sessions: number;
      percentage: number;
      avgDuration: number;
    }>;
    brands: Array<{
      brand: string;
      sessions: number;
      percentage: number;
      avgDuration: number;
      deviceTypes?: string[];
      models?: string[];
    }>;
    screenResolutions: Array<{
      resolution: string;
      sessions: number;
      percentage: number;
      avgDuration: number;
    }>;
    categories: Array<{
      category: string;
      sessions: number;
      percentage: number;
      avgDuration: number;
    }>;
  };
  geographic?: GeographicData;
  insights?: Insight[];
  graphs?: {
    viewsOverTime?: {
      data: Array<{
        date: string;
        views: number;
        uniqueVisitors: number;
        formattedDate?: string;
      }>;
      title: string;
      description: string;
    };
    trafficSources?: {
      data: Array<{
        name: string;
        value: number;
        _id?: string;
        count?: number;
      }>;
      title: string;
      description: string;
    };
    topArticles?: {
      data: Array<{
        title: string;
        views: number;
      }>;
      title: string;
      description: string;
    };
    deviceTypes?: {
      data: Array<{
        device: string;
        sessions: number;
        percentage: number;
        avgDuration: number;
      }>;
      title: string;
      description: string;
    };
    engagementTrends?: {
      data: Array<{
        date: string;
        likes: number;
        comments: number;
        shares: number;
        bookmarks: number;
      }>;
      title: string;
      description: string;
    };
  };
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  period?: '7d' | '30d' | '90d' | '1y';
  compareWithPrevious?: boolean;
  metrics?: string[];
}

export interface RealtimeMetrics {
  activeUsers: number;
  currentViews: number;
  avgTime: number;
  homepageViews: number;
  activeSessions: number;
  topPages: Array<{
    articleId: string;
    views: number;
    title: string;
    slug: string;
    category: string;
    isHomepage: boolean;
  }>;
}

export interface ArticleAnalytics {
  views: number;
  uniqueViews: number;
  avgTimeOnPage: number;
  bounceRate: number;
  viewsByDate: Array<{ date: string; views: number }>;
  referrerSources: Array<{ source: string; views: number }>;
}

export interface UserBehaviorData {
  pageViews: Array<{ page: string; views: number; avgTime: number }>;
  userFlow: Array<{ from: string; to: string; count: number }>;
  deviceStats: Array<{ device: string; count: number; percentage: number }>;
  geoStats: Array<{ country: string; count: number; percentage: number }>;
}

export interface GeographicData {
  countries: Array<{
    country: string;
    countryCode: string;
    sessions: number;
    percentage: number;
    views: number;
    avgDuration: number;
    _id?: {
      country?: string;
      countryCode?: string;
    };
    count?: number;
  }>;
  cities: Array<{
    city: string;
    country: string;
    countryCode: string;
    sessions: number;
    percentage: number;
    views: number;
  }>;
  regions: Array<{
    region: string;
    country: string;
    countryCode: string;
    sessions: number;
    percentage: number;
  }>;
  continents: Array<{
    continent: string;
    sessions: number;
    percentage: number;
    countries: number;
  }>;
  topLocations: Array<{
    location: string;
    type: 'country' | 'city' | 'region';
    sessions: number;
    percentage: number;
    flag?: string;
  }>;
}

export interface ComparisonPeriod {
  currentPeriod: AnalyticsFilters;
  previousPeriod: AnalyticsFilters;
}

export interface AnalyticsReport {
  id: string;
  title: string;
  type: 'performance' | 'engagement' | 'traffic' | 'content';
  dateRange: {
    start: string;
    end: string;
  };
  data: AnalyticsData;
  generatedAt: string;
  generatedBy: string;
}

export interface Insight {
  type: 'traffic' | 'engagement' | 'content' | 'device' | 'marketing' | 'technical' | 'general';
  title: string;
  description: string;
  severity: 'success' | 'warning' | 'danger' | 'info';
  metric: number;
  trend: 'up' | 'down' | 'stable';
  recommendation: string;
}

export interface Recommendation {
  type: 'engagement' | 'content' | 'marketing' | 'technical' | 'traffic' | 'general';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actions: string[];
}




export interface CommentsAnalytics {
  totalComments: number;
  commentsByDate: Array<{
    date: string;
    comments: number;
    articlesWithComments: number;
  }>;
  topCommentedArticles: Array<{
    id: string;
    title: string;
    slug: string;
    category: string;
    views: number;
    comments: number;
  }>;
  commentsByCategory: Array<{
    category: string;
    comments: number;
    articlesWithComments: number;
  }>;
  commentsByHour: Array<{
    hour: number;
    comments: number;
    timeLabel: string;
  }>;
  commentsByDayOfWeek: Array<{
    dayOfWeek: number;
    comments: number;
    dayName: string;
  }>;
  avgCommentsPerArticle: number;
  commentEngagementRate: number;
  commentEngagement: {
    commentsPerView: number;
    commentConversionRate: number;
  };
  period: {
    from: string;
    to: string;
    days: number;
  };
}

export interface InsightsAndRecommendations {
  insights: Insight[];
  recommendations: Recommendation[];
  metrics: {
    totalViews: number;
    uniqueVisitors: number;
    avgSessionDuration: number;
    totalSessions: number;
    avgPageViews: number;
    bounceRate: number;
  };
  period: {
    from: string;
    to: string;
    days: number;
  };
}

// Types for our analytics data
export interface AnalyticsSummary {
  totalViews: number;
  totalVisitors: number;
  totalPosts: number;
  engagementRate: number;
  viewsGrowth: number;
  visitorsGrowth: number;
  postsGrowth: number;
  engagementGrowth: number;
  avgTimeOnPage: number;
  bounceRate: number;
  returningVisitors?: number;
}

export interface TrendData {
  date: string;
  views: number;
  visitors: number;
  engagement: number;
  bounceRate: number;
}

export interface DeviceData {
  name: string;
  value: number;
  change: number;
  icon: React.ReactNode;
}

export interface ContentData {
  id: string;
  title: string;
  views: number;
  likes: number;
  comments?: number;
  shares?: number;
  readTime: number;
  category?: string;
  growth: number;
}

export interface TrafficSource {
  source: string;
  visitors: number;
  conversion: number;
  change: number;
}

export interface CountryData {
  country: string;
  code: string;
  visitors: number;
  change: number;
}

export interface AnalyticsResponse {
  summary: AnalyticsSummary;
  trends: TrendData[];
  hourlyTrends: { hour: string; views: number }[];
  deviceDistribution: DeviceData[];
  topContent: ContentData[];
  trafficSources: TrafficSource[];
  topCountries: CountryData[];
  realtimeVisitors: number;
}

// Using backend data structure directly
export interface BackendAnalyticsData {
  totalViews: number;
  totalUsers: number;
  totalArticles: number;
  overview: {
    totalViews: number;
    totalUsers: number;
    totalArticles: number;
    avgSessionDuration: number;
    avgPagesPerSession: number;
    bounceRate: number;
    newVisitors: number;
    returningVisitors: number;
    totalSessions: number;
  };
  comparison: {
    previousTotalArticles: number;
    totalArticlesChange: number;
  };
  content: {
    topArticles: Array<{
      id: string;
      title: string;
      views: number;
      category: string;
      publishedAt: string;
      likes: number;
    }>;
  };
  categoryStats: Array<{
    category: string;
    views: number;
    articles: number;
  }>;
  userEngagement: Array<{
    metric: string;
    value: number;
    change: number;
  }>;
  devices: {
    types: Array<{
      device: string;
      sessions: number;
      percentage: number;
      avgDuration: number;
    }>;
    brands: Array<{
      brand: string;
      sessions: number;
      percentage: number;
      avgDuration: number;
      deviceTypes: string[];
      models: string[];
    }>;
    screenResolutions: Array<{
      resolution: string;
      sessions: number;
      percentage: number;
      avgDuration: number;
    }>;
    categories: Array<{
      category: string;
      sessions: number;
      percentage: number;
      avgDuration: number;
    }>;
  };
  geographic: {
    countries: Array<{
      country: string;
      sessions: number;
      percentage: number;
      views: number;
      avgDuration: number;
    }>;
    cities: Array<{
      city: string;
      country: string;
      sessions: number;
      percentage: number;
      views: number;
    }>;
    regions: Array<{
      region: string;
      country: string;
      sessions: number;
      percentage: number;
    }>;
    continents: Array<{
      continent: string;
      sessions: number;
      percentage: number;
      countries: number;
    }>;
    topLocations: Array<{
      location: string;
      type: string;
      sessions: number;
      percentage: number;
    }>;
  };
  graphs: {
    viewsOverTime: {
      data: Array<{
        date: string;
        views: number;
        uniqueVisitors: number;
        formattedDate: string;
      }>;
      title: string;
      description: string;
    };
    trafficSources: {
      data: Array<{
        name: string;
        value: number;
      }>;
      title: string;
      description: string;
    };
    topArticles: {
      data: Array<{
        title: string;
        views: number;
      }>;
      title: string;
      description: string;
    };
    deviceTypes: {
      data: Array<{
        device: string;
        sessions: number;
        percentage: number;
        avgDuration: number;
      }>;
      title: string;
      description: string;
    };
    engagementTrends: {
      data: Array<{
        date: string;
        likes: number;
        comments: number;
        shares: number;
        bookmarks: number;
      }>;
      title: string;
      description: string;
    };
  };
}
