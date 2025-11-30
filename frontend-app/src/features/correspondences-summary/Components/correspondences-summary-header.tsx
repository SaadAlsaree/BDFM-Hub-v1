'use client';

import { Button } from '@/components/ui/button';
import { IconRefresh, IconDownload, IconChartBar, IconCalendar } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface CorrespondencesSummaryHeaderProps {
  lastRefresh?: Date;
  onRefresh?: () => void;
  onExport?: () => void;
  loading?: boolean;
}

export function CorrespondencesSummaryHeader({
  lastRefresh,
  onRefresh,
  onExport,
  loading = false
}: CorrespondencesSummaryHeaderProps) {
  return (
    <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
      <div className='space-y-1'>
        <h1 className='flex items-center gap-2 text-2xl font-bold tracking-tight'>
          <IconChartBar className='size-6' />
          ملخص الكتب
        </h1>
        <p className='text-muted-foreground text-sm'>
          عرض إحصائيات الكتب حسب التشكيلات
        </p>
      </div>

      <div className='flex items-center gap-2'>
        {lastRefresh && (
          <div className='text-muted-foreground hidden items-center gap-2 text-sm md:flex'>
            <IconCalendar className='size-4' />
            <span>
              آخر تحديث:{' '}
              {lastRefresh.toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        )}

        {/* {onExport && (
          <Button
            variant='outline'
            onClick={onExport}
            className='flex items-center gap-2'
          >
            <IconDownload className='size-4' />
            تصدير
          </Button>
        )}

        {onRefresh && (
          <Button
            variant='default'
            onClick={onRefresh}
            disabled={loading}
            className='flex items-center gap-2'
          >
            <IconRefresh
              className={cn('size-4', loading && 'animate-spin')}
            />
            تحديث
          </Button>
        )} */}
      </div>
    </div>
  );
}

