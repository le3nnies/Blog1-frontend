// components/charts/ResponsiveChartContainer.tsx
import React from 'react';
import {
  ResponsiveContainer,
  ResponsiveContainerProps,
} from 'recharts';

interface ResponsiveChartContainerProps extends ResponsiveContainerProps {
  title?: string;
  description?: string;
  isLoading?: boolean;
  error?: string | null;
  height?: number;
}

export default function ResponsiveChartContainer({
  title,
  description,
  isLoading = false,
  error = null,
  height = 350,
  children,
  ...props
}: ResponsiveChartContainerProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {title && <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />}
        <div className="bg-gray-100 rounded-lg" style={{ height }}>
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Loading chart...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
        <div className="bg-red-50 border border-red-200 rounded-lg p-8" style={{ height }}>
          <div className="flex flex-col items-center justify-center h-full text-red-600">
            <div className="text-lg font-medium">Failed to load chart data</div>
            <div className="text-sm mt-2">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(title || description) && (
        <div>
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height} {...props}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}