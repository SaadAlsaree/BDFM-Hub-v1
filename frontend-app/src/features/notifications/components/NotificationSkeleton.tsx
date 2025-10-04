'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface NotificationSkeletonProps {
  compact?: boolean;
}

export function NotificationSkeleton({
  compact = false
}: NotificationSkeletonProps) {
  if (compact) {
    return (
      <div className='flex items-start gap-3 rounded-lg p-3'>
        <Skeleton className='mt-0.5 h-4 w-4 rounded-full' />
        <div className='min-w-0 flex-1'>
          <div className='flex items-start justify-between gap-2'>
            <div className='min-w-0 flex-1 space-y-2'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-3 w-3/4' />
            </div>
            <Skeleton className='h-3 w-12' />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='flex items-start gap-4'>
          <Skeleton className='mt-1 h-4 w-4 rounded-full' />

          <div className='min-w-0 flex-1'>
            <div className='flex items-start justify-between gap-4'>
              <div className='min-w-0 flex-1 space-y-3'>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-5 w-20 rounded-full' />
                  <Skeleton className='h-5 w-12 rounded-full' />
                </div>

                <div className='space-y-2'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-4/5' />
                </div>

                <Skeleton className='h-3 w-32' />
              </div>

              <div className='flex flex-shrink-0 flex-col items-end gap-2'>
                <Skeleton className='h-3 w-16' />
                <Skeleton className='h-3 w-3 rounded-full' />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
