'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LeaveBalance, LeaveType, LeaveTypeDisplay } from '../types/leave-balance';
import { formatBalance, formatDate } from '../utils/leave-balance';

interface LeaveBalanceDisplayProps {
  balances: LeaveBalance[];
  employeeId?: string;
  employeeName?: string;
}

export default function LeaveBalanceDisplay({
  balances,
  employeeId,
  employeeName
}: LeaveBalanceDisplayProps) {
  if (!balances || balances.length === 0) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <p className='text-center text-gray-500'>لا توجد أرصدة متاحة</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      {(employeeId || employeeName) && (
        <div className='mb-4'>
          <h3 className='text-lg font-semibold'>
            {employeeName || employeeId}
          </h3>
        </div>
      )}

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {balances.map((balance) => (
          <Card key={balance.id}>
            <CardHeader>
              <CardTitle className='flex items-center justify-between text-lg'>
                <span>
                  {balance.leaveType
                    ? LeaveTypeDisplay[balance.leaveType as LeaveType]
                    : 'إجازة'}
                </span>
                <Badge variant='outline'>{balance.organizationalUnitName}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='grid grid-cols-2 gap-2 text-sm'>
                <div className='text-gray-600'>الرصيد الكلي:</div>
                <div className='font-semibold'>
                  {formatBalance(balance.totalBalance)} يوم
                </div>

                <div className='text-gray-600'>الرصيد الشهري:</div>
                <div className='font-semibold'>
                  {formatBalance(balance.monthlyBalance)} يوم
                </div>

                <div className='text-gray-600'>المستخدم:</div>
                <div className='font-semibold text-orange-600'>
                  {formatBalance(balance.usedBalance)} يوم
                </div>

                <div className='text-gray-600'>المستخدم شهرياً:</div>
                <div className='font-semibold text-orange-600'>
                  {formatBalance(balance.monthlyUsedBalance)} يوم
                </div>

                <div className='text-gray-600'>المتاح:</div>
                <div className='font-semibold text-green-600'>
                  {formatBalance(balance.availableBalance)} يوم
                </div>
              </div>

              <div className='border-t pt-2 text-xs text-gray-500'>
                <div>
                  آخر إعادة تعيين شهري:{' '}
                  {formatDate(balance.lastMonthlyResetDate)}
                </div>
                <div>
                  آخر مزامنة: {formatDate(balance.lastSyncDate)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

