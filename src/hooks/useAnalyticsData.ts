// hooks/useAnalyticsData.ts
import { useState, useEffect, useCallback } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { api } from '@/lib/api';
import { AnalyticsData } from '@/types/analytics.types';

export function useAnalyticsData() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { dateRange, selectedPeriod, compareWithPrevious } = useDashboard();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = {
        startDate: dateRange?.from?.toISOString(),
        endDate: dateRange?.to?.toISOString(),
        period: selectedPeriod,
        compare: compareWithPrevious,
      };

      const response = await api.get('/analytics/', { params });
      setData(response.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, selectedPeriod, compareWithPrevious]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}