import { Article } from '@/types/article.types';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// ============================================
// SLUG & URL UTILITIES
// ============================================

/**
 * Generate a URL-friendly slug from a title
 */
export const generateSlugFromTitle = (title: string): string => {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 60); // Limit length
};

/**
 * Generate a canonical URL for an article
 */
export const generateArticleUrl = (article: Article): string => {
  const slug = article.slug || generateSlugFromTitle(article.title);
  return `/article/${slug}`;
};

// ============================================
// IMAGE UTILITIES
// ============================================

/**
 * Get optimized image URL with Cloudinary transformations
 */
export const getOptimizedImageUrl = (
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}
): string => {
  const { width = 1200, height = 630, quality = 'auto', format = 'auto' } = options;
  
  if (!url || url.includes('placeholder')) {
    return getPlaceholderImageUrl(width, height);
  }
  
  if (url.includes('cloudinary.com')) {
    const cloudinaryParams = [
      `c_fill`,
      `w_${width}`,
      `h_${height}`,
      `q_${quality}`,
      `f_${format}`,
      `fl_lossy`
    ].join(',');
    
    return url.replace('/upload/', `/upload/${cloudinaryParams}/`);
  }
  
  // For other CDNs or direct URLs, consider adding params if supported
  return url;
};

/**
 * Get category-specific featured image with fallback
 */
export const getCategoryImage = (category: string, featuredImage?: string): string => {
  if (featuredImage && !featuredImage.includes('placeholder')) {
    return getOptimizedImageUrl(featuredImage, { width: 1200, height: 630 });
  }
  
  const baseUrl = 'https://res.cloudinary.com/demo/image/upload';
  const optimizationParams = 'c_fill,w_1200,h_630,q_auto,f_auto,fl_lossy';
  
  const categoryMap: Record<string, string> = {
    'tax fundamentals & filing': 'v1/categories/tax-fundamentals',
    'tax fundamentals and filing': 'v1/categories/tax-fundamentals',
    'deductions & credits': 'v1/categories/deductions-credits',
    'deductions and credits': 'v1/categories/deductions-credits',
    'investment & retirement taxes': 'v1/categories/investment-retirement',
    'investment and retirement taxes': 'v1/categories/investment-retirement',
    'irs interactions & tax law': 'v1/categories/irs-interactions',
    'irs interactions and tax law': 'v1/categories/irs-interactions',
    'business taxes': 'v1/categories/business-taxes',
    'estate & gift taxes': 'v1/categories/estate-taxes',
    'state taxes': 'v1/categories/state-taxes',
    'tax planning': 'v1/categories/tax-planning',
    'news & updates': 'v1/categories/news-updates'
  };
  
  const categoryKey = category.toLowerCase().trim();
  const imagePath = categoryMap[categoryKey] || 'v1/categories/default-article';
  
  return `${baseUrl}/${optimizationParams}/${imagePath}`;
};

/**
 * Get placeholder image URL for loading states
 */
export const getPlaceholderImageUrl = (width = 1200, height = 630): string => {
  return `https://res.cloudinary.com/demo/image/upload/c_fill,w_${width},h_${height},q_10,f_auto/v1/placeholders/article-placeholder`;
};

// ============================================
// DATE & TIME UTILITIES
// ============================================

/**
 * Format date with intelligent relative time
 */
