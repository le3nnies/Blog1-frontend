// src/pages/Admin/AdsSettings.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Save, 
  Settings, 
  DollarSign, 
  Shield, 
  Bell, 
  Mail,
  FileText,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Link,
  TestTube
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { adsService } from "@/services/adsService";

interface AdSettings {
  // General Settings
  siteName: string;
  adCurrency: string;
  autoApproveCampaigns: boolean;
  requireAdvertiserVerification: boolean;
  
  // Display Settings
  maxAdsPerPage: number;
  adDensity: 'low' | 'medium' | 'high';
  showAdsToSubscribers: boolean;
  
  // Payment & Billing
  paymentGateway: 'stripe' | 'paypal' | 'manual';
  stripePublicKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  paypalClientId: string;
  defaultCommissionRate: number;
  taxRate: number;
  
  // Notifications
  emailNotifications: boolean;
  notifyOnNewCampaign: boolean;
  notifyOnCampaignApproval: boolean;
  notifyOnLowBalance: boolean;
  adminEmail: string;
  
  // Privacy & Compliance
  enableGDPR: boolean;
  enableCCPA: boolean;
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
  
  // Google AdSense
  googleAdSenseEnabled: boolean;
  googleAdSenseClientId: string;
  autoAdsEnabled: boolean;
  
  // Advanced
  adRefreshInterval: number;
  enableAdBlockRecovery: boolean;
  customAdCSS: string;
}

const AdsSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingStripe, setTestingStripe] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const [settings, setSettings] = useState<AdSettings>({
    siteName: "TrendBlog",
    adCurrency: "USD",
    autoApproveCampaigns: false,
    requireAdvertiserVerification: true,
    maxAdsPerPage: 4,
    adDensity: 'medium',
    showAdsToSubscribers: false,
    paymentGateway: 'stripe',
    stripePublicKey: "",
    stripeSecretKey: "",
    stripeWebhookSecret: "",
    paypalClientId: "",
    defaultCommissionRate: 30,
    taxRate: 0,
    emailNotifications: true,
    notifyOnNewCampaign: true,
    notifyOnCampaignApproval: true,
    notifyOnLowBalance: true,
    adminEmail: "",
    enableGDPR: true,
    enableCCPA: false,
    privacyPolicyUrl: "",
    termsOfServiceUrl: "",
    googleAdSenseEnabled: false,
    googleAdSenseClientId: "",
    autoAdsEnabled: true,
    adRefreshInterval: 0,
    enableAdBlockRecovery: true,
    customAdCSS: "",
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const settingsData = await adsService.getAdsSettings();
        setSettings(settingsData.data || settingsData);
      } catch (error) {
        console.error('Error loading settings:', error);
        toast({
          title: "Error loading settings",
          description: error instanceof Error ? error.message : "Failed to load advertising settings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

  const handleSave = async () => {
    try {
      setSaving(true);

      const updatedSettings = await adsService.updateAdsSettings(settings);
      setSettings(updatedSettings.data || updatedSettings);

      toast({
        title: "Settings saved",
        description: "Your advertising settings have been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error saving settings",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // In your AdsSettings.tsx, update the functions to use the new API service:

const testStripeConnection = async () => {
  try {
    setTestingStripe(true);

    const response = await adsService.testStripeConnection({
      stripePublicKey: settings.stripePublicKey,
      stripeSecretKey: settings.stripeSecretKey
    });

    const result = response.data;

    if (result.valid) {
      toast({
        title: "Stripe connection successful",
        description: "Your Stripe credentials are working correctly.",
        variant: "default",
      });
    } else {
      toast({
        title: "Stripe connection failed",
        description: result.message || "Please check your credentials",
        variant: "destructive",
      });
    }
  } catch (error: any) {
    toast({
      title: "Stripe connection failed",
      description: error.response?.data?.message || error.message || "Please check your credentials",
      variant: "destructive",
    });
  } finally {
    setTestingStripe(false);
  }
};


// Also update the loadSettings and handleSave functions:
const loadSettings = async () => {
  try {
    setLoading(true);
    console.log('🔄 Loading ads settings...');

    const response = await adsService.getAdsSettings();

    console.log('📋 Raw response:', response);

    // Handle different response structures
    let settingsData;
    if (response.data && response.data.data) {
      // Structure: { data: { data: { ... } } }
      settingsData = response.data.data;
    } else if (response.data) {
      // Structure: { data: { ... } }
      settingsData = response.data;
    } else {
      // Structure: { ... } (direct data)
      settingsData = response;
    }

    console.log('✅ Settings data loaded:', settingsData);
    setSettings(settingsData);

  } catch (error: any) {
    console.error('❌ Error loading settings:', error);

    // More specific error messages
    let errorMessage = "Failed to load advertising settings";
    if (error.message?.includes('404')) {
      errorMessage = "Settings endpoint not found. Please check your backend routes.";
    } else if (error.message?.includes('401')) {
      errorMessage = "Authentication failed. Please log in again.";
    } else if (error.message?.includes('Network Error')) {
      errorMessage = "Cannot connect to server. Please check if the backend is running.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    toast({
      title: "Error loading settings",
      description: errorMessage,
      variant: "destructive",
    });

    // Use default settings as fallback
    console.log('🔄 Using default settings as fallback due to error');
  } finally {
    setLoading(false);
  }
};

  const generateWebhookSecret = async () => {
    try {
      const webhookUrl = `${window.location.origin}/api/webhooks/stripe`;

      const result = await adsService.generateWebhookSecret({
        webhookUrl,
        stripeSecretKey: settings.stripeSecretKey
      });

      if (result.webhookSecret) {
        setSettings(prev => ({ ...prev, stripeWebhookSecret: result.webhookSecret }));
        toast({
          title: "Webhook secret generated",
          description: "Stripe webhook secret has been generated successfully.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Failed to generate webhook",
        description: error.message || "Please check your Stripe credentials",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setSettings({
      siteName: "TrendBlog",
      adCurrency: "USD",
      autoApproveCampaigns: false,
      requireAdvertiserVerification: true,
      maxAdsPerPage: 4,
      adDensity: 'medium',
      showAdsToSubscribers: false,
      paymentGateway: 'stripe',
      stripePublicKey: "",
      stripeSecretKey: "",
      stripeWebhookSecret: "",
      paypalClientId: "",
      defaultCommissionRate: 30,
      taxRate: 0,
      emailNotifications: true,
      notifyOnNewCampaign: true,
      notifyOnCampaignApproval: true,
      notifyOnLowBalance: true,
      adminEmail: "",
      enableGDPR: true,
      enableCCPA: false,
      privacyPolicyUrl: "",
      termsOfServiceUrl: "",
      googleAdSenseEnabled: false,
      googleAdSenseClientId: "",
      autoAdsEnabled: true,
      adRefreshInterval: 0,
      enableAdBlockRecovery: true,
      customAdCSS: "",
    });
    
    toast({
      title: "Settings reset",
      description: "All settings have been reset to default values.",
    });
  };

  const handleChange = (field: keyof AdSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const isStripeConfigured = settings.stripePublicKey && settings.stripeSecretKey;
  const isTestMode = settings.stripePublicKey?.includes('_test_') || settings.stripeSecretKey?.includes('_test_');

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => navigate("/admin/ads")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Ads
            </Button>
            <div className="flex-1">
              <h1 className="text-4xl font-bold">Ads Settings</h1>
              <p className="text-muted-foreground mt-1">Loading settings...</p>
            </div>
          </div>
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate("/admin/ads")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Ads
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold">Ads Settings</h1>
            <p className="text-muted-foreground mt-1">
              Configure your advertising platform and preferences
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              Reset to Defaults
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Basic configuration for your advertising platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) => handleChange("siteName", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adCurrency">Default Currency</Label>
                    <Select
                      value={settings.adCurrency}
                      onValueChange={(value) => handleChange("adCurrency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                        <SelectItem value="AUD">AUD (A$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxAdsPerPage">Maximum Ads Per Page</Label>
                    <Input
                      id="maxAdsPerPage"
                      type="number"
                      min="1"
                      max="10"
                      value={settings.maxAdsPerPage}
                      onChange={(e) => handleChange("maxAdsPerPage", parseInt(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum number of ads to display on a single page
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adDensity">Ad Density</Label>
                    <Select
                      value={settings.adDensity}
                      onValueChange={(value: 'low' | 'medium' | 'high') => handleChange("adDensity", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (Less intrusive)</SelectItem>
                        <SelectItem value="medium">Medium (Balanced)</SelectItem>
                        <SelectItem value="high">High (Maximum revenue)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Campaign Management</CardTitle>
                  <CardDescription>
                    Settings for handling advertising campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoApproveCampaigns">Auto-approve Campaigns</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically approve new campaigns without manual review
                      </p>
                    </div>
                    <Switch
                      id="autoApproveCampaigns"
                      checked={settings.autoApproveCampaigns}
                      onCheckedChange={(checked) => handleChange("autoApproveCampaigns", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="requireAdvertiserVerification">Require Advertiser Verification</Label>
                      <p className="text-sm text-muted-foreground">
                        Verify advertiser identity before allowing campaigns
                      </p>
                    </div>
                    <Switch
                      id="requireAdvertiserVerification"
                      checked={settings.requireAdvertiserVerification}
                      onCheckedChange={(checked) => handleChange("requireAdvertiserVerification", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="showAdsToSubscribers">Show Ads to Subscribers</Label>
                      <p className="text-sm text-muted-foreground">
                        Display ads to users with active subscriptions
                      </p>
                    </div>
                    <Switch
                      id="showAdsToSubscribers"
                      checked={settings.showAdsToSubscribers}
                      onCheckedChange={(checked) => handleChange("showAdsToSubscribers", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payment" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Stripe Configuration</CardTitle>
                  <CardDescription>
                    Configure Stripe for processing payments from advertisers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="stripePublicKey">Stripe Publishable Key</Label>
                    <Input
                      id="stripePublicKey"
                      type="password"
                      value={settings.stripePublicKey}
                      onChange={(e) => handleChange("stripePublicKey", e.target.value)}
                      placeholder="pk_test_... or pk_live_..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Found in your Stripe dashboard under Developers → API keys
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                    <Input
                      id="stripeSecretKey"
                      type="password"
                      value={settings.stripeSecretKey}
                      onChange={(e) => handleChange("stripeSecretKey", e.target.value)}
                      placeholder="sk_test_... or sk_live_..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stripeWebhookSecret">Stripe Webhook Secret</Label>
                    <div className="flex gap-2">
                      <Input
                        id="stripeWebhookSecret"
                        type="password"
                        value={settings.stripeWebhookSecret}
                        onChange={(e) => handleChange("stripeWebhookSecret", e.target.value)}
                        placeholder="whsec_..."
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        onClick={generateWebhookSecret}
                        disabled={!isStripeConfigured}
                      >
                        <Link className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Webhook secret for processing Stripe events
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={testStripeConnection} 
                      disabled={!isStripeConfigured || testingStripe}
                      variant="outline"
                      className="flex-1"
                    >
                      {testingStripe ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <TestTube className="h-4 w-4 mr-2" />
                      )}
                      {testingStripe ? "Testing..." : "Test Connection"}
                    </Button>
                    
                    <Button 
                      onClick={() => window.open('https://dashboard.stripe.com/test/apikeys', '_blank')}
                      variant="outline"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Stripe Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Settings</CardTitle>
                  <CardDescription>
                    Configure payment rates and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultCommissionRate">Default Commission Rate (%)</Label>
                    <Input
                      id="defaultCommissionRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={settings.defaultCommissionRate}
                      onChange={(e) => handleChange("defaultCommissionRate", parseFloat(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your commission percentage on all advertising revenue
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      min="0"
                      max="50"
                      step="0.1"
                      value={settings.taxRate}
                      onChange={(e) => handleChange("taxRate", parseFloat(e.target.value))}
                    />
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-semibold mb-2">Revenue Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Commission Rate:</span>
                        <span className="font-medium">{settings.defaultCommissionRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax Rate:</span>
                        <span className="font-medium">{settings.taxRate}%</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span>Your Earnings:</span>
                        <span className="font-medium text-green-600">
                          {settings.defaultCommissionRate - settings.taxRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stripe Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Stripe Status</CardTitle>
                <CardDescription>
                  Current Stripe configuration and connection status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        isStripeConfigured
                          ? 'bg-green-100 text-green-600'
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {isStripeConfigured ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <AlertTriangle className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">API Keys</p>
                        <p className="text-sm text-muted-foreground">
                          {isStripeConfigured ? 'Configured' : 'Missing credentials'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={isStripeConfigured ? 'default' : 'outline'}>
                      {isStripeConfigured ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        settings.stripeWebhookSecret
                          ? 'bg-green-100 text-green-600'
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {settings.stripeWebhookSecret ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <AlertTriangle className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">Webhooks</p>
                        <p className="text-sm text-muted-foreground">
                          {settings.stripeWebhookSecret ? 'Configured' : 'Not configured'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={settings.stripeWebhookSecret ? 'default' : 'outline'}>
                      {settings.stripeWebhookSecret ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        isTestMode ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {isTestMode ? (
                          <TestTube className="h-5 w-5" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">Environment</p>
                        <p className="text-sm text-muted-foreground">
                          {isTestMode ? 'Test Mode' : 'Live Mode'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={isTestMode ? 'outline' : 'default'}>
                      {isTestMode ? 'Testing' : 'Live'}
                    </Badge>
                  </div>
                </div>

                {isTestMode && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800">
                      <TestTube className="h-4 w-4" />
                      <span className="font-medium">Test Mode Active</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      You're using Stripe test keys. No real payments will be processed.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>
                  Configure when to receive email notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Enable Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for important events
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleChange("emailNotifications", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => handleChange("adminEmail", e.target.value)}
                    placeholder="admin@example.com"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifyOnNewCampaign">New Campaign Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when new campaigns are submitted
                      </p>
                    </div>
                    <Switch
                      id="notifyOnNewCampaign"
                      checked={settings.notifyOnNewCampaign}
                      onCheckedChange={(checked) => handleChange("notifyOnNewCampaign", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifyOnCampaignApproval">Campaign Approval Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when campaigns are approved or rejected
                      </p>
                    </div>
                    <Switch
                      id="notifyOnCampaignApproval"
                      checked={settings.notifyOnCampaignApproval}
                      onCheckedChange={(checked) => handleChange("notifyOnCampaignApproval", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifyOnLowBalance">Low Balance Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when advertiser balances are low
                      </p>
                    </div>
                    <Switch
                      id="notifyOnLowBalance"
                      checked={settings.notifyOnLowBalance}
                      onCheckedChange={(checked) => handleChange("notifyOnLowBalance", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy & Compliance</CardTitle>
                  <CardDescription>
                    Configure privacy settings and compliance features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableGDPR">Enable GDPR Compliance</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable GDPR compliance features for EU users
                      </p>
                    </div>
                    <Switch
                      id="enableGDPR"
                      checked={settings.enableGDPR}
                      onCheckedChange={(checked) => handleChange("enableGDPR", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableCCPA">Enable CCPA Compliance</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable CCPA compliance features for California users
                      </p>
                    </div>
                    <Switch
                      id="enableCCPA"
                      checked={settings.enableCCPA}
                      onCheckedChange={(checked) => handleChange("enableCCPA", checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="privacyPolicyUrl">Privacy Policy URL</Label>
                    <Input
                      id="privacyPolicyUrl"
                      value={settings.privacyPolicyUrl}
                      onChange={(e) => handleChange("privacyPolicyUrl", e.target.value)}
                      placeholder="https://yoursite.com/privacy"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="termsOfServiceUrl">Terms of Service URL</Label>
                    <Input
                      id="termsOfServiceUrl"
                      value={settings.termsOfServiceUrl}
                      onChange={(e) => handleChange("termsOfServiceUrl", e.target.value)}
                      placeholder="https://yoursite.com/terms"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Google AdSense</CardTitle>
                  <CardDescription>
                    Configure Google AdSense integration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="googleAdSenseEnabled">Enable Google AdSense</Label>
                      <p className="text-sm text-muted-foreground">
                        Display Google AdSense ads alongside your own ads
                      </p>
                    </div>
                    <Switch
                      id="googleAdSenseEnabled"
                      checked={settings.googleAdSenseEnabled}
                      onCheckedChange={(checked) => handleChange("googleAdSenseEnabled", checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="googleAdSenseClientId">AdSense Client ID</Label>
                    <Input
                      id="googleAdSenseClientId"
                      value={settings.googleAdSenseClientId}
                      onChange={(e) => handleChange("googleAdSenseClientId", e.target.value)}
                      placeholder="ca-pub-xxxxxxxxxxxxxxxx"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoAdsEnabled">Enable Auto Ads</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow Google to automatically place ads on your site
                      </p>
                    </div>
                    <Switch
                      id="autoAdsEnabled"
                      checked={settings.autoAdsEnabled}
                      onCheckedChange={(checked) => handleChange("autoAdsEnabled", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Advanced configuration options for power users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adRefreshInterval">Ad Refresh Interval (seconds)</Label>
                  <Input
                    id="adRefreshInterval"
                    type="number"
                    min="0"
                    max="3600"
                    value={settings.adRefreshInterval}
                    onChange={(e) => handleChange("adRefreshInterval", parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Set to 0 to disable ad refreshing. Higher values reduce server load.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableAdBlockRecovery">Ad Block Recovery</Label>
                    <p className="text-sm text-muted-foreground">
                      Show messages to users with ad blockers enabled
                    </p>
                  </div>
                  <Switch
                    id="enableAdBlockRecovery"
                    checked={settings.enableAdBlockRecovery}
                    onCheckedChange={(checked) => handleChange("enableAdBlockRecovery", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customAdCSS">Custom CSS</Label>
                  <Textarea
                    id="customAdCSS"
                    value={settings.customAdCSS}
                    onChange={(e) => handleChange("customAdCSS", e.target.value)}
                    placeholder="/* Custom CSS for ad styling */"
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Custom CSS to style your ads. Applied to all ad containers.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
          <div className="container mx-auto max-w-6xl flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                Make sure to save your changes
              </p>
              {isTestMode && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  <TestTube className="h-3 w-3 mr-1" />
                  Test Mode
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? "Saving Changes..." : "Save All Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdsSettings;