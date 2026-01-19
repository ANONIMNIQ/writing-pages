import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const DraftSkeleton = () => {
  return (
    <div className="flex items-center justify-between py-5 border-b border-foreground/[0.03] px-4 -mx-4">
      <div className="flex-1 flex items-center space-x-6">
        <Skeleton className="h-8 w-3/4 bg-foreground/5" />
      </div>
      <div className="flex items-center space-x-6">
        <div className="w-4 h-4 rounded-full bg-foreground/5" />
      </div>
    </div>
  );
};

export default DraftSkeleton;