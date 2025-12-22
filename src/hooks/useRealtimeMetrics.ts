// hooks/useRealtimeMetrics.ts
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface RealtimeMetrics {
  activeUsers: number;
  currentViews: number;
  topPage: string;
  avgSessionTime: number;
}

export function useRealtimeMetrics() {
  const [data, setData] = useState<RealtimeMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      const response = await api.get('/analytics/realtime');
      setData(response.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch real-time metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { data, isLoading, error };
}