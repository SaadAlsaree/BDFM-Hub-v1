'use client';

import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  IconMail,
  IconInbox,
  IconCalendarDue,
  IconClock,
  IconAlertTriangle,
  IconTrendingUp,
  IconTrendingDown,
  IconActivity,
  IconUsers,
  IconFileText,
  IconCircleCheck
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { QuickStatsViewModel } from '../types';

interface DashboardStatsCardsProps {
  data?: QuickStatsViewModel;
  loading?: boolean;
  error?: string;
}

export function DashboardStatsCards({
  data,
  loading = false,
  error
}: DashboardStatsCardsProps) {
  const router = useRouter();

  // Handle card click navigation
  function handleCardClick(cardType: string) {
    switch (cardType) {
      case 'unread':
        router.push('/correspondence?filter=unread');
        break;
      case 'tasks-today':
        router.push('/correspondence?filter=due-today');
        break;
      case 'overdue':
        router.push('/correspondence?filter=overdue');
        break;
      case 'completion-rate':
        router.push('/dashboard?view=completion');
        break;
      case 'processing-time':
        router.push('/dashboard?view=processing-time');
        break;
      case 'active-workflows':
        router.push('/custom-workflow');
        break;
      default:
        console.log({ cardType });
    }
  }

  if (loading) {
    return <DashboardStatsCardsSkeleton />;
  }

  if (error) {
    return (
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className='border-destructive/20'>
            <CardHeader>
              <CardDescription className='text-destructive'>
                خطأ في تحميل البيانات
              </CardDescription>
              <CardTitle className='text-muted-foreground text-sm'>
                {error}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      id: 'unread',
      title: 'البريد الوارد غير المقروء',
      value: data?.unreadCount || 0,
      icon: IconMail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      badgeVariant: 'secondary' as const,
      badgeText: 'جديد',
      description: 'الرسائل الواردة غير المقروءة'
    },
    {
      id: 'tasks-today',
      title: 'المهام اليوم',
      value: data?.tasksToday || 0,
      icon: IconCalendarDue,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
      borderColor: 'border-amber-200 dark:border-amber-800',
      badgeVariant: 'outline' as const,
      badgeText: 'مستحقة',
      description: 'المهام المستحقة اليوم'
    },
    {
      id: 'overdue',
      title: 'المهام المتأخرة',
      value: data?.overdueTasks || 0,
      icon: IconAlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      borderColor: 'border-red-200 dark:border-red-800',
      badgeVariant: 'destructive' as const,
      badgeText: 'متأخرة',
      description: 'المهام المتأخرة عن موعدها'
    },
    {
      id: 'completion-rate',
      title: 'معدل الإنجاز',
      value: `${Math.round((data?.completionRate || 0) * 100)}%`,
      icon: IconCircleCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      borderColor: 'border-green-200 dark:border-green-800',
      badgeVariant: 'outline' as const,
      badgeText: 'إنجاز',
      description: 'معدل إنجاز المهام'
    },
    {
      id: 'processing-time',
      title: 'متوسط وقت المعالجة',
      value: `${Math.round(data?.averageProcessingTime || 0)} يوم`,
      icon: IconClock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      badgeVariant: 'outline' as const,
      badgeText: 'متوسط',
      description: 'متوسط وقت معالجة الكتب'
    },
    {
      id: 'active-workflows',
      title: 'سير العمل النشط',
      value: data?.activeWorkflows || 0,
      icon: IconActivity,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
      badgeVariant: 'outline' as const,
      badgeText: 'نشط',
      description: 'عدد سير العمل النشط'
    }
  ];

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isHighValue = stat.id === 'overdue' && Number(stat.value) > 0;

        return (
          <Card
            key={stat.id}
            className={cn(
              '@container/card cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md',
              stat.bgColor,
              stat.borderColor,
              isHighValue && 'ring-2 ring-red-200 dark:ring-red-800'
            )}
            onClick={() => handleCardClick(stat.id)}
          >
            <CardHeader className='pb-2'>
              <CardDescription
                className={cn('flex items-center gap-2', stat.color)}
              >
                <Icon className='size-4' />
                {stat.title}
              </CardDescription>
              <CardTitle
                className={cn(
                  'text-2xl font-semibold tabular-nums @[250px]/card:text-3xl',
                  stat.color
                )}
              >
                {stat.value}
              </CardTitle>
              <CardAction>
                <Badge
                  variant={stat.badgeVariant}
                  className={cn(
                    stat.badgeVariant === 'destructive' &&
                      'border-red-200 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400',
                    stat.badgeVariant === 'secondary' &&
                      'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-400'
                  )}
                >
                  <Icon className='mr-1 size-3' />
                  {stat.badgeText}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 pt-0 text-sm'>
              <div className='text-muted-foreground line-clamp-1 flex gap-2 font-medium'>
                {stat.description}
              </div>
              <div className='text-muted-foreground text-xs'>
                اضغط لعرض التفاصيل
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

function DashboardStatsCardsSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className='@container/card'>
          <CardHeader className='pb-2'>
            <CardDescription className='flex items-center gap-2'>
              <Skeleton className='size-4 rounded' />
              <Skeleton className='h-4 w-32' />
            </CardDescription>
            <CardTitle>
              <Skeleton className='h-8 w-16' />
            </CardTitle>
            <CardAction>
              <Skeleton className='h-6 w-16 rounded-full' />
            </CardAction>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 pt-0 text-sm'>
            <Skeleton className='h-4 w-40' />
            <Skeleton className='h-3 w-32' />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
