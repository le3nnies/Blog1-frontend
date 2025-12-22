import { Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from '@/utils/article.utils';
import { Author } from '@/types/article.types';

interface ArticleMetaProps {
  category: string;
  readTime: string;
  publishedAt: string;
  author?: Author;
  variant?: 'default' | 'compact';
}

export const ArticleMeta = ({ 
  category, 
  readTime, 
  publishedAt, 
  author,
  variant = 'default' 
}: ArticleMetaProps) => {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="secondary" className="text-xs">
          {category}
        </Badge>
        <span className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {readTime}
        </span>
        <span>•</span>
        <time dateTime={publishedAt}>
          {formatDate(publishedAt)}
        </time>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mb-2 flex-wrap">
      <Badge variant="secondary" className="text-xs font-medium">
        {category}
      </Badge>
      <span className="text-xs text-muted-foreground flex items-center">
        <Clock className="h-3 w-3 mr-1" />
        {readTime}
      </span>
      <div className="flex items-center gap-3 ml-auto">
        {author?.avatar ? (
          <img
            src={author.avatar}
            alt={author.name}
            className="h-6 w-6 rounded-full object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
            <User className="h-3 w-3 text-muted-foreground" />
          </div>
        )}
        <span className="text-xs text-muted-foreground">{author?.name}</span>
      </div>
    </div>
  );
};