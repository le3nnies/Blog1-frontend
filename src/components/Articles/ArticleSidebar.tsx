import { Article } from '@/types/article.types';
import { NewsletterSignup } from '@/components/Sidebar/NewsletterSignup';
import AdPlacement from '@/components/Ads/AdPlacement';
import { ArticleCardCompact } from './ArticleCardCompact';

interface ArticleSidebarProps {
  relatedArticles: Article[];
  trendingArticles: Article[];
  category: string;
}

export const ArticleSidebar = ({ 
  relatedArticles, 
  trendingArticles, 
  category 
}: ArticleSidebarProps) => {
  return (
    <div className="space-y-8">
      {/* Sticky container */}
      <div className="lg:sticky lg:top-24 space-y-8">
        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="bg-card rounded-xl p-6 border">
            <h3 className="text-lg font-bold mb-4">Related Articles</h3>
            <div className="space-y-4">
              {relatedArticles.map((article) => (
                <ArticleCardCompact key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}

        {/* Sidebar Ads */}
        <AdPlacement 
          category={category} 
          position="sidebar" 
          limit={2}
        />

        {/* Trending Articles */}
        {trendingArticles.length > 0 && (
          <div className="bg-card rounded-xl p-6 border">
            <h3 className="text-lg font-bold mb-4">Trending Now</h3>
            <div className="space-y-4">
              {trendingArticles.slice(0, 3).map((article) => (
                <ArticleCardCompact key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}

        {/* Newsletter Signup */}
        <NewsletterSignup />
      </div>
    </div>
  );
};