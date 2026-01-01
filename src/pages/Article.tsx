// src/pages/ArticlePage/ArticlePage.tsx
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  Calendar,
  Share2,
  //Facebook,
  //Twitter,
  //Linkedin,
  Heart,
  MessageCircle,
  Eye,
  User,
  //Bookmark,
  //Printer,
  Mail
} from 'lucide-react';
import { Header } from '@/components/Layout/Header';
import { ArticleSidebar } from '@/components/Articles/ArticleSidebar';
import CommentSection from '@/components/Articles/CommentSection';
import AdPlacement from '@/components/Ads/AdPlacement';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
//import { ShareMenu } from '@/components/ui/ShareMenu';
import { useArticle } from '@/hooks/useArticle';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { formatDate, getReadingTime } from '@/utils/dateUtils';
import { trackArticleView, trackShare } from '@/utils/analytics';
import { Article as ArticleType } from '@/types/article.types';

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showScrollProgress, setShowScrollProgress] = useState(false);
  const scrollProgress = useScrollProgress();
  
  const {
    article,
    loading,
    error,
    relatedArticles,
    trendingArticles,
    incrementViewCount,
    handleLike
  } = useArticle(slug || '');

 // Track article view - count only once per page load
useEffect(() => {
  if (article) {
    // Check if article is bookmarked
    const bookmarks = JSON.parse(localStorage.getItem('bookmarked_articles') || '[]');
    setIsBookmarked(bookmarks.includes(article.id));

    // Track initial view for analytics (for bounce rate, etc.)
    trackArticleView(article.id, article.title, article.category);

    // Note: View counting is now handled automatically by the useArticle hook
    // to prevent double counting and ensure it only happens once per page load
  }
}, [article]);

// Track engagement and scroll progress separately
useEffect(() => {
  if (article) {
    // Optional: Still track engagement for analytics purposes
    let engagementTracked = false;
    let maxScrollReached = 0;

    // Track engagement (for analytics, not for counting views)
    const handleEngagementTracking = () => {
      if (engagementTracked) return;

      // Update max scroll percentage
      if (scrollProgress > maxScrollReached) {
        maxScrollReached = scrollProgress;
      }

      // Track high engagement (optional analytics)
      if (maxScrollReached >= 50) {
        engagementTracked = true;
        trackEngagementLevel(article.id, 'high_engagement');
      }
    };

    // Set up timer for engagement tracking
    const engagementTimer = setTimeout(() => {
      if (!engagementTracked) {
        trackEngagementLevel(article.id, 'engaged');
        engagementTracked = true;
      }
    }, 30000);

    // Add scroll listener for engagement tracking
    let scrollTimeout;
    const throttledScrollCheck = () => {
      if (scrollTimeout) return;

      scrollTimeout = setTimeout(() => {
        handleEngagementTracking();
        scrollTimeout = null;
      }, 100);
    };

    window.addEventListener('scroll', throttledScrollCheck);

    // Cleanup function
    return () => {
      clearTimeout(engagementTimer);
      clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', throttledScrollCheck);
    };
  }
}, [article, scrollProgress]);

// Optional: Add a function to handle different types of views
const trackEngagementLevel = (articleId, level) => {
  // Levels could be: 'bounce', 'engaged', 'high_engagement'
  // Store in analytics for more detailed tracking
  console.log(`Article ${articleId}: ${level} engagement`);
};

