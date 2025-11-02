'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LeaveInterruption,
  LeaveInterruptionType,
  LeaveInterruptionTypeDisplay
} from '../types/leave-interruption';
import { formatDate } from '../utils/leave-interruption';
import { Calendar, User, CheckCircle, Clock } from 'lucide-react';

interface LeaveInterruptionListProps {
  interruptions: LeaveInterruption[];
  requestId?: string;
}

export default function LeaveInterruptionList({
  interruptions,
  requestId
}: LeaveInterruptionListProps) {
  if (!interruptions || interruptions.length === 0) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <p className='text-center text-gray-500'>لا توجد قطوع</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold'>القطوع</h3>
      {interruptions.map((interruption) => (
        <Card key={interruption.id}>
          <CardHeader>
            <CardTitle className='flex items-center justify-between text-base'>
              <span>قطع الإجازة</span>
              <div className='flex gap-2'>
                <Badge
                  variant={
                    interruption.isProcessed ? 'default' : 'outline'
                  }
                >
                  {interruption.isProcessed ? 'تم المعالجة' : 'قيد المعالجة'}
                </Badge>
                <Badge variant='secondary'>
                  {interruption.interruptionType
                    ? LeaveInterruptionTypeDisplay[
                        interruption.interruptionType as LeaveInterruptionType
                      ]
                    : '-'}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='grid grid-cols-2 gap-2 text-sm'>
              <div className='flex items-center gap-2 text-gray-600'>
                <Calendar className='h-4 w-4' />
                <span>تاريخ القطع:</span>
              </div>
              <div>{formatDate(interruption.interruptionDate)}</div>

              <div className='flex items-center gap-2 text-gray-600'>
                <Calendar className='h-4 w-4' />
                <span>تاريخ العودة:</span>
              </div>
              <div>{formatDate(interruption.returnDate)}</div>

              <div className='flex items-center gap-2 text-gray-600'>
                <User className='h-4 w-4' />
                <span>قطع بواسطة:</span>
              </div>
              <div>{interruption.interruptedByUserName || '-'}</div>

              {interruption.isProcessed && interruption.adjustedDays !== null && (
                <>
                  <div className='flex items-center gap-2 text-gray-600'>
                    <CheckCircle className='h-4 w-4 text-green-600' />
                    <span>الأيام المعدلة:</span>
                  </div>
                  <div className='font-semibold text-green-600'>
                    {interruption.adjustedDays || 0} يوم
                  </div>
                </>
              )}
            </div>

            {interruption.reason && (
              <div className='mt-3 rounded-lg bg-gray-50 p-3'>
                <p className='text-sm font-medium text-gray-700'>السبب:</p>
                <p className='text-sm text-gray-600'>{interruption.reason}</p>
              </div>
            )}

            <div className='mt-2 text-xs text-gray-500'>
              تاريخ الإنشاء: {formatDate(interruption.createAt)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

