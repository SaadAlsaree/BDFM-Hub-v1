'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertCircle,
  MoreHorizontal,
  TrendingUp,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UnitWorkflowStepsStatistics } from '../types/workflow-steps-statistics';
import {
  UnitType,
  UnitTypeDisplay
} from '@/features/organizational-unit/types/organizational';

interface WorkflowStepsStatisticsCardProps {
  data: UnitWorkflowStepsStatistics;
  onClick?: () => void;
}

export function WorkflowStepsStatisticsCard({
  data,
  onClick
}: WorkflowStepsStatisticsCardProps) {
  const total = data.totalWorkflowSteps || 0;
  const pending = data.pendingCount || 0;
  const inProgress = data.inProgressCount || 0;
  const completed = data.completedCount || 0;
  const rejected = data.rejectedCount || 0;
  const returned = data.returnedCount || 0;
  const delayed = data.delayedCount || 0;

  const completionRate =
    total > 0
      ? (((completed + rejected + returned) / total) * 100).toFixed(1)
      : '0';

  function getStatusColor(rate: string) {
    const numRate = parseFloat(rate);
    if (numRate >= 90)
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    if (numRate >= 75)
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  }

  function getUnitTypeColor(type: number) {
    switch (type) {
      case UnitType.DEPARTMENT:
        return 'blue-outline';
      case UnitType.DIRECTORATE:
        return 'purple-outline';
      case UnitType.DIVISION:
        return 'green-outline';
      case UnitType.BRANCH:
        return 'orange-outline';
      case UnitType.OFFICE:
        return 'indigo-outline';
      default:
        return 'outline';
    }
  }

  const stats = [
    {
      id: 'pending',
      label: 'قيد الانتظار',
      value: pending,
      icon: Mail,
      color: 'text-blue-600'
    },
    {
      id: 'inProgress',
      label: 'قيد التنفيذ',
      value: inProgress,
      icon: Clock,
      color: 'text-amber-600'
    },
    {
      id: 'completed',
      label: 'مكتملة',
      value: completed,
      icon: CheckCircle2,
      color: 'text-green-600'
    },
    {
      id: 'rejected',
      label: 'مرفوضة',
      value: rejected,
      icon: XCircle,
      color: 'text-red-600'
    },

    {
      id: 'returned',
      label: 'مرتجعة',
      value: returned,
      icon: RotateCcw,
      color: 'text-orange-600'
    },
    {
      id: 'delayed',
      label: 'متأخرة',
      value: delayed,
      icon: AlertCircle,
      color: 'text-red-600'
    }
  ];

  return (
    <Card className='transition-shadow hover:shadow-md'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <div className='flex items-center gap-2'>
              {data.unitType && (
                <Badge
                  variant={getUnitTypeColor(data.unitType) as any}
                  size='sm'
                >
                  {UnitTypeDisplay[data.unitType as UnitType] ||
                    data.unitTypeName}
                </Badge>
              )}
              <CardTitle className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                {data.unitName || 'غير محدد'}
              </CardTitle>
            </div>
            {data.unitCode && (
              <Badge variant='outline' className='mt-2'>
                {data.unitCode}
              </Badge>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onClick}>
                عرض التفاصيل
              </DropdownMenuItem>
              <DropdownMenuItem>تصدير البيانات</DropdownMenuItem>
              <DropdownMenuItem>طباعة التقرير</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        <div className='space-y-4'>
          {/* إجمالي خطوات سير العمل */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <FileText className='h-4 w-4 text-blue-600' />
              <span className='text-sm text-gray-600 dark:text-gray-400'>
                إجمالي خطوات سير العمل
              </span>
            </div>
            <span className='font-semibold text-gray-900 dark:text-gray-100'>
              {total.toLocaleString('en-US')}
            </span>
          </div>

          {/* عرض الإحصائيات */}
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div key={stat.id} className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Icon className={cn('h-4 w-4', stat.color)} />
                  <span className='text-sm text-gray-600 dark:text-gray-400'>
                    {stat.label}
                  </span>
                </div>
                <span className={cn('font-semibold', stat.color)}>
                  {stat.value.toLocaleString('en-US')}
                </span>
              </div>
            );
          })}

          {/* معدل الإنجاز */}
          {total > 0 && (
            <div className='border-t border-gray-200 pt-3 dark:border-gray-700'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <TrendingUp className='h-4 w-4 text-blue-600' />
                  <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    معدل الإنجاز
                  </span>
                </div>
                <Badge className={getStatusColor(completionRate)}>
                  {completionRate}%
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
