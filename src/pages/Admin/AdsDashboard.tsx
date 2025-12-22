// src/pages/Admin/AdsDashboard.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Calendar,
  Plus,
  Settings,
  Users
} from "lucide-react";
import { AdCampaign, AdStats, GoogleAdConfig } from "@/types/ads.types";
import { adsService } from "@/services/adsService";
import { useToast } from "@/hooks/use-toast";
import AdCampaignsList from "@/components/Ads/AdCampaignsList";
import GoogleAdsManager from "@/components/Ads/GoogleAdsManager";
import AdStatsOverview from "@/components/Ads/AdStatOverview";
import AdAnalytics from "@/components/Ads/AdsAnalytics";

const AdsDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<AdStats | null>(null);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [googleConfigs, setGoogleConfigs] = useState<GoogleAdConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
  try {
    setLoading(true);
    const [statsResponse, campaignsResponse, googleConfigsResponse] = await Promise.all([
      adsService.getAdStats(),
      adsService.getAdCampaigns(),
      adsService.getGoogleAdConfigs()
    ]);

    const campaignsData = Array.isArray(campaignsResponse)
      ? campaignsResponse as AdCampaign[]
      : ((campaignsResponse as any)?.data ?? []) as AdCampaign[];

    // Ensure campaignsData is an array before calling reduce
    const todayClicks = Array.isArray(campaignsData)
      ? campaignsData.reduce((sum, campaign) => sum + campaign.clicks, 0)
      : 0;
    
    // Update stats with calculated todayClicks
    const statsData = (statsResponse as any)?.data ?? (statsResponse as AdStats);
    const updatedStats = {
      ...statsData,
      todayClicks: todayClicks
    };

    setStats(updatedStats);
    setCampaigns(campaignsData);
    setGoogleConfigs(Array.isArray(googleConfigsResponse) ? googleConfigsResponse as GoogleAdConfig[] : ((googleConfigsResponse as any)?.data ?? []) as GoogleAdConfig[]);
  } catch (error: any) {
    console.error('Error fetching ads data:', error);
    toast({
      title: "Error loading ads data",
      description: error.message,
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

  // FIX: Ensure campaigns is always an array before using filter
  const pendingApprovals = Array.isArray(campaigns) 
    ? campaigns.filter(c => c.status === 'pending').length 
    : 0;
  
  const activeCampaigns = Array.isArray(campaigns) 
    ? campaigns.filter(c => c.status === 'active').length 
    : 0;

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Ads Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage advertising campaigns and Google Ads integration
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button asChild>
              <Link to="/admin/ads/new-campaign">
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/ads/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    ${stats?.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                  <p className="text-2xl font-bold">{activeCampaigns}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                  <p className="text-2xl font-bold">{pendingApprovals}</p>
                </div>
                <Users className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Clicks</p>
                  <p className="text-2xl font-bold">{stats?.todayClicks || 0}</p>
                </div>
                <MousePointer className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">
              Campaigns
              {pendingApprovals > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingApprovals}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="google-ads">Google Ads</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AdStatsOverview 
              stats={stats} 
              campaigns={Array.isArray(campaigns) ? campaigns : []} 
            />
          </TabsContent>

          <TabsContent value="campaigns">
            <AdCampaignsList 
              campaigns={Array.isArray(campaigns) ? campaigns : []} 
              onCampaignUpdate={fetchData}
            />
          </TabsContent>

          <TabsContent value="google-ads">
            <GoogleAdsManager 
              configs={Array.isArray(googleConfigs) ? googleConfigs : []} 
              onConfigUpdate={fetchData}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AdAnalytics 
              stats={stats} 
              campaigns={Array.isArray(campaigns) ? campaigns : []} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdsDashboard;