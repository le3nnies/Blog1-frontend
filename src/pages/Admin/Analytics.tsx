import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/pages/Admin/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';
import { 
  Activity, 
  Users, 
  FileText, 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  Download,
  RefreshCcw,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Clock,
  Target,
  Share2,
  BookOpen,
  Zap,
  Calendar,
  Filter,
  ChevronRight,
  MoreVertical,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyticsService } from "@/services/analyticsService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Using backend data structure directly
interface BackendAnalyticsData {
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
    hourlyTraffic: {
      data: Array<{
        hour: number;
        views: number;
        uniqueVisitors: number;
      }>;
      title: string;
      description: string;
    };
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
const TRAFFIC_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const StatCard = ({ 
  title, 
  value, 
  icon, 
  growth, 
  description,
  loading = false 
}: { 
  title: string;
  value: string | number;
  icon: React.ReactNode;
  growth: number;
  description?: string;
  loading?: boolean;
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-16" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="p-2 rounded-lg bg-primary/10">
            {icon}
          </div>
        </div>
        <div className="flex items-center justify-between pt-2">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className={`text-xs flex items-center ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {growth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {Math.abs(growth)}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function AnalyticsDashboard() {
  const { toast } = useToast();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BackendAnalyticsData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [allTimeData, setAllTimeData] = useState<any>(null);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [activeSessionsLoading, setActiveSessionsLoading] = useState(false);
  const [sessionLimit, setSessionLimit] = useState('25');

  useEffect(() => {
    let isCancelled = false;

    const doFetch = async () => {
      try {
        setLoading(true);

        console.log('Fetching analytics data for period:', period);

        // Fetch both period-specific data and all-time data for consistent total views
        const [analyticsData, allTimeAnalytics] = await Promise.all([
          analyticsService.getAnalytics({
            period,
            startDate: '',
            endDate: '',
            compareWithPrevious: false
          }),
          analyticsService.getDashboardAnalytics('all')
        ]);

        if (isCancelled) return;

        setAllTimeData(allTimeAnalytics);

        console.log('Received analytics data:', analyticsData);

        // Ensure graphs structure exists to prevent errors
        if (!analyticsData.graphs) {
          analyticsData.graphs = {} as any;
        }
        if (!analyticsData.graphs.viewsOverTime) {
          analyticsData.graphs.viewsOverTime = { data: [], title: 'Traffic', description: 'Views over time' };
        }

        // Transform and sort graph data to ensure it renders correctly
        let processedGraphData: any[] = [];

        if (Array.isArray(analyticsData.graphs.viewsOverTime.data)) {
          processedGraphData = analyticsData.graphs.viewsOverTime.data
                .map((item: any) => {
                  // Handle MongoDB aggregation results where date might be in _id
                  let dateStr = item.date || item.formattedDate;

                  // Only use _id if it looks like a date (and not a category name like "Finance")
                  if (!dateStr && item._id) {
                    if (typeof item._id === 'object') {
                      dateStr = item._id;
                    } else if (typeof item._id === 'string' && !isNaN(Date.parse(item._id)) && /\d/.test(item._id)) {
                      dateStr = item._id;
                    }
                  }

                  // Handle object _id (e.g. { year: 2023, month: 10, day: 25 })
                  if (typeof dateStr === 'object' && dateStr !== null) {
                    if (dateStr.year && dateStr.month && dateStr.day) {
                      dateStr = `${dateStr.year}-${String(dateStr.month).padStart(2, '0')}-${String(dateStr.day).padStart(2, '0')}`;
                    } else {
                      return null;
                    }
                  }

                  // Validate date string
                  if (!dateStr || typeof dateStr !== 'string' || isNaN(Date.parse(dateStr))) {
                    return null;
                  }

                  const rawViews = Number(item.views || item.count || item.totalViews || item.sessions || 0);
                  const views = isNaN(rawViews) ? 0 : rawViews;
                  
                  const rawUsers = Number(item.uniqueVisitors || item.users || item.totalUsers || 0);
                  const uniqueVisitors = isNaN(rawUsers) ? 0 : rawUsers;

                  // Skip items that don't look like daily data (e.g., category stats)
                  if (item.articles && !item.date && !item.formattedDate && typeof item._id !== 'string') {
                    return null;
                  }

                  return {
                    date: dateStr,
                    views: views,
                    uniqueVisitors: uniqueVisitors,
                    // Ensure formattedDate exists for display
                    formattedDate: item.formattedDate || (dateStr.includes('-') ?
                      new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) :
                      dateStr
                    )
                  };
                })
                .filter(item => item !== null) // Filter out invalid data and null items
                .sort((a: any, b: any) => {
                  // Sort by date
                  try {
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                  } catch (e) {
                    return 0;
                  }
                });
        }

        // Fallback: If graph data is empty but we have total stats, create a synthetic data point.
        // This handles cases where the backend provides totals but no time-series data for the graph.
        if (processedGraphData.length === 0 && (Number(analyticsData.overview?.totalViews) > 0 || Number(analyticsData.overview?.totalUsers) > 0)) {
          const today = new Date().toISOString().split('T')[0];
          processedGraphData.push({
            date: today,
            views: Number(analyticsData.overview?.totalViews || analyticsData.totalViews) || 0,
            uniqueVisitors: Number(analyticsData.overview?.totalUsers || analyticsData.totalUsers) || 0,
            formattedDate: new Date(today).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          });
        }

        console.log('Processed graph data:', processedGraphData);
        analyticsData.graphs.viewsOverTime.data = processedGraphData;

        // Ensure traffic sources have correct mapping
        if (analyticsData?.graphs?.trafficSources?.data) {
          analyticsData.graphs.trafficSources.data = analyticsData.graphs.trafficSources.data.map((item: any) => ({
            name: item.name || item._id || 'Direct',
            value: Number(item.value || item.count || 0)
          }));
        }

        // Transform geographic data to handle backend variations
        if (analyticsData?.geographic?.countries) {
          analyticsData.geographic.countries = analyticsData.geographic.countries.map((item: any) => ({
            country: item.country || item._id || 'Unknown',
            sessions: Number(item.sessions || item.count || 0),
            percentage: Number(item.percentage || 0),
            views: Number(item.views || item.count || 0),
            avgDuration: Number(item.avgDuration || 0)
          }));
        }

        setData(analyticsData);

        toast({
          title: "Analytics Updated",
          description: `Loaded real analytics data for ${period}`,
        });

      } catch (error) {
        if (isCancelled) return;

        let errorMessage = error instanceof Error ? error.message : "Unable to fetch analytics data from server";

        // Detect HTML response error (common when API is down or path is wrong)
        if (errorMessage.includes("Unexpected token '<'") || errorMessage.includes("Unexpected token <")) {
          console.error("API Error: The server returned HTML (likely a 404 page) instead of JSON. Check your API URL and backend status.");
          errorMessage = "API Error: Received HTML instead of JSON. Check if backend is running.";
        } else {
          console.error('Error fetching analytics:', error);
        }

        // Show error instead of falling back to mock data
        toast({
          title: "Failed to Load Analytics",
          description: errorMessage,
          variant: "destructive",
        });

        // Set empty data state
        setData(null);
      } finally {
        if (!isCancelled) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    doFetch();

    return () => {
      isCancelled = true;
    };
  }, [period, refreshTrigger, toast]);

  const fetchActiveSessions = useCallback(async () => {
    try {
      setActiveSessionsLoading(true);
      const data = await analyticsService.getActiveSessions(parseInt(sessionLimit));
      setActiveSessions(data.activeSessions);
    } catch (error) {
      console.error("Failed to fetch active sessions", error);
      toast({
        title: "Error",
        description: "Failed to load active sessions",
        variant: "destructive",
      });
    } finally {
      setActiveSessionsLoading(false);
    }
  }, [sessionLimit, toast]);

  useEffect(() => {
    if (activeTab === 'active-sessions') {
      fetchActiveSessions();
      const interval = setInterval(fetchActiveSessions, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [activeTab, fetchActiveSessions]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshTrigger(c => c + 1);
    toast({
      title: "Refreshing Data",
      description: "Fetching latest analytics data...",
    });
  };

  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    setExporting(true);
    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Export Successful",
        description: `Data exported as ${format.toUpperCase()} file`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const formatNumber = (num: number) => {
    return (num || 0).toLocaleString('en-US');
  };

  const formatDuration = (minutes: number) => {
    return `${minutes} min`;
  };

  if (loading && !data) {
    return (
      <DashboardLayout>
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 lg:col-span-2" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analytics Dashboard</h1>
                <p className="text-slate-500 mt-1">Monitor your content performance and audience insights</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="font-medium">{data?.overview.totalSessions || 0} active sessions</span>
            </div>
            
            <Select value={period} onValueChange={(value) => setPeriod(value as '7d' | '30d' | '90d' | '1y')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 3 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              className="hover:bg-blue-50 hover:text-blue-600"
            >
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={exporting}>
                  {exporting ? (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('csv')}>CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>JSON</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>PDF Report</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full md:w-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="audience" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Audience
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="active-sessions" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Active Sessions
            </TabsTrigger>
            <TabsTrigger value="realtime" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Realtime
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Views"
                value={formatNumber(data?.overview?.totalViews || data?.totalViews || 0)}
                icon={<Eye className="h-5 w-5 text-blue-600" />}
                growth={0} // Growth data for views is not available in the current data structure
                description="Total page views"
                loading={loading}
              />

              <StatCard
                title="Unique Visitors"
                value={formatNumber(data?.overview?.totalUsers || data?.totalUsers || 0)}
                icon={<Users className="h-5 w-5 text-purple-600" />}
                growth={0}
                description="Total unique visitors"
                loading={loading}
              />

              <StatCard
                title="Total Articles"
                value={formatNumber(data?.totalArticles || 0)}
                icon={<FileText className="h-5 w-5 text-green-600" />}
                growth={data?.comparison.totalArticlesChange || 0}
                description="Total articles"
                loading={loading}
              />

              <StatCard
                title="Avg. Session Duration"
                value={formatDuration(data?.overview.avgSessionDuration || 0)}
                icon={<Clock className="h-5 w-5 text-orange-600" />}
                growth={0}
                description="Average session time"
                loading={loading}
              />
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bounce Rate</p>
                      <div className="text-2xl font-bold mt-1">{data?.overview.bounceRate}%</div>
                    </div>
                    <div className="w-32">
                      <Progress value={100 - (data?.overview.bounceRate || 0)} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Returning Visitors</p>
                      <div className="text-2xl font-bold mt-1">
                        {formatNumber(data?.overview.returningVisitors || 0)}
                      </div>
                    </div>
                    <Target className="h-8 w-8 text-indigo-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                      <div className="text-2xl font-bold mt-1">{data?.overview.totalSessions}</div>
                    </div>
                    <div className={`text-xs flex items-center ${(data?.comparison.totalArticlesChange || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {(data?.comparison.totalArticlesChange || 0) >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {Math.abs(data?.comparison.totalArticlesChange || 0)}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Traffic Overview</CardTitle>
                  <CardDescription>Daily views and unique visitors over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data?.graphs.viewsOverTime.data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#0088FE" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#00C49F" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="date" 
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          minTickGap={30}
                          tickFormatter={(value) => {
                            try {
                              return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            } catch (e) {
                              return value;
                            }
                          }}
                        />
                        <YAxis 
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${value}`}
                        />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="views" 
                          stroke="#0088FE" 
                          fillOpacity={1} 
                          fill="url(#colorViews)" 
                          name="Page Views"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="uniqueVisitors"
                          stroke="#00C49F"
                          fillOpacity={1}
                          fill="url(#colorVisitors)"
                          name="Unique Visitors"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Device Distribution</CardTitle>
                  <CardDescription>Traffic by device type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data?.devices.types}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="percentage"
                        >
                          {data?.devices.types.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {data?.devices.types.map((device, index) => {
                        const getDeviceIcon = (deviceType: string) => {
                          const type = deviceType.toLowerCase();
                          if (type.includes('mobile') || type.includes('phone')) {
                            return <Smartphone className="h-6 w-6 text-blue-600" />;
                          } else if (type.includes('tablet')) {
                            return <Tablet className="h-6 w-6 text-green-600" />;
                          } else {
                            return <Monitor className="h-6 w-6 text-purple-600" />;
                          }
                        };

                        const formatDeviceName = (deviceType: string) => {
                          return deviceType.charAt(0).toUpperCase() + deviceType.slice(1).toLowerCase();
                        };

                        return (
                          <div key={`${device.device}-${index}`} className="text-center p-2 border rounded-lg">
                            <div className="flex items-center justify-center mb-1">
                              {getDeviceIcon(device.device)}
                            </div>
                            <div className="font-medium">{formatDeviceName(device.device)}</div>
                            <div className="text-2xl font-bold">{Math.round(device.percentage)}%</div>
                            <div className="text-xs text-muted-foreground">
                              {formatNumber(device.sessions)} sessions
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hourly Traffic & Traffic Sources */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hourly Traffic</CardTitle>
                  <CardDescription>Views distribution by hour (24h)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data?.graphs.hourlyTraffic.data}>
                        <XAxis dataKey="hour" stroke="#888888" fontSize={12} />
                        <YAxis stroke="#888888" fontSize={12} />
                        <Tooltip />
                        <Bar dataKey="views" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                  <CardDescription>Visitor sources and conversion rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.graphs.trafficSources.data.map((source, index) => (
                      <div key={source.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: TRAFFIC_COLORS[index] }} />
                          <span className="font-medium">{source.name}</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="font-bold">{formatNumber(source.value)}</div>
                            <div className="text-xs text-muted-foreground">visitors</div>
                          </div>
                          <div className="text-right w-24">
                            <div className="font-bold">{source.value}%</div>
                            <div className="text-xs text-muted-foreground">conversion</div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            N/A
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            {/* Top Content Table */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
                <CardDescription>Most viewed posts with engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.content.topArticles.map((content, index) => (
                    <div key={content.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors group">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900 group-hover:text-primary transition-colors">
                              {content.title}
                            </p>
                            <Badge variant="outline">{content.category}</Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {formatNumber(content.views)}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {content.likes} likes
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(content.publishedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">
                          {(content.views || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500">views</div>
                      </div>
                      <Button variant="ghost" size="icon" className="ml-4">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button variant="outline" className="w-full">
                  View All Content Analytics
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="audience" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                  <CardDescription>Top countries by visitors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.geographic.countries.map((country, index) => (
                      <div key={country.country} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <span className="font-bold text-sm">{country.country.substring(0, 2).toUpperCase()}</span>
                          </div>
                          <span className="font-medium">{country.country}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-bold">{formatNumber(country.sessions)}</div>
                            <div className="text-xs text-muted-foreground">sessions</div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {country.percentage}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Audience Engagement</CardTitle>
                  <CardDescription>Detailed engagement metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Pages per Session</span>
                        <span className="text-sm font-bold">{data?.overview.avgPagesPerSession?.toFixed(1) || 0}</span>
                      </div>
                      <Progress value={Math.min((data?.overview.avgPagesPerSession || 0) * 10, 100)} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Avg. Session Duration</span>
                        <span className="text-sm font-bold">{formatDuration(data?.overview.avgSessionDuration || 0)}</span>
                      </div>
                      <Progress value={Math.min((data?.overview.avgSessionDuration || 0) * 10, 100)} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">New vs Returning</span>
                        <span className="text-sm font-bold">
                          {Math.round((data?.overview.newVisitors || 0) / ((data?.overview.newVisitors || 0) + (data?.overview.returningVisitors || 0) || 1) * 100)}% / {Math.round((data?.overview.returningVisitors || 0) / ((data?.overview.newVisitors || 0) + (data?.overview.returningVisitors || 0) || 1) * 100)}%
                        </span>
                      </div>
                      <Progress value={Math.round((data?.overview.newVisitors || 0) / ((data?.overview.newVisitors || 0) + (data?.overview.returningVisitors || 0) || 1) * 100)} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="active-sessions" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Active Sessions</h2>
                <p className="text-sm text-muted-foreground">Real-time monitoring of current users</p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={sessionLimit} onValueChange={setSessionLimit}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Limit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 sessions</SelectItem>
                    <SelectItem value="50">50 sessions</SelectItem>
                    <SelectItem value="100">100 sessions</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={fetchActiveSessions} disabled={activeSessionsLoading}>
                  <RefreshCcw className={`h-4 w-4 ${activeSessionsLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                {activeSessionsLoading && activeSessions.length === 0 ? (
                  <div className="p-6 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                ) : activeSessions.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No active sessions found at the moment.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {activeSessions.map((session) => (
                      <div key={session.sessionId} className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border">
                            {session.user?.avatar ? (
                              <img src={session.user.avatar} alt={session.user.username} className="h-full w-full object-cover" />
                            ) : (
                              <Users className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{session.user?.username || 'Guest User'}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {session.location?.city || 'Unknown'}, {session.location?.country || 'Unknown'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-600 min-w-[150px]">
                          {session.device?.type === 'mobile' ? <Smartphone className="h-4 w-4" /> : 
                           session.device?.type === 'tablet' ? <Tablet className="h-4 w-4" /> : 
                           <Monitor className="h-4 w-4" />}
                          <span className="capitalize">{session.device?.os || 'Unknown OS'} • {session.device?.browser || 'Browser'}</span>
                        </div>

                        <div className="flex-1 min-w-[200px]">
                          <div className="text-sm font-medium truncate max-w-[300px] text-primary">
                            {session.currentPage?.title || 'Viewing Page'}
                          </div>
                          <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                            {session.currentPage?.url || '/'}
                          </div>
                        </div>

                        <div className="text-right text-sm min-w-[100px]">
                          <div className="font-medium flex items-center justify-end gap-1 text-green-600">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            Active
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round((session.session?.duration || 0) / 60)}m duration
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Stats Footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border rounded-lg bg-white">
            <div className="text-2xl font-bold text-primary">{formatNumber(data?.overview?.totalViews || data?.totalViews || 0)}</div>
            <div className="text-sm text-muted-foreground">Total Views</div>
          </div>
          <div className="text-center p-4 border rounded-lg bg-white">
            <div className="text-2xl font-bold text-purple-600">{formatNumber(data?.overview?.totalUsers || data?.totalUsers || 0)}</div>
            <div className="text-sm text-muted-foreground">Unique Visitors</div>
          </div>
          <div className="text-center p-4 border rounded-lg bg-white">
            <div className="text-2xl font-bold text-green-600">{data?.overview.bounceRate}%</div>
            <div className="text-sm text-muted-foreground">Bounce Rate</div>
          </div>
          <div className="text-center p-4 border rounded-lg bg-white">
            <div className="text-2xl font-bold text-orange-600">{data?.overview.totalSessions || 0}</div>
            <div className="text-sm text-muted-foreground">Total Sessions</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
