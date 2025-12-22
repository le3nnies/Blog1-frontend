// contexts/DashboardContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { DateRange } from 'react-day-picker';

interface DashboardContextType {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  compareWithPrevious: boolean;
  toggleCompareWithPrevious: () => void;
  chartType: 'area' | 'line' | 'bar';
  setChartType: (type: 'area' | 'line' | 'bar') => void;
  refreshData: () => Promise<void>;
  exportData: (format: 'csv' | 'excel' | 'pdf') => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    to: new Date(),
  });
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [compareWithPrevious, setCompareWithPrevious] = useState(false);
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar'>('area');

  const toggleCompareWithPrevious = useCallback(() => {
    setCompareWithPrevious(prev => !prev);
  }, []);

  const refreshData = useCallback(async () => {
    // Implementation will be added with data fetching
    console.log('Refreshing data...');
  }, []);

  const exportData = useCallback((format: 'csv' | 'excel' | 'pdf') => {
    // Implementation for exporting data
    console.log(`Exporting data as ${format}`);
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        dateRange,
        setDateRange,
        selectedPeriod,
        setSelectedPeriod,
        compareWithPrevious,
        toggleCompareWithPrevious,
        chartType,
        setChartType,
        refreshData,
        exportData,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};