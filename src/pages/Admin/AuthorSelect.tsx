import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { articleService } from '@/services/articleService';
import { useAuth } from '@/context/AuthContext';

interface Author {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: string;
}

interface AuthorSelectProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function AuthorSelect({ value, onChange, className }: AuthorSelectProps) {
  const { user } = useAuth();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only show for admin users
  if (user?.role !== 'admin') {
    return null;
  }

  useEffect(() => {
    const fetchAuthors = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await articleService.getAuthors();

        if (result.success && result.data) {
          setAuthors(result.data);

          // If no value is set, default to current user
          if (!value && user?.id) {
            onChange(user.id);
          }
        } else {
          setError(result.error || 'Failed to load authors');
        }
      } catch (err) {
        setError('Failed to load authors');
        console.error('Error fetching authors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthors();
  }, [user?.id, value, onChange]);

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="text-sm font-medium">Author</label>
        <div className="h-10 bg-gray-100 animate-pulse rounded-md"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="text-sm font-medium">Author</label>
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium">Author</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an author" />
        </SelectTrigger>
        <SelectContent>
          {authors.map((author) => (
            <SelectItem key={author._id} value={author._id}>
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={author.avatar} alt={author.username} />
                  <AvatarFallback>
                    {author.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{author.username}</span>
                  <span className="text-xs text-gray-500 capitalize">{author.role}</span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
