import { Link } from "react-router-dom";
import { TrendingUp, Clock, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Article } from "@/data/articles.types";
import { articleService } from "@/services/articleService";

// Helper function to generate slug from title if missing
const generateSlugFromTitle = (title: string): string => {
  if (!title) return 'unknown-article';
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// Ensure article has a valid slug
const ensureArticleSlug = (article: Article): Article => {
  const validSlug = article.slug || generateSlugFromTitle(article.title) || `article-${article.id}`;
  return {
    ...article,
    slug: validSlug
  };
};

export const TrendingWidget = () => {
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrendingArticles();
  }, []);

  const fetchTrendingArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching trending articles...');
      
      const articles = await articleService.getTrendingArticles(5);
      
      // DEBUG: Check what we received
      console.log('📊 Raw trending articles:', articles);
      articles.forEach((article, index) => {
        console.log(`Trending ${index + 1}:`, {
          id: article.id,
          title: article.title,
          slug: article.slug,
          hasSlug: !!article.slug
        });
      });

      // Ensure all articles have valid slugs
      const articlesWithValidSlugs = articles.map(ensureArticleSlug);
      
      // Filter out any articles that still don't have valid data
      const validArticles = articlesWithValidSlugs.filter(article => 
        article.id && 
        article.title && 
        article.slug && 
        article.slug !== 'undefined'
      );

      console.log('✅ Valid trending articles after processing:', validArticles);
      setTrendingArticles(validArticles);
      
    } catch (err: any) {
      console.error('❌ Error fetching trending articles:', err);
      setError(err.message || 'Failed to load trending articles');
      setTrendingArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const getTrendingLevel = (index: number, trendingScore?: number) => {
    if (index === 0) return { color: 'bg-red-500', label: 'Hot' };
    if (index === 1) return { color: 'bg-orange-500', label: 'Trending' };
    if (index === 2) return { color: 'bg-yellow-500', label: 'Popular' };
    return { color: 'bg-blue-500', label: 'Trending' };
  };

  const handleArticleClick = (article: Article) => {
    console.log('🔗 Trending article clicked:', {
      id: article.id,
      title: article.title,
      slug: article.slug
    });
    
    // Safety check - this should never happen with our fixes
    if (!article.slug || article.slug === 'undefined') {
      console.error('🚨 Invalid slug in trending article click:', article);
      // You could show a toast notification here
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Trending Now
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Trending Now
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">
              Failed to load trending articles
            </p>
            <button 
              onClick={fetchTrendingArticles}
              className="text-xs text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (trendingArticles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Trending Now
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              No trending articles yet
            </p>
            <button 
              onClick={fetchTrendingArticles}
              className="text-xs text-primary hover:underline mt-2"
            >
              Refresh
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          Trending Now
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {trendingArticles.map((article, index) => {
          const trendingInfo = getTrendingLevel(index, article.trendingScore);
          
          return (
            <Link
              key={article.id}
              to={`/article/${article.slug}`}
              onClick={() => handleArticleClick(article)}
              className="block group"
            >
              <div className="flex gap-3 p-2 rounded-lg group-hover:bg-accent transition-colors">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full ${trendingInfo.color} flex items-center justify-center text-white font-bold text-sm`}>
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {article.category || 'General'}
                    </Badge>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${trendingInfo.color} text-white`}>
                      {trendingInfo.label}
                    </span>
                  </div>
                  
                  <h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors text-sm leading-tight">
                    {article.title}
                  </h4>
                  
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {article.readTime || '5 min read'}
                    </span>
                    {article.views && article.views > 0 && (
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {article.views}
                      </span>
                    )}
                    {article.trendingScore && (
                      <span className="text-orange-500 font-medium">
                        {Math.round(article.trendingScore)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
};