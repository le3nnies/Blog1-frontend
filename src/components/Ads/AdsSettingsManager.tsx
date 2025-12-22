import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Save, TestTube, AlertCircle, CheckCircle } from "lucide-react";
import { adsService } from "@/services/adsService";
import { AdSettings } from "@/types/ads.types";
import { useToast } from "@/hooks/use-toast";

const AdsSettingsManager = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AdSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingStripe, setTestingStripe] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await adsService.getAdsSettings();
      if (response.success) {
        setSettings(response.data);
      }
    } catch (error: any) {
      toast({
        title: "Error loading settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const response = await adsService.updateAdsSettings(settings);
      if (response.success) {
        toast({
          title: "Settings saved",
          description: "Ad settings have been updated successfully.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestStripe = async () => {
    if (!settings?.stripeSecretKey) {
      toast({
        title: "Missing Stripe key",
        description: "Please enter your Stripe secret key first.",
        variant: "destructive",
      });
      return;
    }

    setTestingStripe(true);
    try {
      const response = await fetch('/api/ads/stripe/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stripeSecretKey: settings.stripeSecretKey }),
      });

      const result = await response.json();

      if (result.valid) {
        toast({
          title: "Stripe connection successful",
          description: result.message,
        });
      } else {
        toast({
          title: "Stripe connection failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Test failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTestingStripe(false);
    }
  };

  const updateSetting = (key: keyof AdSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Settings className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load settings. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Ad Settings</h2>
          <p className="text-muted-foreground">
            Configure your advertising platform settings
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="adsense">AdSense</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => updateSetting('siteName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="adCurrency">Currency</Label>
                  <Select
                    value={settings.adCurrency}
                    onValueChange={(value) => updateSetting('adCurrency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                      <SelectItem value="AUD">AUD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="autoApproveCampaigns"
                  checked={settings.autoApproveCampaigns}
                  onCheckedChange={(checked) => updateSetting('autoApproveCampaigns', checked)}
                />
                <Label htmlFor="autoApproveCampaigns">Auto-approve campaigns</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="requireAdvertiserVerification"
                  checked={settings.requireAdvertiserVerification}
                  onCheckedChange={(checked) => updateSetting('requireAdvertiserVerification', checked)}
                />
                <Label htmlFor="requireAdvertiserVerification">Require advertiser verification</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxAdsPerPage">Max Ads Per Page</Label>
                  <Input
                    id="maxAdsPerPage"
                    type="number"
                    min="1"
                    max="10"
                    value={settings.maxAdsPerPage}
                    onChange={(e) => updateSetting('maxAdsPerPage', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="adDensity">Ad Density</Label>
                  <Select
                    value={settings.adDensity}
                    onValueChange={(value: 'low' | 'medium' | 'high') => updateSetting('adDensity', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="showAdsToSubscribers"
                  checked={settings.showAdsToSubscribers}
                  onCheckedChange={(checked) => updateSetting('showAdsToSubscribers', checked)}
                />
                <Label htmlFor="showAdsToSubscribers">Show ads to subscribers</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment & Billing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="paymentGateway">Payment Gateway</Label>
                <Select
                  value={settings.paymentGateway}
                  onValueChange={(value: 'stripe' | 'paypal' | 'manual') => updateSetting('paymentGateway', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.paymentGateway === 'stripe' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stripePublicKey">Stripe Public Key</Label>
                      <Input
                        id="stripePublicKey"
                        type="password"
                        value={settings.stripePublicKey}
                        onChange={(e) => updateSetting('stripePublicKey', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                      <Input
                        id="stripeSecretKey"
                        type="password"
                        value={settings.stripeSecretKey}
                        onChange={(e) => updateSetting('stripeSecretKey', e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleTestStripe}
                    disabled={testingStripe}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    {testingStripe ? "Testing..." : "Test Stripe Connection"}
                  </Button>
                </>
              )}

              {settings.paymentGateway === 'paypal' && (
                <div>
                  <Label htmlFor="paypalClientId">PayPal Client ID</Label>
                  <Input
                    id="paypalClientId"
                    value={settings.paypalClientId}
                    onChange={(e) => updateSetting('paypalClientId', e.target.value)}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultCommissionRate">Default Commission Rate (%)</Label>
                  <Input
                    id="defaultCommissionRate"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.defaultCommissionRate}
                    onChange={(e) => updateSetting('defaultCommissionRate', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="50"
                    value={settings.taxRate}
                    onChange={(e) => updateSetting('taxRate', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                />
                <Label htmlFor="emailNotifications">Enable email notifications</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="notifyOnNewCampaign"
                  checked={settings.notifyOnNewCampaign}
                  onCheckedChange={(checked) => updateSetting('notifyOnNewCampaign', checked)}
                />
                <Label htmlFor="notifyOnNewCampaign">Notify on new campaigns</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="notifyOnCampaignApproval"
                  checked={settings.notifyOnCampaignApproval}
                  onCheckedChange={(checked) => updateSetting('notifyOnCampaignApproval', checked)}
                />
                <Label htmlFor="notifyOnCampaignApproval">Notify on campaign approvals</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="notifyOnLowBalance"
                  checked={settings.notifyOnLowBalance}
                  onCheckedChange={(checked) => updateSetting('notifyOnLowBalance', checked)}
                />
                <Label htmlFor="notifyOnLowBalance">Notify on low balance</Label>
              </div>

              <div>
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => updateSetting('adminEmail', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adsense" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Google AdSense</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="googleAdSenseEnabled"
                  checked={settings.googleAdSenseEnabled}
                  onCheckedChange={(checked) => updateSetting('googleAdSenseEnabled', checked)}
                />
                <Label htmlFor="googleAdSenseEnabled">Enable Google AdSense</Label>
              </div>

              <div>
                <Label htmlFor="googleAdSenseClientId">AdSense Client ID</Label>
                <Input
                  id="googleAdSenseClientId"
                  value={settings.googleAdSenseClientId}
                  onChange={(e) => updateSetting('googleAdSenseClientId', e.target.value)}
                  placeholder="ca-pub-xxxxxxxxxxxxxxxx"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="autoAdsEnabled"
                  checked={settings.autoAdsEnabled}
                  onCheckedChange={(checked) => updateSetting('autoAdsEnabled', checked)}
                />
                <Label htmlFor="autoAdsEnabled">Enable Auto Ads</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy & Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableGDPR"
                  checked={settings.enableGDPR}
                  onCheckedChange={(checked) => updateSetting('enableGDPR', checked)}
                />
                <Label htmlFor="enableGDPR">Enable GDPR compliance</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enableCCPA"
                  checked={settings.enableCCPA}
                  onCheckedChange={(checked) => updateSetting('enableCCPA', checked)}
                />
                <Label htmlFor="enableCCPA">Enable CCPA compliance</Label>
              </div>

              <div>
                <Label htmlFor="privacyPolicyUrl">Privacy Policy URL</Label>
                <Input
                  id="privacyPolicyUrl"
                  value={settings.privacyPolicyUrl}
                  onChange={(e) => updateSetting('privacyPolicyUrl', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="termsOfServiceUrl">Terms of Service URL</Label>
                <Input
                  id="termsOfServiceUrl"
                  value={settings.termsOfServiceUrl}
                  onChange={(e) => updateSetting('termsOfServiceUrl', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="adRefreshInterval">Ad Refresh Interval (seconds)</Label>
                <Input
                  id="adRefreshInterval"
                  type="number"
                  min="0"
                  max="3600"
                  value={settings.adRefreshInterval}
                  onChange={(e) => updateSetting('adRefreshInterval', parseInt(e.target.value))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enableAdBlockRecovery"
                  checked={settings.enableAdBlockRecovery}
                  onCheckedChange={(checked) => updateSetting('enableAdBlockRecovery', checked)}
                />
                <Label htmlFor="enableAdBlockRecovery">Enable ad block recovery</Label>
              </div>

              <div>
                <Label htmlFor="customAdCSS">Custom Ad CSS</Label>
                <Textarea
                  id="customAdCSS"
                  value={settings.customAdCSS}
                  onChange={(e) => updateSetting('customAdCSS', e.target.value)}
                  placeholder="Enter custom CSS for ads..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdsSettingsManager;
