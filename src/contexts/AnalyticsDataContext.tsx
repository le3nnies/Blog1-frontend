import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';

interface AnalyticsDataContextType {
  data: any;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const AnalyticsDataContext = createContext<AnalyticsDataContextType | undefined>(undefined);

export function AnalyticsDataProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, error, refetch } = useAnalyticsData();

  return (
    <AnalyticsDataContext.Provider value={{ data, isLoading, error, refetch }}>
      {children}
    </AnalyticsDataContext.Provider>
  );
}

export const useAnalyticsDataContext = () => {
  const context = useContext(AnalyticsDataContext);
  if (!context) {
    throw new Error('useAnalyticsDataContext must be used within AnalyticsDataProvider');
  }
  return context;
};
