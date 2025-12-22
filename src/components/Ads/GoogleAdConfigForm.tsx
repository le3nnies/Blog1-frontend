import { useState, useEffect } from "react";
import { GoogleAdConfig } from "@/types/ads.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { X, Plus, Settings, Eye, Code } from "lucide-react";
import { adsService } from "@/services/adsService";
import { useToast } from "@/hooks/use-toast";

interface GoogleAdConfigFormProps {
  config?: GoogleAdConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const GoogleAdConfigForm = ({ config, isOpen, onClose, onSave }: GoogleAdConfigFormProps) => {
  const { toast } = useToast();
  const isEditing = !!config;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    adUnit: "",
    adSlot: "",
    position: "header" as GoogleAdConfig['position'],
    displayOn: [] as GoogleAdConfig['displayOn'],
    size: "auto" as GoogleAdConfig['size'],
    format: "auto" as GoogleAdConfig['format'],
    responsive: true,
    maxWidth: "",
    customStyle: "",
    enabled: true,
  });

  const [newPage, setNewPage] = useState("");

  // Available pages for display
  const availablePages = [
    { value: "home", label: "Home Page" },
    { value: "article", label: "Article Pages" },
    { value: "category", label: "Category Pages" },
    { value: "about", label: "About Page" },
    { value: "contact", label: "Contact Page" },
    { value: "search", label: "Search Results" },
    { value: "author", label: "Author Pages" },
  ];

  // Ad size options
  const adSizes = [
    { value: "auto", label: "Auto (Responsive)" },
    { value: "rectangle", label: "Rectangle (300x250)" },
    { value: "vertical", label: "Vertical (300x600)" },
    { value: "banner", label: "Banner (728x90)" },
    { value: "leaderboard", label: "Leaderboard (728x90)" },
    { value: "mobile_banner", label: "Mobile Banner (320x50)" },
    { value: "skyscraper", label: "Skyscraper (120x600)" },
    { value: "square", label: "Square (250x250)" },
  ];

  // Ad format options
  const adFormats = [
    { value: "auto", label: "Auto" },
    { value: "rectangle", label: "Rectangle" },
    { value: "vertical", label: "Vertical" },
    { value: "horizontal", label: "Horizontal" },
  ];

  // Position options
  const positions = [
    { value: "header", label: "Header", description: "Top of page, below navigation" },
    { value: "sidebar", label: "Sidebar", description: "Right sidebar, between content" },
    { value: "footer", label: "Footer", description: "Bottom of page, above footer" },
    { value: "inline", label: "Inline Content", description: "Between article content" },
    { value: "between_posts", label: "Between Posts", description: "Between blog post listings" },
  ];

  // Initialize form data when config changes
  useEffect(() => {
    if (config) {
      setFormData({
        adUnit: config.adUnit,
        adSlot: config.adSlot,
        position: config.position,
        displayOn: config.displayOn || [],
        size: config.size || "auto",
        format: config.format || "auto",
        responsive: config.responsive !== false,
        maxWidth: config.maxWidth || "",
        customStyle: config.customStyle || "",
        enabled: config.enabled !== false,
      });
    } else {
      // Reset form for new config
      setFormData({
        adUnit: "",
        adSlot: "",
        position: "header",
        displayOn: [],
        size: "auto",
        format: "auto",
        responsive: true,
        maxWidth: "",
        customStyle: "",
        enabled: true,
      });
    }
  }, [config, isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addPage = () => {
    if (newPage && !formData.displayOn.includes(newPage)) {
      setFormData(prev => ({
        ...prev,
        displayOn: [...prev.displayOn, newPage]
      }));
      setNewPage("");
    }
  };

  const removePage = (page: string) => {
    setFormData(prev => ({
      ...prev,
      displayOn: prev.displayOn.filter(p => p !== page)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.adUnit.trim()) {
      toast({
        title: "Validation Error",
        description: "Ad unit name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.adSlot.trim()) {
      toast({
        title: "Validation Error",
        description: "Ad slot ID is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.displayOn.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one page to display the ad on",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const configData = {
        ...formData,
        maxWidth: formData.maxWidth || undefined,
        customStyle: formData.customStyle || undefined,
      };

      if (isEditing && config) {
        await adsService.updateGoogleAdConfig({
          ...config,
          ...configData,
        });
        toast({
          title: "Ad configuration updated",
          description: `${formData.adUnit} has been updated successfully`,
        });
      } else {
        await adsService.createGoogleAdConfig(configData);
        toast({
          title: "Ad configuration created",
          description: `${formData.adUnit} has been created successfully`,
        });
      }

      onSave();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error saving configuration",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPageLabel = (value: string) => {
    return availablePages.find(p => p.value === value)?.label || value;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {isEditing ? "Edit Ad Configuration" : "Create New Ad Configuration"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adUnit">Ad Unit Name *</Label>
                  <Input
                    id="adUnit"
                    placeholder="e.g., Header Banner, Sidebar Ad"
                    value={formData.adUnit}
                    onChange={(e) => handleChange("adUnit", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adSlot">Ad Slot ID *</Label>
                  <Input
                    id="adSlot"
                    placeholder="e.g., 1234567890"
                    value={formData.adSlot}
                    onChange={(e) => handleChange("adSlot", e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Google AdSense ad slot ID
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  checked={formData.enabled}
                  onCheckedChange={(enabled) => handleChange("enabled", enabled)}
                />
                <Label htmlFor="enabled">Enable this ad unit</Label>
              </div>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Display Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Position *</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value: GoogleAdConfig['position']) => handleChange("position", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((pos) => (
                      <SelectItem key={pos.value} value={pos.value}>
                        <div>
                          <div className="font-medium">{pos.label}</div>
                          <div className="text-xs text-muted-foreground">{pos.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Display On Pages *</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.displayOn.map((page) => (
                    <Badge
                      key={page}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {getPageLabel(page)}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => removePage(page)}
                      />
                    </Badge>
                  ))}
                  {formData.displayOn.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No pages selected</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Select
                    value={newPage}
                    onValueChange={setNewPage}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select page to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePages
                        .filter(page => !formData.displayOn.includes(page.value))
                        .map((page) => (
                          <SelectItem key={page.value} value={page.value}>
                            {page.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addPage}
                    disabled={!newPage}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ad Format & Size */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ad Format & Size</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ad Size</Label>
                  <Select
                    value={formData.size}
                    onValueChange={(value: GoogleAdConfig['size']) => handleChange("size", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {adSizes.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ad Format</Label>
                  <Select
                    value={formData.format}
                    onValueChange={(value: GoogleAdConfig['format']) => handleChange("format", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {adFormats.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="responsive"
                  checked={formData.responsive}
                  onCheckedChange={(responsive) => handleChange("responsive", responsive)}
                />
                <Label htmlFor="responsive">Responsive design</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxWidth">Maximum Width (optional)</Label>
                <Input
                  id="maxWidth"
                  placeholder="e.g., 728px, 100%"
                  value={formData.maxWidth}
                  onChange={(e) => handleChange("maxWidth", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty for auto-sizing
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Custom Styling */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Custom Styling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customStyle">Custom CSS (optional)</Label>
                <Textarea
                  id="customStyle"
                  placeholder="/* Custom styles for this ad unit */"
                  value={formData.customStyle}
                  onChange={(e) => handleChange("customStyle", e.target.value)}
                  rows={4}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Additional CSS styles to apply to this ad unit
                </p>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : (isEditing ? "Update Configuration" : "Create Configuration")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GoogleAdConfigForm;
