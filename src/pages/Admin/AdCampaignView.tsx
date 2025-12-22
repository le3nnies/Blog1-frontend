// src/pages/Admin/AdCampaignView.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AdCampaign } from "@/types/ads.types";
import { Layout } from "@/components/Layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Calendar, DollarSign, Eye, MousePointer, Users, Mail, Phone } from "lucide-react";
import { adsService } from "@/services/adsService";
import { useToast } from "@/hooks/use-toast";

const AdCampaignView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<AdCampaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCampaign();
    }
  }, [id]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const campaignData = await adsService.getAdCampaign(id!);
      setCampaign(campaignData);
    } catch (error: any) {
      console.error('Error fetching campaign:', error);
      toast({
        title: "Error loading campaign",
        description: error.message,
        variant: "destructive",
      });
      navigate("/admin/ads");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: AdCampaign['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      //case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!campaign) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Campaign Not Found</h1>
            <Button asChild>
              <Link to="/admin/ads">
                Back to Ads Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/ads")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Ads
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold">{campaign.title}</h1>
              <Badge className={getStatusColor(campaign.status)}>
                {campaign.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Campaign details and performance metrics
            </p>
          </div>
          <Button asChild>
            <Link to={`/admin/ads/${campaign.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Campaign
            </Link>
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Campaign Details */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Media Display */}
              {campaign.mediaUrl && (
                <div>
                  <h3 className="font-semibold mb-2">Media</h3>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    {campaign.mediaType === 'video' ? (
                      <video
                        src={campaign.mediaUrl}
                        controls
                        className="w-full max-h-64 object-contain rounded"
                        onError={(e) => {
                          console.error('Failed to load video:', campaign.mediaUrl);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <img
                        src={campaign.mediaUrl}
                        alt={campaign.title}
                        className="w-full max-h-64 object-contain rounded"
                        onError={(e) => {
                          console.error('Failed to load image:', campaign.mediaUrl);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p><strong>Type:</strong> {campaign.mediaType}</p>
                      <p><strong>URL:</strong> <a href={campaign.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{campaign.mediaUrl}</a></p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{campaign.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Ad Type</h3>
                  <Badge variant="outline" className="capitalize">
                    {campaign.type}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Created</h3>
                  <p className="text-muted-foreground">
                    {formatDate(campaign.createdAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold">${campaign.budget.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Budget</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold">${campaign.spent.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Spent</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Eye className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold">{campaign.impressions.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Impressions</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <MousePointer className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <p className="text-2xl font-bold">{campaign.ctr}%</p>
                  <p className="text-sm text-muted-foreground">CTR</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advertiser Information */}
          <Card>
            <CardHeader>
              <CardTitle>Advertiser Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Advertiser</h3>
                  <p className="text-muted-foreground">{campaign.advertiser}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {campaign.advertiserEmail}
                  </div>
                </div>
              </div>
              {campaign.advertiserPhone && (
                <div>
                  <h3 className="font-semibold mb-2">Phone</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {campaign.advertiserPhone}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-semibold">Start Date</p>
                    <p className="text-muted-foreground">{formatDate(campaign.startDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold">End Date</p>
                    <p className="text-muted-foreground">{formatDate(campaign.endDate)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdCampaignView;