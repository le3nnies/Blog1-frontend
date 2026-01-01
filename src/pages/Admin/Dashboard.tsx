import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, Eye, TrendingUp, RefreshCw, DollarSign, Users } from "lucide-react";
import { Layout } from "@/components/Layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Article } from "@/data/articles.types";
import { articleService } from "@/services/articleService";
import { analyticsService } from "@/services/analyticsService";
import { useToast } from "@/hooks/use-toast";
import { calculateArticleStats } from "@/utils/analytics.utils";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [totalViews, setTotalViews] = useState<number>(0);
  const [viewsLoading, setViewsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const { toast } = useToast();

  // Debug: Check user and initial state
  useEffect(() => {
    console.log('🔐 AdminDashboard Auth State:');
    console.log('User:', user ? 'Available' : 'Missing');
  }, [user]);

  const fetchDashboardData = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (isFetching) {
      console.log('⚠️ Fetch already in progress, skipping...');
      return;
    }

    try {
      setIsFetching(true);
      setLoading(true);
      setViewsLoading(true);
      console.log('📥 Fetching all dashboard data...');

      // Fetch articles first
      const fetchedArticles = await articleService.getAllArticles({
        sortBy: 'publishedAt',
        sortOrder: 'desc'
      });
      console.log('✅ Fetched articles:', fetchedArticles.length);
      setArticles(fetchedArticles);

      // Now, fetch analytics data with better error handling
      try {
        console.log('📊 Fetching total views...');
        const totalViewsData = await analyticsService.getDashboardAnalytics('all');
        setTotalViews(totalViewsData.totalViews || 0);
        console.log('✅ Fetched total views:', totalViewsData.totalViews);
      } catch (analyticsError: any) {
        const isAuthError = analyticsError.message?.includes('401') || analyticsError.message?.includes('Unauthorized');

        if (!isAuthError) {
          console.error('❌ Error fetching total views:', analyticsError);
        }

        // Check if it's an authentication error
        if (isAuthError) {
          console.log('🔐 Analytics access denied - using fallback calculation');
          // Fallback logic now safely uses the fetched articles
          const fallbackViews = fetchedArticles.reduce((sum, article) => sum + (article.views || 0), 0);
          setTotalViews(fallbackViews);
          toast({
            title: "Analytics Access Limited",
            description: "Using article view counts. Full analytics may require admin privileges.",
            variant: "default",
          });
        } else {
          // Other errors - still use fallback
          const fallbackViews = fetchedArticles.reduce((sum, article) => sum + (article.views || 0), 0);
          setTotalViews(fallbackViews);
          toast({
            title: "Analytics Warning",
            description: "Using fallback view calculation. Analytics may be unavailable.",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error('❌ Error fetching articles:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load articles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setViewsLoading(false);
      setIsFetching(false);
    }
  }, [toast, isFetching]);

  useEffect(() => {
    fetchDashboardData();
  }, []); // Only run once on mount - fetchDashboardData is stable due to useCallback

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);

      console.log('🗑️ Deleting article:', id);

      const result = await articleService.deleteArticle(id);
      if (!result.success) {
        throw new Error(result.error || "Failed to delete article");
      }

      // Remove from local state
      setArticles(articles.filter((a) => a.id !== id));

      toast({
        title: "Article deleted",
        description: "The article has been successfully deleted.",
      });
    } catch (error: any) {
      console.error('❌ Error deleting article:', error);

      // Handle specific error cases
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to delete this article.",
          variant: "destructive",
        });
      } else if (error.message?.includes('404') || error.message?.includes('Not found')) {
        toast({
          title: "Article Not Found",
          description: "The article may have already been deleted.",
          variant: "destructive",
        });
        // Remove from local state anyway
        setArticles(articles.filter((a) => a.id !== id));
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to delete article",
          variant: "destructive",
        });
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleTrending = async (article: Article) => {
    try {
      setUpdatingId(article.id);

      const updateData = {
        trending: !article.trending,
        trendingScore: !article.trending ? 85 : 0,
      };

      console.log('🔄 Toggling trending for article:', article.id, 'New state:', updateData.trending);

      const result = await articleService.updateArticle(article.id, updateData);

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to update article");
      }

      setArticles(prevArticles =>
        prevArticles.map(a => (a.id === article.id ? result.data! : a))
      );

      toast({
        title: "Article updated",
        description: `Article ${updateData.trending ? 'added to' : 'removed from'} trending.`,
      });
    } catch (error: any) {
      console.error('❌ Error updating article:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update article",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = {
    total: articles.length,
    trending: articles.filter((a) => a.trending).length,
    categories: new Set(articles.map((a) => a.category)).size,
    totalViews: totalViews,
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your blog articles</p>
            </div>
            <Button size="lg" disabled>
              <Plus className="h-5 w-5 mr-2" />
              New Article
            </Button>
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your blog articles and advertising</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button
              variant="outline"
              size="lg"
              onClick={fetchDashboardData}
              disabled={loading || viewsLoading}
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${(loading || viewsLoading) ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link to="/admin/ads">
              <Button variant="outline" size="lg">
                <DollarSign className="h-5 w-5 mr-2" />
                Ads Manager
              </Button>
            </Link>
            <Link to="/admin/editor">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Plus className="h-5 w-5 mr-2" />
                New Article
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trending</CardTitle>
              <TrendingUp className="h-4 w-4 text-trending" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.trending}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently trending articles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.categories}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All-time article views
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Create Article</h3>
                  <p className="text-sm text-muted-foreground">Write and publish new content</p>
                </div>
              </div>
              <Button className="w-full mt-4" asChild>
                <Link to="/admin/editor">
                  <Plus className="h-4 w-4 mr-2" />
                  New Article
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Ads Manager</h3>
                  <p className="text-sm text-muted-foreground">Manage advertising campaigns</p>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline" asChild>
                <Link to="/admin/ads">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Manage Ads
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Analytics</h3>
                  <p className="text-sm text-muted-foreground">View performance insights</p>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline" asChild>
                <Link to="/admin/analytics">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Author Management</h3>
                  <p className="text-sm text-muted-foreground">Manage authors and permissions</p>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline" asChild>
                <Link to="/admin/authors">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Authors
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Articles Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Articles ({articles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {articles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No articles found.</p>
                <Link to="/admin/editor">
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Article
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium max-w-md">
                        <div className="flex flex-col">
                          <div className="line-clamp-2 font-semibold">{article.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {article.slug}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{article.category}</Badge>
                      </TableCell>
                      <TableCell>{article.author.name}</TableCell>
                      <TableCell>
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{article.views || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleTrending(article)}
                            disabled={updatingId === article.id}
                            className="p-0 m-0 border-0 bg-transparent"
                            title={article.trending ? "Toggle trending off" : "Toggle trending on"}
                          >
                            <Badge 
                              variant={article.trending ? "default" : "outline"}
                              className={`cursor-pointer transition-all ${
                                article.trending 
                                  ? "bg-gradient-trending border-0 text-white" 
                                  : "hover:bg-muted"
                              } ${updatingId === article.id ? 'opacity-50' : ''}`}
                            >
                              {updatingId === article.id ? (
                                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                              ) : article.trending ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : null}
                              {updatingId === article.id ? "Updating..." : article.trending ? "Trending" : "Normal"}
                            </Badge>
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {/* View Live */}
                          <Link to={`/article/${article.slug}`} target="_blank">
                            <Button variant="ghost" size="icon" title="View Live">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          
                          {/* Edit - FIXED: Using slug instead of id */}
                          <Link to={`/admin/editor/${article.slug}`}>
                            <Button variant="ghost" size="icon" title="Edit Article">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          
                          {/* Delete */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                disabled={deletingId === article.id}
                                title="Delete Article"
                              >
                                {deletingId === article.id ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Article</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{article.title}"? This action cannot be undone and will permanently remove the article from your blog.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(article.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                  disabled={deletingId === article.id}
                                >
                                  {deletingId === article.id ? (
                                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                  ) : null}
                                  {deletingId === article.id ? "Deleting..." : "Delete Article"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Debug Info (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2 text-blue-800">Debug Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
                <div>
                  <strong>Articles Loaded:</strong> {articles.length}
                </div>
                <div>
                  <strong>User Status:</strong> {user ? 'Available' : 'Missing'}
                </div>
                <div>
                  <strong>First Article Slug:</strong> {articles[0]?.slug || 'N/A'}
                </div>
                <div>
                  <strong>Edit URLs:</strong> Using /admin/editor/{'{slug}'}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;