import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';
import { Article } from '@/types/article.types';

interface ArticleCardCompactProps {
  article: Article;
}

export const ArticleCardCompact = ({ article }: ArticleCardCompactProps) => {
  return (
    <Link
      to={`/article/${article.slug}`}
      className="group block hover:no-underline"
    >
      <div className="flex gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2 mb-1">
            {article.title}
          </h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatDate(article.publishedAt)}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readTime}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};