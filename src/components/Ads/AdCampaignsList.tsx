// src/components/Ads/AdCampaignsList.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { AdCampaign } from "@/types/ads.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Eye, Edit, MoreVertical, Calendar, DollarSign, Users, MousePointer, Trash2 } from "lucide-react";
import { adsService } from "@/services/adsService";
import { useToast } from "@/hooks/use-toast";

interface AdCampaignsListProps {
  campaigns: AdCampaign[];
  onCampaignUpdate: () => void;
}

const AdCampaignsList: React.FC<AdCampaignsListProps> = ({ campaigns = [], onCampaignUpdate }) => {
  const { toast } = useToast();
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<string | null>(null);

  const handleStatusUpdate = async (campaignId: string, newStatus: AdCampaign['status']) => {
    try {
      // FIX: Check if campaignId is valid
      if (!campaignId || campaignId === 'undefined') {
        console.error('Invalid campaign ID:', campaignId);
        toast({
          title: "Error",
          description: "Invalid campaign ID",
          variant: "destructive",
        });
        return;
      }

      setUpdatingStatus(campaignId);
      await adsService.updateCampaignStatus(campaignId, newStatus);

      toast({
        title: "Status updated",
        description: `Campaign status changed to ${newStatus}`,
      });

      onCampaignUpdate();
    } catch (error: any) {
      console.error('Error updating campaign status:', error);
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      if (!campaignId || campaignId === 'undefined') {
        console.error('Invalid campaign ID:', campaignId);
        toast({
          title: "Error",
          description: "Invalid campaign ID",
          variant: "destructive",
        });
        return;
      }

      setDeletingCampaign(campaignId);
      await adsService.deleteAdCampaign(campaignId);

      toast({
        title: "Campaign deleted",
        description: "The campaign has been successfully deleted",
      });

      onCampaignUpdate();
    } catch (error: any) {
      console.error('Error deleting campaign:', error);
      toast({
        title: "Error deleting campaign",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingCampaign(null);
    }
  };

  const getStatusColor = (status: AdCampaign['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paused': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      //case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];

  if (safeCampaigns.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground mb-4">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">No campaigns found</h3>
            <p className="mt-1">Create your first campaign to get started</p>
          </div>
          <Button asChild>
            <Link to="/admin/ads/new-campaign">
              Create Campaign
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Campaigns ({safeCampaigns.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {safeCampaigns.map((campaign) => (
            // FIX: Add unique key prop
            <div 
              key={campaign.id} 
              className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 mb-4 md:mb-0">
                <div className="flex items-start gap-3 mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{campaign.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {campaign.description}
                    </p>
                  </div>
                  <Badge variant="outline" className={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span>Budget: ${campaign.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <span>Spent: ${campaign.spent.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-purple-600" />
                    <span>Impressions: {campaign.impressions.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MousePointer className="h-4 w-4 text-orange-600" />
                    <span>CTR: {campaign.ctr}%</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                  <div>Advertiser: {campaign.advertiser}</div>
                  <div>Type: {campaign.type}</div>
                  <div>Start: {formatDate(campaign.startDate)}</div>
                  <div>End: {formatDate(campaign.endDate)}</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Select
                  value={campaign.status}
                  onValueChange={(value: AdCampaign['status']) => 
                    handleStatusUpdate(campaign.id, value)
                  }
                  disabled={updatingStatus === campaign.id}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-1">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/ads/${campaign.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/ads/${campaign.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={deletingCampaign === campaign.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{campaign.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdCampaignsList;