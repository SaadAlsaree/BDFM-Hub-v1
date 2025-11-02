'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LeaveCancellation } from '../types/leave-cancellation';
import { formatDate } from '../utils/leave-cancellation';
import { Calendar, User, CheckCircle } from 'lucide-react';

interface LeaveCancellationListProps {
  cancellations: LeaveCancellation[];
}

export default function LeaveCancellationList({
  cancellations
}: LeaveCancellationListProps) {
  if (!cancellations || cancellations.length === 0) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <p className='text-center text-gray-500'>لا توجد إلغاءات</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold'>الإلغاءات</h3>
      {cancellations.map((cancellation) => (
        <Card key={cancellation.id}>
          <CardHeader>
            <CardTitle className='flex items-center justify-between text-base'>
              <span>إلغاء الإجازة</span>
              <Badge
                variant={cancellation.isBalanceRestored ? 'default' : 'outline'}
              >
                {cancellation.isBalanceRestored
                  ? 'تم استعادة الرصيد'
                  : 'لم يتم استعادة الرصيد'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='grid grid-cols-2 gap-2 text-sm'>
              <div className='flex items-center gap-2 text-gray-600'>
                <Calendar className='h-4 w-4' />
                <span>تاريخ الإلغاء:</span>
              </div>
              <div>{formatDate(cancellation.cancellationDate)}</div>

              <div className='flex items-center gap-2 text-gray-600'>
                <User className='h-4 w-4' />
                <span>ألغي بواسطة:</span>
              </div>
              <div>{cancellation.cancelledByUserName || '-'}</div>

              {cancellation.isBalanceRestored && (
                <>
                  <div className='flex items-center gap-2 text-gray-600'>
                    <CheckCircle className='h-4 w-4 text-green-600' />
                    <span>الأيام المستعادة:</span>
                  </div>
                  <div className='font-semibold text-green-600'>
                    {cancellation.restoredDays || 0} يوم
                  </div>
                </>
              )}
            </div>

            {cancellation.reason && (
              <div className='mt-3 rounded-lg bg-gray-50 p-3'>
                <p className='text-sm font-medium text-gray-700'>السبب:</p>
                <p className='text-sm text-gray-600'>{cancellation.reason}</p>
              </div>
            )}

            <div className='mt-2 text-xs text-gray-500'>
              تاريخ الإنشاء: {formatDate(cancellation.createAt)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
