import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rounded',
  width,
  height,
}) => {
  const variantClass = {
    text: 'rounded-md h-4 my-1',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
  }[variant];

  return (
    <div
      style={{ width, height }}
      className={`skeleton-shimmer bg-paper-border/60 dark:bg-white/10 ${variantClass} ${className}`}
      aria-hidden="true"
    />
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full space-y-3 p-4">
      <div className="flex items-center justify-between pb-3 border-b border-paper-border dark:border-paper-border">
        <Skeleton className="w-32 h-4" />
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-16 h-4" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-3 space-x-4">
          <div className="flex items-center space-x-3 w-1/3">
            <Skeleton variant="circular" className="w-9 h-9 flex-shrink-0" />
            <div className="space-y-1.5 w-full">
              <Skeleton className="w-3/4 h-3.5" />
              <Skeleton className="w-1/2 h-2.5" />
            </div>
          </div>
          <Skeleton className="w-28 h-3.5" />
          <Skeleton className="w-20 h-6 rounded-full" />
          <Skeleton className="w-16 h-3.5" />
          <Skeleton className="w-12 h-6" />
        </div>
      ))}
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl w-full mx-auto px-6 md:px-10 py-8 space-y-10 animate-fade-in">
      {/* Hero Skeleton */}
      <div className="p-8 md:p-12 rounded-3xl bg-forest-900/40 dark:bg-[#121C17] border border-forest-700/30 space-y-6">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-36 h-6 rounded-full bg-white/20" />
          <Skeleton className="w-48 h-4 bg-white/10" />
        </div>
        <div className="space-y-3">
          <Skeleton className="w-3/4 h-10 bg-white/20" />
          <Skeleton className="w-1/2 h-8 bg-white/15" />
          <Skeleton className="w-2/3 h-4 bg-white/10 pt-2" />
        </div>
        <div className="flex items-center space-x-4 pt-2">
          <Skeleton className="w-44 h-11 rounded-xl bg-amber-500/40" />
          <Skeleton className="w-48 h-11 rounded-xl bg-white/15" />
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="w-40 h-4" />
          <Skeleton className="w-32 h-4" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="luxury-card p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-10 h-10 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="w-20 h-8" />
                <Skeleton className="w-28 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table Section Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-64 h-3" />
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="w-48 h-9 rounded-xl" />
            <Skeleton className="w-20 h-9 rounded-xl" />
          </div>
        </div>
        <div className="luxury-card rounded-2xl overflow-hidden">
          <TableSkeleton rows={4} />
        </div>
      </div>
    </div>
  );
};

export const DocumentViewerSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl w-full mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      {/* Left PDF Preview Skeleton */}
      <div className="lg:col-span-7 luxury-card p-6 rounded-2xl space-y-4 min-h-[600px] flex flex-col justify-between">
        <div className="flex items-center justify-between pb-4 border-b border-paper-border dark:border-paper-border">
          <Skeleton className="w-48 h-5" />
          <div className="flex space-x-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
        </div>
        <div className="space-y-4 flex-1 py-6">
          <Skeleton className="w-full h-8" />
          <Skeleton className="w-5/6 h-4" />
          <Skeleton className="w-4/6 h-4" />
          <Skeleton className="w-full h-32 rounded-xl" />
          <Skeleton className="w-3/4 h-4" />
          <Skeleton className="w-5/6 h-4" />
        </div>
      </div>

      {/* Right Verification Results Skeleton */}
      <div className="lg:col-span-5 space-y-4">
        <div className="luxury-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="w-36 h-5" />
            <Skeleton className="w-24 h-6 rounded-full" />
          </div>
          <Skeleton className="w-full h-24 rounded-xl" />
        </div>

        <div className="luxury-card p-6 rounded-2xl space-y-3">
          <Skeleton className="w-40 h-5" />
          <div className="space-y-2">
            <Skeleton className="w-full h-12 rounded-xl" />
            <Skeleton className="w-full h-12 rounded-xl" />
            <Skeleton className="w-full h-12 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
