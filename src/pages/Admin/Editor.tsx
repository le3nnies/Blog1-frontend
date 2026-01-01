import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Eye, RefreshCw } from "lucide-react";
import { Layout } from "@/components/Layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Article } from "@/data/articles.types";
import { articleService } from "@/services/articleService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import AuthorSelect from "@/pages/Admin/AuthorSelect";

interface Author {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: string;
}
const API_URL = import.meta.env.REACT_APP_API_BASE_URL;

const ArticleEditor: React.FC = () => {
  const { user } = useAuth();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isEditing = !!slug;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "Tax Fundamentals & Filing",
    tags: "",
    slug: "",
    trending: false,
    trendingScore: 50,
    readTime: "5 min read",
    featuredImage: "/placeholder.svg",
    status: "published",
    author: "",
  });

  const [authors, setAuthors] = useState<Author[]>([]);

  // Debug: Check what we're getting from the URL
  useEffect(() => {
    console.log('🔍 ArticleEditor Debug:');
    console.log('URL Slug:', slug);
    console.log('Is Editing:', isEditing);
    console.log('User available:', !!user);
    console.log('Full URL:', window.location.href);
  }, [slug, isEditing, user]);

  // Fetch article data if editing
  useEffect(() => {
    if (isEditing && slug) {
      fetchArticle();
    } else if (isEditing) {
      // If we're supposed to be editing but no valid slug, show error
      setLoading(false);
      toast({
        title: "Invalid Article",
        description: "No valid article slug provided for editing.",
        variant: "destructive",
      });
    }
  }, [slug, isEditing]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      console.log('📥 Fetching article with slug:', slug);
      
      // Validate slug before making the request
      if (!slug || slug === 'undefined') {
        throw new Error('Invalid slug provided: ' + slug);
      }
      
      const fetchedArticle = await articleService.getArticleBySlug(slug);
      console.log('✅ Fetched article:', fetchedArticle);
      
      setArticle(fetchedArticle);
      setFormData({
        title: fetchedArticle.title,
        excerpt: fetchedArticle.excerpt,
        content: fetchedArticle.content,
        category: fetchedArticle.category,
        tags: fetchedArticle.tags.join(", "),
        slug: fetchedArticle.slug,
        trending: fetchedArticle.trending || false,
        trendingScore: fetchedArticle.trendingScore || 50,
        readTime: fetchedArticle.readTime,
        featuredImage: fetchedArticle.featuredImage || "/placeholder.svg",
        status: "published",
        author: typeof fetchedArticle.author === 'object' ? fetchedArticle.author._id : fetchedArticle.author || "",
      });
    } catch (error: any) {
      console.error('❌ Error fetching article:', error);
      toast({
        title: "Error Loading Article",
        description: error.message || "Failed to load article. It may have been deleted or the URL is incorrect.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🚀 Submit clicked - User available:', !!user);
    console.log('Form data:', formData);

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create articles",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    try {
      setSaving(true);

      // Prepare article data for backend
      const articleData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        category: formData.category,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
        slug: formData.slug,
        metaTitle: formData.title,
        metaDescription: formData.excerpt,
        readTime: parseInt(formData.readTime) || 5,
        featuredImage: formData.featuredImage,
        status: formData.status as 'draft' | 'published',
        ...(isEditing ? {} : { publishedAt: new Date().toISOString() })
      };

      console.log('📦 Article data being sent:', articleData);

      let url, method;

      if (isEditing && article) {
        // Use the article ID for updates
        url = `${API_URL}/api/articles/${article.id}`;
        method = 'PUT';
        console.log('🔄 Updating existing article with ID:', article.id);
      } else {
        url = `${API_URL}/api/articles`;
        method = 'POST';
        console.log('🆕 Creating new article');
      }

      console.log('📤 Making request:', method, url);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(articleData),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response OK:', response.ok);

      if (response.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem('authToken');
        toast({
          title: "Session Expired",
          description: "Please log in again",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      if (response.status === 404) {
        throw new Error('API endpoint not found. Check your backend routes.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        let errorMessage = `Failed to ${isEditing ? 'update' : 'create'} article: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // Not JSON, use the text as is
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Success response:', result);

      toast({
        title: isEditing ? "Article updated" : "Article created",
        description: isEditing 
          ? "Your article has been successfully updated."
          : "Your new article has been published.",
      });
      
      navigate("/admin");
    } catch (error: any) {
      console.error('❌ Error saving article:', error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditing ? 'update' : 'create'} article`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Auto-generate slug when title changes
  useEffect(() => {
    if (!isEditing && formData.title && !formData.slug) {
      const generatedSlug = generateSlug(formData.title);
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title, isEditing]);

  // Update read time based on content length
  useEffect(() => {
    if (formData.content) {
      const wordCount = formData.content.split(/\s+/).length;
      const readTimeMinutes = Math.ceil(wordCount / 200); // 200 words per minute
      setFormData(prev => ({
        ...prev,
        readTime: `${readTimeMinutes} min read`
      }));
    }
  }, [formData.content]);

  // Fetch authors for preview
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const result = await articleService.getAuthors();
        if (result.success && result.data) {
          setAuthors(result.data);
        }
      } catch (error) {
        console.error('Error fetching authors:', error);
      }
    };

    if (user?.role === 'admin') {
      fetchAuthors();
    }
  }, [user]);

  // Show error if we have an invalid slug in edit mode
  if (isEditing && !slug) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Invalid Article URL</h1>
          <p className="text-muted-foreground mb-6">
            The article URL is invalid. Please check the link and try again.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link to="/admin/dashboard">Back to Articles</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/editor">Create New Article</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Articles
            </Button>
            <div>
              <h1 className="text-4xl font-bold">Loading Article...</h1>
              <p className="text-muted-foreground">Slug: {slug}</p>
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
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header with Debug Info */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Articles
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold">
              {isEditing ? "Edit Article" : "Create New Article"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditing ? `Editing: ${slug}` : "Write and publish a new article"}
            </p>
          </div>
          {isEditing && article && (
                <Button variant="outline" asChild>
                  <Link to={`/article/${article.slug}`} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-4 w-4 mr-2" />
                    View Live
                  </Link>
                </Button>
              )}
        </div>

        {/* Debug Info Card */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mb-6 bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>URL Slug:</strong> {slug || 'N/A'}
                </div>
                <div>
                  <strong>Editing Mode:</strong> {isEditing ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Article ID:</strong> {article?.id || 'N/A'}
                </div>
                <div>
                  <strong>User:</strong> {user ? 'Available' : 'Missing'}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="content" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Article Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter article title..."
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt *</Label>
                    <Textarea
                      id="excerpt"
                      placeholder="Write a brief summary..."
                      value={formData.excerpt}
                      onChange={(e) => handleChange("excerpt", e.target.value)}
                      rows={3}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      This will be used as the meta description and article preview.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Content (HTML) *</Label>
                    <Textarea
                      id="content"
                      placeholder="Write your article content in HTML..."
                      value={formData.content}
                      onChange={(e) => handleChange("content", e.target.value)}
                      rows={15}
                      className="font-mono text-sm"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      You can use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;blockquote&gt;, etc.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Article Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleChange("category", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tax Fundamentals & Filing">Tax Fundamentals & Filing</SelectItem>
                          <SelectItem value="Deductions & Credits">Deductions & Credits</SelectItem>
                          <SelectItem value="Investment & Retirement Taxes">Investment & Retirement Taxes</SelectItem>
                          <SelectItem value="IRS Interactions & Tax Law">IRS Interactions & Tax Law</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => handleChange("status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <AuthorSelect
                    value={formData.author}
                    onChange={(value) => handleChange("author", value)}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      placeholder="article-url-slug"
                      value={formData.slug}
                      onChange={(e) => handleChange("slug", e.target.value)}
                      required
                    />
                    {!isEditing && (
                      <p className="text-xs text-muted-foreground">
                        Slug will be auto-generated from title. Make sure it's unique!
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="featuredImage">Featured Image URL</Label>
                    <Input
                      id="featuredImage"
                      placeholder="/images/featured-image.jpg"
                      value={formData.featuredImage}
                      onChange={(e) => handleChange("featuredImage", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use a high-quality image for better engagement. Recommended size: 1200x630px
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      placeholder="AI, Technology, Innovation, Future"
                      value={formData.tags}
                      onChange={(e) => handleChange("tags", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Add relevant tags to help users discover your content
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="trending">Mark as Trending</Label>
                        <p className="text-sm text-muted-foreground">
                          Display this article in trending sections
                        </p>
                      </div>
                      <Switch
                        id="trending"
                        checked={formData.trending}
                        onCheckedChange={(checked) => handleChange("trending", checked)}
                      />
                    </div>

                    {formData.trending && (
                      <div className="space-y-2">
                        <Label htmlFor="trendingScore">
                          Trending Score: {formData.trendingScore}
                        </Label>
                        <input
                          type="range"
                          id="trendingScore"
                          min="1"
                          max="100"
                          value={formData.trendingScore}
                          onChange={(e) => handleChange("trendingScore", parseInt(e.target.value))}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          Higher scores appear more prominently in trending lists
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview">
              <Card>
                <CardHeader>
                  <CardTitle>Article Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {formData.featuredImage && formData.featuredImage !== "/placeholder.svg" && (
                      <img
                        src={formData.featuredImage}
                        alt="Featured"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    )}
                    
                    <div>
                      <h1 className="text-4xl font-bold mb-4">{formData.title || "Untitled Article"}</h1>
                      <p className="text-lg text-muted-foreground mb-4">{formData.excerpt}</p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                        <span>By {authors.find(author => author._id === formData.author)?.username || 'Unknown Author'}</span>
                        <span>•</span>
                        <span>{formData.readTime}</span>
                        <span>•</span>
                        <span>{formData.category}</span>
                      </div>
                    </div>
                    
                    <div
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: formData.content || "<p>Start writing your article content...</p>" 
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin")}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90"
              disabled={saving || !formData.title || !formData.content || !formData.slug}
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? "Saving..." : (isEditing ? "Update Article" : "Publish Article")}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ArticleEditor;