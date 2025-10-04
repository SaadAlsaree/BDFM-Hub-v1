import PageContainer from '@/components/layout/page-container';
import { AutomationPerformance, dashboardService } from '@/features/dashboard';
import { Button } from '@/components/ui/button';
import {
  IconRefresh,
  IconFilter,
  IconCalendar,
  IconChartBar
} from '@tabler/icons-react';
import React from 'react';
import UnitSelecter from '@/components/unit-selecter';

interface DashboardLayoutProps {
  task_stats: React.ReactNode;
  performance_stats: React.ReactNode;
  overview_stats: React.ReactNode;
  children: React.ReactNode;
  searchParams?: Promise<{
    unitId?: string;
  }>;
}

export default async function DashboardLayout({
  task_stats,
  performance_stats,
  overview_stats,
  searchParams
}: DashboardLayoutProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const { unitId } = resolvedSearchParams;

  // Fetch automation performance data for the additional section
  const automationResponse = await dashboardService.getAutomationPerformance({
    unitId: unitId || ''
  });
  const automationData = automationResponse?.succeeded
    ? automationResponse.data
    : undefined;

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col gap-6'>
        {/* Dashboard Header */}
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>لوحة التحكم</h1>
            <p className='text-muted-foreground'>
              نظرة عامة شاملة على أداء نظام إدارة الكتب
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm'>
              <IconRefresh className='mr-2 size-4' />
              تحديث
            </Button>

            <Button variant='outline' size='sm'>
              <IconFilter className='mr-2 size-4' />
              تصفية
            </Button>

            {/* <Button variant='outline' size='sm'>
              <IconDownload className='mr-2 size-4' />
              تصدير
            </Button> */}

            <UnitSelecter />
          </div>
        </div>

        {/* Last Updated Info */}
        <div className='text-muted-foreground flex items-center gap-4 text-sm'>
          <div className='flex items-center gap-2'>
            <IconCalendar className='size-4' />
            <span>آخر تحديث: {new Date().toLocaleString('ar-IQ')}</span>
          </div>
          <div className='flex items-center gap-2'>
            <IconChartBar className='size-4' />
            <span>البيانات محدثة في الوقت الفعلي</span>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className='w-full'>{task_stats}</div>

        {/* Main Dashboard Grid */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
          {/* Charts Section - Takes 8 columns on large screens */}
          <div className='space-y-6 lg:col-span-8'>
            {/* Performance Stats */}
            <div className='w-full'>{performance_stats}</div>

            {/* Overview Stats */}
            <div className='w-full'>{overview_stats}</div>
          </div>

          {/* Sidebar Section - Takes 4 columns on large screens */}
          <div className='space-y-6 lg:col-span-4'>
            {/* Automation Performance */}
            <AutomationPerformance
              data={automationData}
              loading={false}
              error={
                automationResponse?.succeeded === false
                  ? automationResponse.message
                  : undefined
              }
            />

            {/* Recent Inbox Items */}

            {/* Quick Actions */}
          </div>
        </div>

        {/* Footer Summary */}
      </div>
    </PageContainer>
  );
}
