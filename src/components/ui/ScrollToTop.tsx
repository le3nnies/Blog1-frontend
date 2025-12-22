// src/components/UI/ScrollToTop.tsx
import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ScrollToTopProps {
  threshold?: number; // Scroll threshold in pixels
  offset?: number; // Distance from bottom of viewport
  showOnScrollUp?: boolean; // Only show when scrolling up
  smooth?: boolean; // Use smooth scrolling
  className?: string;
}

export const ScrollToTop = ({
  threshold = 400,
  offset = 24,
  showOnScrollUp = false,
  smooth = true,
  className = ''
}: ScrollToTopProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determine scroll direction
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up');
      }
      
      // Update visibility based on threshold and scroll direction
      const shouldBeVisible = currentScrollY > threshold && 
        (!showOnScrollUp || scrollDirection === 'up');
      
      setIsVisible(shouldBeVisible);
      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [threshold, showOnScrollUp, scrollDirection, lastScrollY]);

  const scrollToTop = () => {
    const scrollOptions: ScrollToOptions = {
      top: 0,
      behavior: smooth ? 'smooth' : 'auto'
    };

    // Safari fallback
    if (!('scrollBehavior' in document.documentElement.style)) {
      scrollOptions.behavior = 'auto';
    }

    window.scrollTo(scrollOptions);

    // Fallback for older browsers
    if (!smooth || !('scrollBehavior' in document.documentElement.style)) {
      const start = window.scrollY;
      const startTime = performance.now();
      const duration = 500; // ms

      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        
        window.scrollTo(0, start * (1 - easeOutCubic));
        
        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      };

      requestAnimationFrame(animateScroll);
    }

    // Track analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'scroll_to_top', {
        event_category: 'engagement',
        event_label: 'scroll_behavior'
      });
    }
  };

  if (!isVisible) return null;

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={cn(
        'fixed z-50 rounded-full shadow-lg hover:shadow-xl',
        'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'border border-border hover:bg-accent hover:text-accent-foreground',
        'transition-all duration-300',
        'animate-in fade-in slide-in-from-bottom-4',
        'hover:scale-105 active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        className
      )}
      style={{
        bottom: `${offset}px`,
        right: `${offset}px`
      }}
    >
      <ChevronUp className="h-5 w-5" />
      
      {/* Ripple effect on click */}
      <span className="absolute inset-0 overflow-hidden rounded-full">
        <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </span>
      
      {/* Tooltip on hover */}
      <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
        <div className="relative">
          <div className="bg-foreground text-background text-xs font-medium px-2 py-1 rounded whitespace-nowrap">
            Scroll to top
            <div className="absolute top-full right-3 -mt-1 border-4 border-transparent border-t-foreground" />
          </div>
        </div>
      </div>
    </Button>
  );
};

// Variant with progress indicator
export const ScrollToTopWithProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const calculateScrollProgress = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(Math.round(progress));
    };

    // Throttle scroll events
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          calculateScrollProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    calculateScrollProgress();

    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);

  return (
    <div className="group relative">
      <ScrollToTop 
        threshold={100}
        className="relative overflow-hidden"
      />
      
      {/* Progress ring around button */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `conic-gradient(rgb(var(--primary)) ${scrollProgress}%, transparent ${scrollProgress}% 100%)`
        }}
      />
      
      {/* Progress percentage (optional) */}
      {scrollProgress > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold text-primary-foreground">
            {scrollProgress}%
          </span>
        </div>
      )}
    </div>
  );
};

export default ScrollToTop;