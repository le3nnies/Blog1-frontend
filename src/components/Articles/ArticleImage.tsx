import { useState } from 'react';
import { getCategoryImage, getOptimizedImageUrl } from '@/utils/article.utils';

interface ArticleImageProps {
  src?: string;
  alt: string;
  category: string;
  className?: string;
  priority?: boolean;
  onError?: () => void;
}

export const ArticleImage = ({ 
  src, 
  alt, 
  category, 
  className = '', 
  priority = false,
  onError 
}: ArticleImageProps) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  const handleError = () => {
    setError(true);
    onError?.();
  };

  const imageUrl = error ? getCategoryImage(category, src) : (src || getCategoryImage(category, src));
  const optimizedUrl = getOptimizedImageUrl(imageUrl);

  return (
    <div className="relative overflow-hidden">
      <img
        src={optimizedUrl}
        alt={error ? `${alt} - Image not available` : alt}
        className={`w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onError={handleError}
        onLoad={() => setLoaded(true)}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        data-testid="article-image"
      />
      {!loaded && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse"
          data-testid="image-skeleton"
        />
      )}
    </div>
  );
};