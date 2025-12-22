import { Link } from "react-router-dom";
import { Clock, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Article } from "@/data/articles.types";
import heroBg from "@/assets/hero-bg.jpg";

interface FeaturedArticleProps {
  article: {
    id: string;
    title: string;
    excerpt: string;
    slug: string;
    category: string;
    tags: string[];
    author: {
      name: string;
      avatar?: string;
    };
    publishedAt: string;
    readTime: string;
    image?: string;
    trending?: boolean;
  };
}

export const FeaturedArticle = ({ article }: FeaturedArticleProps) => {
  return (
    <div className="relative overflow-hidden rounded-xl">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 to-background/60" />
      </div>
      
      <div className="relative container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-gradient-trending border-0 text-trending-foreground">
              <TrendingUp className="h-4 w-4 mr-1" />
              Featured
            </Badge>
            <Badge variant="secondary">{article.category}</Badge>
            <span className="text-sm text-muted-foreground flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {article.readTime}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {article.title}
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            {article.excerpt}
          </p>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="h-12 w-12 rounded-full ring-2 ring-primary/20"
              />
              <div>
                <div className="font-medium">{article.author.name}</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(article.publishedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
            
            <Link to={`/article/${article.slug}`}>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Read Article
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
