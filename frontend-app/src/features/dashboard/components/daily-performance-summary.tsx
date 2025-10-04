'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  IconRefresh,
  IconCalendar,
  IconClock,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconActivity,
  IconTarget,
  IconBuilding,
  IconChartBar,
  IconClock12,
  IconUsers,
  IconCircleCheck
} from '@tabler/icons-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { dashboardService } from '../api/dashboard.service';
import {
  DailyPerformanceSummaryViewModel,
  DailyPerformanceQuery,
  DailyUnitPerformance
} from '../types/overview';
import UnitSelecter from '@/components/unit-selecter';

interface DailyPerformanceSummaryProps {
  initialData?: DailyPerformanceSummaryViewModel;
  unitId?: string;
  date?: string;
  onRefresh?: () => void;
}

export function DailyPerformanceSummary({
  initialData,
  unitId,
  date,
  onRefresh
}: DailyPerformanceSummaryProps) {
  const [data, setData] = useState<
    DailyPerformanceSummaryViewModel | undefined
  >(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | undefined>(undefined);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Load daily performance data
  async function loadDailyPerformance(query?: DailyPerformanceQuery) {
    try {
      setLoading(true);
      setError(undefined);

      const response = await dashboardService.getDailyPerformanceSummary(query);

      if (response?.succeeded && response.data) {
        setData(response.data);
        setLastRefresh(new Date());
      } else {
        setError(response?.message || 'فشل في تحميل بيانات الأداء اليومي');
      }
    } catch (err) {
      setError('حدث خطأ أثناء تحميل البيانات');
      console.error('Daily performance loading error:', err);
    } finally {
      setLoading(false);
    }
  }

  // Initial load
  useEffect(() => {
    if (!initialData) {
      loadDailyPerformance({ unitId, date });
    }
  }, [unitId, date]);

  // Handle refresh
  function handleRefresh() {
    loadDailyPerformance({ unitId, date });
    onRefresh?.();
  }

  // Get performance status color
  function getPerformanceStatusColor(
    status: DailyUnitPerformance['performanceStatus']
  ) {
    switch (status) {
      case 'ممتاز':
        return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950/20';
      case 'جيد':
        return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/20';
      case 'متوسط':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20';
      case 'ضعيف':
        return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/20';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-950/20';
    }
  }

  // Get trend icon
  function getTrendIcon(direction: 'Up' | 'Down' | 'Stable') {
    switch (direction) {
      case 'Up':
        return <IconTrendingUp className='size-4 text-green-600' />;
      case 'Down':
        return <IconTrendingDown className='size-4 text-red-600' />;
      case 'Stable':
        return <IconMinus className='size-4 text-gray-600' />;
    }
  }

  // Prepare chart data
  const breakdownChartData = data?.breakdown
    ? [
        {
          name: 'واردة',
          value: data.breakdown.incomingCorrespondence,
          color: '#22c55e'
        },
        {
          name: 'صادرة',
          value: data.breakdown.outgoingCorrespondence,
          color: '#3b82f6'
        },
        {
          name: 'داخلية',
          value: data.breakdown.internalCorrespondence,
          color: '#8b5cf6'
        }
      ]
    : [];

  const completionChartData = data?.breakdown
    ? [
        {
          name: 'مكتملة في الوقت',
          value: data.breakdown.onTimeCompleted,
          color: '#22c55e'
        },
        {
          name: 'مكتملة متأخرة',
          value: data.breakdown.overdueCompleted,
          color: '#f59e0b'
        }
      ]
    : [];

  if (error && !data) {
    return (
      <div className='space-y-4'>
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className='flex justify-center'>
          <Button onClick={handleRefresh} variant='outline'>
            <IconRefresh className='mr-2 size-4' />
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  if (loading && !data) {
    return <DailyPerformanceSummarySkeleton />;
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            ملخص الأداء اليومي
          </h1>
          <p className='text-muted-foreground'>
            نظرة شاملة على أداء اليوم في نظام إدارة الكتب
          </p>
          {data?.dateDisplay && (
            <div className='mt-2 flex items-center gap-2 text-sm text-blue-600'>
              <IconCalendar className='size-4' />
              <span>{data.dateDisplay}</span>
            </div>
          )}
          {data?.filteredByUnitName && (
            <div className='mt-1 flex items-center gap-2 text-sm text-purple-600'>
              <IconBuilding className='size-4' />
              <span>مصفاة حسب الجهة: {data.filteredByUnitName}</span>
            </div>
          )}
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            disabled={loading}
          >
            <IconRefresh
              className={`mr-2 size-4 ${loading ? 'animate-spin' : ''}`}
            />
            تحديث
          </Button>

          <UnitSelecter />
        </div>
      </div>

      {/* Last Updated Info */}
      {data?.generatedAt && (
        <div className='text-muted-foreground flex items-center gap-4 text-sm'>
          <div className='flex items-center gap-2'>
            <IconRefresh className='size-4' />
            <span>
              آخر تحديث:{' '}
              {new Date(data.generatedAt).toLocaleDateString('en-GB')}{' '}
              {new Date(data.generatedAt).toLocaleTimeString('en-GB')}
            </span>
          </div>
        </div>
      )}

      {/* Key Performance Indicators */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardDescription className='flex items-center gap-2'>
              <IconActivity className='size-4 text-blue-600' />
              الكتب قيد المعالجة اليوم
            </CardDescription>
            <CardTitle className='text-2xl font-bold text-blue-600'>
              {data?.todaysProcessingCorrespondence?.toLocaleString('ar-IQ') ||
                '0'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-muted-foreground text-xs'>
              {data?.breakdown?.startedToday || 0} بدأت اليوم
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardDescription className='flex items-center gap-2'>
              <IconTarget className='size-4 text-green-600' />
              معدل الإنجاز
            </CardDescription>
            <CardTitle className='text-2xl font-bold text-green-600'>
              {data?.completionRate?.toFixed(1) || '0.0'}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={data?.completionRate || 0} className='h-2' />
            <div className='text-muted-foreground mt-1 text-xs'>
              {data?.breakdown?.completedToday || 0} مكتملة اليوم
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardDescription className='flex items-center gap-2'>
              <IconClock className='size-4 text-orange-600' />
              متوسط وقت المعالجة
            </CardDescription>
            <CardTitle className='text-2xl font-bold text-orange-600'>
              {data?.averageProcessingTimeHours?.toFixed(1) || '0.0'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-muted-foreground text-xs'>ساعة</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardDescription className='flex items-center gap-2'>
              <IconBuilding className='size-4 text-purple-600' />
              الجهات النشطة
            </CardDescription>
            <CardTitle className='text-2xl font-bold text-purple-600'>
              {data?.activeUnitsCount?.toLocaleString('ar-IQ') || '0'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-muted-foreground text-xs'>جهة نشطة اليوم</div>
          </CardContent>
        </Card>
      </div>

      {/* Velocity Metrics */}
      {data?.breakdown?.velocity && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <IconChartBar className='size-5' />
              مقاييس السرعة والإنتاجية
            </CardTitle>
            <CardDescription>
              تحليل سرعة الإنجاز واتجاهات الأداء
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-blue-600'>
                  {data.breakdown.velocity.itemsPerHour.toFixed(2)}
                </div>
                <div className='text-muted-foreground text-sm'>عنصر/ساعة</div>
              </div>

              <div className='text-center'>
                <div className='text-2xl font-bold text-green-600'>
                  {data.breakdown.velocity.itemsPerDay}
                </div>
                <div className='text-muted-foreground text-sm'>عنصر/يوم</div>
              </div>

              <div className='text-center'>
                <div className='flex items-center justify-center gap-2'>
                  {getTrendIcon(data.breakdown.velocity.trendDirection)}
                  <span className='text-2xl font-bold'>
                    {data.breakdown.velocity.trendPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className='text-muted-foreground text-sm'>
                  الاتجاه مقارنة بالأمس
                </div>
              </div>

              <div className='text-center'>
                <div className='flex items-center justify-center gap-2'>
                  <IconClock12 className='size-5 text-orange-600' />
                  <span className='text-2xl font-bold text-orange-600'>
                    {data.breakdown.velocity.peakProcessingTime.slice(0, 5)}
                  </span>
                </div>
                <div className='text-muted-foreground text-sm'>وقت الذروة</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Correspondence Type Breakdown */}
        {breakdownChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>توزيع أنواع الكتب</CardTitle>
              <CardDescription>
                توزيع الكتب المعالجة اليوم حسب النوع
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-[300px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={breakdownChartData}
                      cx='50%'
                      cy='50%'
                      outerRadius={100}
                      fill='#8884d8'
                      dataKey='value'
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {breakdownChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        Number(value).toLocaleString('ar-IQ'),
                        'العدد'
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completion Analysis */}
        {completionChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>تحليل الإنجاز</CardTitle>
              <CardDescription>
                تحليل الكتب المكتملة حسب التوقيت
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-[300px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={completionChartData}
                      cx='50%'
                      cy='50%'
                      outerRadius={100}
                      fill='#8884d8'
                      dataKey='value'
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {completionChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        Number(value).toLocaleString('ar-IQ'),
                        'العدد'
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Active Units Performance */}
      {data?.activeUnits && data.activeUnits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <IconUsers className='size-5' />
              أداء الجهات النشطة
            </CardTitle>
            <CardDescription>
              تفصيل أداء الجهات التي لديها نشاط اليوم
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {data.activeUnits.slice(0, 10).map((unit) => (
                <div
                  key={unit.unitId}
                  className='border-muted/50 rounded-lg border p-4'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3'>
                        <h4 className='font-semibold'>{unit.unitName}</h4>
                        <Badge
                          variant='outline'
                          className={getPerformanceStatusColor(
                            unit.performanceStatus
                          )}
                        >
                          {unit.performanceStatus}
                        </Badge>
                      </div>
                      <p className='text-muted-foreground text-sm'>
                        كود الجهة: {unit.unitCode}
                      </p>
                    </div>
                    <div className='text-right'>
                      <div className='text-lg font-bold text-blue-600'>
                        {unit.processingCount.toLocaleString('ar-IQ')}
                      </div>
                      <div className='text-muted-foreground text-sm'>
                        قيد المعالجة
                      </div>
                    </div>
                  </div>

                  <div className='mt-4 grid grid-cols-2 gap-4 md:grid-cols-4'>
                    <div className='text-center'>
                      <div className='font-semibold text-green-600'>
                        {unit.completedCount}
                      </div>
                      <div className='text-muted-foreground text-xs'>
                        مكتملة
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='font-semibold text-blue-600'>
                        {unit.completionRate.toFixed(1)}%
                      </div>
                      <div className='text-muted-foreground text-xs'>
                        معدل الإنجاز
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='font-semibold text-orange-600'>
                        {unit.averageProcessingTimeHours.toFixed(1)}
                      </div>
                      <div className='text-muted-foreground text-xs'>
                        متوسط الوقت (ساعة)
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='font-semibold text-purple-600'>
                        {unit.activeTasksCount}
                      </div>
                      <div className='text-muted-foreground text-xs'>
                        مهام نشطة
                      </div>
                    </div>
                  </div>

                  <div className='mt-3'>
                    <Progress value={unit.completionRate} className='h-2' />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <IconCircleCheck className='size-5' />
            ملخص إحصائيات اليوم
          </CardTitle>
          <CardDescription>نظرة سريعة على الأرقام الرئيسية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
            <div className='rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-950/20'>
              <div className='text-2xl font-bold text-blue-600'>
                {data?.breakdown?.startedToday?.toLocaleString('ar-IQ') || '0'}
              </div>
              <div className='text-muted-foreground text-sm'>بدأت اليوم</div>
            </div>

            <div className='rounded-lg bg-green-50 p-4 text-center dark:bg-green-950/20'>
              <div className='text-2xl font-bold text-green-600'>
                {data?.breakdown?.completedToday?.toLocaleString('ar-IQ') ||
                  '0'}
              </div>
              <div className='text-muted-foreground text-sm'>مكتملة اليوم</div>
            </div>

            <div className='rounded-lg bg-orange-50 p-4 text-center dark:bg-orange-950/20'>
              <div className='text-2xl font-bold text-orange-600'>
                {data?.breakdown?.onTimeCompleted?.toLocaleString('ar-IQ') ||
                  '0'}
              </div>
              <div className='text-muted-foreground text-sm'>
                في الوقت المحدد
              </div>
            </div>

            <div className='rounded-lg bg-red-50 p-4 text-center dark:bg-red-950/20'>
              <div className='text-2xl font-bold text-red-600'>
                {data?.breakdown?.overdueCompleted?.toLocaleString('ar-IQ') ||
                  '0'}
              </div>
              <div className='text-muted-foreground text-sm'>متأخرة</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Loading skeleton
export function DailyPerformanceSummarySkeleton() {
  return (
    <div className='space-y-6'>
      {/* Header Skeleton */}
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-48' />
          <Skeleton className='h-4 w-64' />
          <Skeleton className='h-4 w-32' />
        </div>
        <Skeleton className='h-9 w-20' />
      </div>

      {/* KPI Cards Skeleton */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center gap-2'>
                <Skeleton className='size-4 rounded' />
                <Skeleton className='h-4 w-32' />
              </CardDescription>
              <Skeleton className='h-8 w-16' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-4 w-20' />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className='h-6 w-48' />
              <Skeleton className='h-4 w-32' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-[300px] w-full' />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
