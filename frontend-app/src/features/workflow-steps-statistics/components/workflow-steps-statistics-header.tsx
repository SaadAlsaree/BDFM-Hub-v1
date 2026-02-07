'use client';

import { Button } from '@/components/ui/button';
import {
  IconRefresh,
  IconDownload,
  IconChartBar,
  IconCalendar,
  IconFileExport
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useAuthApi } from '@/hooks/use-auth-api';
import { workflowStepsStatisticsService } from '../api/workflow-steps-statistics.service';
import { toast } from 'sonner';
import { useState } from 'react';

interface WorkflowStepsStatisticsHeaderProps {
  lastRefresh?: Date;
  onRefresh?: () => void;
  onExport?: () => void;
  loading?: boolean;
}

export function WorkflowStepsStatisticsHeader({
  lastRefresh,
  onRefresh,
  onExport,
  loading = false
}: WorkflowStepsStatisticsHeaderProps) {
  const { authApiCall } = useAuthApi();
  const [downloading, setDownloading] = useState(false);

  const handleDownloadReport = async () => {
    try {
      setDownloading(true);
      const data = await authApiCall(() =>
        workflowStepsStatisticsService.downloadDelayedStepsReport()
      );

      if (data) {
        // Create blob link to download
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `خطوات سير العمل المتأخرة_${new Date().toLocaleDateString('ar-IQ').replace(/\//g, '-')}.pdf`
        );

        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();

        // Clean up and remove the link
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('تم تحميل التقرير بنجاح');
      } else {
        toast.error('فشل في تحميل التقرير');
      }
    } catch (error) {
      console.error('Download report error:', error);
      toast.error('حدث خطأ أثناء تحميل التقرير');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
      <div className='space-y-1'>
        <h1 className='flex items-center gap-2 text-2xl font-bold tracking-tight'>
          <IconChartBar className='size-6' />
          إحصائيات خطوات سير العمل
        </h1>
        <p className='text-muted-foreground text-sm'>
          عرض إحصائيات خطوات سير العمل حسب التشكيلات
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

        <Button
          variant='outline'
          onClick={handleDownloadReport}
          disabled={downloading}
          className='flex items-center gap-2'
        >
          <IconFileExport
            className={cn('size-4', downloading && 'animate-spin')}
          />
          تقرير المتأخرات
        </Button>

        {onRefresh && (
          <Button
            variant='default'
            onClick={onRefresh}
            disabled={loading}
            className='flex items-center gap-2'
          >
            <IconRefresh className={cn('size-4', loading && 'animate-spin')} />
            تحديث
          </Button>
        )}
      </div>
    </div>
  );
}

