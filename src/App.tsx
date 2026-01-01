import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import Home from "./pages/Home";
import Article from "./pages/Article";
import Category from "./pages/Category";
import Newsletter from "./pages/Newsletter";
import AdminDashboard from "./pages/Admin/Dashboard";
import ArticleEditor from "./pages/Admin/Editor";
import AdsDashboard from "./pages/Admin/AdsDashboard";
import AdCampaignForm from "./pages/Admin/AdCampaignForm";
import AdCampaignView from "./pages/Admin/AdCampaignView"; 
import AdsSettings from "./pages/Admin/AdsSettings";
import Analytics from "./pages/Admin/Analytics";
import AuthorManagement from "./pages/Admin/AuthorManagement";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import Login from "@/components/Auth/Login";

// Secure login route guard
const SecureLoginRoute = () => {
  // Check for specific access token or query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = urlParams.get('access');

  // Only allow access if the correct access token is provided
  if (accessToken !== 'secure-admin-portal-2024') {
    return <NotFound />;
  }

  return <Login />;
};

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        {/* Wrap everything with AuthProvider */}
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/article/:slug" element={<Article />} />
            <Route path="/category/:category" element={<Category />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin-access-secure-portal" element={<SecureLoginRoute />} />
            
            {/* Protected admin routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/editor" 
              element={
                <ProtectedRoute>
                  <ArticleEditor />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/editor/:slug" 
              element={
                <ProtectedRoute>
                  <ArticleEditor />
                </ProtectedRoute>
              } 
            />

            {/* Ads Management Routes */}
            <Route 
              path="/admin/ads" 
              element={
                <ProtectedRoute>
                  <AdsDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/ads/new-campaign" 
              element={
                <ProtectedRoute>
                  <AdCampaignForm />
                </ProtectedRoute>
              } 
            />
            {/* ADD THESE MISSING ROUTES */}
            <Route 
              path="/admin/ads/:id" 
              element={
                <ProtectedRoute>
                  <AdCampaignView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/ads/:id/edit" 
              element={
                <ProtectedRoute>
                  <AdCampaignForm />
                </ProtectedRoute>
              } 
            />
            {/* Keep your existing edit route for compatibility */}
            <Route 
              path="/admin/ads/edit-campaign/:id" 
              element={
                <ProtectedRoute>
                  <AdCampaignForm />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/admin/ads/settings"
              element={
                <ProtectedRoute>
                  <AdsSettings />
                </ProtectedRoute>
              }
            />

            {/* Analytics Route */}
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />

            {/* Author Management Route */}
            <Route
              path="/admin/authors"
              element={
                <ProtectedRoute>
                  <AuthorManagement />
                </ProtectedRoute>
              }
            />

            <Route path="/newsletter" element={<Newsletter />} />
            

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;