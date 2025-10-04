'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { CorrespondenceTypeDistribution } from '../types';

interface CorrespondenceTypeChartProps {
  data?: CorrespondenceTypeDistribution[];
  loading?: boolean;
  error?: string;
  title?: string;
  description?: string;
}

const COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16' // lime
];

export function CorrespondenceTypeChart({
  data,
  loading = false,
  error,
  title = 'توزيع أنواع الكتب',
  description = 'توزيع الكتب حسب النوع'
}: CorrespondenceTypeChartProps) {
  if (loading) {
    return (
      <CorrespondenceTypeChartSkeleton
        title={title}
        description={description}
      />
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>{title}</CardTitle>
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

  // Prepare data for the chart
  const chartData = data.map((item, index) => ({
    name: item.type,
    value: item.count,
    percentage: item.percentage,
    color: item.color || COLORS[index % COLORS.length]
  }));

  function CustomTooltip({ active, payload }: any) {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className='bg-background rounded-lg border p-3 shadow-md'>
          <p className='font-medium'>{data.name}</p>
          <p className='text-muted-foreground text-sm'>
            العدد: {data.value.toLocaleString('ar-IQ')}
          </p>
          <p className='text-muted-foreground text-sm'>
            النسبة: {data.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  }

  function CustomLegend({ payload }: any) {
    return (
      <div className='mt-4 flex flex-wrap justify-center gap-4'>
        {payload.map((entry: any, index: number) => (
          <div key={index} className='flex items-center gap-2 text-sm'>
            <div
              className='h-3 w-3 rounded-full'
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.value}</span>
            <span className='text-muted-foreground'>
              (
              {chartData
                .find((d) => d.name === entry.value)
                ?.percentage.toFixed(1)}
              %)
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='h-[400px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={chartData}
                cx='50%'
                cy='50%'
                labelLine={false}
                label={({ percentage }) => `${percentage.toFixed(1)}%`}
                outerRadius={120}
                fill='#8884d8'
                dataKey='value'
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Statistics */}
        <div className='mt-4 grid grid-cols-2 gap-4 border-t pt-4'>
          <div className='text-center'>
            <div className='text-primary text-2xl font-bold'>
              {data
                .reduce((sum, item) => sum + item.count, 0)
                .toLocaleString('ar-IQ')}
            </div>
            <div className='text-muted-foreground text-sm'>إجمالي الكتب</div>
          </div>
          <div className='text-center'>
            <div className='text-primary text-2xl font-bold'>{data.length}</div>
            <div className='text-muted-foreground text-sm'>عدد الأنواع</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CorrespondenceTypeChartSkeleton({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex h-[400px] items-center justify-center'>
          <div className='space-y-4 text-center'>
            <Skeleton className='mx-auto h-48 w-48 rounded-full' />
            <div className='flex justify-center gap-4'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-16' />
            </div>
          </div>
        </div>
        <div className='mt-4 grid grid-cols-2 gap-4 border-t pt-4'>
          <div className='space-y-2 text-center'>
            <Skeleton className='mx-auto h-8 w-16' />
            <Skeleton className='mx-auto h-4 w-24' />
          </div>
          <div className='space-y-2 text-center'>
            <Skeleton className='mx-auto h-8 w-8' />
            <Skeleton className='mx-auto h-4 w-20' />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
