import { useState, useMemo } from 'react';
import { Link } from "react-router-dom";
import { 
  TrendingUp, 
  User, 
  Eye, 
  Heart, 
  Clock, 
  ArrowRight, 
  Sparkles,
  Bookmark,
  MessageCircle,
  BarChart3,
  Award,
  CalendarDays
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Helmet } from 'react-helmet-async';
import { Article, ArticleCardProps } from '@/types/article.types';
import { 
  generateSlugFromTitle, 
  formatDate, 
  trackArticleClick,
  calculateEngagementRate,
  formatCompactNumber
} from '@/utils/article.utils';
import { ArticleImage } from './ArticleImage';
import { cn } from '@/lib/utils';

export const ArticleCard = ({ article, variant = 'default', className = '', index = 0 }: ArticleCardProps) => {
  // Memoized values
  const articleSlug = useMemo(() =>
    article.slug || generateSlugFromTitle(article.title) || `article-${article.id}`
  , [article.slug, article.title, article.id]);

  const formattedDate = useMemo(() =>
    formatDate(article.publishedAt, 'short')
  , [article.publishedAt]);

  const showTrending = useMemo(() =>
    article.trending || (article.trendingScore && article.trendingScore > 70)
  , [article.trending, article.trendingScore]);

  const isFeatured = useMemo(() =>
    article.featured || index === 0
  , [article.featured, index]);

  const engagementRate = useMemo(() =>
    calculateEngagementRate(article)
  , [article]);

  const formattedViews = useMemo(() =>
    formatCompactNumber(article.views)
  , [article.views]);

  // State
  const [isHovered, setIsHovered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(article.bookmarked || false);

  // Validation
  if (!article.id || !article.title) {
    return (
      <Card className="h-full overflow-hidden border border-gray-200 bg-white rounded-xl shadow-xs">
        <div className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
            <Sparkles className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm font-medium">Content Coming Soon</p>
          <p className="text-gray-400 text-xs mt-1">Stay Tuned</p>
        </div>
      </Card>
    );
  }

  // Event handlers
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    trackArticleClick(article, variant);
    
    setTimeout(() => {
      window.location.href = `/article/${articleSlug}`;
    }, 50);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  // Card styles
  const cardStyles = {
    default: {
      container: 'h-full overflow-hidden border border-gray-200 bg-white rounded-xl shadow-xs hover:shadow-md transition-all duration-300',
      image: 'h-48',
      title: 'text-base font-semibold text-gray-900 leading-snug',
    },
    compact: {
      container: 'h-auto overflow-hidden border border-gray-200 bg-white rounded-lg shadow-xs hover:shadow-sm transition-all duration-300',
      image: 'h-36',
      title: 'text-sm font-semibold text-gray-900 leading-tight',
    },
    featured: {
      container: 'h-full overflow-hidden border border-gray-300 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300',
      image: 'h-56',
      title: 'text-lg font-semibold text-gray-900 leading-tight',
    }
  };

  const variantStyle = cardStyles[variant] || cardStyles.default;

  return (
    <>
      <Helmet>
        {index < 3 && (
          <link rel="preload" as="image" href={article.featuredImage} />
        )}
      </Helmet>

      <Link
        to={`/article/${articleSlug}`}
        onClick={handleClick}
        className={cn(`block group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-1 ${className}`)}
        aria-label={`Read article: ${article.title}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card className={cn(variantStyle.container, "relative overflow-hidden")}>
          {/* Premium Badge */}
          {isFeatured && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0 text-white font-medium text-xs px-2.5 py-1 shadow-md">
                <Sparkles className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            </div>
          )}

          {/* Bookmark Button */}
          <div className="absolute top-3 right-3 z-10">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleBookmark}
                    className={cn(
                      "h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center",
                      "border border-gray-300/50 shadow-sm transition-all duration-200",
                      "hover:bg-white hover:shadow-md hover:scale-105",
                      isBookmarked && "bg-blue-50 border-blue-200"
                    )}
                  >
                    <Bookmark className={cn(
                      "h-4 w-4 transition-colors",
                      isBookmarked 
                        ? "fill-blue-500 text-blue-500" 
                        : "text-gray-400 group-hover:text-gray-600"
                    )} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p className="text-xs">{isBookmarked ? 'Remove bookmark' : 'Save article'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Image Section */}
          <div className="relative overflow-hidden">
            <div className={cn(
              variantStyle.image,
              "bg-gradient-to-br from-gray-100 to-gray-200"
            )}>
              <ArticleImage
                src={article.featuredImage}
                alt={article.title}
                category={article.category}
                priority={index < 3}
                className={cn(
                  "w-full h-full object-cover transition-transform duration-500",
                  isHovered && "scale-105"
                )}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>

            {/* Category Badge */}
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-white/95 backdrop-blur-sm text-gray-800 font-medium text-xs px-3 py-1.5 border border-white/50 shadow-sm">
                {article.category}
              </Badge>
            </div>

            {/* Trending Badge */}
            {showTrending && (
              <div className="absolute bottom-3 right-3">
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 border-0 text-white font-medium text-xs px-3 py-1.5 shadow-md">
                  <TrendingUp className="h-3 w-3 mr-1.5" />
                  Trending
                </Badge>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-4">
            {/* Title */}
            <h3 className={cn(
              variantStyle.title,
              "mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200"
            )}>
              {article.title}
            </h3>

            {/* Excerpt */}
            <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
              {article.excerpt}
            </p>

            {/* Author & Metadata */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  {article.author?.avatar ? (
                    <img
                      src={article.author.avatar}
                      alt={article.author.name}
                      className="h-6 w-6 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                      <User className="h-3 w-3 text-gray-500" />
                    </div>
                  )}
                  <span className="text-sm text-gray-700 font-medium">
                    {article.author?.name || "Anonymous"}
                  </span>
                </div>
                
                {/* Divider */}
                <div className="w-1 h-1 rounded-full bg-gray-300" />
                
                {/* Date */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <CalendarDays className="h-3 w-3" />
                  {formattedDate}
                </div>
              </div>

              {/* Reading Time */}
              {article.readTime && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {article.readTime} min
                </div>
              )}
            </div>

            {/* Engagement Stats */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-4">
                {/* Views */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Eye className="h-3.5 w-3.5" />
                        <span className="font-medium">{formattedViews}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Total views</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Likes */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Heart className={cn(
                          "h-3.5 w-3.5",
                          article.likes > 100 && "text-red-500"
                        )} />
                        <span className="font-medium">{formatCompactNumber(article.likes)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Likes</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Comments */}
                {article.comments && article.comments.length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span className="font-medium">{formatCompactNumber(article.comments.length)}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Comments</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {/* Engagement Rate */}
                {engagementRate > 10 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <BarChart3 className="h-3.5 w-3.5 text-green-500" />
                          <span className="font-medium">{engagementRate}%</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Engagement rate</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              {/* Premium Indicator */}
              {article.premium && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <Award className="h-4 w-4 text-amber-500" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Premium content</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {article.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={`${tag}-${idx}`}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md font-medium"
                  >
                    #{tag}
                  </span>
                ))}
                {article.tags.length > 3 && (
                  <span className="text-xs px-2 py-1 text-gray-500 font-medium">
                    +{article.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* CTA Button */}
            <div className={cn(
              "mt-4 pt-3 border-t border-gray-100",
              "flex items-center justify-between",
              "group-hover:border-gray-200 transition-colors duration-200"
            )}>
              <span className="text-sm text-gray-600">
                Published in <span className="font-medium text-gray-800">{article.category}</span>
              </span>
              <div className="flex items-center gap-1 text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors">
                <span>Read</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </>
  );
};