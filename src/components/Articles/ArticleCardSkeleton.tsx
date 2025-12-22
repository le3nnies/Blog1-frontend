import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ArticleCardSkeletonProps {
  variant?: 'default' | 'compact' | 'featured';
}

export const ArticleCardSkeleton = ({ variant = 'default' }: ArticleCardSkeletonProps) => {
  if (variant === 'compact') {
    return (
      <Card className="overflow-hidden animate-pulse" data-testid="article-card-skeleton">
        <div className="flex">
          <Skeleton className="w-24 h-24 rounded-l-lg" />
          <div className="flex-1 p-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-hidden animate-pulse" data-testid="article-card-skeleton">
      <Skeleton className="w-full h-48 rounded-none" />
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-6 w-full mb-1" />
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="pt-0">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-4" />
        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2 w-16" />
            </div>
          </div>
          <Skeleton className="h-3 w-12" />
        </div>
      </CardContent>
    </Card>
  );
};