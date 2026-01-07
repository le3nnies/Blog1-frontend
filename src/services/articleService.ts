import { Article } from "@/data/articles.types";

const API_BASE_URL = import.meta.env.REACT_APP_API_BASE_URL;

// API service for articles
export const articleService = {
  transformArticle: (backendArticle: any): Article => {
    console.log('🔄 Transforming article:', backendArticle?._id, backendArticle?.title);
    console.log('🖼️ Featured image from backend:', backendArticle?.featuredImage);

    return {
      id: backendArticle._id,
      title: backendArticle.title,
      slug: backendArticle.slug || '', // Added slug
      excerpt: backendArticle.excerpt,
      content: backendArticle.content,
      category: backendArticle.category,
      tags: backendArticle.tags || [], // Added tags
      author: backendArticle.author ? {
        _id: backendArticle.author._id || backendArticle.author.id,
        name: backendArticle.author.username || backendArticle.author.name || 'Unknown Author',
        avatar: backendArticle.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${backendArticle.author.username || backendArticle.author.name || 'user'}`
      } : 'Unknown Author',
      views: backendArticle.views || 0,
      likesCount: backendArticle.likesCount || backendArticle.likes || 0,
      likes: backendArticle.likes || [], // Added likes
      comments: backendArticle.comments || [],
      shares: backendArticle.shares || 0,
      trendingScore: backendArticle.trendingScore || 0,
      readTime: backendArticle.readTime,
      metaTitle: backendArticle.metaTitle || backendArticle.title,
      metaDescription: backendArticle.metaDescription || backendArticle.excerpt,
      status: backendArticle.status || 'published',
      publishedAt: backendArticle.publishedAt || backendArticle.createdAt,
      createdAt: backendArticle.createdAt,
      updatedAt: backendArticle.updatedAt,
      featuredImage: backendArticle.featuredImage, // Added featured image mapping
    };
  },

  // Get all articles
  getAllArticles: async (params = {}): Promise<Article[]> => {
    try {
      const queryString = new URLSearchParams(params).toString();
      console.log('🔄 Fetching all articles:', `/api/articles?${queryString}`);

      const response = await fetch(`${API_BASE_URL}/api/articles?${queryString}`, {
        credentials: 'include',
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch articles: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error('❌ Expected JSON but received:', text.substring(0, 200));
        throw new Error('Invalid API response: Expected JSON but received HTML. Check proxy config or backend URL.');
      }
      
      const data = await response.json();
      console.log('📊 All articles response:', data);
      
      if (data.success && data.data) {
        // Handle different response formats
        const articlesArray = Array.isArray(data.data) ? data.data : data.data.articles;
        if (articlesArray) {
          return articlesArray.map((article: any) => articleService.transformArticle(article));
        }
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }
  },

  // Get trending articles
  getTrendingArticles: async (limit = 5): Promise<Article[]> => {
    try {
      console.log('🔄 Fetching trending articles:', `/api/articles/trending?limit=${limit}`);

      const response = await fetch(`${API_BASE_URL}/api/articles/trending?limit=${limit}`, {
        credentials: 'include',
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch trending articles: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📈 Trending articles response:', data);
      
      if (data.success && data.data) {
        return data.data.map((article: any) => articleService.transformArticle(article));
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error fetching trending articles:', error);
      throw error;
    }
  },

  // Get article by slug - FIXED ENDPOINT
  getArticleBySlug: async (slug: string): Promise<Article> => {
    try {
      // Add validation for slug
      if (!slug || slug === 'undefined' || slug.trim() === '') {
        throw new Error('Invalid slug provided: ' + slug);
      }

      console.log('🔍 Fetching article with slug:', slug);

      // Use the correct slug route - note the /slug/ part
      const response = await fetch(`${API_BASE_URL}/api/articles/slug/${slug}`, {
        credentials: 'include',
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response OK:', response.ok);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Article with slug "${slug}" not found`);
        } else if (response.status === 400) {
          const errorText = await response.text();
          throw new Error(`Bad request for slug "${slug}": ${errorText}`);
        } else {
          throw new Error(`Failed to fetch article: ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('✅ Backend response success:', data.success);

      if (data.success && data.data) {
        const transformedArticle = articleService.transformArticle(data.data);
        console.log('✅ Article transformed successfully');
        return transformedArticle;
      }

      throw new Error('Invalid response format from backend');
    } catch (error) {
      console.error('❌ Error in getArticleBySlug:', error);
      throw error;
    }
  },

  // Get articles by category
  getArticlesByCategory: async (category: string): Promise<Article[]> => {
    try {
      console.log('🔄 Fetching articles by category:', category);
      
      const response = await fetch(`${API_BASE_URL}/api/articles/category/${encodeURIComponent(category)}`, {
        credentials: 'include',
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch category articles: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📂 Category articles response:', data);
      
      if (data.success && data.data) {
        // Handle different response formats
        const articlesArray = Array.isArray(data.data) ? data.data : data.data.articles;
        if (articlesArray) {
          return articlesArray.map((article: any) => articleService.transformArticle(article));
        }
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error fetching category articles:', error);
      throw error;
    }
  },

  getRelatedArticles: async (slug: string, limit = 3): Promise<Article[]> => {
    try {
      console.log('🔄 Fetching related articles for slug:', slug);
      const response = await fetch(`${API_BASE_URL}/api/articles/${slug}/related?limit=${limit}`, {
        credentials: 'include',
      });
      
      console.log('📡 Response status:', response.status)
      if (!response.ok) {
        throw new Error(`Failed to fetch related articles: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('📚 Related articles response:', data)
      if (data.success && data.data) {
        return data.data.map((article: any) => articleService.transformArticle(article));
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error fetching related articles:', error);
      throw error;
    }
  },

  // Increment view count
  incrementViewCount: async (articleId: string): Promise<void> => {
    try {
      console.log('🔄 Incrementing view count for:', articleId);
      
      const response = await fetch(`${API_BASE_URL}/api/articles/${articleId}/view`, {
        method: 'POST',
        credentials: 'include',
      });
      
      console.log('📡 View count response status:', response.status);
      
      if (!response.ok) {
        console.warn('⚠️ Failed to increment view count:', response.statusText);
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
      // Don't throw error for view count updates - fail silently
    }
  },

  // Search articles
  searchArticles: async (query: string): Promise<Article[]> => {
    try {
      console.log('🔍 Searching articles:', query);
      
      const response = await fetch(`${API_BASE_URL}/api/articles?search=${encodeURIComponent(query)}`, {
        credentials: 'include',
      });
      
      console.log('📡 Search response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to search articles: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('🔍 Search results:', data);
      
      if (data.success && data.data) {
        // Handle different response formats
        const articlesArray = Array.isArray(data.data) ? data.data : data.data.articles;
        if (articlesArray) {
          return articlesArray.map((article: any) => articleService.transformArticle(article));
        }
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error searching articles:', error);
      throw error;
    }
  },

  // Like article
  likeArticle: async (articleId: string): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      console.log('❤️ Liking article:', articleId);

      const response = await fetch(`${API_BASE_URL}/api/articles/${articleId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      console.log('📡 Like response status:', response.status);

      const data = await response.json();
      console.log('✅ Like response:', data);

      if (!response.ok) {
        return { success: false, error: data.error || `Failed to like article: ${response.statusText}` };
      }

      return { success: true, data: data.data };

    } catch (error) {
      console.error('Error liking article:', error);
      return {
        success: false,
        error: 'Failed to like article. Please try again.'
      };
    }
  },

  // Add comment to article
  addComment: async (articleId: string, commentData: { content: string }): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      console.log('💬 Adding comment to article:', articleId);

      const response = await fetch(`${API_BASE_URL}/api/articles/${articleId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(commentData),
      });

      console.log('📡 Comment response status:', response.status);

      const data = await response.json();
      console.log('✅ Comment response:', data);

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Failed to add comment: ${response.statusText}`
        };
      }

      return {
        success: true,
        data: data.data
      };

    } catch (error) {
      console.error('Error adding comment:', error);
      return {
        success: false,
        error: 'Failed to add comment. Please try again.'
      };
    }
  },

  // Delete article
  deleteArticle: async (articleId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🗑️ Deleting article:', articleId);

      const response = await fetch(`${API_BASE_URL}/api/articles/${articleId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      console.log('📡 Delete response status:', response.status);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return {
          success: false,
          error: data.error || `Failed to delete article: ${response.statusText}`
        };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting article:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete article. Please try again.'
      };
    }
  },

  // Update article
  updateArticle: async (articleId: string, updateData: any): Promise<{ success: boolean; data?: Article; error?: string }> => {
    try {
      console.log('🔄 Updating article:', articleId, 'with:', updateData);

      const response = await fetch(`${API_BASE_URL}/api/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || `Failed to update article: ${response.statusText}` };
      }

      return { success: true, data: articleService.transformArticle(data.data) };
    } catch (error: any) {
      console.error('Error updating article:', error);
      return { success: false, error: error.message || 'Failed to update article. Please try again.' };
    }
  },

  // Get authors for article creation (Admin only)
  getAuthors: async (): Promise<{ success: boolean; data?: any[]; error?: string }> => {
    try {
      console.log('👥 Fetching available authors');

      const response = await fetch(`${API_BASE_URL}/api/users/authors`, {
        credentials: 'include',
      });

      console.log('📡 Authors response status:', response.status);

      const data = await response.json();
      console.log('✅ Authors response:', data);

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Failed to fetch authors: ${response.statusText}`
        };
      }

      return {
        success: true,
        data: data.data
      };

    } catch (error) {
      console.error('Error fetching authors:', error);
      return {
        success: false,
        error: 'Failed to fetch authors. Please try again.'
      };
    }
  },

  // Create new article
  createArticle: async (articleData: any): Promise<{ success: boolean; data?: Article; error?: string }> => {
    try {
      console.log('📝 Creating new article:', articleData);

      const response = await fetch('${API_BASE_URL}/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(articleData),
      });

      console.log('📡 Create article response status:', response.status);

      const data = await response.json();
      console.log('✅ Create article response:', data);

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Failed to create article: ${response.statusText}`
        };
      }

      return {
        success: true,
        data: articleService.transformArticle(data.data)
      };

    } catch (error) {
      console.error('Error creating article:', error);
      return {
        success: false,
        error: 'Failed to create article. Please try again.'
      };
    }
  },

  // Change article author (Admin only)
  changeArticleAuthor: async (articleId: string, newAuthorId: string): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      console.log('👤 Changing article author:', articleId, 'to:', newAuthorId);

      const response = await fetch(`${API_BASE_URL}/api/articles/${articleId}/author`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ newAuthorId }),
      });

      console.log('📡 Change author response status:', response.status);

      const data = await response.json();
      console.log('✅ Change author response:', data);

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Failed to change article author: ${response.statusText}`
        };
      }

      return {
        success: true,
        data: data.data
      };

    } catch (error) {
      console.error('Error changing article author:', error);
      return {
        success: false,
        error: 'Failed to change article author. Please try again.'
      };
    }
  }
};
