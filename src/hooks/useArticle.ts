import { useState, useEffect, useRef } from 'react';
import { articleService } from '@/services/articleService';
import { Article } from '@/types/article.types';

export const useArticle = (slug: string) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([]);
  const viewRecordedRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchArticleData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [articleData, relatedData, trendingData] = await Promise.all([
          articleService.getArticleBySlug(slug),
          articleService.getRelatedArticles(slug, 3),
          articleService.getTrendingArticles(5)
        ]);
        
        setArticle(articleData);
        setRelatedArticles(relatedData);
        setTrendingArticles(trendingData);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load article');
        console.error('Error fetching article:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticleData();
    }
  }, [slug]);

  // Google-like behavior: Automatically record view when article is loaded
  useEffect(() => {
    if (article?.id && viewRecordedRef.current !== article.id) {
      // Mark as recorded immediately to prevent race conditions or duplicate calls
      viewRecordedRef.current = article.id;
      
      const recordView = async () => {
        try {
          await articleService.incrementViewCount(article.id);
        } catch (err) {
          console.error('Failed to record view:', err);
        }
      };
      recordView();
    }
  }, [article?.id]); // Depend only on ID to prevent re-runs on other state changes (like scroll/likes)

  const incrementViewCount = async () => {
    if (article) {
      await articleService.incrementViewCount(article.id);
    }
  };

  const handleLike = async (articleId: string) => {
    try {
      await articleService.likeArticle(articleId);
      setArticle(prev => prev ? { ...prev, likes: (prev.likes || 0) + 1 } : null);
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  return {
    article,
    loading,
    error,
    relatedArticles,
    trendingArticles,
    incrementViewCount,
    handleLike
  };
};