import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export const HotelCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3.5 w-1/2" />
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3.5 w-3.5 rounded-full" />
          ))}
          <Skeleton className="h-3.5 w-16 ml-1" />
        </div>
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-12 rounded-md" />
          <Skeleton className="h-5 w-14 rounded-md" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
