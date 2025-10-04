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
  IconMail,
  IconTrendingUp,
  IconTrendingDown,
  IconClock,
  IconActivity,
  IconChartBar,
  IconCircleCheck,
  IconAlertTriangle,
  IconCalendar
} from '@tabler/icons-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { CorrespondenceMetricsViewModel } from '../types';
import UnitSelecter from '@/components/unit-selecter';

interface CorrespondenceMetricsProps {
  data?: CorrespondenceMetricsViewModel;
  loading?: boolean;
  error?: string;
  title?: string;
  description?: string;
}

export function CorrespondenceMetrics({
  data,
  loading = false,
  error,
  title = 'مقاييس الكتب',
  description = 'تحليل شامل لأداء وإحصائيات الكتب'
}: CorrespondenceMetricsProps) {
  if (loading) {
    return (
      <CorrespondenceMetricsSkeleton title={title} description={description} />
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-destructive flex items-center gap-2'>
            <IconAlertTriangle className='size-5' />
            {title}
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <IconChartBar className='size-5' />
            {title}
          </CardTitle>
          <CardDescription>لا توجد بيانات متاحة</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Prepare chart data
  const volumeTrendData =
    data.monthlyVolume?.map((item) => ({
      period: item.monthName,
      total: item.count,
      incoming: item.incomingCount,
      outgoing: item.outgoingCount,
      internal: item.internalCount
    })) || [];

  // Calculate completion rate
  const completionRate =
    data.totalCount > 0 ? (data.completedCount / data.totalCount) * 100 : 0;

  // Status colors mapping
  const statusColors: Record<string, string> = {
    مسودة: '#6b7280',
    مسجل: '#3b82f6',
    'قيد المعالجة': '#f59e0b',
    مكتملة: '#22c55e',
    متأخرة: '#ef4444',
    معلقة: '#8b5cf6'
  };

  // Type colors mapping
  const typeColors: Record<string, string> = {
    داخلي: '#8b5cf6',
    'وارد خارجي': '#22c55e',
    'صادر خارجي': '#f59e0b'
  };

  // Priority colors mapping
  const priorityColors: Record<string, string> = {
    عادي: '#3b82f6',
    مستعجل: '#f59e0b',
    عاجل: '#ef4444'
  };

  return (
    <div className='scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent h-full max-h-screen overflow-y-auto'>
      <div className='space-y-6 p-4 pb-8'>
        {/* Header */}
        <Card className='bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 backdrop-blur'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <IconChartBar className='size-5' />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
            {data.generatedAt && (
              <div className='text-muted-foreground flex items-center gap-2 text-xs'>
                <IconCalendar className='size-3' />
                <span>
                  آخر تحديث:{' '}
                  {new Date(data.generatedAt).toLocaleString('ar-IQ')}
                </span>
              </div>
            )}
          </CardHeader>
          <CardContent className='flex justify-end'>
            <UnitSelecter />
          </CardContent>
        </Card>

        {/* Key Metrics Overview */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6'>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center gap-2 text-blue-600'>
                <IconMail className='size-4' />
                إجمالي الكتب
              </CardDescription>
              <CardTitle className='text-2xl font-bold text-blue-600'>
                {(data.totalCount || 0).toLocaleString('ar-IQ')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant='secondary' className='text-xs'>
                الإجمالي
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center gap-2 text-green-600'>
                <IconCircleCheck className='size-4' />
                معدل الإنجاز
              </CardDescription>
              <CardTitle className='text-2xl font-bold text-green-600'>
                {completionRate.toFixed(1)}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={completionRate} className='h-2' />
              <div className='text-muted-foreground mt-1 text-xs'>
                {data.completedCount || 0} من {data.totalCount || 0} مكتملة
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center gap-2 text-purple-600'>
                <IconClock className='size-4' />
                متوسط وقت المعالجة
              </CardDescription>
              <CardTitle className='text-2xl font-bold text-purple-600'>
                {(data.averageProcessingTimeInDays || 0).toFixed(1)} يوم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center gap-2'>
                {(data.averageProcessingTimeInDays || 0) <= 5 ? (
                  <IconTrendingUp className='size-4 text-green-600' />
                ) : (
                  <IconTrendingDown className='size-4 text-red-600' />
                )}
                <span className='text-muted-foreground text-xs'>
                  {(data.averageProcessingTimeInDays || 0) <= 5
                    ? 'ضمن المعدل المطلوب'
                    : 'أعلى من المعدل المطلوب'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center gap-2 text-orange-600'>
                <IconActivity className='size-4' />
                الكتب النشطة
              </CardDescription>
              <CardTitle className='text-2xl font-bold text-orange-600'>
                {(data.activeCount || 0).toLocaleString('ar-IQ')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-muted-foreground text-xs'>
                {data.pendingCount || 0} في الانتظار
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center gap-2 text-red-600'>
                <IconAlertTriangle className='size-4' />
                الكتب المتأخرة
              </CardDescription>
              <CardTitle className='text-2xl font-bold text-red-600'>
                {(data.overdueCount || 0).toLocaleString('ar-IQ')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-muted-foreground text-xs'>
                تحتاج متابعة عاجلة
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center gap-2 text-yellow-600'>
                <IconClock className='size-4' />
                في الانتظار
              </CardDescription>
              <CardTitle className='text-2xl font-bold text-yellow-600'>
                {(data.pendingCount || 0).toLocaleString('ar-IQ')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-muted-foreground text-xs'>تحتاج إجراء</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {/* Volume Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconTrendingUp className='size-5' />
                اتجاه حجم الكتب الشهري
              </CardTitle>
              <CardDescription>تطور حجم الكتب عبر الأشهر</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-[300px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={volumeTrendData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='period' />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        Number(value).toLocaleString('ar-IQ'),
                        name === 'incoming'
                          ? 'واردة'
                          : name === 'outgoing'
                            ? 'صادرة'
                            : name === 'internal'
                              ? 'داخلية'
                              : 'المجموع'
                      ]}
                      labelFormatter={(label) => `الشهر: ${label}`}
                    />
                    <Area
                      type='monotone'
                      dataKey='total'
                      stackId='1'
                      stroke='#3b82f6'
                      fill='#3b82f6'
                      fillOpacity={0.3}
                    />
                    <Area
                      type='monotone'
                      dataKey='incoming'
                      stackId='2'
                      stroke='#22c55e'
                      fill='#22c55e'
                      fillOpacity={0.6}
                    />
                    <Area
                      type='monotone'
                      dataKey='outgoing'
                      stackId='2'
                      stroke='#f59e0b'
                      fill='#f59e0b'
                      fillOpacity={0.6}
                    />
                    <Area
                      type='monotone'
                      dataKey='internal'
                      stackId='2'
                      stroke='#8b5cf6'
                      fill='#8b5cf6'
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Processing Time Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconClock className='size-5' />
                تحليل أوقات المعالجة
              </CardTitle>
              <CardDescription>
                متوسط أوقات المعالجة مقارنة بالهدف
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-[300px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={volumeTrendData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='period' />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        `${Number(value).toFixed(1)} يوم`,
                        name === 'averageTime' ? 'متوسط الوقت' : 'الهدف'
                      ]}
                      labelFormatter={(label) => `الشهر: ${label}`}
                    />
                    <Line
                      type='monotone'
                      dataKey='total'
                      stroke='#3b82f6'
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Distribution Charts */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* Status Distribution */}
          {data.statusDistribution && data.statusDistribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconActivity className='size-5' />
                  توزيع حالات الكتب
                </CardTitle>
                <CardDescription>توزيع الكتب حسب الحالة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='h-[250px]'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={data.statusDistribution}
                        cx='50%'
                        cy='50%'
                        outerRadius={80}
                        fill='#8884d8'
                        dataKey='count'
                        label={({ statusName, percentage }) =>
                          `${statusName}: ${percentage}%`
                        }
                      >
                        {data.statusDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={statusColors[entry.statusName] || '#6b7280'}
                          />
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

                {/* Status Legend */}
                <div className='mt-4 space-y-2 text-sm'>
                  {data.statusDistribution.map((item, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between'
                    >
                      <div className='flex items-center gap-2'>
                        <div
                          className='h-3 w-3 rounded-full'
                          style={{
                            backgroundColor:
                              statusColors[item.statusName] || '#6b7280'
                          }}
                        />
                        <span className='font-medium'>{item.statusName}</span>
                      </div>
                      <span className='text-muted-foreground'>
                        {item.count.toLocaleString('ar-IQ')} ({item.percentage}
                        %)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Type Distribution */}
          {data.typeDistribution && data.typeDistribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconMail className='size-5' />
                  توزيع أنواع الكتب
                </CardTitle>
                <CardDescription>توزيع الكتب حسب النوع</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='h-[250px]'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={data.typeDistribution}
                        cx='50%'
                        cy='50%'
                        outerRadius={80}
                        fill='#8884d8'
                        dataKey='count'
                        label={({ typeName, percentage }) =>
                          `${typeName}: ${percentage}%`
                        }
                      >
                        {data.typeDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={typeColors[entry.typeName] || '#6b7280'}
                          />
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

                {/* Type Legend */}
                <div className='mt-4 space-y-2 text-sm'>
                  {data.typeDistribution.map((item, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between'
                    >
                      <div className='flex items-center gap-2'>
                        <div
                          className='h-3 w-3 rounded-full'
                          style={{
                            backgroundColor:
                              typeColors[item.typeName] || '#6b7280'
                          }}
                        />
                        <span className='font-medium'>{item.typeName}</span>
                      </div>
                      <span className='text-muted-foreground'>
                        {item.count.toLocaleString('ar-IQ')} ({item.percentage}
                        %)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Priority Distribution */}
          {data.priorityDistribution &&
            data.priorityDistribution.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <IconAlertTriangle className='size-5' />
                    توزيع الأولويات
                  </CardTitle>
                  <CardDescription>توزيع الكتب حسب الأولوية</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='h-[250px]'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <PieChart>
                        <Pie
                          data={data.priorityDistribution}
                          cx='50%'
                          cy='50%'
                          outerRadius={80}
                          fill='#8884d8'
                          dataKey='count'
                          label={({ priorityName, percentage }) =>
                            `${priorityName}: ${percentage}%`
                          }
                        >
                          {data.priorityDistribution.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                priorityColors[entry.priorityName] || '#6b7280'
                              }
                            />
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

                  {/* Priority Legend */}
                  <div className='mt-4 space-y-2 text-sm'>
                    {data.priorityDistribution.map((item, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between'
                      >
                        <div className='flex items-center gap-2'>
                          <div
                            className='h-3 w-3 rounded-full'
                            style={{
                              backgroundColor:
                                priorityColors[item.priorityName] || '#6b7280'
                            }}
                          />
                          <span className='font-medium'>
                            {item.priorityName}
                          </span>
                        </div>
                        <span className='text-muted-foreground'>
                          {item.count.toLocaleString('ar-IQ')} (
                          {item.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
        </div>

        {/* Summary Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <IconChartBar className='size-5' />
              ملخص الإحصائيات
            </CardTitle>
            <CardDescription>نظرة سريعة على الأرقام الرئيسية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
              <div className='rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-950/20'>
                <div className='text-2xl font-bold text-blue-600'>
                  {data.totalCount.toLocaleString('ar-IQ')}
                </div>
                <div className='text-muted-foreground text-sm'>
                  إجمالي الكتب
                </div>
              </div>

              <div className='rounded-lg bg-green-50 p-4 text-center dark:bg-green-950/20'>
                <div className='text-2xl font-bold text-green-600'>
                  {data.completedCount.toLocaleString('ar-IQ')}
                </div>
                <div className='text-muted-foreground text-sm'>
                  الكتب المكتملة
                </div>
              </div>

              <div className='rounded-lg bg-orange-50 p-4 text-center dark:bg-orange-950/20'>
                <div className='text-2xl font-bold text-orange-600'>
                  {data.activeCount.toLocaleString('ar-IQ')}
                </div>
                <div className='text-muted-foreground text-sm'>
                  الكتب النشطة
                </div>
              </div>

              <div className='rounded-lg bg-red-50 p-4 text-center dark:bg-red-950/20'>
                <div className='text-2xl font-bold text-red-600'>
                  {data.overdueCount.toLocaleString('ar-IQ')}
                </div>
                <div className='text-muted-foreground text-sm'>
                  الكتب المتأخرة
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Spacer to prevent content cutoff */}
        <div className='h-16'></div>
      </div>
    </div>
  );
}

function CorrespondenceMetricsSkeleton({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <div className='scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent h-full max-h-screen overflow-y-auto'>
      <div className='space-y-6 p-4 pb-8'>
        {/* Header Skeleton */}
        <Card className='bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 backdrop-blur'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Skeleton className='size-5 rounded' />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
        </Card>

        {/* Key Metrics Skeleton */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6'>
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className='pb-2'>
                <CardDescription className='flex items-center gap-2'>
                  <Skeleton className='size-4 rounded' />
                  <Skeleton className='h-4 w-24' />
                </CardDescription>
                <Skeleton className='h-8 w-16' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-4 w-full' />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Skeleton className='size-5 rounded' />
                  <Skeleton className='h-6 w-32' />
                </CardTitle>
                <CardDescription>
                  <Skeleton className='h-4 w-48' />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className='h-[300px] w-full' />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className='h-16'></div>
      </div>
    </div>
  );
}
