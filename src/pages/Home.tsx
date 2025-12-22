import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { ArticleCard } from "@/components/Articles/ArticleCard";
import { NewsletterSignup } from "@/components/Sidebar/NewsletterSignup";
import { Article } from "@/data/articles.types";
import { articleService } from "@/services/articleService";

// Helper function to generate slug from title
const generateSlugFromTitle = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// Ensure all articles have valid slugs
const ensureArticleSlugs = (articles: Article[]): Article[] => {
  return articles.map(article => ({
    ...article,
    slug: article.slug || generateSlugFromTitle(article.title) || `article-${article.id}`
  }));
};

const Home = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery);
    } else {
      setFilteredArticles(articles);
    }
  }, [searchQuery, articles]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedArticles = await articleService.getAllArticles({
        limit: 20,
        sortBy: 'publishedAt',
        sortOrder: 'desc'
      });
      
      const articlesWithSlugs = ensureArticleSlugs(fetchedArticles);
      setArticles(articlesWithSlugs);
      setFilteredArticles(articlesWithSlugs);
    } catch (err: any) {
      console.error('Error fetching articles:', err);
      setError(err.message || 'Failed to load articles');
      setArticles([]);
      setFilteredArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    try {
      setLoading(true);
      const searchResults = await articleService.searchArticles(query);
      const searchResultsWithSlugs = ensureArticleSlugs(searchResults);
      setFilteredArticles(searchResultsWithSlugs);
    } catch (err: any) {
      console.error('Error searching articles:', err);
      setError(err.message || 'Search failed');
      const filtered = articles.filter(
        (article) =>
          article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.excerpt.toLowerCase().includes(query.toLowerCase()) ||
          article.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredArticles(filtered);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 py-8">
            {/* Search results skeleton */}
            {searchQuery && (
              <div className="mb-8">
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-64 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-48 animate-pulse"></div>
              </div>
            )}
            
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Main content - 3 columns */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-xs p-5 hover:shadow-sm transition-shadow duration-200 animate-pulse min-h-[200px]">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-20"></div>
                          <div className="h-1 w-1 bg-gray-200 rounded-full"></div>
                          <div className="h-2.5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-14"></div>
                        </div>
                        <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-4/5"></div>
                        <div className="h-3.5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full"></div>
                        <div className="h-3.5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-24"></div>
                            <div className="h-2.5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-12"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Sidebar - Newsletter skeleton */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-6 animate-pulse">
                  <div className="space-y-4">
                    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-5/6"></div>
                    <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && articles.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-8">
              <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                <span className="text-xl">📚</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 mb-3">Unable to Load Content</h1>
              <p className="text-gray-600 mb-6 text-sm">{error}</p>
              <button 
                onClick={fetchArticles}
                className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          {/* Search Results Header */}
          {searchQuery && (
            <div className="mb-8 bg-white rounded-xl border border-gray-200 shadow-xs p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 mb-1">
                    Search Results for "<span className="text-blue-600">{searchQuery}</span>"
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Found {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'}
                  </p>
                </div>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors self-start"
                >
                  Clear Search
                </button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 text-sm">!</span>
                </div>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* No Results */}
          {filteredArticles.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-200 shadow-xs p-8">
                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {searchQuery ? 'No articles found' : 'No content available'}
                </h3>
                <p className="text-gray-600 mb-6 text-sm">
                  {searchQuery 
                    ? 'Try adjusting your search terms or browse our latest articles.'
                    : 'Check back soon for new content.'
                  }
                </p>
                {searchQuery && (
                  <button 
                    onClick={() => window.location.href = '/'}
                    className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    View All Articles
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Main Content with Newsletter Sidebar */}
          {filteredArticles.length > 0 && (
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Articles Grid - 3 columns */}
              <div className="lg:col-span-3">
                {!searchQuery && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Latest Articles</h2>
                    <p className="text-gray-600 text-sm mt-1">Fresh insights and stories curated for you</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles.map((article) => {
                    if (!article.slug) {
                      console.error('Article missing slug:', article);
                      return null;
                    }
                    return (
                      <div key={article.id} className="min-h-[200px]">
                        <ArticleCard article={article} />
                      </div>
                    );
                  })}
                </div>

                {!searchQuery && articles.length > 0 && (
                  <div className="pt-6 mt-8 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-gray-600 text-xs">Showing {filteredArticles.length} of {articles.length} articles</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Newsletter Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6 shadow-xs">
                    <NewsletterSignup />
                  </div>
                  
                  {/* Additional sidebar content can go here 
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
                    <h3 className="font-medium text-gray-900 mb-3">Quick Links</h3>
                    <ul className="space-y-2">
                      <li>
                        <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors block py-1">
                          Popular Tags
                        </a>
                      </li>
                      <li>
                        <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors block py-1">
                          Editor's Picks
                        </a>
                      </li>
                      <li>
                        <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors block py-1">
                          Archive
                        </a>
                      </li>
                    </ul>
                  </div>
                  */}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;