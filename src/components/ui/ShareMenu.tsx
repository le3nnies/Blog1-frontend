// src/components/UI/ShareMenu.tsx
import { useState, useRef, useEffect } from 'react';
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  Mail,
  MessageCircle,
  Bookmark,
  Copy,
  Check,
  X,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface ShareData {
  url?: string;
  title?: string;
  text?: string;
  image?: string;
}

interface ShareMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
  description?: string;
  shortcut?: string;
}

interface ShareMenuProps {
  url?: string;
  title?: string;
  description?: string;
  image?: string;
  hashtags?: string[];
  via?: string; // Twitter username to mention
  compact?: boolean;
  showLabels?: boolean;
  orientation?: 'horizontal' | 'vertical';
  position?: 'top' | 'bottom' | 'left' | 'right';
  onShare?: (platform: string) => void;
  className?: string;
}

export const ShareMenu = ({
  url: customUrl,
  title = document.title,
  description = '',
  image = '',
  hashtags = [],
  via = '',
  compact = false,
  showLabels = true,
  orientation = 'horizontal',
  position = 'bottom',
  onShare,
  className = ''
}: ShareMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout>();

  const currentUrl = customUrl || window.location.href;
  const pageTitle = title || document.title;
  const shareText = description || pageTitle;

  // Check if Web Share API is available
  const canUseWebShare = typeof navigator !== 'undefined' && navigator.share;

  // Check if URL is already bookmarked
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const bookmarks = JSON.parse(localStorage.getItem('shared_bookmarks') || '[]');
      setIsBookmarked(bookmarks.includes(currentUrl));
    }
  }, [currentUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setIsCopied(true);
      
      // Track copy event
      trackShareEvent('copy');
      
      // Show success toast
      toast.success('Link copied to clipboard!', {
        duration: 2000,
        position: 'top-center'
      });

      // Reset copied state after 2 seconds
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy link', {
        description: 'Please try again or copy manually'
      });
    });
  };

  const handleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('shared_bookmarks') || '[]');
    
    if (isBookmarked) {
      // Remove bookmark
      const newBookmarks = bookmarks.filter((url: string) => url !== currentUrl);
      localStorage.setItem('shared_bookmarks', JSON.stringify(newBookmarks));
      setIsBookmarked(false);
      toast.info('Bookmark removed', {
        description: 'Removed from your saved items'
      });
    } else {
      // Add bookmark
      const newBookmarks = [currentUrl, ...bookmarks];
      localStorage.setItem('shared_bookmarks', JSON.stringify(newBookmarks));
      setIsBookmarked(true);
      toast.success('Bookmark added', {
        description: 'Saved to your bookmarks'
      });
    }
  };

  const trackShareEvent = (platform: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'share', {
        method: platform,
        content_type: 'article',
        content_id: currentUrl,
        event_category: 'engagement'
      });
    }
    
    // Call custom callback
    onShare?.(platform);
  };

  const shareViaWebAPI = async () => {
    try {
      await navigator.share({
        title: pageTitle,
        text: shareText,
        url: currentUrl
      });
      trackShareEvent('web_share');
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Web Share failed:', error);
        toast.error('Sharing failed', {
          description: 'Please try another method'
        });
      }
    }
  };

  const shareToPlatform = (platform: string) => {
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedTitle = encodeURIComponent(pageTitle);
    const encodedText = encodeURIComponent(shareText);
    const encodedHashtags = hashtags.map(tag => tag.replace('#', '')).join(',');
    
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}${
          encodedHashtags ? `&hashtags=${encodedHashtags}` : ''
        }${via ? `&via=${via}` : ''}`;
        break;
      
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
        break;
      
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
        break;
      
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      
      case 'email':
        shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`;
        break;
      
      case 'reddit':
        shareUrl = `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
      trackShareEvent(platform);
    }
  };

  const shareItems: ShareMenuItem[] = [
    {
      id: 'twitter',
      label: 'Twitter',
      icon: <Twitter className="h-4 w-4" />,
      color: 'text-[#1DA1F2] hover:bg-[#1DA1F2]/10',
      action: () => shareToPlatform('twitter'),
      description: 'Share on Twitter',
      shortcut: 'T'
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: <Facebook className="h-4 w-4" />,
      color: 'text-[#1877F2] hover:bg-[#1877F2]/10',
      action: () => shareToPlatform('facebook'),
      description: 'Share on Facebook'
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: <Linkedin className="h-4 w-4" />,
      color: 'text-[#0A66C2] hover:bg-[#0A66C2]/10',
      action: () => shareToPlatform('linkedin'),
      description: 'Share on LinkedIn'
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: <MessageCircle className="h-4 w-4" />,
      color: 'text-[#25D366] hover:bg-[#25D366]/10',
      action: () => shareToPlatform('whatsapp'),
      description: 'Share on WhatsApp'
    },
    {
      id: 'telegram',
      label: 'Telegram',
      icon: <MessageCircle className="h-4 w-4" />,
      color: 'text-[#26A5E4] hover:bg-[#26A5E4]/10',
      action: () => shareToPlatform('telegram'),
      description: 'Share on Telegram'
    },
    {
      id: 'email',
      label: 'Email',
      icon: <Mail className="h-4 w-4" />,
      color: 'text-gray-600 hover:bg-gray-100',
      action: () => shareToPlatform('email'),
      description: 'Share via Email'
    },
    {
      id: 'copy',
      label: isCopied ? 'Copied!' : 'Copy Link',
      icon: isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />,
      color: isCopied ? 'text-green-600 hover:bg-green-50' : 'text-gray-600 hover:bg-gray-100',
      action: handleCopyLink,
      description: 'Copy link to clipboard',
      shortcut: '⌘C'
    },
    {
      id: 'bookmark',
      label: isBookmarked ? 'Bookmarked' : 'Bookmark',
      icon: <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />,
      color: isBookmarked ? 'text-amber-600 hover:bg-amber-50' : 'text-gray-600 hover:bg-gray-100',
      action: handleBookmark,
      description: 'Save for later'
    }
  ];

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Compact horizontal layout
  if (compact && orientation === 'horizontal') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {shareItems.slice(0, 4).map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="icon"
            onClick={item.action}
            aria-label={item.label}
            className={cn('h-8 w-8', item.color)}
            title={item.description}
          >
            {item.icon}
          </Button>
        ))}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="More sharing options"
              className="h-8 w-8"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {shareItems.slice(4).map((item) => (
              <DropdownMenuItem
                key={item.id}
                onClick={item.action}
                className={item.color}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
                {item.shortcut && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {item.shortcut}
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Standard dropdown menu
  return (
    <div className={cn('relative isolate', className)}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={compact ? 'sm' : 'default'}
            className={cn(
              'group relative overflow-hidden',
              compact ? 'px-3' : 'px-4'
            )}
          >
            <Share2 className={cn('mr-2', compact ? 'h-4 w-4' : 'h-4 w-4')} />
            {showLabels && (compact ? 'Share' : 'Share Article')}

            {/* Animated background */}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 group-hover:translate-x-full transition-transform duration-700" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-64 z-50"
          sideOffset={8}
          avoidCollisions={true}
          collisionPadding={16}
          side="bottom"
          alignOffset={0}
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Share this article</p>
              <p className="text-xs leading-none text-muted-foreground">
                Spread the word with your network
              </p>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          {/* Web Share API option (if available) */}
          {canUseWebShare && (
            <>
              <DropdownMenuItem
                onClick={shareViaWebAPI}
                className="text-primary hover:bg-primary/10"
              >
                <Share2 className="mr-2 h-4 w-4" />
                <span>Share via...</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  Native
                </Badge>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          
          {/* Social platforms */}
          <DropdownMenuGroup>
            {shareItems.map((item) => (
              <DropdownMenuItem
                key={item.id}
                onClick={item.action}
                className={cn('cursor-pointer', item.color)}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
                {item.shortcut && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {item.shortcut}
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          {/* Custom share dialog trigger */}
          <DropdownMenuItem
            onClick={() => setShowCustomDialog(true)}
            className="text-muted-foreground"
          >
            <LinkIcon className="mr-2 h-4 w-4" />
            <span>Custom Share</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Custom Share Dialog */}
      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Custom Share</DialogTitle>
            <DialogDescription>
              Customize your share message and preview
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="share-url">Link</Label>
              <div className="flex gap-2">
                <Input
                  id="share-url"
                  value={currentUrl}
                  readOnly
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyLink}
                >
                  {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="share-message">Custom Message (optional)</Label>
              <Textarea
                id="share-message"
                placeholder="Add a personal note..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
              />
            </div>
            
            <Separator />
            
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Preview:</p>
              <div className="bg-muted p-3 rounded-lg space-y-1">
                <p className="font-medium">{pageTitle}</p>
                <p className="text-sm">{customMessage || shareText}</p>
                <p className="text-xs opacity-75 truncate">{currentUrl}</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowCustomDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const finalText = customMessage 
                  ? `${customMessage}\n\n${currentUrl}`
                  : `${shareText}\n\n${currentUrl}`;
                
                navigator.clipboard.writeText(finalText);
                toast.success('Custom message copied!');
                setShowCustomDialog(false);
              }}
            >
              Copy Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Quick Share Bar Component (for fixed positioning)
export const QuickShareBar = ({ className }: { className?: string }) => {
  return (
    <div className={cn(
      'fixed left-1/2 -translate-x-1/2 bottom-8 z-40',
      'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      'border rounded-full shadow-lg p-2',
      'flex items-center gap-1',
      'animate-in slide-in-from-bottom-4 fade-in duration-300',
      className
    )}>
      <span className="text-sm font-medium px-3">Share:</span>
      <ShareMenu compact orientation="horizontal" />
    </div>
  );
};

export default ShareMenu;