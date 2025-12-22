// src/components/Ads/GoogleAdsManager.tsx
import { useState } from "react";
import { GoogleAdConfig } from "@/types/ads.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Eye, Code, ToggleLeft, Plus, LayoutTemplate } from "lucide-react";
import { adsService } from "@/services/adsService";
import { useToast } from "@/hooks/use-toast";
import GoogleAdConfigForm from "./GoogleAdConfigForm";
import AdPreview from "./AdPreview";
import AdCodeGenerator from "./AdCodeGenerator";
import AdTemplates from "./AdTemplates";
import AdsSettingsManager from "./AdsSettingsManager";

interface GoogleAdsManagerProps {
  configs: GoogleAdConfig[];
  onConfigUpdate: () => void;
}

const GoogleAdsManager = ({ configs, onConfigUpdate }: GoogleAdsManagerProps) => {
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleToggle = async (config: GoogleAdConfig, enabled: boolean) => {
    try {
      setUpdatingId(config.id);
      await adsService.updateGoogleAdConfig({
        ...config,
        enabled
      });
      toast({
        title: enabled ? "Ad enabled" : "Ad disabled",
        description: `${config.adUnit} has been ${enabled ? 'enabled' : 'disabled'}`,
      });
      onConfigUpdate();
    } catch (error: any) {
      toast({
        title: "Error updating ad",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePositionChange = async (config: GoogleAdConfig, position: GoogleAdConfig['position']) => {
    try {
      setUpdatingId(config.id);
      await adsService.updateGoogleAdConfig({
        ...config,
        position
      });
      toast({
        title: "Position updated",
        description: `${config.adUnit} position changed to ${position}`,
      });
      onConfigUpdate();
    } catch (error: any) {
      toast({
        title: "Error updating position",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const getPositionDescription = (position: GoogleAdConfig['position']) => {
    const descriptions = {
      header: "Top of page, below navigation",
      sidebar: "Right sidebar, between content",
      footer: "Bottom of page, above footer",
      inline: "Between article content",
      between_posts: "Between blog post listings"
    };
    return descriptions[position];
  };

  const getDisplayOnText = (displayOn: string[]) => {
    return displayOn.map(page => {
      const names = {
        home: "Home",
        article: "Articles",
        category: "Categories",
        about: "About",
        contact: "Contact"
      };
      return names[page as keyof typeof names] || page;
    }).join(", ");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Google Ads Manager</h2>
          <p className="text-muted-foreground">
            Manage Google AdSense integration and ad placements
          </p>
        </div>
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              AdSense Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>AdSense Settings</DialogTitle>
            </DialogHeader>
            <AdsSettingsManager />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {configs.map((config) => (
          <Card key={config.id} className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">{config.adUnit}</h3>
                  <Badge variant={config.enabled ? "default" : "outline"}>
                    {config.enabled ? "Active" : "Disabled"}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Ad Slot</Label>
                    <p className="font-mono text-sm">{config.adSlot}</p>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground">Display On</Label>
                    <p>{getDisplayOnText(config.displayOn)}</p>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground">Position</Label>
                    <p className="capitalize">{config.position.replace('_', ' ')}</p>
                    <p className="text-xs text-muted-foreground">
                      {getPositionDescription(config.position)}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground">Max Width</Label>
                    <p>{config.maxWidth || "Auto"}</p>
                  </div>
                </div>

                {config.customStyle && (
                  <div>
                    <Label className="text-muted-foreground">Custom Styles</Label>
                    <pre className="font-mono text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                      {config.customStyle}
                    </pre>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 min-w-[200px]">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor={`toggle-${config.id}`} className="flex items-center gap-2">
                    <ToggleLeft className="h-4 w-4" />
                    {config.enabled ? "Enabled" : "Disabled"}
                  </Label>
                  <Switch
                    id={`toggle-${config.id}`}
                    checked={config.enabled}
                    onCheckedChange={(enabled) => handleToggle(config, enabled)}
                    disabled={updatingId === config.id}
                  />
                </div>

                <Select
                  value={config.position}
                  onValueChange={(value: GoogleAdConfig['position']) => 
                    handlePositionChange(config, value)
                  }
                  disabled={updatingId === config.id}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="header">Header</SelectItem>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                    <SelectItem value="footer">Footer</SelectItem>
                    <SelectItem value="inline">Inline Content</SelectItem>
                    <SelectItem value="between_posts">Between Posts</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Ad Preview: {config.adUnit}</DialogTitle>
                      </DialogHeader>
                      <AdPreview config={config} />
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Code className="h-4 w-4 mr-1" />
                        Code
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Ad Code Generator: {config.adUnit}</DialogTitle>
                      </DialogHeader>
                      <AdCodeGenerator config={config} />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add New Ad Unit Card */}
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Add New Ad Unit</h3>
          <p className="text-muted-foreground mb-4">
            Configure a new Google AdSense ad unit for your site
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configure New Ad Unit
          </Button>
        </CardContent>
      </Card>

      {/* Configuration Form */}
      <GoogleAdConfigForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={onConfigUpdate}
      />
    </div>
  );
};

export default GoogleAdsManager;