// Optional: Reset view count after 24 hours for same user
const shouldResetViewCount = (articleId) => {
  const viewDataKey = `viewed_${articleId}_data`;
  const viewData = JSON.parse(sessionStorage.getItem(viewDataKey) || 'null');
  
  if (viewData) {
    const hoursSinceView = (Date.now() - viewData.timestamp) / (1000 * 60 * 60);
    return hoursSinceView >= 24; // Reset after 24 hours
  }
  return true;
};

  // Show scroll progress after scrolling 10%
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollProgress(window.scrollY > window.innerHeight * 0.1);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = (platform: string) => {
    if (!article) return;
    
    const shareUrl = window.location.href;
    const title = article.title;
    const text = article.excerpt;
    
    trackShare(article.id, platform);
    
    /*switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        break;
    }*/
  };

  const handleBookmark = () => {
    if (!article) return;
    
    const bookmarks = JSON.parse(localStorage.getItem('bookmarked_articles') || '[]');
    const newBookmarks = isBookmarked
      ? bookmarks.filter((id: string) => id !== article.id)
      : [...bookmarks, article.id];
    
    localStorage.setItem('bookmarked_articles', JSON.stringify(newBookmarks));
    setIsBookmarked(!isBookmarked);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderLoadingState = () => (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-8">
          {/* Header skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-3/4" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </div>
          
          {/* Featured image skeleton */}
          <Skeleton className="h-[400px] w-full rounded-xl" />
          
          {/* Content skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold">Article Not Found</h1>
          <p className="text-muted-foreground text-lg">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/')}>
              Return to Homepage
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return renderLoadingState();
  if (error || !article) return renderErrorState();

  const readingTime = getReadingTime(article.content);

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>
      <div className="pt-16">

      {/* Scroll progress bar */}
      {showScrollProgress && (
        <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-gradient-to-r from-blue-500 to-purple-500"
             style={{ width: `${scrollProgress}%` }} />
      )}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Article Header */}
        <article className="mb-12">
          {/* Category and Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Badge variant="secondary" className="text-sm">
              {article.category}
            </Badge>
            {article.tags?.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          {/* Article Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            {article.title}
          </h1>
          
          {/* Meta Information */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              {/* Author Avatar */}
              <div className="flex items-center gap-3">
                {article.author?.avatar ? (
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="h-12 w-12 rounded-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className="hidden h-12 w-12 rounded-full bg-muted items-center justify-center">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                
                <div>
                  <p className="font-medium">{article.author?.name || 'Unknown Author'}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <time dateTime={article.publishedAt} className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(article.publishedAt)}
                    </time>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {readingTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 relative z-10">              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/newsletter')}
                aria-label="Subscribe to newsletter"
              >
                <Mail className="h-5 w-5" />
              </Button>
              
            </div>
          </div>
          
          {/* Featured Image */}
          {article.featuredImage && (
            <div className="mb-8">
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-auto max-h-[500px] object-cover rounded-xl shadow-lg"
                loading="eager"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}
          
          {/* Header Ad */}
          <div className="mb-8">
            <AdPlacement 
              category={article.category} 
              position="article_header" 
              limit={1}
            />
          </div>
        </article>
        
        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Article Content */}
          <div className="lg:col-span-3">
            <div className="prose prose-lg max-w-none 
                          prose-headings:font-bold 
                          prose-h2:text-3xl 
                          prose-h3:text-2xl 
                          prose-p:text-gray-700 
                          prose-p:leading-relaxed
                          prose-img:rounded-lg
                          prose-img:shadow-md
                          prose-blockquote:border-l-4
                          prose-blockquote:border-primary
                          prose-blockquote:pl-4
                          prose-blockquote:italic
                          prose-ul:list-disc
                          prose-ol:list-decimal
                          prose-li:my-2
                          prose-a:text-primary
                          prose-a:underline
                          prose-a:hover:text-primary/80
                          dark:prose-invert
                          dark:prose-p:text-gray-300">
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>
            
            {/* Inline Ad */}
            <div className="my-12">
              <AdPlacement 
                category={article.category} 
                position="article_inline" 
                limit={1}
              />
            </div>
            
            {/* Tags Section */}
            {article.tags && article.tags.length > 0 && (
              <div className="mb-12">
                <h3 className="text-lg font-semibold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="text-sm cursor-pointer hover:bg-secondary/80 transition-colors"
                      onClick={() => navigate(`/tag/${tag.toLowerCase()}`)}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Share and Engagement Section */}
            <div className="border-t border-b py-6 mb-12">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLike(article.id)}
                    className="flex items-center gap-2"
                  >
                    <Heart className="h-5 w-5" />
                    <span>{article.likes || 0} Likes</span>
                  </Button>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="h-5 w-5" />
                    <span>{article.views || 0} views</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageCircle className="h-5 w-5" />
                    <span>{article.comments?.length || 0} comments</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/*<span className="text-sm text-muted-foreground">Share:</span>*/}
                  <div className="flex items-center gap-2">
                   {/* <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare('twitter')}
                      aria-label="Share on Twitter"
                    >
                      <Twitter className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare('facebook')}
                      aria-label="Share on Facebook"
                    >
                      <Facebook className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare('linkedin')}
                      aria-label="Share on LinkedIn"
                    >
                      <Linkedin className="h-5 w-5" />
                    </Button>*/}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Author Bio */}
            <div className="bg-card rounded-xl p-6 mb-12 border">
              <div className="flex items-start gap-4">
                {article.author?.avatar ? (
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="h-16 w-16 rounded-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold mb-2">About the Author</h3>
                  <p className="text-muted-foreground font-medium mb-2">
                    {article.author?.name || 'Unknown Author'}
                  </p>
                  {article.author?.bio && (
                    <p className="text-muted-foreground leading-relaxed">
                      {article.author.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <CommentSection
              article={article}
              onCommentAdded={() => {
                // Optionally refresh the article data to get updated comment count
                window.location.reload();
              }}
            />

            {/* Bottom Ad */}
            <div className="mb-12">
              <AdPlacement 
                category={article.category} 
                position="article_bottom" 
                limit={1}
              />
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ArticleSidebar
              relatedArticles={relatedArticles}
              trendingArticles={trendingArticles}
              category={article.category}
            />
          </div>
        </div>
      </main>
      
      <ScrollToTop />
      </div>
    </div>
  );
};

export default ArticlePage;