// src/components/Ads/AdBanner.tsx
import { AdCampaign } from '@/types/ads.types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, X, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { adDisplayService } from '@/services/AdDisplayService';
import { useState, useEffect, useRef } from 'react';

interface AdBannerProps {
  ad: AdCampaign;
  format?: 'leaderboard' | 'medium_rectangle' | 'large_rectangle' | 'skyscraper' | 'banner';
  onClose?: () => void;
  size?: 'small' | 'medium' | 'large' | 'banner' | 'leaderboard';
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ ad, format, size, onClose, className }) => {
  const [showCloseButton, setShowCloseButton] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [mediaError, setMediaError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Show close button after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCloseButton(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    let hideTimer: NodeJS.Timeout;
    
    if (showControls) {
      hideTimer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    
    return () => {
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [showControls]);

  // Determine effective format based on props
  const effectiveFormat = format || (
    size === 'leaderboard' ? 'leaderboard' :
    size === 'banner' ? 'banner' :
    size === 'large' ? 'large_rectangle' :
    size === 'small' ? 'medium_rectangle' :
    'medium_rectangle'
  );

  // Standard Google Ad sizes
  const getFormatDimensions = () => {
    switch (effectiveFormat) {
      case 'leaderboard': // 728x90
        return { width: 728, height: 90, class: 'w-[728px] h-[90px]' };
      case 'medium_rectangle': // 300x250 (most common)
        return { width: 300, height: 250, class: 'w-[300px] h-[250px]' };
      case 'large_rectangle': // 336x280
        return { width: 336, height: 280, class: 'w-[336px] h-[280px]' };
      case 'skyscraper': // 120x600
        return { width: 120, height: 600, class: 'w-[120px] h-[600px]' };
      case 'banner': // 468x60
        return { width: 468, height: 60, class: 'w-[468px] h-[60px]' };
      default:
        return { width: 300, height: 250, class: 'w-[300px] h-[250px]' };
    }
  };

  const dimensions = getFormatDimensions();

  // Detect media type from URL if not properly set
  const detectMediaType = (url: string, declaredType: string) => {
    if (!url) return declaredType;

    // Check URL extension for video formats
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv'];
    const isVideoFromUrl = videoExtensions.some(ext => url.toLowerCase().includes(ext));

    // Check if URL contains video path indicators
    const hasVideoPath = url.includes('/video/') || url.includes('video=true');

    if (isVideoFromUrl || hasVideoPath) {
      return 'video';
    }

    // Default to declared type or image
    return declaredType || 'image';
  };

  // Format media URL for proper display
  const getFormattedMediaUrl = (url: string, mediaType: string) => {
    if (!url) return url;

    // Detect actual media type from URL
    const actualMediaType = detectMediaType(url, mediaType);

    // For Cloudinary videos, ensure proper format parameters
    if (actualMediaType === 'video' && url.includes('cloudinary.com')) {
      try {
        const cloudinaryUrl = new URL(url);
        if (!cloudinaryUrl.searchParams.has('f')) {
          cloudinaryUrl.searchParams.set('f', 'mp4');
        }
        if (!cloudinaryUrl.searchParams.has('q')) {
          cloudinaryUrl.searchParams.set('q', 'auto');
        }
        return cloudinaryUrl.toString();
      } catch (error) {
        console.error('Error formatting Cloudinary video URL:', error);
        return url;
      }
    }

    return url;
  };

  const handleMediaError = () => {
    console.error('Failed to load ad media:', ad.mediaUrl, 'Type:', ad.mediaType);
    setMediaError(true);
  };

  // Handle video end event to ensure it restarts
  const handleVideoEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(error => {
        console.error('Error restarting video:', error);
      });
    }
  };

  // Handle video playback errors
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error('Video playback error:', e);
    handleMediaError();
  };

  // Toggle mute/unmute
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  // Toggle play/pause
  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(error => {
          console.error('Error playing video:', error);
        });
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  const handleAdClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // FIX: Check for valid ad ID
    if (!ad.id || ad.id === 'undefined') {
      console.warn('Invalid ad ID, cannot track click');
      window.open(ad.clickUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    
    try {
      await adDisplayService.trackAdClick(ad.id);
      window.open(ad.clickUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error tracking ad click:', error);
      window.open(ad.clickUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering ad click
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  // Show video controls on hover
  const handleMouseEnter = () => {
    setIsHovered(true);
    setShowControls(true);
  };

  // Hide controls with delay on mouse leave
  const handleMouseLeave = () => {
    setIsHovered(false);
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 1000);
    return () => clearTimeout(timer);
  };

  if (!isVisible) {
    return null; // Don't render if closed
  }

  return (
    <div
      className={`relative overflow-hidden rounded border border-gray-300 bg-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${dimensions.class}`}
      onClick={handleAdClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Close Button - appears after 5 seconds */}
      {showCloseButton && (
        <button
          onClick={handleCloseClick}
          className="absolute top-1 right-1 bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-800 rounded-full p-1 shadow-sm transition-all duration-200 z-30 hover:scale-110"
          title="Close ad"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Ad Badge - Always visible */}
      <div className="absolute top-1 left-1 z-20">
        <Badge className="bg-white/95 text-gray-700 text-[10px] font-medium px-1.5 py-0.5 border border-gray-300">
          Ad
        </Badge>
      </div>

      {/* Ad Media - Display if mediaUrl exists and no error */}
      {ad.mediaUrl && !mediaError && (() => {
        const actualMediaType = detectMediaType(ad.mediaUrl, ad.mediaType);
        const formattedUrl = getFormattedMediaUrl(ad.mediaUrl, ad.mediaType);

        return (
          <div className="absolute inset-0">
            {actualMediaType === 'video' ? (
              <>
                <video
                  ref={videoRef}
                  src={formattedUrl}
                  className="w-full h-full object-contain bg-gray-50"
                  muted={isMuted}
                  loop
                  autoPlay
                  playsInline
                  onError={handleVideoError}
                  onEnded={handleVideoEnded}
                  onPlay={handleVideoPlay}
                  onPause={handleVideoPause}
                  preload="auto"
                  crossOrigin="anonymous"
                >
                  {/* Fallback message for unsupported video */}
                  <p className="text-xs text-gray-600">Your browser doesn't support HTML5 video.</p>
                </video>
                
                {/* Video Controls Overlay - YouTube style */}
                <div 
                  className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 transition-all duration-300 z-20
                    ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                >
                  <div className="flex items-center justify-between">
                    {/* Left side: Play/Pause button */}
                    <button
                      onClick={togglePlayPause}
                      className="bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5 transition-colors duration-200 backdrop-blur-sm"
                      title={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause className="h-3 w-3" />
                      ) : (
                        <Play className="h-3 w-3 ml-0.5" />
                      )}
                    </button>
                    
                    {/* Right side: Volume control */}
                    <button
                      onClick={toggleMute}
                      className="bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5 transition-colors duration-200 backdrop-blur-sm"
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? (
                        <VolumeX className="h-3 w-3" />
                      ) : (
                        <Volume2 className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Sound status indicator - appears briefly when toggled */}
                {!isMuted && (
                  <div className="absolute bottom-12 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm animate-pulse">
                    🔊 Sound On
                  </div>
                )}
              </>
            ) : (
              <img
                src={formattedUrl}
                alt={ad.title}
                className="w-full h-full object-contain bg-gray-50"
                onError={handleMediaError}
              />
            )}
          </div>
        );
      })()}

      {/* Show error message if media failed to load */}
      {ad.mediaUrl && mediaError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-xs text-gray-600 mb-1">Advertisement</p>
            <p className="text-[10px] text-gray-500">Click to visit advertiser</p>
          </div>
        </div>
      )}

      {/* Text Overlay - Only shows on hover for larger formats, always for small banners */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 z-10
          ${effectiveFormat === 'banner' || effectiveFormat === 'leaderboard' 
            ? 'opacity-100' 
            : isHovered ? 'opacity-100' : 'opacity-0'
          }`}
      >
        {/* Content layout based on format */}
        <div className={`h-full p-3 flex flex-col justify-between ${
          effectiveFormat === 'banner' || effectiveFormat === 'leaderboard' 
            ? 'flex-row items-center' 
            : ''
        }`}>
          
          {/* For banner/leaderboard formats: horizontal layout */}
          {(effectiveFormat === 'banner' || effectiveFormat === 'leaderboard') ? (
            <>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white line-clamp-1">
                  {ad.title}
                </h3>
                <p className="text-xs text-white/80 line-clamp-1">
                  {ad.description}
                </p>
                <p className="text-[10px] text-white/60 mt-1">
                  Sponsored • {ad.advertiser}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-900 text-xs font-medium rounded transition-colors duration-200 flex items-center gap-1">
                  Visit <ExternalLink className="h-3 w-3" />
                </div>
              </div>
            </>
          ) : (
            /* For rectangle/skyscraper formats: vertical layout */
            <>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1 line-clamp-2">
                  {ad.title}
                </h3>
                <p className="text-xs text-white/80 line-clamp-2">
                  {ad.description}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-white/60 mb-2">
                  Sponsored by {ad.advertiser}
                </p>
                <div className="flex items-center justify-between">
                  <div className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-900 text-xs font-medium rounded transition-colors duration-200 flex items-center gap-1">
                    Learn More <ExternalLink className="h-3 w-3" />
                  </div>
                  <p className="text-[9px] text-white/50">
                    Ad • Supports our platform
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Hover border effect */}
      <div className={`absolute inset-0 border-2 border-transparent pointer-events-none transition-all duration-300
        ${isHovered ? 'border-blue-400/30' : ''}`}
      ></div>
    </div>
  );
};

export default AdBanner;