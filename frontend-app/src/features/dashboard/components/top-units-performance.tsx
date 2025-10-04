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
  IconTrophy,
  IconUsers,
  IconClock,
  IconTrendingUp
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { UnitCorrespondenceVolume } from '../types';

interface TopUnitsPerformanceProps {
  data?: UnitCorrespondenceVolume[];
  loading?: boolean;
  error?: string;
  title?: string;
  description?: string;
  maxUnits?: number;
}

export function TopUnitsPerformance({
  data,
  loading = false,
  error,
  title = 'أفضل الجهات أداءً',
  description = 'ترتيب الجهات حسب الأداء وحجم الكتب',
  maxUnits = 5
}: TopUnitsPerformanceProps) {
  if (loading) {
    return (
      <TopUnitsPerformanceSkeleton
        title={title}
        description={description}
        maxUnits={maxUnits}
      />
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <IconTrophy className='size-5' />
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

  // Sort units by efficiency score and take top N
  const topUnits = data
    .sort((a, b) => b.efficiencyScore - a.efficiencyScore)
    .slice(0, maxUnits);

  const maxEfficiency = Math.max(
    ...topUnits.map((unit) => unit.efficiencyScore)
  );

  function getRankBadge(index: number) {
    const ranks = [
      { variant: 'default' as const, icon: '🥇', text: 'الأول' },
      { variant: 'secondary' as const, icon: '🥈', text: 'الثاني' },
      { variant: 'outline' as const, icon: '🥉', text: 'الثالث' },
      { variant: 'outline' as const, icon: '🏅', text: `${index + 1}` },
      { variant: 'outline' as const, icon: '🏅', text: `${index + 1}` }
    ];

    return (
      ranks[index] || {
        variant: 'outline' as const,
        icon: '🏅',
        text: `${index + 1}`
      }
    );
  }

  function getEfficiencyColor(score: number) {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  }

  function getEfficiencyBgColor(score: number) {
    if (score >= 90)
      return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800';
    if (score >= 80)
      return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
    if (score >= 70)
      return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <IconTrophy className='size-5' />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {topUnits.map((unit, index) => {
          const rank = getRankBadge(index);
          const completionRate =
            unit.totalCorrespondence > 0
              ? (unit.completedCorrespondence / unit.totalCorrespondence) * 100
              : 0;

          return (
            <div
              key={unit.unitId}
              className={cn(
                'relative rounded-lg border p-4 transition-all hover:shadow-md',
                getEfficiencyBgColor(unit.efficiencyScore)
              )}
            >
              {/* Rank Badge */}
              <div className='absolute -top-2 -right-2'>
                <Badge variant={rank.variant} className='px-2 py-1'>
                  <span className='mr-1'>{rank.icon}</span>
                  {rank.text}
                </Badge>
              </div>

              <div className='space-y-3'>
                {/* Unit Name and Efficiency Score */}
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <h3 className='text-lg font-semibold'>{unit.unitName}</h3>
                    <p className='text-muted-foreground text-sm'>
                      ترميز الجهة: {unit.unitCode}
                    </p>
                  </div>
                  <div className='text-right'>
                    <div
                      className={cn(
                        'text-2xl font-bold',
                        getEfficiencyColor(
                          unit.efficiencyScore !== undefined &&
                            unit.efficiencyScore !== null
                            ? unit.efficiencyScore
                            : 0
                        )
                      )}
                    >
                      {unit.efficiencyScore !== undefined &&
                      unit.efficiencyScore !== null
                        ? unit.efficiencyScore.toFixed(1)
                        : '0.0'}
                      %
                    </div>
                    <p className='text-muted-foreground text-xs'>
                      نقاط الكفاءة
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>مستوى الأداء</span>
                    <span>
                      {unit.efficiencyScore !== undefined &&
                      unit.efficiencyScore !== null
                        ? unit.efficiencyScore.toFixed(1)
                        : '0.0'}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      ((unit.efficiencyScore !== undefined &&
                      unit.efficiencyScore !== null
                        ? unit.efficiencyScore
                        : 0) /
                        maxEfficiency) *
                      100
                    }
                    className='h-2'
                  />
                </div>

                {/* Statistics Grid */}
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div className='flex items-center gap-2'>
                    <IconUsers className='text-muted-foreground size-4' />
                    <div>
                      <div className='font-medium'>
                        {unit.totalCorrespondence !== undefined &&
                        unit.totalCorrespondence !== null
                          ? unit.totalCorrespondence.toLocaleString('ar-IQ')
                          : '0'}
                      </div>
                      <div className='text-muted-foreground text-xs'>
                        إجمالي الكتب
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <IconTrendingUp className='text-muted-foreground size-4' />
                    <div>
                      <div className='font-medium'>
                        {completionRate.toFixed(1)}%
                      </div>
                      <div className='text-muted-foreground text-xs'>
                        معدل الإنجاز
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <IconClock className='text-muted-foreground size-4' />
                    <div>
                      <div className='font-medium'>
                        {unit.averageProcessingTime !== undefined &&
                        unit.averageProcessingTime !== null
                          ? unit.averageProcessingTime.toFixed(1)
                          : '0.0'}{' '}
                        يوم
                      </div>
                      <div className='text-muted-foreground text-xs'>
                        متوسط وقت المعالجة
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <IconUsers className='text-muted-foreground size-4' />
                    <div>
                      <div className='font-medium'>
                        {unit.activeCorrespondence !== undefined &&
                        unit.activeCorrespondence !== null
                          ? unit.activeCorrespondence.toLocaleString('ar-IQ')
                          : '0'}
                      </div>
                      <div className='text-muted-foreground text-xs'>
                        الكتب النشطة
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Summary */}
        <div className='bg-muted/50 mt-6 rounded-lg p-4'>
          <div className='grid grid-cols-3 gap-4 text-center'>
            <div>
              <div className='text-primary text-2xl font-bold'>
                {topUnits
                  .reduce((sum, unit) => sum + unit.totalCorrespondence, 0)
                  .toLocaleString('ar-IQ')}
              </div>
              <div className='text-muted-foreground text-sm'>إجمالي الكتب</div>
            </div>
            <div>
              <div className='text-primary text-2xl font-bold'>
                {(
                  topUnits.reduce(
                    (sum, unit) => sum + unit.efficiencyScore,
                    0
                  ) / topUnits.length
                ).toFixed(1)}
                %
              </div>
              <div className='text-muted-foreground text-sm'>متوسط الكفاءة</div>
            </div>
            <div>
              <div className='text-primary text-2xl font-bold'>
                {(
                  topUnits.reduce(
                    (sum, unit) => sum + unit.averageProcessingTime,
                    0
                  ) / topUnits.length
                ).toFixed(1)}
              </div>
              <div className='text-muted-foreground text-sm'>
                متوسط وقت المعالجة (يوم)
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TopUnitsPerformanceSkeleton({
  title,
  description,
  maxUnits
}: {
  title: string;
  description: string;
  maxUnits: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <IconTrophy className='size-5' />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {Array.from({ length: maxUnits }).map((_, index) => (
          <div key={index} className='space-y-3 rounded-lg border p-4'>
            <div className='flex items-start justify-between'>
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-6 w-48' />
                <Skeleton className='h-4 w-32' />
              </div>
              <div className='space-y-2 text-right'>
                <Skeleton className='h-8 w-16' />
                <Skeleton className='h-3 w-20' />
              </div>
            </div>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-4 w-12' />
              </div>
              <Skeleton className='h-2 w-full' />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='flex items-center gap-2'>
                  <Skeleton className='size-4' />
                  <div className='space-y-1'>
                    <Skeleton className='h-4 w-16' />
                    <Skeleton className='h-3 w-24' />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className='bg-muted/50 mt-6 rounded-lg p-4'>
          <div className='grid grid-cols-3 gap-4 text-center'>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className='space-y-2'>
                <Skeleton className='mx-auto h-8 w-16' />
                <Skeleton className='mx-auto h-4 w-24' />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
