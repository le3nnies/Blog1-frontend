

// Extend the Window interface to include fbq for Facebook Pixel
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

// Add these utility functions to your existing utils file
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Share utility functions
export const generateShareUrl = (platform: string, data: {
  url: string;
  title?: string;
  text?: string;
  hashtags?: string[];
  via?: string;
}): string => {
  const { url, title = '', text = '', hashtags = [], via = '' } = data;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(text);
  const encodedHashtags = hashtags.join(',');

  const platforms: Record<string, string> = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=${encodedHashtags}&via=${via}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`
  };

  return platforms[platform] || '';
};

// Track share analytics
export const trackShare = (
  platform: string,
  contentId: string,
  contentType: string = 'article'
) => {
  if (typeof window !== 'undefined') {
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', 'share', {
        method: platform,
        content_id: contentId,
        content_type: contentType,
        event_category: 'engagement'
      });
    }

    // Facebook Pixel
    if (window.fbq) {
      window.fbq('track', 'Share', {
        content_id: contentId,
        content_type: contentType,
        platform: platform
      });
    }
  }
};