'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { IconRefresh } from '@tabler/icons-react';
import { WorkflowStepsStatisticsHeader } from './workflow-steps-statistics-header';
import { WorkflowStepsStatisticsFilter } from './workflow-steps-statistics-filter';
import { WorkflowStepsStatisticsCard } from './workflow-steps-statistics-card';
import { WorkflowStepsStatisticsResponse } from '../types/workflow-steps-statistics';
import { Separator } from '@/components/ui/separator';

interface WorkflowStepsStatisticsProps {
  initialData?: WorkflowStepsStatisticsResponse;
  initialQuery?: unknown;
  error?: string | null;
}

export function WorkflowStepsStatistics({
  initialData,
  error: initialError
}: WorkflowStepsStatisticsProps) {
  const router = useRouter();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  function onRefresh() {
    router.refresh();
    setLastRefresh(new Date());
  }

  function onExport() {
    // TODO: Implement export functionality
    // Export logic will be implemented here
  }

  const units = initialData?.data?.units || [];

  // Calculate totals across all units
  const totals = units.reduce(
    (acc, unit) => ({
      totalWorkflowSteps:
        acc.totalWorkflowSteps + (unit.totalWorkflowSteps || 0),
      totalPending: acc.totalPending + (unit.pendingCount || 0),
      totalInProgress: acc.totalInProgress + (unit.inProgressCount || 0),
      totalCompleted: acc.totalCompleted + (unit.completedCount || 0),
      totalRejected: acc.totalRejected + (unit.rejectedCount || 0),
      totalDelegated: acc.totalDelegated + (unit.delegatedCount || 0),
      totalReturned: acc.totalReturned + (unit.returnedCount || 0),
      totalDelayed: acc.totalDelayed + (unit.delayedCount || 0)
    }),
    {
      totalWorkflowSteps: 0,
      totalPending: 0,
      totalInProgress: 0,
      totalCompleted: 0,
      totalRejected: 0,
      totalDelegated: 0,
      totalReturned: 0,
      totalDelayed: 0
    }
  );

  const error =
    initialError ||
    (initialData && !initialData.succeeded ? initialData.message : null);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <WorkflowStepsStatisticsHeader
        lastRefresh={lastRefresh}
        onRefresh={onRefresh}
        onExport={onExport}
        loading={false}
      />
      <Separator />
      {/* Filter */}
      <div className='flex justify-end'>
        <WorkflowStepsStatisticsFilter />
      </div>

      {/* Content */}
      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='size-4' />
          <AlertTitle>خطأ في تحميل البيانات</AlertTitle>
          <AlertDescription>
            {typeof error === 'string'
              ? error
              : 'حدث خطأ أثناء تحميل إحصائيات خطوات سير العمل. يرجى المحاولة مرة أخرى.'}
          </AlertDescription>
          <div className='mt-4'>
            <Button variant='outline' onClick={onRefresh} size='sm'>
              <IconRefresh className='ml-2 size-4' />
              إعادة المحاولة
            </Button>
          </div>
        </Alert>
      )}

      {!error && units.length === 0 && (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <AlertCircle className='text-muted-foreground mb-4 size-12' />
            <h3 className='text-muted-foreground mb-2 text-lg font-semibold'>
              لا توجد بيانات
            </h3>
            <p className='text-muted-foreground text-center text-sm'>
              لم يتم العثور على أي إحصائيات بناءً على معايير الفلترة المحددة.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {!error && totals.totalWorkflowSteps > 0 && (
        <Card>
          <CardContent className='pt-6'>
            <div className='grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8'>
              <div className='text-center'>
                <div className='text-2xl font-bold'>
                  {totals.totalWorkflowSteps.toLocaleString('en-US')}
                </div>
                <div className='text-muted-foreground text-xs'>
                  إجمالي الخطوات
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-blue-600'>
                  {totals.totalPending.toLocaleString('en-US')}
                </div>
                <div className='text-muted-foreground text-xs'>
                  قيد الانتظار
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-amber-600'>
                  {totals.totalInProgress.toLocaleString('en-US')}
                </div>
                <div className='text-muted-foreground text-xs'>
                  قيد التنفيذ
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-600'>
                  {totals.totalCompleted.toLocaleString('en-US')}
                </div>
                <div className='text-muted-foreground text-xs'>مكتملة</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-red-600'>
                  {totals.totalRejected.toLocaleString('en-US')}
                </div>
                <div className='text-muted-foreground text-xs'>مرفوضة</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-purple-600'>
                  {totals.totalDelegated.toLocaleString('en-US')}
                </div>
                <div className='text-muted-foreground text-xs'>معينة</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-orange-600'>
                  {totals.totalReturned.toLocaleString('en-US')}
                </div>
                <div className='text-muted-foreground text-xs'>مرتجعة</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-red-600'>
                  {totals.totalDelayed.toLocaleString('en-US')}
                </div>
                <div className='text-muted-foreground text-xs'>متأخرة</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!error && units.length > 0 && (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {units.map((unit) => (
            <WorkflowStepsStatisticsCard
              key={unit.unitId}
              data={unit}
              onClick={() => {
                // TODO: Navigate to unit details or filter by unit
                // Navigation logic will be implemented here
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

