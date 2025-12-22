import { useState } from "react";
import { GoogleAdConfig } from "@/types/ads.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Template, Plus, Eye, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdTemplatesProps {
  onSelectTemplate: (template: Partial<GoogleAdConfig>) => void;
}

interface AdTemplate {
  id: string;
  name: string;
  description: string;
  category: 'banner' | 'sidebar' | 'content' | 'mobile';
  position: GoogleAdConfig['position'];
  size: GoogleAdConfig['size'];
  displayOn: GoogleAdConfig['displayOn'];
  responsive: boolean;
  preview: {
    width: number;
    height: number;
    color: string;
  };
  recommended: boolean;
}

const AdTemplates = ({ onSelectTemplate }: AdTemplatesProps) => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<AdTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Pre-defined ad templates
  const templates: AdTemplate[] = [
    // Banner Templates
    {
      id: "header-banner",
      name: "Header Banner",
      description: "Large banner ad displayed at the top of the page, below the navigation",
      category: "banner",
      position: "header",
      size: "banner",
      displayOn: ["home", "article", "category"],
      responsive: true,
      preview: { width: 728, height: 90, color: "bg-blue-500" },
      recommended: true,
    },
    {
      id: "leaderboard",
      name: "Leaderboard",
      description: "Wide banner ad perfect for header or footer placement",
      category: "banner",
      position: "header",
      size: "leaderboard",
      displayOn: ["home", "article"],
      responsive: true,
      preview: { width: 728, height: 90, color: "bg-green-500" },
      recommended: true,
    },
    {
      id: "mobile-banner",
      name: "Mobile Banner",
      description: "Optimized banner for mobile devices",
      category: "mobile",
      position: "header",
      size: "mobile_banner",
      displayOn: ["home", "article", "category"],
      responsive: true,
      preview: { width: 320, height: 50, color: "bg-purple-500" },
      recommended: true,
    },

    // Sidebar Templates
    {
      id: "sidebar-rectangle",
      name: "Sidebar Rectangle",
      description: "Standard rectangle ad for sidebar placement",
      category: "sidebar",
      position: "sidebar",
      size: "rectangle",
      displayOn: ["article", "category"],
      responsive: true,
      preview: { width: 300, height: 250, color: "bg-orange-500" },
      recommended: true,
    },
    {
      id: "sidebar-vertical",
      name: "Sidebar Vertical",
      description: "Tall vertical ad for sidebar, maximizes revenue potential",
      category: "sidebar",
      position: "sidebar",
      size: "vertical",
      displayOn: ["article"],
      responsive: true,
      preview: { width: 300, height: 600, color: "bg-red-500" },
      recommended: true,
    },
    {
      id: "sidebar-skyscraper",
      name: "Sidebar Skyscraper",
      description: "Narrow but tall ad for sidebar placement",
      category: "sidebar",
      position: "sidebar",
      size: "skyscraper",
      displayOn: ["article", "category"],
      responsive: false,
      preview: { width: 120, height: 600, color: "bg-indigo-500" },
      recommended: false,
    },

    // Content Templates
    {
      id: "inline-rectangle",
      name: "Inline Rectangle",
      description: "Rectangle ad placed between article content",
      category: "content",
      position: "inline",
      size: "rectangle",
      displayOn: ["article"],
      responsive: true,
      preview: { width: 300, height: 250, color: "bg-yellow-500" },
      recommended: true,
    },
    {
      id: "between-posts",
      name: "Between Posts",
      description: "Banner ad displayed between blog post listings",
      category: "content",
      position: "between_posts",
      size: "banner",
      displayOn: ["home", "category"],
      responsive: true,
      preview: { width: 728, height: 90, color: "bg-pink-500" },
      recommended: true,
    },

    // Footer Templates
    {
      id: "footer-banner",
      name: "Footer Banner",
      description: "Banner ad placed above the footer",
      category: "banner",
      position: "footer",
      size: "banner",
      displayOn: ["home", "article", "category"],
      responsive: true,
      preview: { width: 728, height: 90, color: "bg-gray-500" },
      recommended: false,
    },
  ];

  const categories = [
    { id: "all", label: "All Templates", count: templates.length },
    { id: "banner", label: "Banner Ads", count: templates.filter(t => t.category === "banner").length },
    { id: "sidebar", label: "Sidebar Ads", count: templates.filter(t => t.category === "sidebar").length },
    { id: "content", label: "Content Ads", count: templates.filter(t => t.category === "content").length },
    { id: "mobile", label: "Mobile Ads", count: templates.filter(t => t.category === "mobile").length },
  ];

  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredTemplates = selectedCategory === "all"
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  const handleSelectTemplate = (template: AdTemplate) => {
    const configData: Partial<GoogleAdConfig> = {
      adUnit: template.name,
      position: template.position,
      size: template.size,
      format: template.size === "auto" ? "auto" : template.category === "banner" ? "horizontal" : "rectangle",
      displayOn: template.displayOn,
      responsive: template.responsive,
      enabled: true,
    };

    onSelectTemplate(configData);
    toast({
      title: "Template selected",
      description: `${template.name} template has been applied. Configure your ad slot ID to complete setup.`,
    });
  };

  const handlePreviewTemplate = (template: AdTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "banner": return "bg-blue-100 text-blue-800";
      case "sidebar": return "bg-green-100 text-green-800";
      case "content": return "bg-yellow-100 text-yellow-800";
      case "mobile": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Template className="h-5 w-5" />
            Ad Templates
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose from pre-configured ad templates to quickly set up your Google AdSense ads
          </p>
        </CardHeader>
        <CardContent>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                {category.label}
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="relative hover:shadow-md transition-shadow">
                {template.recommended && (
                  <Badge className="absolute -top-2 -right-2 z-10 bg-green-500">
                    Recommended
                  </Badge>
                )}

                <CardContent className="p-4">
                  {/* Preview */}
                  <div className="mb-4 flex justify-center">
                    <div
                      className={`border-2 border-gray-200 rounded flex items-center justify-center text-white text-xs font-medium ${template.preview.color}`}
                      style={{
                        width: Math.min(template.preview.width, 200),
                        height: Math.min(template.preview.height, 120),
                        aspectRatio: template.preview.width / template.preview.height,
                      }}
                    >
                      {template.preview.width}×{template.preview.height}
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-sm">{template.name}</h3>
                      <Badge variant="outline" className={`text-xs ${getCategoryColor(template.category)}`}>
                        {template.category}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Settings className="h-3 w-3" />
                      Position: {template.position.replace('_', ' ')}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      Pages: {template.displayOn.join(', ')}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewTemplate(template)}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSelectTemplate(template)}
                      className="flex-1"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Template className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No templates found for the selected category.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Template Preview: {selectedTemplate?.name}</DialogTitle>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Configuration</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Position:</strong> {selectedTemplate.position.replace('_', ' ')}</p>
                    <p><strong>Size:</strong> {selectedTemplate.size}</p>
                    <p><strong>Responsive:</strong> {selectedTemplate.responsive ? 'Yes' : 'No'}</p>
                    <p><strong>Pages:</strong> {selectedTemplate.displayOn.join(', ')}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Ad Preview</h4>
                  <div className="flex justify-center">
                    <div
                      className={`border-2 border-gray-200 rounded flex items-center justify-center text-white text-sm font-medium ${selectedTemplate.preview.color}`}
                      style={{
                        width: selectedTemplate.preview.width,
                        height: selectedTemplate.preview.height,
                        maxWidth: '100%',
                        maxHeight: '150px',
                      }}
                    >
                      Ad Space
                      <div className="absolute text-xs opacity-75">
                        {selectedTemplate.preview.width}×{selectedTemplate.preview.height}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
            {selectedTemplate && (
              <Button onClick={() => {
                handleSelectTemplate(selectedTemplate);
                setShowPreview(false);
              }}>
                Use This Template
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdTemplates;
