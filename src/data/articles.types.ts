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
  comments: any[];
  shares: number;
  status: 'draft' | 'published' | 'archived';
  metaTitle: string;
  metaDescription: string;
  readTime: string;
  featuredImage?: string;
  trendingScore: number;
  trending?: boolean;
  likes: number;
}


export const categories = [
  "All",
  "Tax Fundamentals & Filing",
  "Deductions & Credits",
  "Investment & Retirement Taxes",
  "IRS Interactions & Tax Law",
];
