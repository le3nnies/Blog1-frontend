import { Article } from '@/types/article.types';

/**
 * Calculate total views from an array of articles
 * @param articles Array of articles
 * @returns Total views count
 */
export const calculateTotalViews = (articles: Article[]): number => {
  return articles.reduce((sum, article) => sum + (article.views || 0), 0);
};

/**
 * Calculate article statistics
 * @param articles Array of articles
 * @returns Object containing various statistics
 */
export const calculateArticleStats = (articles: Article[]) => {
  return {
    total: articles.length,
    trending: articles.filter((a) => a.trending).length,
    categories: new Set(articles.map((a) => a.category)).size,
    totalViews: calculateTotalViews(articles),
  };
};
