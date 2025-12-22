import { useCallback } from 'react';
import { Article } from '@/types/article.types';

export const useArticleAnalytics = () => {
  const trackImpression = useCallback((article: Article, position: string) => {
    if (typeof window === 'undefined' || !window.gtag) return;
    
    window.gtag('event', 'article_impression', {
      article_id: article.id,
      article_title: article.title,
      category: article.category,
      position,
      timestamp: new Date().toISOString()
    });
  }, []);

  const trackClick = useCallback((article: Article, position: string) => {
    if (typeof window === 'undefined') return;
    
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', 'article_click', {
        article_id: article.id,
        article_title: article.title,
        category: article.category,
        position,
        author: article.author?.name,
        timestamp: new Date().toISOString()
      });
    }
    
    // Store for recommendations
    try {
      const history = JSON.parse(localStorage.getItem('article_view_history') || '[]');
      const updatedHistory = [
        {
          id: article.id,
          title: article.title,
          category: article.category,
          timestamp: new Date().toISOString()
        },
        ...history.slice(0, 49)
      ];
      localStorage.setItem('article_view_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving view history:', error);
    }
  }, []);

  return { trackImpression, trackClick };
};