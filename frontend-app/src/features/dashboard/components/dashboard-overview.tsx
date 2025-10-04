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
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  IconRefresh,
  IconFilter,
  IconDownload,
  IconCalendar,
  IconBuilding,
  IconClock,
  IconChartBar
} from '@tabler/icons-react';
import { DashboardStatsCards } from './dashboard-stats-cards';
import { CorrespondenceTypeChart } from './correspondence-type-chart';
import { TopUnitsPerformance } from './top-units-performance';
import { AutomationPerformance } from './automation-performance';
import { dashboardService } from '../api/dashboard.service';
import {
  CorrespondenceDashboardSummary,
  OverviewQuery,
  TopUnitEntry
} from '../types/overview';

interface DashboardOverviewProps {
  initialData?: CorrespondenceDashboardSummary;
  defaultFilters?: OverviewQuery;
  onExport?: () => void;
}

export function DashboardOverview({
  initialData,
  defaultFilters = {},
  onExport
}: DashboardOverviewProps) {
  const [data, setData] = useState<CorrespondenceDashboardSummary | undefined>(
    initialData
  );
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | undefined>(undefined);
  const [filters, setFilters] = useState<OverviewQuery>(defaultFilters);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Load dashboard data
  async function loadDashboardData(query?: OverviewQuery) {
    try {
      setLoading(true);
      setError(undefined);

      const response = await dashboardService.getDashboardOverview(query);

      if (response?.succeeded && response.data) {
        setData(response.data);
        setLastRefresh(new Date());
      } else {
        setError(response?.message || 'فشل في تحميل بيانات لوحة التحكم');
      }
    } catch (err) {
      setError('حدث خطأ أثناء تحميل البيانات');
      console.error('Dashboard loading error:', err);
    } finally {
      setLoading(false);
    }
  }

  // Initial load
  useEffect(() => {
    if (!initialData) {
      loadDashboardData(filters);
    }
  }, []);

  // Refresh data
  function onRefresh() {
    loadDashboardData(filters);
  }

  // Apply filters
  // function onApplyFilters(newFilters: OverviewQuery) {
  //   setFilters(newFilters);
  //   loadDashboardData(newFilters);
  // }

  if (error && !data) {
    return (
      <div className='space-y-4'>
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className='flex justify-center'>
          <Button onClick={onRefresh} variant='outline'>
            <IconRefresh className='mr-2 size-4' />
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>لوحة التحكم</h1>
          <p className='text-muted-foreground'>
            نظرة عامة على أداء نظام إدارة الكتب
          </p>
          {data?.filteredByUnitName && (
            <div className='mt-2 flex items-center gap-2 text-sm text-blue-600'>
              <IconBuilding className='size-4' />
              <span>مصفاة حسب الجهة: {data.filteredByUnitName}</span>
            </div>
          )}
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={onRefresh}
            disabled={loading}
          >
            <IconRefresh
              className={`mr-2 size-4 ${loading ? 'animate-spin' : ''}`}
            />
            تحديث
          </Button>

          <Button variant='outline' size='sm'>
            <IconFilter className='mr-2 size-4' />
            تصفية
          </Button>

          {onExport && (
            <Button variant='outline' size='sm' onClick={onExport}>
              <IconDownload className='mr-2 size-4' />
              تصدير
            </Button>
          )}
        </div>
      </div>

      {/* Last Updated Info */}
      {data?.generatedAt && (
        <div className='text-muted-foreground flex items-center gap-4 text-sm'>
          <div className='flex items-center gap-2'>
            <IconCalendar className='size-4' />
            <span>
              تاريخ التحديث:{' '}
              {new Date(data.generatedAt).toLocaleDateString('ar-IQ')}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <IconRefresh className='size-4' />
            <span>آخر تحديث: {lastRefresh.toLocaleTimeString('ar-IQ')}</span>
          </div>
        </div>
      )}

      {/* Quick Stats Cards */}
      <DashboardStatsCards
        data={{
          unreadCount: data?.unreadIncomingMailCount || 0,
          tasksToday: data?.backlogMetrics?.tasksDueToday || 0,
          overdueTasks: data?.backlogMetrics?.overdueTasks || 0,
          completionRate: data?.totalCorrespondence
            ? ((data.totalCorrespondence - data.totalActiveCorrespondence) /
                data.totalCorrespondence) *
              100
            : 0,
          averageProcessingTime: data?.backlogMetrics?.averageTaskAge || 0,
          activeWorkflows: data?.totalActiveCorrespondence || 0
        }}
        loading={loading}
        error={error}
      />

      {/* Main Content Grid */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Correspondence Type Distribution */}
        <CorrespondenceTypeChart
          data={data?.correspondenceTypeDistribution?.map((item) => ({
            type: item.typeName,
            count: item.count,
            percentage: item.percentage,
            color: getTypeColor(item.typeName)
          }))}
          loading={loading}
          error={error}
          title='توزيع أنواع الكتب'
          description='توزيع الكتب حسب النوع'
        />

        {/* Correspondence Status Distribution */}
        <CorrespondenceTypeChart
          data={data?.correspondenceStatusDistribution?.map((item) => ({
            type: item.statusName,
            count: item.count,
            percentage: item.percentage,
            color: getStatusColor(item.statusName)
          }))}
          loading={loading}
          error={error}
          title='توزيع حالات الكتب'
          description='توزيع الكتب حسب الحالة'
        />
      </div>

      {/* Performance Sections */}
      <div className='grid grid-cols-1 gap-6 xl:grid-cols-3'>
        {/* Top Units Performance - Takes 2 columns */}
        <div className='xl:col-span-2'>
          <TopUnitsPerformance
            data={data?.topUnitsReceivingCorrespondence?.map((unit) => ({
              unitId: unit.unitId,
              unitName: unit.unitName,
              unitCode: unit.unitCode,
              totalCorrespondence: unit.correspondenceCount,
              activeCorrespondence: unit.incomingCount + unit.outgoingCount,
              completedCorrespondence: unit.internalCount,
              averageProcessingTime: 0, // Not available in current data structure
              efficiencyScore: calculateUnitEfficiency(unit)
            }))}
            loading={loading}
            error={error}
          />
        </div>

        {/* Automation Performance - Takes 1 column */}
        <div className='xl:col-span-1'>
          <AutomationPerformance
            data={
              data?.automationPerformance
                ? {
                    totalExecutions:
                      data.automationPerformance.totalAutomatedProcesses,
                    successfulExecutions:
                      data.automationPerformance.successfulProcesses,
                    failedExecutions:
                      data.automationPerformance.failedProcesses,
                    successRate: data.automationPerformance.successRate,
                    averageExecutionTime:
                      data.automationPerformance.averageExecutionTimeMinutes,
                    totalProcessingTime:
                      data.automationPerformance.averageExecutionTimeMinutes *
                      data.automationPerformance.totalAutomatedProcesses,
                    automationTypes:
                      data.automationPerformance.byAutomationType.map(
                        (type) => ({
                          type: type.automationType,
                          executions: type.totalProcesses,
                          successRate: type.successRate
                        })
                      )
                  }
                : undefined
            }
            loading={loading}
            error={error}
          />
        </div>
      </div>

      {/* Backlog Overview */}
      {data?.backlogMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <IconClock className='size-5' />
              نظرة عامة على المهام المتراكمة
            </CardTitle>
            <CardDescription>تفصيل المهام المتراكمة حسب الجهات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
              <div className='text-center'>
                <div className='text-primary text-2xl font-bold'>
                  {data.backlogMetrics.totalBackloggedTasks.toLocaleString(
                    'ar-IQ'
                  )}
                </div>
                <div className='text-muted-foreground text-sm'>
                  إجمالي المهام المتراكمة
                </div>
              </div>

              <div className='text-center'>
                <div className='text-2xl font-bold text-red-600'>
                  {data.backlogMetrics.overdueTasks.toLocaleString('ar-IQ')}
                </div>
                <div className='text-muted-foreground text-sm'>مهام متأخرة</div>
              </div>

              <div className='text-center'>
                <div className='text-2xl font-bold text-yellow-600'>
                  {data.backlogMetrics.tasksDueToday.toLocaleString('ar-IQ')}
                </div>
                <div className='text-muted-foreground text-sm'>
                  مهام مستحقة اليوم
                </div>
              </div>

              <div className='text-center'>
                <div className='text-2xl font-bold text-blue-600'>
                  {data.backlogMetrics.averageTaskAge.toFixed(1)}
                </div>
                <div className='text-muted-foreground text-sm'>
                  متوسط عمر المهمة (يوم)
                </div>
              </div>
            </div>

            {/* Unit Breakdown */}
            {data.backlogMetrics.byUnit &&
              data.backlogMetrics.byUnit.length > 0 && (
                <div className='mt-6'>
                  <h4 className='mb-3 font-semibold'>تفصيل حسب الوحدة</h4>
                  <div className='space-y-2'>
                    {data.backlogMetrics.byUnit.slice(0, 5).map((unit) => (
                      <div
                        key={unit.unitId}
                        className='bg-muted/50 flex items-center justify-between rounded-lg p-3'
                      >
                        <span className='font-medium'>{unit.unitName}</span>
                        <div className='flex items-center gap-4 text-sm'>
                          <span>المتراكمة: {unit.backloggedTasks}</span>
                          <span className='text-red-600'>
                            متأخرة: {unit.overdueTasks}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      )}

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
                {data?.totalCorrespondence?.toLocaleString('ar-IQ') || '0'}
              </div>
              <div className='text-muted-foreground text-sm'>إجمالي الكتب</div>
            </div>

            <div className='rounded-lg bg-green-50 p-4 text-center dark:bg-green-950/20'>
              <div className='text-2xl font-bold text-green-600'>
                {data?.totalActiveCorrespondence?.toLocaleString('ar-IQ') ||
                  '0'}
              </div>
              <div className='text-muted-foreground text-sm'>الكتب النشطة</div>
            </div>

            <div className='rounded-lg bg-purple-50 p-4 text-center dark:bg-purple-950/20'>
              <div className='text-2xl font-bold text-purple-600'>
                {Math.round(data?.averageMonthlyVolume || 0).toLocaleString(
                  'ar-IQ'
                )}
              </div>
              <div className='text-muted-foreground text-sm'>
                متوسط الحجم الشهري
              </div>
            </div>

            <div className='rounded-lg bg-orange-50 p-4 text-center dark:bg-orange-950/20'>
              <div className='text-2xl font-bold text-orange-600'>
                {data?.unreadIncomingMailCount?.toLocaleString('ar-IQ') || '0'}
              </div>
              <div className='text-muted-foreground text-sm'>
                البريد الوارد غير المقروء
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Units Details */}
      {data?.topUnitsReceivingCorrespondence &&
        data.topUnitsReceivingCorrespondence.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconBuilding className='size-5' />
                تفاصيل أداء الوحدات
              </CardTitle>
              <CardDescription>
                تفصيل أداء الوحدات التنظيمية في استقبال الكتب
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {data.topUnitsReceivingCorrespondence
                  .slice(0, 10)
                  .map((unit) => (
                    <div
                      key={unit.unitId}
                      className='border-muted/50 rounded-lg border p-4'
                    >
                      <div className='flex items-center justify-between'>
                        <div>
                          <h4 className='font-semibold'>{unit.unitName}</h4>
                          <p className='text-muted-foreground text-sm'>
                            كود الوحدة: {unit.unitCode}
                          </p>
                        </div>
                        <div className='text-right'>
                          <div className='text-lg font-bold text-blue-600'>
                            {unit.correspondenceCount.toLocaleString('ar-IQ')}
                          </div>
                          <div className='text-muted-foreground text-sm'>
                            إجمالي الكتب
                          </div>
                        </div>
                      </div>

                      <div className='mt-3 grid grid-cols-3 gap-4 text-sm'>
                        <div className='text-center'>
                          <div className='font-semibold text-green-600'>
                            {unit.incomingCount}
                          </div>
                          <div className='text-muted-foreground'>واردة</div>
                        </div>
                        <div className='text-center'>
                          <div className='font-semibold text-blue-600'>
                            {unit.outgoingCount}
                          </div>
                          <div className='text-muted-foreground'>صادرة</div>
                        </div>
                        <div className='text-center'>
                          <div className='font-semibold text-purple-600'>
                            {unit.internalCount}
                          </div>
                          <div className='text-muted-foreground'>داخلية</div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}

// Helper functions for color mapping
function getTypeColor(typeName: string): string {
  const typeColors: Record<string, string> = {
    داخلي: '#8b5cf6',
    'وارد خارجي': '#22c55e',
    'صادر خارجي': '#f59e0b',
    مذكرة: '#3b82f6'
  };
  return typeColors[typeName] || '#6b7280';
}

function getStatusColor(statusName: string): string {
  const statusColors: Record<string, string> = {
    مسودة: '#6b7280',
    مسجل: '#3b82f6',
    'قيد المعالجة': '#f59e0b',
    مكتملة: '#22c55e',
    متأخرة: '#ef4444',
    معلقة: '#8b5cf6'
  };
  return statusColors[statusName] || '#6b7280';
}

function calculateUnitEfficiency(unit: TopUnitEntry): number {
  // Simple efficiency calculation based on the ratio of different correspondence types
  const total = unit.correspondenceCount;
  if (total === 0) return 0;

  // Higher efficiency for units with balanced correspondence types
  const balance = 1 - Math.abs(unit.incomingCount - unit.outgoingCount) / total;
  return Math.min(100, balance * 100);
}

// Loading skeleton for the entire dashboard
export function DashboardOverviewSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Header Skeleton */}
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-48' />
          <Skeleton className='h-4 w-64' />
        </div>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-9 w-20' />
          <Skeleton className='h-9 w-20' />
          <Skeleton className='h-9 w-20' />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className='@container/card'>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center gap-2'>
                <Skeleton className='size-4 rounded' />
                <Skeleton className='h-4 w-32' />
              </CardDescription>
              <Skeleton className='h-8 w-16' />
              <Skeleton className='h-6 w-16 rounded-full' />
            </CardHeader>
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
              <Skeleton className='h-[400px] w-full' />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Section Skeleton */}
      <div className='grid grid-cols-1 gap-6 xl:grid-cols-3'>
        <div className='xl:col-span-2'>
          <Card>
            <CardHeader>
              <Skeleton className='h-6 w-48' />
              <Skeleton className='h-4 w-32' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-[300px] w-full' />
            </CardContent>
          </Card>
        </div>
        <div className='xl:col-span-1'>
          <Card>
            <CardHeader>
              <Skeleton className='h-6 w-48' />
              <Skeleton className='h-4 w-32' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-[300px] w-full' />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
