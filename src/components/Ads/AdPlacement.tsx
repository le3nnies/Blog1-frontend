// src/components/Ads/AdPlacement.tsx
import { useState, useEffect, useMemo } from 'react';
import { AdCampaign } from '@/types/ads.types';
import { adDisplayService } from '@/services/AdDisplayService';
import AdBanner from './AdBanner';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface AdPlacementProps {
  category?: string;
  position: 'sidebar' | 'inline' | 'header' | 'between_posts' | 'article_header' | 'article_inline' | 'article_bottom';
  limit?: number;
  className?: string;
  sticky?: boolean;
}

// Position configuration with proper styling and behavior
const POSITION_CONFIG = {
  sidebar: {
    size: 'small' as const,
    fetchMethod: 'getSidebarAds' as const,
    containerClass: "sticky top-20 self-start",
    wrapperClass: "space-y-4",
    isSticky: true,
  },
  inline: {
    size: 'medium' as const,
    fetchMethod: 'getInlineAds' as const,
    containerClass: "my-8",
    wrapperClass: "space-y-4",
    isSticky: false,
  },
  header: {
    size: 'banner' as const,
    fetchMethod: 'getHeaderAds' as const,
    containerClass: "w-full bg-background border-b",
    wrapperClass: "container mx-auto px-4 py-2",
    isSticky: false,
    placement: 'below-header' as const,
  },
  between_posts: {
    size: 'medium' as const,
    fetchMethod: 'getBetweenPostsAds' as const,
    containerClass: "my-6",
    wrapperClass: "space-y-4",
    isSticky: false,
  },
  article_header: {
    size: 'leaderboard' as const,
    fetchMethod: 'getHeaderAds' as const,
    containerClass: "mt-4 mb-6",
    wrapperClass: "space-y-4",
    isSticky: false,
    placement: 'below-article-header' as const,
  },
  article_inline: {
    size: 'medium' as const,
    fetchMethod: 'getInlineAds' as const,
    containerClass: "my-8 mx-auto max-w-2xl",
    wrapperClass: "space-y-4",
    isSticky: false,
    placement: 'in-content' as const,
  },
  article_bottom: {
    size: 'medium' as const,
    fetchMethod: 'getBetweenPostsAds' as const,
    containerClass: "mt-8 border-t pt-8",
    wrapperClass: "space-y-4",
    isSticky: false,
    placement: 'after-content' as const,
  },
} as const;

// Size mapping for banners
const SIZE_MAPPING = {
  sidebar: 'small' as const,
  inline: 'medium' as const,
  header: 'banner' as const,
  between_posts: 'medium' as const,
  article_header: 'leaderboard' as const,
  article_inline: 'medium' as const,
  article_bottom: 'medium' as const,
};

const AdPlacement: React.FC<AdPlacementProps> = ({ 
  category, 
  position, 
  limit = 2,
  className,
  sticky = false,
}) => {
  const [ads, setAds] = useState<AdCampaign[]>([]);
  const [closedAdIds, setClosedAdIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  const config = POSITION_CONFIG[position];
  const bannerSize = SIZE_MAPPING[position];

  // Determine if this placement should be sticky
  const shouldBeSticky = sticky || config.isSticky;

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        setError(false);
        let fetchedAds: AdCampaign[] = [];
        
        switch (position) {
          case 'sidebar':
            fetchedAds = await adDisplayService.getSidebarAds(category);
            break;
          case 'inline':
            fetchedAds = await adDisplayService.getInlineAds(category);
            break;
          case 'header':
            fetchedAds = await adDisplayService.getHeaderAds();
            break;
          case 'between_posts':
            fetchedAds = await adDisplayService.getBetweenPostsAds(category);
            break;
          case 'article_header':
            fetchedAds = await adDisplayService.getHeaderAds();
            break;
          case 'article_inline':
            fetchedAds = await adDisplayService.getInlineAds(category);
            break;
          case 'article_bottom':
            fetchedAds = await adDisplayService.getBetweenPostsAds(category);
            break;
          default:
            fetchedAds = await adDisplayService.getActiveAds(category, position, limit);
        }
        
        // Apply limit after fetching
        fetchedAds = fetchedAds.slice(0, limit);
        
        setAds(fetchedAds);
        
        // Track impressions for each ad
        fetchedAds.forEach(ad => {
          if (ad.id && ad.id !== 'undefined') {
            adDisplayService.trackAdImpression(ad.id).catch(error => {
              console.warn('Failed to track impression for ad:', ad.id, error);
            });
          }
        });
        
      } catch (error) {
        console.error('Error fetching ads:', error);
        setError(true);
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [category, position, limit]);

  const handleAdClose = (adId: string) => {
    setClosedAdIds(prev => new Set(prev).add(adId));
  };

  // Filter out closed ads
  const visibleAds = useMemo(() => 
    ads.filter(ad => !closedAdIds.has(ad.id)),
    [ads, closedAdIds]
  );

  if (loading) {
    return (
      <div className={cn(config.containerClass, className)}>
        <div className={config.wrapperClass}>
          {Array.from({ length: Math.min(limit, 2) }).map((_, i) => (
            <Skeleton 
              key={i} 
              className={cn(
                "w-full",
                position === 'header' || position === 'article_header' 
                  ? "h-20" 
                  : position === 'sidebar' 
                  ? "h-40" 
                  : "h-48"
              )} 
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || visibleAds.length === 0) {
    // Return empty with minimal height to prevent layout shift
    return <div className={cn(config.containerClass, "min-h-0", className)} />;
  }

  return (
    <div 
      className={cn(
        config.containerClass,
        shouldBeSticky && "sticky top-20",
        className
      )}
      data-ad-position={position}
      data-testid={`ad-placement-${position}`}
    >
      <div className={config.wrapperClass}>
        {visibleAds.map((ad) => (
          <AdBanner 
            key={ad.id}
            ad={ad} 
            size={bannerSize}
            onClose={() => handleAdClose(ad.id)}
            // Add specific styling based on position
            className={cn(
              position === 'header' && "shadow-sm",
              position === 'article_header' && "rounded-lg border",
              position === 'sidebar' && "rounded-lg",
              position === 'article_bottom' && "border-t pt-4"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default AdPlacement;