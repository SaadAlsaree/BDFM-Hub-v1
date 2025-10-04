'use client';

import React from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationEmptyProps {
  compact?: boolean;
  onRefresh?: () => void;
}

export function NotificationEmpty({
  compact = false,
  onRefresh
}: NotificationEmptyProps) {
  if (compact) {
    return (
      <div className='flex flex-col items-center justify-center p-6 text-center'>
        <BellOff className='text-muted-foreground mb-2 h-8 w-8' />
        <p className='text-muted-foreground text-sm'>لا يوجد إشعارات</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center justify-center p-12 text-center'>
      <div className='bg-muted mb-4 rounded-full p-6'>
        <Bell className='text-muted-foreground h-12 w-12' />
      </div>

      <h3 className='mb-2 text-lg font-semibold'>لا يوجد إشعارات</h3>

      <p className='text-muted-foreground mb-6 max-w-sm'>
        لا يوجد إشعارات جديدة حالياً. سنضيف لك إشعارات عندما يحدث شيء مهم.
      </p>

      {onRefresh && (
        <Button variant='outline' onClick={onRefresh} className='mb-2'>
          تحديث
        </Button>
      )}

      <p className='text-muted-foreground text-xs'>
        سيظهر الإشعارات هنا في الوقت الفعلي
      </p>
    </div>
  );
}
