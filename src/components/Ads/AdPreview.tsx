import { useState } from "react";
import { GoogleAdConfig } from "@/types/ads.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Smartphone, Tablet, Eye, RotateCcw } from "lucide-react";

interface AdPreviewProps {
  config: GoogleAdConfig;
}

const AdPreview = ({ config }: AdPreviewProps) => {
  const [previewSize, setPreviewSize] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showAd, setShowAd] = useState(true);

  // Mock ad content based on size
  const getAdContent = () => {
    const size = config.size || "auto";
    const format = config.format || "auto";

    switch (size) {
      case "rectangle":
        return {
          width: 300,
          height: 250,
          content: "Rectangle Ad (300x250)",
          className: "bg-blue-100 border-2 border-blue-300"
        };
      case "vertical":
        return {
          width: 300,
          height: 600,
          content: "Vertical Ad (300x600)",
          className: "bg-green-100 border-2 border-green-300"
        };
      case "banner":
        return {
          width: 728,
          height: 90,
          content: "Banner Ad (728x90)",
          className: "bg-yellow-100 border-2 border-yellow-300"
        };
      case "leaderboard":
        return {
          width: 728,
          height: 90,
          content: "Leaderboard Ad (728x90)",
          className: "bg-purple-100 border-2 border-purple-300"
        };
      case "mobile_banner":
        return {
          width: 320,
          height: 50,
          content: "Mobile Banner (320x50)",
          className: "bg-pink-100 border-2 border-pink-300"
        };
      case "skyscraper":
        return {
          width: 120,
          height: 600,
          content: "Skyscraper (120x600)",
          className: "bg-indigo-100 border-2 border-indigo-300"
        };
      case "square":
        return {
          width: 250,
          height: 250,
          content: "Square Ad (250x250)",
          className: "bg-red-100 border-2 border-red-300"
        };
      default:
        // Auto responsive
        if (previewSize === "mobile") {
          return {
            width: 320,
            height: 50,
            content: "Responsive Ad (Mobile)",
            className: "bg-gray-100 border-2 border-gray-300"
          };
        } else if (previewSize === "tablet") {
          return {
            width: 468,
            height: 60,
            content: "Responsive Ad (Tablet)",
            className: "bg-gray-100 border-2 border-gray-300"
          };
        } else {
          return {
            width: 728,
            height: 90,
            content: "Responsive Ad (Desktop)",
            className: "bg-gray-100 border-2 border-gray-300"
          };
        }
    }
  };

  const adContent = getAdContent();

  // Get container styles based on position
  const getPositionStyles = () => {
    switch (config.position) {
      case "header":
        return "w-full bg-gray-50 p-4 border-b";
      case "sidebar":
        return "w-80 bg-gray-50 p-4 border-l";
      case "footer":
        return "w-full bg-gray-50 p-4 border-t";
      case "inline":
        return "w-full bg-gray-50 p-4 my-4";
      case "between_posts":
        return "w-full bg-gray-50 p-4 my-8";
      default:
        return "w-full bg-gray-50 p-4";
    }
  };

  // Get preview container width based on screen size
  const getPreviewWidth = () => {
    switch (previewSize) {
      case "mobile":
        return "max-w-sm";
      case "tablet":
        return "max-w-2xl";
      case "desktop":
        return "max-w-6xl";
      default:
        return "max-w-6xl";
    }
  };

  const renderAdPreview = () => {
    if (!showAd) {
      return (
        <div className={`${getPositionStyles()} flex items-center justify-center min-h-[100px] text-muted-foreground`}>
          <div className="text-center">
            <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Ad hidden in preview</p>
          </div>
        </div>
      );
    }

    const adElement = (
      <div
        className={`flex items-center justify-center text-sm font-medium text-gray-700 ${adContent.className}`}
        style={{
          width: adContent.width,
          height: adContent.height,
          maxWidth: config.maxWidth || '100%',
        }}
      >
        {adContent.content}
        <div className="absolute top-1 right-1 text-xs text-gray-500 bg-white px-1 rounded">
          Ad
        </div>
      </div>
    );

    return (
      <div className={getPositionStyles()}>
        <div className="flex justify-center">
          {adElement}
        </div>
      </div>
    );
  };

  const renderPagePreview = () => {
    const isSidebar = config.position === "sidebar";

    return (
      <div className={`bg-white border rounded-lg overflow-hidden ${getPreviewWidth()} mx-auto`}>
        {/* Mock page header */}
        <div className="bg-gray-800 text-white p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold">Your Website</h1>
            <nav className="hidden md:flex space-x-4">
              <a href="#" className="hover:text-gray-300">Home</a>
              <a href="#" className="hover:text-gray-300">Articles</a>
              <a href="#" className="hover:text-gray-300">About</a>
            </nav>
          </div>
        </div>

        {/* Header position ad */}
        {config.position === "header" && renderAdPreview()}

        <div className={`flex ${isSidebar ? 'gap-6' : ''}`}>
          {/* Main content */}
          <div className={`flex-1 p-6 ${isSidebar ? 'max-w-4xl' : ''}`}>
            {/* Inline position ad */}
            {config.position === "inline" && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-4">Sample Article Title</h2>
                  <p className="text-gray-600 mb-4">
                    This is a sample article content. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                </div>
                {renderAdPreview()}
                <div className="mt-6">
                  <p className="text-gray-600">
                    More article content continues here. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                </div>
              </>
            )}

            {/* Between posts position ad */}
            {config.position === "between_posts" && (
              <>
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-2">Post 1</h3>
                  <p className="text-gray-600">Sample post content...</p>
                </div>
                {renderAdPreview()}
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-2">Post 2</h3>
                  <p className="text-gray-600">More post content...</p>
                </div>
              </>
            )}

            {/* Default content for other positions */}
            {config.position !== "inline" && config.position !== "between_posts" && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Page Content</h2>
                <p className="text-gray-600 mb-4">
                  This is sample page content. The ad position is set to {config.position}.
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
                  ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p className="text-gray-600">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          {isSidebar && (
            <div className="w-80 p-6 border-l bg-gray-50">
              <h3 className="font-semibold mb-4">Sidebar</h3>
              {renderAdPreview()}
              <div className="mt-6 space-y-4">
                <div className="bg-white p-4 rounded">
                  <h4 className="font-medium mb-2">Recent Posts</h4>
                  <ul className="space-y-2 text-sm">
                    <li><a href="#" className="text-blue-600 hover:underline">Post 1</a></li>
                    <li><a href="#" className="text-blue-600 hover:underline">Post 2</a></li>
                    <li><a href="#" className="text-blue-600 hover:underline">Post 3</a></li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer position ad */}
        {config.position === "footer" && renderAdPreview()}

        {/* Mock page footer */}
        <div className="bg-gray-100 p-4 border-t">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Your Website. All rights reserved.</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Ad Preview: {config.adUnit}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAd(!showAd)}
            >
              {showAd ? "Hide Ad" : "Show Ad"}
            </Button>
            <Select value={previewSize} onValueChange={(value: any) => setPreviewSize(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desktop">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Desktop
                  </div>
                </SelectItem>
                <SelectItem value="tablet">
                  <div className="flex items-center gap-2">
                    <Tablet className="h-4 w-4" />
                    Tablet
                  </div>
                </SelectItem>
                <SelectItem value="mobile">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Mobile
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Page Preview</TabsTrigger>
            <TabsTrigger value="details">Ad Details</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              {renderPagePreview()}
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Ad Unit</Label>
                  <p className="font-medium">{config.adUnit}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Position</Label>
                  <p className="capitalize">{config.position.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Size</Label>
                  <p>{config.size || 'Auto'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Format</Label>
                  <p>{config.format || 'Auto'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Responsive</Label>
                  <Badge variant={config.responsive ? "default" : "outline"}>
                    {config.responsive ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge variant={config.enabled ? "default" : "outline"}>
                    {config.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>

              {config.displayOn && config.displayOn.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Display Pages</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {config.displayOn.map((page) => (
                      <Badge key={page} variant="secondary" className="text-xs">
                        {page}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {config.customStyle && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Custom Styles</Label>
                  <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                    {config.customStyle}
                  </pre>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdPreview;