export const formatDate = (
  dateString: string, 
  format: 'short' | 'long' | 'relative' = 'short',
  locale: string = 'en-US'
): string => {
  if (!dateString) return 'Unknown date';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';
  
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  
  if (format === 'relative') {
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}mo ago`;
    
    return `${Math.floor(diffInDays / 365)}y ago`;
  }
  
  if (format === 'short') {
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString(locale, { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
  
  // Long format
  return date.toLocaleDateString(locale, { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

/**
 * Calculate reading time in minutes based on word count
 */
export const calculateReadingTime = (
  wordCount: number = 500,
  wordsPerMinute: number = 200
): number => {
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

/**
 * Format reading time with context
 */
export const formatReadingTime = (minutes: number): string => {
  if (minutes < 1) return 'Quick read';
  if (minutes === 1) return '1 min read';
  if (minutes < 5) return `${minutes} min read`;
  if (minutes < 15) return `${minutes} min read`;
  return `${minutes} min read`;
};

// ============================================
// ANALYTICS & TRACKING
// ============================================

/**
 * Track article click/impression for analytics
 */
export const trackArticleClick = (
  article: Article, 
  position: string,
  eventType: 'click' | 'impression' = 'click'
): void => {
  if (typeof window === 'undefined') return;
  
  const eventData = {
    event: eventType === 'click' ? 'article_click' : 'article_view',
    article_id: article.id,
    article_title: article.title,
    article_slug: article.slug || generateSlugFromTitle(article.title),
    category: article.category,
    author: article.author?.name || 'Unknown',
    position,
    timestamp: new Date().toISOString(),
    engagement_score: calculateEngagementScore(article)
  };
  
  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', eventType === 'click' ? 'select_content' : 'view_item', {
      content_type: 'article',
      item_id: article.id,
      item_name: article.title,
      item_category: article.category
    });
  }
  
  // Data Layer for GTM
  if (window.dataLayer) {
    window.dataLayer.push(eventData);
  }
  
  // Custom event for internal tracking
  window.dispatchEvent(new CustomEvent('article_interaction', { detail: eventData }));
  
  // Store in localStorage for recommendations (only on click)
  if (eventType === 'click') {
    storeArticleInteraction(article);
  }
};

/**
 * Store article interaction for personalized recommendations
 */
const storeArticleInteraction = (article: Article): void => {
  try {
    const storageKey = 'article_interaction_history';
    const maxHistory = 50;
    
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const interaction = {
      id: article.id,
      title: article.title,
      category: article.category,
      tags: article.tags || [],
      author: article.author?.name,
      timestamp: new Date().toISOString()
    };
    
    // Remove duplicate entries for same article
    const filtered = existing.filter((item: any) => item.id !== article.id);
    const updatedHistory = [interaction, ...filtered].slice(0, maxHistory);
    
    localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
  } catch (error) {
    console.warn('Failed to store article interaction:', error);
  }
};

// ============================================
// ENGAGEMENT & METRICS UTILITIES
// ============================================

/**
 * Calculate comprehensive engagement score (0-100)
 */
export const calculateEngagementScore = (article: Article): number => {
  const {
    views = 0,
    likes = 0,
    comments = [],
    shares = 0
  } = article;

  // Weights for different engagement types
  const weights = {
    view: 0.1,
    like: 0.3,
    comment: 0.5,
    share: 0.7
  };

  // Normalize scores (prevent any single metric from dominating)
  const normalizedViews = Math.min(views / 1000, 1);
  const normalizedLikes = Math.min(likes / 500, 1);
  const normalizedComments = Math.min((comments?.length || 0) / 100, 1);
  const normalizedShares = Math.min(shares / 50, 1);

  // Calculate weighted score
  const score = (
    normalizedViews * weights.view +
    normalizedLikes * weights.like +
    normalizedComments * weights.comment +
    normalizedShares * weights.share
  ) * 25; // Scale to 0-100

  return Math.min(100, Math.round(score * 10) / 10); // Cap at 100, round to 1 decimal
};

/**
 * Calculate engagement rate percentage
 */
export const calculateEngagementRate = (article: Article): number => {
  if (!article.views || article.views === 0) return 0;

  const totalEngagement = article.likes + (article.comments?.length || 0) + (article.shares || 0);
  const rate = (totalEngagement / article.views) * 100;

  return Math.round(rate * 10) / 10; // Round to 1 decimal place
};

/**
 * Format numbers for display (1k, 1.5M, etc.)
 */
export const formatCompactNumber = (num: number): string => {
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toLocaleString();
};

/**
 * Get trending status based on engagement metrics
 */
export const isTrendingArticle = (article: Article): boolean => {
  const engagementScore = calculateEngagementScore(article);
  const engagementRate = calculateEngagementRate(article);
  
  return engagementScore > 70 || engagementRate > 15 || article.trending === true;
};

/**
 * Get article difficulty level
 */
export const getDifficultyLevel = (
  difficulty?: string
): { label: string; color: string; icon: string } => {
  switch (difficulty?.toLowerCase()) {
    case 'beginner':
      return { 
        label: 'Beginner', 
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: '🎯'
      };
    case 'intermediate':
      return { 
        label: 'Intermediate', 
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: '⚡'
      };
    case 'advanced':
      return { 
        label: 'Advanced', 
        color: 'bg-rose-100 text-rose-800 border-rose-200',
        icon: '🚀'
      };
    case 'expert':
      return { 
        label: 'Expert', 
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: '🏆'
      };
    default:
      return { 
        label: 'All Levels', 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: '📚'
      };
  }
};

// ============================================
// CONTENT VALIDATION & SANITIZATION
// ============================================

/**
 * Validate article data structure
 */
export const validateArticle = (article: Partial<Article>): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (!article.id) errors.push('Article ID is required');
  if (!article.title?.trim()) errors.push('Article title is required');
  if (!article.content?.trim()) errors.push('Article content is required');
  if (!article.category?.trim()) errors.push('Article category is required');
  if (!article.author?.name?.trim()) errors.push('Author name is required');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize article excerpt (remove HTML, limit length)
 */
export const sanitizeExcerpt = (
  content: string,
  maxLength: number = 200
): string => {
  if (!content) return '';
  
  // Remove HTML tags
  const text = content.replace(/<[^>]*>/g, '');
  
  // Trim and add ellipsis if needed
  if (text.length <= maxLength) return text.trim();
  
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Extract key points/takeaways from content
 */
export const extractKeyPoints = (
  content: string,
  maxPoints: number = 3
): string[] => {
  const points: string[] = [];
  
  // Look for bullet points, numbered lists, or section headers
  const bulletRegex = /•\s*(.+?)(?=\n|$)/g;
  const numberRegex = /\d+\.\s*(.+?)(?=\n|$)/g;
  const headingRegex = /<h[23]>(.+?)<\/h[23]>/gi;
  
  let match;
  
  // Extract bullet points
  while ((match = bulletRegex.exec(content)) !== null && points.length < maxPoints) {
    points.push(match[1].trim());
  }
  
  // Extract numbered items
  while ((match = numberRegex.exec(content)) !== null && points.length < maxPoints) {
    points.push(match[1].trim());
  }
  
  // Extract headings
  while ((match = headingRegex.exec(content)) !== null && points.length < maxPoints) {
    points.push(match[1].replace(/<[^>]*>/g, '').trim());
  }
  
  // Fallback: extract first few sentences
  if (points.length === 0) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    points.push(...sentences.slice(0, maxPoints).map(s => s.trim()));
  }
  
  return points;
};

// ============================================
// EXPORT ALL UTILITIES
// ============================================

export default {
  // Slug & URL
  generateSlugFromTitle,
  generateArticleUrl,
  
  // Image
  getOptimizedImageUrl,
  getCategoryImage,
  getPlaceholderImageUrl,
  
  // Date & Time
  formatDate,
  calculateReadingTime,
  formatReadingTime,
  
  // Analytics
  trackArticleClick,
  
  // Engagement & Metrics
  calculateEngagementScore,
  calculateEngagementRate,
  formatCompactNumber,
  isTrendingArticle,
  getDifficultyLevel,
  
  // Validation
  validateArticle,
  sanitizeExcerpt,
  extractKeyPoints
};