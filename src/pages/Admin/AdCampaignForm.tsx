// src/pages/Admin/AdCampaignForm.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdCampaign } from "@/types/ads.types";
import { Layout } from "@/components/Layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Plus, X, Upload, Video, Image } from "lucide-react";
import { adsService } from "@/services/adsService";
import { useToast } from "@/hooks/use-toast";

const AdCampaignForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [campaign, setCampaign] = useState<AdCampaign | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    advertiser: "",
    advertiserEmail: "",
    advertiserPhone: "",
    type: "banner" as AdCampaign['type'],
    status: "pending" as AdCampaign['status'],
    budget: 0,
    spent: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    targetCategories: [] as string[],
    targetPositions: [] as string[],
    impressions: 0,
    clicks: 0,
    ctr: 0,
    clickUrl: "",
    mediaUrl: "",
    mediaType: "image" as "image" | "video",
  });

  // 🔥 FIX: Create a ref to mirror formData to avoid stale closures
  const formDataRef = useRef(formData);

  // 🔥 FIX: Sync the ref with state on every render
  formDataRef.current = formData;

  const [newCategory, setNewCategory] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const availableCategories = ["Tax Fundamentals & Billing", "Deductions & Credits", "Investment and Retirement Taxes", "IRS Interactions & Tax Law"];
  const availablePositions = ["header", "sidebar", "footer", "inline", "between_posts"];

  // Supported file types
  const supportedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  const supportedVideoTypes = ["video/mp4", "video/webm", "video/ogg"];
  const maxFileSize = 50 * 1024 * 1024; // 50MB

  // Add a ref to track if we've already fetched
  const hasFetched = useRef(false);

  // 🔥 FIX: Add debug effect to track when arrays get wiped
  useEffect(() => {
    if (formData.targetCategories.length > 0) {
      console.log('✅ Categories currently exist:', formData.targetCategories);
    } else {
      console.log('⚠️ Categories are EMPTY. Did they just get wiped?');
    }
  }, [formData.targetCategories]);

  useEffect(() => {
    if (formData.targetPositions.length > 0) {
      console.log('✅ Positions currently exist:', formData.targetPositions);
    } else {
      console.log('⚠️ Positions are EMPTY. Did they just get wiped?');
    }
  }, [formData.targetPositions]);

  // Debug formData changes
  useEffect(() => {
    console.log('📊 FORM DATA UPDATED - Categories:', formData.targetCategories);
    console.log('📊 FORM DATA UPDATED - Positions:', formData.targetPositions);
  }, [formData.targetCategories, formData.targetPositions]);

  // 🔥 FIX: Memoize fetchCampaign to avoid stale closures
  const fetchCampaign = useCallback(async () => {
    // Prevent multiple fetches
    if (hasFetched.current) {
      console.log('⏩ Already fetched campaign, skipping...');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 FETCHING CAMPAIGN - Current formData before fetch:', formDataRef.current);
      
      const fetchedCampaign = await adsService.getAdCampaign(id!);
      console.log('📥 FETCHED CAMPAIGN FROM API:', {
        categories: fetchedCampaign.targetCategories,
        positions: fetchedCampaign.targetPositions
      });
      
      setCampaign(fetchedCampaign);
      
      // Use functional update to ensure we don't overwrite existing state
      setFormData(prev => {
        // Only update if we're in initial state (no user input yet)
        const hasUserInput = prev.title !== "" || prev.advertiser !== "" || prev.targetCategories.length > 0;
        
        if (!hasUserInput) {
          console.log('📝 Setting initial form data from fetched campaign');
          return {
            title: fetchedCampaign.title,
            description: fetchedCampaign.description,
            advertiser: fetchedCampaign.advertiser,
            advertiserEmail: fetchedCampaign.advertiserEmail,
            advertiserPhone: fetchedCampaign.advertiserPhone || "",
            type: fetchedCampaign.type,
            status: fetchedCampaign.status,
            budget: fetchedCampaign.budget,
            spent: fetchedCampaign.spent,
            startDate: fetchedCampaign.startDate ? fetchedCampaign.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
            endDate: fetchedCampaign.endDate ? fetchedCampaign.endDate.split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            targetCategories: fetchedCampaign.targetCategories || [],
            targetPositions: fetchedCampaign.targetPositions || [],
            impressions: fetchedCampaign.impressions,
            clicks: fetchedCampaign.clicks,
            ctr: fetchedCampaign.ctr,
            clickUrl: fetchedCampaign.clickUrl || "",
            mediaUrl: fetchedCampaign.mediaUrl || "",
            mediaType: fetchedCampaign.mediaType || "image",
          };
        } else {
          console.log('💾 Preserving user changes, not overwriting form data');
          return prev;
        }
      });
      
      hasFetched.current = true;
      
    } catch (error: any) {
      toast({
        title: "Error loading campaign",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]); // Dependencies

  useEffect(() => {
    if (isEditing && id && !hasFetched.current) {
      console.log('🚀 INITIAL CAMPAIGN FETCH');
      fetchCampaign();
    }
  }, [id, isEditing, fetchCampaign]);

  // Keep preview URL separate from server URL for immediate display
  // Always update preview when mediaUrl or mediaType changes
  useEffect(() => {
    if (formData.mediaUrl) {
      // Transform Cloudinary URLs for optimal display
      let finalUrl = formData.mediaUrl;
      if (formData.mediaUrl.includes('cloudinary.com')) {
        const url = new URL(formData.mediaUrl);

        // For videos, ensure proper format and quality
        if (formData.mediaType === 'video') {
          if (!url.searchParams.has('f')) {
            url.searchParams.set('f', 'mp4');
          }
          if (!url.searchParams.has('q')) {
            url.searchParams.set('q', 'auto');
          }
        }
        // For images, add optimization parameters
        else if (formData.mediaType === 'image') {
          if (!url.searchParams.has('q')) {
            url.searchParams.set('q', 'auto');
          }
          if (!url.searchParams.has('f')) {
            url.searchParams.set('f', 'auto');
          }
        }

        finalUrl = url.toString();
      }
      setPreviewUrl(finalUrl);
    } else {
      setPreviewUrl("");
    }
  }, [formData.mediaUrl, formData.mediaType]);

  // 🔥 FIX: File selection handler - only validates and creates preview, no upload
  const handleFileUpload = (file: File) => {
    // Validate file size
    if (file.size > maxFileSize) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 50MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const isImage = supportedImageTypes.includes(file.type);
    const isVideo = supportedVideoTypes.includes(file.type);

    if (!isImage && !isVideo) {
      toast({
        title: "Unsupported file type",
        description: "Please upload an image (JPEG, PNG, GIF, WebP) or video (MP4, WebM, OGG)",
        variant: "destructive",
      });
      return;
    }

    // Determine media type
    const mediaType = isImage ? "image" : "video";

    // Store the selected file
    setSelectedFile(file);

    // 🔥 FIX: Set media type immediately for proper preview rendering
    setFormData(prev => ({
      ...prev,
      mediaType
    }));

    // Create preview URL from the actual file for immediate preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    toast({
      title: "Media selected",
      description: `${mediaType === "image" ? "Image" : "Video"} selected and ready to upload when you save the campaign`,
    });
  };

  const handleRemoveMedia = () => {
    setPreviewUrl("");
    setFormData(prev => ({
      ...prev,
      mediaUrl: "",
      mediaType: "image"
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Use ref to avoid stale closures
    const currentFormData = formDataRef.current;

    // Validate that arrays are not empty
    if (currentFormData.targetCategories.length === 0 || currentFormData.targetPositions.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one target category and one ad position before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Validate that media is selected
    if (!selectedFile && !currentFormData.mediaUrl) {
      toast({
        title: "Validation Error",
        description: "Please select ad media before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      console.log('🔄 REAL-TIME DATA FROM REF:', {
        categories: currentFormData.targetCategories,
        positions: currentFormData.targetPositions
      });
      console.log('🎯 Target Categories from ref:', currentFormData.targetCategories);
      console.log('📍 Target Positions from ref:', currentFormData.targetPositions);
      console.log('🔍 Array validation from ref:', {
        categoriesIsArray: Array.isArray(currentFormData.targetCategories),
        positionsIsArray: Array.isArray(currentFormData.targetPositions),
        categoriesLength: currentFormData.targetCategories.length,
        positionsLength: currentFormData.targetPositions.length
      });

      let mediaUrl = currentFormData.mediaUrl;
      let mediaMetadata = {};

      // Upload media if a new file was selected
      if (selectedFile) {
        console.log('📤 Uploading selected media file...');
        // Pass campaignId for existing campaigns to save media URL directly to database
        const campaignId = isEditing && campaign ? campaign.id : undefined;
        const uploadResult = await adsService.uploadAdMedia(selectedFile, campaignId);
        console.log('✅ Media uploaded successfully:', uploadResult);

        // Extract all media metadata from upload result
        mediaUrl = uploadResult.url;
        mediaMetadata = {
          mediaUrl: uploadResult.url,
          fileName: uploadResult.fileName,
          fileType: uploadResult.fileType,
          fileSize: uploadResult.fileSize,
          mediaType: uploadResult.mediaType,
          cloudinaryPublicId: uploadResult.cloudinaryPublicId
        };

        // Update form data with the uploaded media URL immediately
        setFormData(prev => ({
          ...prev,
          mediaUrl: uploadResult.url,
          mediaType: uploadResult.mediaType as "image" | "video"
        }));

        // Clear the selected file since it's been uploaded
          setSelectedFile(null);

        // Update preview URL to show the uploaded media with transformations
        let finalUrl = uploadResult.url;
        if (uploadResult.url && uploadResult.url.includes('cloudinary.com')) {
          const url = new URL(uploadResult.url);
          if (uploadResult.mediaType === 'video') {
            if (!url.searchParams.has('f')) {
              url.searchParams.set('f', 'mp4');
            }
            if (!url.searchParams.has('q')) {
              url.searchParams.set('q', 'auto');
            }
          } else if (uploadResult.mediaType === 'image') {
            if (!url.searchParams.has('q')) {
              url.searchParams.set('q', 'auto');
            }
            if (!url.searchParams.has('f')) {
              url.searchParams.set('f', 'auto');
            }
          }
          finalUrl = url.toString();
        }
        setPreviewUrl(finalUrl);
      }

      const campaignData = {
        ...currentFormData,
        ...mediaMetadata, // Include all media metadata
        mediaUrl,
        startDate: new Date(currentFormData.startDate).toISOString(),
        endDate: new Date(currentFormData.endDate).toISOString(),
        advertiserPhone: currentFormData.advertiserPhone || undefined,
        // Explicitly ensure arrays are included and properly formatted
        targetCategories: currentFormData.targetCategories || [],
        targetPositions: currentFormData.targetPositions || [],
      };

      console.log('📤 FINAL DATA BEING SENT (FROM REF):', {
        ...campaignData,
        targetCategories: campaignData.targetCategories,
        targetPositions: campaignData.targetPositions
      });

      if (isEditing && campaign) {
        console.log('🔄 Updating campaign:', campaign.id);
        const result = await adsService.updateAdCampaign(campaign.id, campaignData);
        console.log('✅ Update response:', result);
        toast({
          title: "Campaign updated",
          description: "Your campaign has been successfully updated.",
        });
      } else {
        console.log('🆕 Creating new campaign');
        const result = await adsService.createAdCampaign(campaignData);
        console.log('✅ Create response:', result);
        toast({
          title: "Campaign created",
          description: "Your new campaign has been created and is pending approval.",
        });
      }

      navigate("/admin/ads");
    } catch (error: any) {
      console.error('❌ Error saving campaign:', error);
      toast({
        title: "Error saving campaign",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    console.log(`✏️ Changing ${field}:`, value);
    // 🔥 FIX: Ensure we use functional updates here too
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addCategory = () => {
    console.log('🔴 === ADD CATEGORY FUNCTION START ===');
    console.log('📝 newCategory value:', newCategory);
    console.log('📊 Current formData.targetCategories:', formData.targetCategories);

    if (newCategory) {
      console.log('✅ CONDITION PASSED - Adding category');

      setFormData(prev => {
        // Ensure targetCategories is an array
        const currentCategories = Array.isArray(prev.targetCategories) ? prev.targetCategories : [];

        // Check if category already exists in the current state
        if (currentCategories.includes(newCategory)) {
          console.log('⚠️ Category already exists, not adding duplicate');
          return prev;
        }

        const updatedCategories = [...currentCategories, newCategory];
        console.log('🔄 INSIDE setFormData - Updated categories:', updatedCategories);
        return {
          ...prev,
          targetCategories: updatedCategories
        };
      });

      setNewCategory("");
      console.log('🔄 newCategory reset to empty string');
    } else {
      console.log('❌ CONDITION FAILED - No category selected');
    }
    console.log('🟢 === ADD CATEGORY FUNCTION END ===');
  };

  const removeCategory = (category: string) => {
    console.log('➖ REMOVING Category:', category);
    setFormData(prev => ({
      ...prev,
      targetCategories: prev.targetCategories.filter(c => c !== category)
    }));
  };

  const addPosition = () => {
    console.log('🔴 === ADD POSITION FUNCTION START ===');
    console.log('📝 newPosition value:', newPosition);
    console.log('📊 Current formData.targetPositions:', formData.targetPositions);

    if (newPosition) {
      console.log('✅ CONDITION PASSED - Adding position');

      setFormData(prev => {
        // Ensure targetPositions is an array
        const currentPositions = Array.isArray(prev.targetPositions) ? prev.targetPositions : [];

        // Check if position already exists in the current state
        if (currentPositions.includes(newPosition)) {
          console.log('⚠️ Position already exists, not adding duplicate');
          return prev;
        }

        const updatedPositions = [...currentPositions, newPosition];
        console.log('🔄 INSIDE setFormData - Updated positions:', updatedPositions);
        return {
          ...prev,
          targetPositions: updatedPositions
        };
      });

      setNewPosition("");
      console.log('🔄 newPosition reset to empty string');
    } else {
      console.log('❌ CONDITION FAILED - No position selected');
    }
    console.log('🟢 === ADD POSITION FUNCTION END ===');
  };

  const removePosition = (position: string) => {
    console.log('➖ REMOVING Position:', position);
    setFormData(prev => ({
      ...prev,
      targetPositions: prev.targetPositions.filter(p => p !== position)
    }));
  };

  // Debug initial state
  useEffect(() => {
    console.log('🚀 Form initialized - isEditing:', isEditing);
    console.log('📝 Initial formData:', {
      ...formData,
      targetCategories: formData.targetCategories,
      targetPositions: formData.targetPositions
    });
  }, []);

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
            <h1 className="text-4xl font-bold">
              {isEditing ? "Edit Campaign" : "Create New Campaign"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditing ? `Editing: ${campaign?.title}` : "Set up a new advertising campaign"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Campaign Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter campaign title..."
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the campaign goals and target audience..."
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Ad Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: AdCampaign['type']) => handleChange("type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="banner">Banner Ad</SelectItem>
                        <SelectItem value="sidebar">Sidebar Ad</SelectItem>
                        <SelectItem value="inline">Inline Ad</SelectItem>
                        <SelectItem value="popup">Popup Ad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget ($) *</Label>
                    <Input
                      id="budget"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="500.00"
                      value={formData.budget}
                      onChange={(e) => handleChange("budget", parseFloat(e.target.value))}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ad Media */}
            <Card>
              <CardHeader>
                <CardTitle>Ad Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clickUrl">Destination URL *</Label>
                  <Input
                    id="clickUrl"
                    type="url"
                    placeholder="https://example.com/product-page"
                    value={formData.clickUrl}
                    onChange={(e) => handleChange("clickUrl", e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    The URL users will be directed to when they click on your ad
                  </p>
                </div>

                <div className="space-y-4">
                  <Label>Ad Media</Label>
                  
                  {/* Media Preview */}
                  {previewUrl && (
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">Media Preview</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveMedia}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                      
                      {formData.mediaType === "image" ? (
                        <div className="flex justify-center">
                          <img
                            src={previewUrl}
                            alt="Ad preview"
                            className="max-h-64 max-w-full rounded-lg object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <video
                            src={previewUrl}
                            controls
                            preload="metadata"
                            crossOrigin="anonymous"
                            className="max-h-64 max-w-full rounded-lg object-contain"
                            onError={(e) => console.error('Video failed to load:', e)}
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}
                      
                      <div className="mt-2 text-center text-sm text-muted-foreground">
                        {formData.mediaType === "image" ? "Image" : "Video"} Preview
                        {formData.mediaUrl && (
                          <div className="mt-1">
                            <Badge variant="outline" className="text-xs">
                              {formData.mediaType === "image" ? "Image" : "Video"} Selected
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Upload Area */}
                  {!previewUrl && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <Upload className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium mb-1">Upload Ad Media</p>
                          <p className="text-sm text-muted-foreground mb-4">
                            Upload an image or short video (max 50MB)
                          </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Image className="h-4 w-4" />
                            <span className="text-sm">Images: JPEG, PNG, GIF, WebP</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            <span className="text-sm">Videos: MP4, WebM, OGG</span>
                          </div>
                        </div>

                        <input
                          type="file"
                          id="media-upload"
                          className="hidden"
                          accept={[...supportedImageTypes, ...supportedVideoTypes].join(',')}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(file);
                            }
                          }}
                        />
                        <Label htmlFor="media-upload" className="cursor-pointer">
                          <Button
                            type="button"
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => document.getElementById('media-upload')?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Choose File from Device
                          </Button>
                        </Label>
                        
                        <p className="text-xs text-muted-foreground">
                          Click to browse your device's files
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Debug Button */}
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      console.log('🧪 DEBUG - Current form state:', {
                        ...formData,
                        targetCategories: formData.targetCategories,
                        targetPositions: formData.targetPositions
                      });
                      console.log('🧪 DEBUG - Ref state:', {
                        ...formDataRef.current,
                        targetCategories: formDataRef.current.targetCategories,
                        targetPositions: formDataRef.current.targetPositions
                      });
                    }}
                    className="w-full"
                  >
                    Debug Form State (State vs Ref)
                  </Button>

                  {/* Alternative: Drag & Drop Area */}
                  <div 
                    className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-gray-300 transition-colors"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-primary');
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-primary');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-primary');
                      const files = e.dataTransfer.files;
                      if (files.length > 0) {
                        handleFileUpload(files[0]);
                      }
                    }}
                    onClick={() => document.getElementById('media-upload')?.click()}
                  >
                    <p className="text-sm text-muted-foreground">
                      Or drag and drop your file here
                    </p>
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
                <div className="space-y-2">
                  <Label htmlFor="advertiser">Advertiser Name *</Label>
                  <Input
                    id="advertiser"
                    placeholder="Company or individual name"
                    value={formData.advertiser}
                    onChange={(e) => handleChange("advertiser", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="advertiserEmail">Email *</Label>
                    <Input
                      id="advertiserEmail"
                      type="email"
                      placeholder="advertiser@example.com"
                      value={formData.advertiserEmail}
                      onChange={(e) => handleChange("advertiserEmail", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="advertiserPhone">Phone</Label>
                    <Input
                      id="advertiserPhone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.advertiserPhone}
                      onChange={(e) => handleChange("advertiserPhone", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Targeting */}
            <Card>
              <CardHeader>
                <CardTitle>Targeting & Placement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Categories */}
                <div className="space-y-3">
                  <Label>Target Categories *</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.targetCategories.map((category) => (
                      <Badge
                        key={category}
                        variant="secondary"
                        className="flex items-center gap-1"
                        data-category-badge={category}
                      >
                        {category}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive"
                          onClick={() => removeCategory(category)}
                        />
                      </Badge>
                    ))}
                    {formData.targetCategories.length === 0 && (
                      <p className="text-sm text-muted-foreground italic">No categories selected</p>
                    )}
                  </div>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      console.log('🎯 Category selected:', value);
                      if (value && Array.isArray(formData.targetCategories) && !formData.targetCategories.includes(value)) {
                        setFormData(prev => ({
                          ...prev,
                          targetCategories: [...(prev.targetCategories || []), value]
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select categories to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories
                        .filter(category => !Array.isArray(formData.targetCategories) || !((formData.targetCategories || [])).includes(category))
                        .map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Positions */}
                <div className="space-y-3">
                  <Label>Ad Positions *</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.targetPositions.map((position) => (
                      <Badge
                        key={position}
                        variant="outline"
                        className="flex items-center gap-1 capitalize"
                        data-position-badge={position}
                      >
                        {position.replace('_', ' ')}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive"
                          onClick={() => removePosition(position)}
                        />
                      </Badge>
                    ))}
                    {formData.targetPositions.length === 0 && (
                      <p className="text-sm text-muted-foreground italic">No positions selected</p>
                    )}
                  </div>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      console.log('📍 Position selected:', value);
                      if (value && Array.isArray(formData.targetPositions) && !formData.targetPositions.includes(value)) {
                        setFormData(prev => ({
                          ...prev,
                          targetPositions: [...(prev.targetPositions || []), value]
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select positions to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePositions
                        .filter(position => !Array.isArray(formData.targetPositions) || !((formData.targetPositions || [])).includes(position))
                        .map(position => (
                          <SelectItem key={position} value={position}>
                            {position.replace('_', ' ')}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleChange("startDate", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleChange("endDate", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/ads")}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || !formData.title || !formData.advertiser || !formData.clickUrl || (!selectedFile && !formData.mediaUrl) || formData.targetCategories.length === 0 || formData.targetPositions.length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : (isEditing ? "Update Campaign" : "Create Campaign")}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AdCampaignForm;