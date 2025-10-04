'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardAction
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CorrespondenceDetails } from '../../types/correspondence-details';
import { useRouter } from 'next/navigation';
import {
  ExternalLink,
  Link,
  FileText,

} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReferencesTabProps {
  data: CorrespondenceDetails;
}

export function ReferencesTab({ data }: ReferencesTabProps) {


  const referencesToCount = data.referencesToCorrespondences?.length || 0;
  const referencedByCount = data.referencedByCorrespondences?.length || 0;



  return (
    <div className='flex flex-1 flex-col space-y-6'>
      {/* Header Section */}
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <h2 className='text-2xl font-bold tracking-tight'>
            المراجع والروابط
          </h2>
          <p className='text-muted-foreground'>الكتب المرتبطة بهذه المراسلة</p>
        </div>
        <Badge variant='outline' className='font-mono text-xs'>
          {referencesToCount + referencedByCount} مرجع
        </Badge>
      </div>

      {/* Stats Cards Grid */}
      <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-2 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2'>
        {/* References To Summary Card */}
        <Card className='@container/card'>
          <CardHeader>
            <CardDescription className='flex items-center gap-2'>
              <ExternalLink className='h-4 w-4' />
              يشير إلى
            </CardDescription>
            <CardTitle className='text-lg font-semibold tabular-nums @[250px]/card:text-xl'>
              {referencesToCount}
            </CardTitle>
            <CardAction>
              <Badge
                variant='outline'
                className={cn(
                  referencesToCount > 0
                    ? 'border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'border-gray-200 bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300'
                )}
              >
                <ExternalLink className='ml-1 h-3 w-3' />
                مرجع
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            {referencesToCount > 0 && (
              <div className='flex flex-col gap-2'>
                {data.referencesToCorrespondences?.map((reference) => (
                  <div key={reference.linkId}>
                    <div className='flex flex-col gap-2'>
                      <div className='flex flex-col gap-2'>
                        <div className='border-muted bg-background overflow-x-auto rounded-lg border'>
                          <table className='divide-muted min-w-full divide-y text-sm'>
                            <thead>
                              <tr className='bg-muted/50'>
                                <th className='px-3 py-2 text-right font-semibold'>
                                  رقم الكتاب
                                </th>
                                <th className='px-3 py-2 text-right font-semibold'>
                                  الموضوع
                                </th>
                                <th className='px-3 py-2 text-right font-semibold'>
                                  الاتجاه
                                </th>
                                <th className='px-3 py-2 text-right font-semibold'>
                                  ملاحظات
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className='hover:bg-muted/30 transition-colors'>
                                <td className='px-3 py-2 font-mono'>
                                  {reference.targetRefNo ? (
                                    <a
                                      href={`/correspondence/view/${reference.targetCorrespondenceId}`}
                                      className='text-primary hover:text-primary/80 underline underline-offset-2 transition-colors'
                                    >
                                      {reference.targetRefNo}
                                    </a>
                                  ) : (
                                    <span className='text-muted-foreground'>
                                      —
                                    </span>
                                  )}
                                </td>
                                <td className='px-3 py-2'>
                                  {reference.targetSubject ? (
                                    <a
                                      href={`/correspondence/view/${reference.targetCorrespondenceId}`}
                                      className='text-primary hover:text-primary/80 underline underline-offset-2 transition-colors'
                                    >
                                      {reference.targetSubject}
                                    </a>
                                  ) : (
                                    <span className='text-muted-foreground'>
                                      —
                                    </span>
                                  )}
                                </td>
                                <td className='px-3 py-2'>
                                  <span
                                    className={cn(
                                      'rounded px-2 py-0.5 text-xs font-medium',
                                      'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                                    )}
                                  >
                                    يشير إلى
                                  </span>
                                </td>
                                <td className='px-3 py-2'>
                                  {reference.notes ? (
                                    <span className='line-clamp-1'>
                                      {reference.notes}
                                    </span>
                                  ) : (
                                    <span className='text-muted-foreground'>
                                      —
                                    </span>
                                  )}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              الكتب المرجعية
            </div>
            <div className='text-muted-foreground'>
              {referencesToCount > 0
                ? `${referencesToCount} كتب مرجعية`
                : 'لا توجد مراجع'}
            </div>
          </CardFooter>
        </Card>

        {/* Referenced By Summary Card */}
        <Card className='@container/card'>
          <CardHeader>
            <CardDescription className='flex items-center gap-2'>
              <Link className='h-4 w-4' />
              مشار إليه من
            </CardDescription>
            <CardTitle className='text-lg font-semibold tabular-nums @[250px]/card:text-xl'>
              {referencedByCount}
            </CardTitle>
            <CardAction>
              <Badge
                variant='outline'
                className={cn(
                  referencedByCount > 0
                    ? 'border-green-200 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                    : 'border-gray-200 bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300'
                )}
              >
                <Link className='ml-1 h-3 w-3' />
                رابط
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            {referencesToCount > 0 && (
              <div className='flex flex-col gap-2'>
                {data.referencedByCorrespondences?.map((reference) => (
                  <div key={reference.linkId}>
                    <div className='flex flex-col gap-2'>
                      <div className='flex flex-col gap-2'>
                        <div className='border-muted bg-background overflow-x-auto rounded-lg border'>
                          <table className='divide-muted min-w-full divide-y text-sm'>
                            <thead>
                              <tr className='bg-muted/50'>
                                <th className='px-3 py-2 text-right font-semibold'>
                                  رقم الكتاب
                                </th>
                                <th className='px-3 py-2 text-right font-semibold'>
                                  الموضوع
                                </th>
                                <th className='px-3 py-2 text-right font-semibold'>
                                  الاتجاه
                                </th>
                                <th className='px-3 py-2 text-right font-semibold'>
                                  ملاحظات
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className='hover:bg-muted/30 transition-colors'>
                                <td className='px-3 py-2 font-mono'>
                                  {reference.targetRefNo ? (
                                    <a
                                      href={`/correspondence/view/${reference.targetCorrespondenceId}`}
                                      className='text-primary hover:text-primary/80 underline underline-offset-2 transition-colors'
                                    >
                                      {reference.targetRefNo}
                                    </a>
                                  ) : (
                                    <span className='text-muted-foreground'>
                                      —
                                    </span>
                                  )}
                                </td>
                                <td className='px-3 py-2'>
                                  {reference.targetSubject ? (
                                    <a
                                      href={`/correspondence/view/${reference.targetCorrespondenceId}`}
                                      className='text-primary hover:text-primary/80 underline underline-offset-2 transition-colors'
                                    >
                                      {reference.targetSubject}
                                    </a>
                                  ) : (
                                    <span className='text-muted-foreground'>
                                      —
                                    </span>
                                  )}
                                </td>
                                <td className='px-3 py-2'>
                                  <span
                                    className={cn(
                                      'rounded px-2 py-0.5 text-xs font-medium',
                                      reference.direction === 'to'
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                                        : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                                    )}
                                  >
                                    {reference.direction === 'to'
                                      ? 'يشير إلى'
                                      : 'مشار إليه من'}
                                  </span>
                                </td>
                                <td className='px-3 py-2'>
                                  {reference.notes ? (
                                    <span className='line-clamp-1'>
                                      {reference.notes}
                                    </span>
                                  ) : (
                                    <span className='text-muted-foreground'>
                                      —
                                    </span>
                                  )}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              الكتب المرتبطة
            </div>
            <div className='text-muted-foreground'>
              {referencedByCount > 0
                ? `${referencedByCount} كتب مرتبطة`
                : 'لا توجد روابط'}
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Empty State */}
      {referencesToCount === 0 && referencedByCount === 0 && (
        <div className='flex flex-col items-center justify-center py-12 text-center'>
          <FileText className='text-muted-foreground/50 mb-4 h-12 w-12' />
          <h3 className='text-muted-foreground mb-2 text-lg font-medium'>
            لا توجد مراجع
          </h3>
          <p className='text-muted-foreground max-w-sm text-sm'>
            هذه الكتب لا تحتوي على أي مراجع أو روابط لكتب أخرى
          </p>
        </div>
      )}
    </div>
  );
}
