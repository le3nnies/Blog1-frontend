import { useState, useEffect } from 'react';
import { Mail, CheckCircle, XCircle, Settings, Bell, BellOff, Sparkles, TrendingUp, Target } from 'lucide-react';
import { Header } from '@/components/Layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [preferences, setPreferences] = useState({
    categories: [] as string[],
    frequency: 'weekly' as 'daily' | 'weekly'
  });
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const categories = [
    { id: 'technology', label: 'Technology', color: 'bg-blue-500' },
    { id: 'business', label: 'Business', color: 'bg-green-500' },
    { id: 'finance', label: 'Finance', color: 'bg-emerald-500' },
    { id: 'ai', label: 'AI & ML', color: 'bg-purple-500' },
    { id: 'startup', label: 'Startup', color: 'bg-amber-500' },
    { id: 'marketing', label: 'Marketing', color: 'bg-pink-500' },
    { id: 'design', label: 'Design', color: 'bg-rose-500' },
    { id: 'development', label: 'Development', color: 'bg-indigo-500' }
  ];

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
      checkSubscriptionStatus();
    } else {
      setStatusLoading(false);
    }
  }, [user]);

  const checkSubscriptionStatus = async () => {
    setStatusLoading(true);
    try {
      const response = await fetch('/api/newsletter/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setIsSubscribed(data.subscribed);
        if (data.preferences) {
          setPreferences(data.preferences);
        }
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          preferences
        })
      });

      const data = await response.json();

      if (data.success) {
        setIsSubscribed(true);
        toast({
          title: "🎉 Welcome aboard!",
          description: "You've successfully subscribed to our newsletter.",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to subscribe",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe to newsletter",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email
        })
      });

      const data = await response.json();

      if (data.success) {
        setIsSubscribed(false);
        toast({
          title: "Unsubscribed",
          description: "You've been unsubscribed from our newsletter.",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to unsubscribe",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unsubscribe from newsletter",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async () => {
    try {
      const response = await fetch('/api/newsletter/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          preferences
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Preferences Updated",
          description: "Your newsletter preferences have been saved.",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update preferences",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive"
      });
    }
  };

  const toggleCategory = (category: string) => {
    setPreferences(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Stay Informed</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Newsletter Subscription
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get curated insights, trending articles, and exclusive content delivered to your inbox
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content - 2/3 width */}
            <div className="lg:col-span-2 space-y-8">
              {/* Subscription Card */}
              <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">
                          {isSubscribed ? 'Your Subscription' : 'Subscribe Now'}
                        </CardTitle>
                        <CardDescription>
                          {isSubscribed
                            ? 'Manage your newsletter subscription'
                            : 'Join 10,000+ readers getting weekly updates'
                          }
                        </CardDescription>
                      </div>
                    </div>
                    {isSubscribed && (
                      <Badge className="h-8 px-3 bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                  {statusLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : isSubscribed ? (
                    <div className="space-y-6">
                      <div className="p-4 rounded-lg bg-green-50 border border-green-100 dark:bg-green-950/20 dark:border-green-900/30">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <div>
                            <p className="font-medium text-green-800 dark:text-green-300">
                              Successfully subscribed
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                              You're receiving updates at <span className="font-semibold">{email}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Button
                          onClick={handleUnsubscribe}
                          variant="outline"
                          disabled={loading}
                          className="w-full h-11 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          {loading ? 'Processing...' : (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Unsubscribe
                            </>
                          )}
                        </Button>
                        <p className="text-sm text-muted-foreground text-center">
                          You can resubscribe anytime
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubscribe} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-base">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-12 text-base"
                        />
                        <p className="text-sm text-muted-foreground">
                          We'll send a confirmation email to this address
                        </p>
                      </div>
                      <Button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full h-12 text-base bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-primary shadow-md hover:shadow-lg transition-all"
                      >
                        {loading ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent mr-2" />
                            Subscribing...
                          </>
                        ) : (
                          <>
                            <Mail className="h-5 w-5 mr-2" />
                            Subscribe to Newsletter
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Preferences Card - Only show when subscribed */}
              {isSubscribed && !statusLoading && (
                <Card className="border-2 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Settings className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">Preferences</CardTitle>
                        <CardDescription>
                          Customize what you receive and how often
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Frequency */}
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold">Delivery Frequency</Label>
                      <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                        <div className="flex items-center gap-3">
                          {preferences.frequency === 'daily' ? (
                            <Bell className="h-5 w-5 text-amber-600" />
                          ) : (
                            <BellOff className="h-5 w-5 text-slate-600" />
                          )}
                          <div>
                            <p className="font-medium">
                              {preferences.frequency === 'daily' ? 'Daily Digest' : 'Weekly Roundup'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {preferences.frequency === 'daily' 
                                ? 'Get updates every weekday morning' 
                                : 'Receive a curated summary every Monday'
                              }
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.frequency === 'daily'}
                          onCheckedChange={(checked) =>
                            setPreferences(prev => ({
                              ...prev,
                              frequency: checked ? 'daily' : 'weekly'
                            }))
                          }
                        />
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-lg font-semibold">Topics of Interest</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Select the topics you want to hear about
                        </p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {categories.map((category) => {
                          const isSelected = preferences.categories.includes(category.id);
                          return (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() => toggleCategory(category.id)}
                              className={`p-4 rounded-lg border transition-all duration-200 ${
                                isSelected
                                  ? `border-2 ${category.color.replace('bg-', 'border-')} bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-sm`
                                  : 'border hover:border-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-900/50'
                              }`}
                            >
                              <div className="flex flex-col items-center gap-2">
                                <div className={`h-8 w-8 rounded-full ${category.color} flex items-center justify-center`}>
                                  <span className="text-white font-semibold text-sm">
                                    {category.label.charAt(0)}
                                  </span>
                                </div>
                                <span className={`font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {category.label}
                                </span>
                                {isSelected && (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Button 
                      onClick={updatePreferences}
                      className="w-full h-12 text-base bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                      Save Preferences
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="space-y-8">
              {/* Benefits Card */}
              <Card className="border-2 bg-gradient-to-br from-background to-background/50">
                <CardHeader>
                  <CardTitle className="text-xl">Why Subscribe?</CardTitle>
                  <CardDescription>
                    Exclusive benefits for our subscribers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {[
                      {
                        icon: <Sparkles className="h-5 w-5 text-purple-600" />,
                        title: "Curated Content",
                        description: "Handpicked articles from trusted sources",
                        color: "bg-purple-100 dark:bg-purple-900/30"
                      },
                      {
                        icon: <TrendingUp className="h-5 w-5 text-green-600" />,
                        title: "Trend Analysis",
                        description: "Weekly insights on trending topics",
                        color: "bg-green-100 dark:bg-green-900/30"
                      },
                      {
                        icon: <Target className="h-5 w-5 text-blue-600" />,
                        title: "Personalized",
                        description: "Content tailored to your interests",
                        color: "bg-blue-100 dark:bg-blue-900/30"
                      }
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`h-10 w-10 rounded-lg ${benefit.color} flex items-center justify-center flex-shrink-0`}>
                          {benefit.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold">{benefit.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-xl">Community</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Active Subscribers</span>
                      <span className="text-2xl font-bold">10,247</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Open Rate</span>
                      <span className="text-2xl font-bold">68%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Weekly Articles</span>
                      <span className="text-2xl font-bold">15+</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Newsletter Preview */}
              <Card className="border-2 border-dashed">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">See a Sample</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Preview what our newsletter looks like
                      </p>
                    </div>
                    <Button variant="outline" className="w-full">
                      View Sample Issue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Newsletter;