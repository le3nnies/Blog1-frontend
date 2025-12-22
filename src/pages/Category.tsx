import { useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/Layout/Layout";
import { ArticleCard } from "@/components/Articles/ArticleCard";
import { TrendingWidget } from "@/components/Sidebar/TrendingWidget";
import { NewsletterSignup } from "@/components/Sidebar/NewsletterSignup";
import { Article } from "@/data/articles.types";
import { articleService } from "@/services/articleService";
import AdPlacement from "@/components/Ads/AdPlacement";

const Category = () => {
  const { category } = useParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categoryName = useMemo(() => 
    category?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "", 
    [category]
  );

  // Fetch all articles from backend
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedArticles = await articleService.getAllArticles({
          sortBy: 'publishedAt',
          sortOrder: 'desc'
        });
        setArticles(fetchedArticles);
      } catch (err: any) {
        console.error('Error fetching articles:', err);
        setError(err.message || 'Failed to load articles');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Filter articles when category or articles change
  useEffect(() => {
    if (category && articles.length > 0) {
      const filtered = articles.filter(
        (article) => article.category.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-") === category
      );
      setFilteredArticles(filtered);
    } else {
      setFilteredArticles([]);
    }
  }, [category, articles]);

  // Loading skeleton
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2">
                <div className="animate-pulse">
                  {/* Horizontal skeleton grid */}
                  <div className="flex overflow-x-auto pb-4 -mx-2 px-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex-shrink-0 w-80 mx-2">
                        <div className="group">
                          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl h-48 mb-5 overflow-hidden"></div>
                          <div className="space-y-4">
                            <div className="bg-gradient-to-r from-gray-100 to-gray-200 h-4 rounded-full w-32"></div>
                            <div className="bg-gradient-to-r from-gray-100 to-gray-200 h-6 rounded-lg w-5/6"></div>
                            <div className="bg-gradient-to-r from-gray-100 to-gray-200 h-4 rounded-lg w-2/3"></div>
                            <div className="flex items-center gap-4 pt-3">
                              <div className="bg-gradient-to-r from-gray-100 to-gray-200 h-8 w-8 rounded-full"></div>
                              <div className="space-y-2 flex-1">
                                <div className="bg-gradient-to-r from-gray-100 to-gray-200 h-3 rounded w-24"></div>
                                <div className="bg-gradient-to-r from-gray-100 to-gray-200 h-2 rounded w-16"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <div className="sticky top-28 space-y-8">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl h-80 animate-pulse"></div>
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl h-64 animate-pulse"></div>
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl h-96 animate-pulse"></div>
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
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-md mx-auto text-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-red-200 to-pink-200 rounded-full blur opacity-30 animate-pulse"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Something went wrong</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white font-medium rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                <span className="relative z-10">Try Again</span>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          {/* Error Banner */}
          {error && (
            <div className="mb-10">
              <div className="relative bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-5 rounded-xl shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-red-800 font-medium">There was an error loading content</p>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Category Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  {categoryName}
                </h1>
                <p className="text-gray-600">
                  {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} in this category
                </p>
              </div>

              {/* Header Ad */}
              <div className="mb-10">
                <AdPlacement 
                  category={categoryName} 
                  position="header" 
                  limit={1}
                />
              </div>

              {/* Articles Grid - HORIZONTAL LAYOUT */}
              <div className="space-y-12">
                {filteredArticles.length > 0 ? (
                  <>
                    {/* Horizontal scroll container for articles */}
                    <div className="relative">
                      <div className="flex overflow-x-auto pb-6 -mx-2 px-2 snap-x snap-mandatory">
                        {filteredArticles.map((article, index) => (
                          <div 
                            key={article.id} 
                            className="flex-shrink-0 w-80 mx-2 snap-start"
                          >
                            <ArticleCard
                              article={article}
                              variant="compact" // Use compact mode for horizontal layout
                            />
                          </div>
                        ))}
                      </div>
                      
                      {/* Scroll indicator */}
                      {filteredArticles.length > 3 && (
                        <div className="flex justify-center items-center gap-2 mt-6">
                          <span className="text-sm text-gray-500">
                            Scroll horizontally to see more articles →
                          </span>
                        </div>
                      )}
                    </div>

                    {/* OR: If you prefer a responsive grid instead of horizontal scroll, use this: */}
                    {/* 
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredArticles.map((article, index) => (
                        <div key={article.id}>
                          <ArticleCard article={article} compact={true} />
                        </div>
                      ))}
                    </div>
                    */}

                    {/* Show ad after article list */}
                    {filteredArticles.length > 0 && (
                      <div className="mt-12 pt-12 border-t border-gray-200">
                        <div className="relative">
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="px-4 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 text-xs font-medium rounded-full border border-gray-300">
                              Advertisement
                            </span>
                          </div>
                          <AdPlacement 
                            category={categoryName} 
                            position="inline" 
                            limit={1}
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-20">
                    <div className="relative mb-8">
                      <div className="w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-14 h-14 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full blur opacity-30"></div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">No articles found</h3>
                    <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                      We couldn't find any articles in this category. Check back later for new content.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-10">
              <div className="sticky top-28 space-y-10">
                {/* Sidebar Ads */}
                <div className="space-y-8">
                  <AdPlacement 
                    category={categoryName} 
                    position="sidebar" 
                    limit={2}
                  />
                </div>
                
                <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl p-7 shadow-sm border border-gray-100">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <span className="bg-gradient-to-r from-blue-500 to-purple-500 w-1.5 h-6 rounded-full"></span>
                      Trending Now
                    </h3>
                  </div>
                  <TrendingWidget />
                </div>
                
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-7 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="relative z-10">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 w-1.5 h-6 rounded-full"></span>
                        Stay Updated
                      </h3>
                      <p className="text-gray-300 text-sm mt-2">
                        Get the latest articles delivered to your inbox
                      </p>
                    </div>
                    <NewsletterSignup />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Category;