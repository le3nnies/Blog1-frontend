export interface Author {
  id?: string;
  name: string;
  avatar?: string;
  bio?: string;
  role?: string;
}

export interface Comment {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
  };
  content: string;
  likes: number;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  likesCount: number;
  comments: Comment[];
  shares: number;
  status: 'draft' | 'published' | 'archived';
  metaTitle: string;
  metaDescription: string;
  readTime: string;
  featuredImage?: string;
  trendingScore: number;
  trending?: boolean;
  likes: number;
  priority?: number;
  featured?: boolean;
  bookmarked?: boolean;
  premium?: boolean;
}

export interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
  index?: number;
}