'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  IconRobot,
  IconClock,
  IconCheck,
  IconX,
  IconTrendingUp,
  IconActivity,
  IconBolt
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { AutomationPerformanceMetrics } from '../types';

interface AutomationPerformanceProps {
  data?: AutomationPerformanceMetrics;
  loading?: boolean;
  error?: string;
  title?: string;
  description?: string;
}

export function AutomationPerformance({
  data,
  loading = false,
  error,
  title = 'أداء الأتمتة',
  description = 'مقاييس أداء العمليات الآلية ومعدلات النجاح'
}: AutomationPerformanceProps) {
  if (loading) {
    return (
      <AutomationPerformanceSkeleton title={title} description={description} />
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <IconRobot className='size-5' />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-muted-foreground flex h-[300px] items-center justify-center'>
            {error ? 'خطأ في تحميل البيانات' : 'لا توجد بيانات متاحة'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const successRate = (data.successRate || 0) * 100;
  const failureRate = 100 - successRate;

  function getSuccessRateColor(rate: number) {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-blue-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-red-600';
  }

  function getSuccessRateBg(rate: number) {
    if (rate >= 95)
      return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800';
    if (rate >= 85)
      return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
    if (rate >= 75)
      return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <IconRobot className='size-5' />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Overall Performance Summary */}
        <div
          className={cn('rounded-lg border p-4', getSuccessRateBg(successRate))}
        >
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-semibold'>الأداء العام للأتمتة</h3>
              <p className='text-muted-foreground text-sm'>
                معدل نجاح العمليات الآلية
              </p>
            </div>
            <div className='text-right'>
              <div
                className={cn(
                  'text-3xl font-bold',
                  getSuccessRateColor(successRate)
                )}
              >
                {successRate.toFixed(1)}%
              </div>
              <Badge
                variant={
                  successRate >= 90
                    ? 'default'
                    : successRate >= 75
                      ? 'secondary'
                      : 'destructive'
                }
                className='mt-1'
              >
                {successRate >= 90
                  ? 'ممتاز'
                  : successRate >= 75
                    ? 'جيد'
                    : 'يحتاج تحسين'}
              </Badge>
            </div>
          </div>

          {/* Success Rate Progress */}
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span>معدل النجاح</span>
              <span>{successRate.toFixed(1)}%</span>
            </div>
            <Progress value={successRate} className='h-3' />
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
          <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 text-center dark:border-blue-800 dark:bg-blue-950/20'>
            <IconActivity className='mx-auto mb-2 size-8 text-blue-600' />
            <div className='text-2xl font-bold text-blue-600'>
              {(data.totalExecutions || 0).toLocaleString('ar-IQ')}
            </div>
            <div className='text-muted-foreground text-sm'>إجمالي العمليات</div>
          </div>

          <div className='rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-800 dark:bg-green-950/20'>
            <IconCheck className='mx-auto mb-2 size-8 text-green-600' />
            <div className='text-2xl font-bold text-green-600'>
              {(data.successfulExecutions || 0).toLocaleString('ar-IQ')}
            </div>
            <div className='text-muted-foreground text-sm'>عمليات ناجحة</div>
          </div>

          <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-center dark:border-red-800 dark:bg-red-950/20'>
            <IconX className='mx-auto mb-2 size-8 text-red-600' />
            <div className='text-2xl font-bold text-red-600'>
              {(data.failedExecutions || 0).toLocaleString('ar-IQ')}
            </div>
            <div className='text-muted-foreground text-sm'>عمليات فاشلة</div>
          </div>

          <div className='rounded-lg border border-purple-200 bg-purple-50 p-4 text-center dark:border-purple-800 dark:bg-purple-950/20'>
            <IconClock className='mx-auto mb-2 size-8 text-purple-600' />
            <div className='text-2xl font-bold text-purple-600'>
              {(data.averageExecutionTime || 0).toFixed(1)}
            </div>
            <div className='text-muted-foreground text-sm'>
              متوسط وقت التنفيذ (ثانية)
            </div>
          </div>
        </div>

        {/* Success vs Failure Breakdown */}
        <div className='space-y-4'>
          <h4 className='font-semibold'>تفصيل النتائج</h4>

          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className='h-4 w-4 rounded-full bg-green-500'></div>
                <span className='text-sm'>عمليات ناجحة</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium'>
                  {(data.successfulExecutions || 0).toLocaleString('ar-IQ')}
                </span>
                <span className='text-muted-foreground text-xs'>
                  ({successRate.toFixed(1)}%)
                </span>
              </div>
            </div>
            <Progress value={successRate} className='h-2' />

            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className='h-4 w-4 rounded-full bg-red-500'></div>
                <span className='text-sm'>عمليات فاشلة</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium'>
                  {(data.failedExecutions || 0).toLocaleString('ar-IQ')}
                </span>
                <span className='text-muted-foreground text-xs'>
                  ({failureRate.toFixed(1)}%)
                </span>
              </div>
            </div>
            <Progress value={failureRate} className='h-2' />
          </div>
        </div>

        {/* Automation Types Performance */}
        {data.automationTypes && data.automationTypes.length > 0 && (
          <div className='space-y-4'>
            <h4 className='font-semibold'>أداء أنواع الأتمتة</h4>
            <div className='space-y-3'>
              {data.automationTypes.map((type, index) => {
                const typeSuccessRate = (type.successRate || 0) * 100;
                return (
                  <div key={index} className='rounded-lg border p-3'>
                    <div className='mb-2 flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <IconBolt className='text-muted-foreground size-4' />
                        <span className='font-medium'>{type.type}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant={
                            typeSuccessRate >= 90
                              ? 'default'
                              : typeSuccessRate >= 75
                                ? 'secondary'
                                : 'destructive'
                          }
                          className='text-xs'
                        >
                          {typeSuccessRate.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <div className='text-muted-foreground mb-1 flex items-center justify-between text-sm'>
                      <span>
                        عدد العمليات:{' '}
                        {(type.executions || 0).toLocaleString('ar-IQ')}
                      </span>
                      <span>معدل النجاح: {typeSuccessRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={typeSuccessRate} className='h-1.5' />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Performance Insights */}
        <div className='bg-muted/50 rounded-lg p-4'>
          <h4 className='mb-3 flex items-center gap-2 font-semibold'>
            <IconTrendingUp className='size-4' />
            رؤى الأداء
          </h4>
          <div className='grid grid-cols-1 gap-4 text-sm md:grid-cols-2'>
            <div>
              <div className='text-primary font-medium'>
                {((data.totalProcessingTime || 0) / 3600).toFixed(1)} ساعة
              </div>
              <div className='text-muted-foreground'>إجمالي وقت المعالجة</div>
            </div>
            <div>
              <div className='text-primary font-medium'>
                {(data.totalExecutions || 0) > 0
                  ? (
                      (data.totalProcessingTime || 0) /
                      (data.totalExecutions || 1)
                    ).toFixed(1)
                  : '0'}{' '}
                ثانية
              </div>
              <div className='text-muted-foreground'>
                متوسط وقت العملية الواحدة
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AutomationPerformanceSkeleton({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <IconRobot className='size-5' />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Overall Performance Summary Skeleton */}
        <div className='space-y-4 rounded-lg border p-4'>
          <div className='flex items-center justify-between'>
            <div className='space-y-2'>
              <Skeleton className='h-6 w-48' />
              <Skeleton className='h-4 w-32' />
            </div>
            <div className='space-y-2 text-right'>
              <Skeleton className='h-8 w-20' />
              <Skeleton className='h-6 w-16' />
            </div>
          </div>
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-4 w-12' />
            </div>
            <Skeleton className='h-3 w-full' />
          </div>
        </div>

        {/* Key Metrics Grid Skeleton */}
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className='space-y-2 rounded-lg border p-4 text-center'
            >
              <Skeleton className='mx-auto size-8' />
              <Skeleton className='mx-auto h-8 w-16' />
              <Skeleton className='mx-auto h-4 w-20' />
            </div>
          ))}
        </div>

        {/* Success vs Failure Breakdown Skeleton */}
        <div className='space-y-4'>
          <Skeleton className='h-6 w-32' />
          <div className='space-y-3'>
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-4 w-4 rounded-full' />
                    <Skeleton className='h-4 w-24' />
                  </div>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-4 w-12' />
                    <Skeleton className='h-3 w-16' />
                  </div>
                </div>
                <Skeleton className='h-2 w-full' />
              </div>
            ))}
          </div>
        </div>

        {/* Performance Insights Skeleton */}
        <div className='bg-muted/50 space-y-3 rounded-lg p-4'>
          <div className='flex items-center gap-2'>
            <Skeleton className='size-4' />
            <Skeleton className='h-6 w-24' />
          </div>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className='space-y-1'>
                <Skeleton className='h-6 w-20' />
                <Skeleton className='h-4 w-32' />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
