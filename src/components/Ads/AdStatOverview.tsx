// src/components/Ads/AdStatsOverview.tsx
import { AdCampaign, AdStats } from "@/types/ads.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  Eye, 
  MousePointer, 
  DollarSign,
  Calendar,
  Users,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { useEffect, useState } from "react";

interface AdStatsOverviewProps {
  stats: AdStats | null;
  campaigns: AdCampaign[];
}

const AdStatsOverview = ({ stats, campaigns }: AdStatsOverviewProps) => {
  const [debugData, setDebugData] = useState<any>(null);

  // Debug: Log the actual stats structure
  useEffect(() => {
    if (stats) {
      console.log('📊 Stats Structure:', stats);
      console.log('📈 Weekly Analytics:', (stats as any)?.weeklyAnalytics);
      console.log('📅 Weekly Trends:', (stats as any)?.weeklyAnalytics?.weeklyTrends);
      setDebugData({
        hasWeeklyAnalytics: !!(stats as any)?.weeklyAnalytics,
        weeklyTrends: (stats as any)?.weeklyAnalytics?.weeklyTrends,
        statsKeys: Object.keys(stats)
      });
    }
  }, [stats]);

  // Safe data access helper functions
  const safeToLocaleString = (value: number | undefined) => {
    return (value || 0).toLocaleString();
  };

  const safeCurrency = (value: number | undefined) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value || 0);
  };

  const safePercentage = (value: number | undefined) => {
    return (value || 0).toFixed(2);
  };

  // Calculate metrics from real data
  const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + (c.spent || 0), 0);
  
  const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const averageCPC = totalClicks > 0 ? totalRevenue / totalClicks : 0;

  // Handle both old and new data structures for weekly data
  const weeklyRevenueData = (() => {
    // Check if we have the new weeklyAnalytics structure
    const weeklyAnalytics = (stats as any)?.weeklyAnalytics;
    
    if (weeklyAnalytics?.weeklyTrends?.length > 0) {
      // New structure with weeklyAnalytics
      return weeklyAnalytics.weeklyTrends.map((week: any, index: number, array: any[]) => {
        // Handle different possible week label formats
        let weekLabel = 'Unknown Week';
        
        if (week.week && week.week !== 'undefined') {
          weekLabel = week.week;
        } else if (week.weekKey) {
          const weekNum = week.weekKey.split('-W')[1];
          weekLabel = `Week ${weekNum}`;
        } else if (week.startDate) {
          const start = new Date(week.startDate);
          const month = start.toLocaleString('default', { month: 'short' });
          const day = start.getDate();
          weekLabel = `${month} ${day}`;
        }
        
        // Use relative labels for better UX
        const position = array.length - index;
        if (position === 1) weekLabel = 'This Week';
        else if (position === 2) weekLabel = 'Last Week';
        else if (position === 3) weekLabel = '2 Weeks Ago';
        else if (position === 4) weekLabel = '3 Weeks Ago';
        
        return {
          name: weekLabel,
          revenue: week.revenue || 0,
          clicks: week.clicks || 0,
          impressions: week.impressions || 0,
          ctr: week.ctr || 0,
          // Add gradient color based on position
          gradientId: `colorRevenue_${index}`,
          isCurrentWeek: position === 1
        };
      });
    } 
    
    // Fallback: Check if we have direct weeklyRevenue array (old structure)
    else if ((stats as any)?.weeklyRevenue?.length > 0) {
      return (stats as any).weeklyRevenue.map((week: any, index: number, array: any[]) => {
        const position = array.length - index;
        let weekLabel = 'Week';
        
        if (position === 1) weekLabel = 'This Week';
        else if (position === 2) weekLabel = 'Last Week';
        else if (position === 3) weekLabel = '2 Weeks Ago';
        else if (position === 4) weekLabel = '3 Weeks Ago';
        else weekLabel = `Week ${position}`;
        
        return {
          name: weekLabel,
          revenue: week.revenue || 0,
          clicks: week.clicks || 0,
          impressions: week.impressions || 0,
          ctr: week.ctr || 0,
          gradientId: `colorRevenue_${index}`,
          isCurrentWeek: position === 1
        };
      });
    }
    
    // No weekly data available - create sample data for demonstration
    return [
      { name: '3 Weeks Ago', revenue: 0.05, gradientId: 'colorRevenue_0', isCurrentWeek: false },
      { name: '2 Weeks Ago', revenue: 0.08, gradientId: 'colorRevenue_1', isCurrentWeek: false },
      { name: 'Last Week', revenue: 0.12, gradientId: 'colorRevenue_2', isCurrentWeek: false },
      { name: 'This Week', revenue: 0.18, gradientId: 'colorRevenue_3', isCurrentWeek: true },
    ];
  })();

  // Gradient colors for different weeks
  const gradientColors = [
    { start: '#8884d8', end: '#8884d840' }, // Purple
    { start: '#82ca9d', end: '#82ca9d40' }, // Green
    { start: '#ffc658', end: '#ffc65840' }, // Yellow
    { start: '#ff8042', end: '#ff804240' }, // Orange
    { start: '#0088fe', end: '#0088fe40' }, // Blue
    { start: '#00c49f', end: '#00c49f40' }, // Teal
    { start: '#ffbb28', end: '#ffbb2840' }, // Gold
    { start: '#ff6b6b', end: '#ff6b6b40' }, // Red
  ];

  // Get weekly growth and current week data with fallbacks
  const weeklyGrowth = (stats as any)?.weeklyAnalytics?.weeklyGrowth || 
                     (stats as any)?.weeklyGrowth || 
                     { revenueGrowth: 0, clickGrowth: 0, isPositive: false };

  const currentWeek = (stats as any)?.weeklyAnalytics?.currentWeek || 
                    (stats as any)?.currentWeek || 
                    { revenue: 0, clicks: 0, weekNumber: 'Current' };

  // Campaign status data from real campaigns
  const campaignStatusData = campaigns.reduce((acc, campaign) => {
    const status = campaign.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusChartData = Object.entries(campaignStatusData).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Top performing campaigns (real data)
  const topPerformingCampaigns = campaigns
    .filter(c => (c.impressions || 0) > 0)
    .sort((a, b) => (b.ctr || 0) - (a.ctr || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Debug Info - Remove in production */}
      {debugData && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="text-sm text-yellow-800">
              <strong>Debug Info:</strong> 
              Has Weekly Analytics: {debugData.hasWeeklyAnalytics ? 'Yes' : 'No'}, 
              Weekly Trends: {debugData.weeklyTrends?.length || 0}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CTR</p>
                <p className="text-2xl font-bold">
                  {safePercentage(averageCTR)}%
                </p>
                {weeklyGrowth && (
                  <div className={`flex items-center text-xs ${weeklyGrowth.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {weeklyGrowth.isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {Math.abs(weeklyGrowth.clickGrowth || 0)}% vs last week
                  </div>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
            <Progress 
              value={averageCTR} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. CPC</p>
                <p className="text-2xl font-bold">
                  {safeCurrency(averageCPC)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Cost Per Click</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Clicks</p>
                <p className="text-2xl font-bold">
                  {safeToLocaleString(stats?.todayClicks)}
                </p>
              </div>
              <MousePointer className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {safeToLocaleString(stats?.todayImpressions)} impressions today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Week</p>
                <p className="text-2xl font-bold">
                  {safeCurrency(currentWeek?.revenue)}
                </p>
                 {weeklyGrowth && (
                  <div className={`flex items-center text-xs ${weeklyGrowth.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {weeklyGrowth.isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {Math.abs(weeklyGrowth.revenueGrowth || 0)}% revenue growth
                  </div>
                )} 
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {currentWeek?.weekNumber || 'Current Week'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Smooth Area Chart with Gradient */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Weekly Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyRevenueData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No weekly revenue data yet</p>
                  <p className="text-sm">Data will appear after campaigns generate revenue</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weeklyRevenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                    width={60}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                    labelFormatter={(label) => `Week: ${label}`}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    strokeWidth={3}
                    dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, fill: '#8884d8', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Campaign Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Campaign Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Smooth Line Chart */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Growth Curve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                />
                <YAxis 
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                  width={60}
                />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                  labelFormatter={(label) => `Week: ${label}`}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8884d8" 
                  strokeWidth={3}
                  dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, fill: '#8884d8', stroke: '#fff', strokeWidth: 2 }}
                />
                <ReferenceLine 
                  y={weeklyRevenueData.reduce((sum, week) => sum + week.revenue, 0) / weeklyRevenueData.length} 
                  stroke="#ff7300" 
                  strokeDasharray="3 3" 
                  label={{ 
                    value: 'Average', 
                    position: 'right',
                    fill: '#ff7300',
                    fontSize: 12
                  }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Today's Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">{safeCurrency((stats as any)?.todayRevenue ?? stats?.totalRevenue)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clicks</p>
                <p className="text-2xl font-bold">{safeToLocaleString(stats?.todayClicks)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">This Week Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">{safeCurrency(currentWeek?.revenue)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clicks</p>
                <p className="text-2xl font-bold">{safeToLocaleString(currentWeek?.clicks)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Campaign Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Active</span>
                <Badge variant="default">{campaigns.filter(c => c.status === 'active').length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Pending</span>
                <Badge variant="outline">{campaigns.filter(c => c.status === 'pending').length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total</span>
                <Badge variant="secondary">{campaigns.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Performing Campaigns (by CTR)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topPerformingCampaigns.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No campaign data available yet
            </p>
          ) : (
            <div className="space-y-4">
              {topPerformingCampaigns.map((campaign, index) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{campaign.title}</p>
                      <p className="text-sm text-muted-foreground">{campaign.advertiser}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-medium">{safePercentage(campaign.ctr)}% CTR</p>
                      <p className="text-sm text-muted-foreground">
                        {safeToLocaleString(campaign.clicks)} clicks
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{safeCurrency(campaign.spent)}</p>
                      <p className="text-sm text-muted-foreground">spent</p>
                    </div>
                    <Badge variant={
                      campaign.status === 'active' ? 'default' : 
                      campaign.status === 'paused' ? 'outline' : 'secondary'
                    }>
                      {campaign.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="text-center">
              <Eye className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <h3 className="font-semibold mb-1">Total Impressions</h3>
              <p className="text-2xl font-bold">
                {safeToLocaleString(totalImpressions)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clicks</p>
                <p className="text-2xl font-bold">
                  {safeToLocaleString(totalClicks)}
                </p>
              </div>
              <MousePointer className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">All Time</p>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <h3 className="font-semibold mb-1">Total Revenue</h3>
              <p className="text-2xl font-bold">
                {safeCurrency(stats?.totalRevenue || totalRevenue)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdStatsOverview;