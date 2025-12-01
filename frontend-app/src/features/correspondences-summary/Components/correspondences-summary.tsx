'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { IconRefresh } from '@tabler/icons-react';
import { CorrespondencesSummaryHeader } from './correspondences-summary-header';
import { CorrespondencesSummaryFilter } from './correspondences-summary-filter';
import { CorrespondencesSummaryCard } from './correspondences-summary-card';
import {
  UnitCorrespondenceSummary,
  UnitCorrespondenceSummaryResponse
} from '../types/correspondences-summary';
import { Separator } from '@/components/ui/separator';

interface CorrespondencesSummaryProps {
  initialData?: UnitCorrespondenceSummaryResponse;
  initialQuery?: unknown;
  error?: string | null;
}

export function CorrespondencesSummary({
  initialData,
  error: initialError
}: CorrespondencesSummaryProps) {
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
  const totals = initialData?.data;
  const error =
    initialError ||
    (initialData && !initialData.succeeded ? initialData.message : null);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <CorrespondencesSummaryHeader
        lastRefresh={lastRefresh}
        onRefresh={onRefresh}
        onExport={onExport}
        loading={false}
      />
      <Separator />
      {/* Filter */}
      <div className='flex justify-end'>
        <CorrespondencesSummaryFilter />
      </div>

      {/* Content */}
      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='size-4' />
          <AlertTitle>خطأ في تحميل البيانات</AlertTitle>
          <AlertDescription>
            {typeof error === 'string'
              ? error
              : 'حدث خطأ أثناء تحميل ملخص المراسلات. يرجى المحاولة مرة أخرى.'}
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
              لم يتم العثور على أي مراسلات بناءً على معايير الفلترة المحددة.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {!error && totals && (
        <Card>
          <CardContent className='pt-6'>
            <div className='grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8'>
              <div className='text-center'>
                <div className='text-2xl font-bold'>
                  {(totals.totalAllCorrespondences || 0).toLocaleString(
                    'en-US'
                  )}
                </div>
                <div className='text-muted-foreground text-xs'>
                  إجمالي الكتب
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-blue-600'>
                  {(totals.totalAllCorrespondencesPending || 0).toLocaleString(
                    'en-US'
                  )}
                </div>
                <div className='text-muted-foreground text-xs'>معلقة</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-amber-600'>
                  {(
                    totals.totalAllCorrespondencesUnderProcessing || 0
                  ).toLocaleString('en-US')}
                </div>
                <div className='text-muted-foreground text-xs'>
                  قيد المعالجة
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-600'>
                  {(
                    totals.totalAllCorrespondencesCompleted || 0
                  ).toLocaleString('en-US')}
                </div>
                <div className='text-muted-foreground text-xs'>مكتملة</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-red-600'>
                  {(totals.totalAllCorrespondencesRejected || 0).toLocaleString(
                    'en-US'
                  )}
                </div>
                <div className='text-muted-foreground text-xs'>مرفوضة</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-orange-600'>
                  {(
                    totals.totalAllCorrespondencesReturnedForModification || 0
                  ).toLocaleString('en-US')}
                </div>
                <div className='text-muted-foreground text-xs'>
                  مرتجعة للتعديل
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-purple-600'>
                  {(
                    totals.totalAllCorrespondencesPostponed || 0
                  ).toLocaleString('en-US')}
                </div>
                <div className='text-muted-foreground text-xs'>مؤجلة</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-indigo-600'>
                  {(
                    totals.totalAllCorrespondencesForwarded || 0
                  ).toLocaleString('en-US')}
                </div>
                <div className='text-muted-foreground text-xs'>محولة</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!error && units.length > 0 && (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {units.map((unit: UnitCorrespondenceSummary) => (
            <CorrespondencesSummaryCard
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
