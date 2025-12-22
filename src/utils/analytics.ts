export const trackArticleView = (articleId: string, title: string, category: string) => {
  if (typeof window === 'undefined') return;
  
  if (window.gtag) {
    window.gtag('event', 'article_view', {
      article_id: articleId,
      article_title: title,
      category,
      timestamp: new Date().toISOString()
    });
  }
  
  // Store in local storage for recommendations
  const viewHistory = JSON.parse(localStorage.getItem('article_view_history') || '[]');
  const updatedHistory = [
    { id: articleId, timestamp: new Date().toISOString() },
    ...viewHistory.slice(0, 99)
  ];
  localStorage.setItem('article_view_history', JSON.stringify(updatedHistory));
};

export const trackShare = (articleId: string, platform: string) => {
  if (window.gtag) {
    window.gtag('event', 'article_share', {
      article_id: articleId,
      platform,
      timestamp: new Date().toISOString()
    });
  }
};