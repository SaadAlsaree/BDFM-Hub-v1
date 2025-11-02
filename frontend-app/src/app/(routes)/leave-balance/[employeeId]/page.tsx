import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { leaveBalanceService } from '@/features/leave-balance/api/leave-balance.service';
import LeaveBalanceDisplay from '@/features/leave-balance/components/leave-balance-display';
import { LeaveBalance } from '@/features/leave-balance/types/leave-balance';
import React, { Suspense } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { IconRefresh } from '@tabler/icons-react';

export const metadata = {
  title: 'رصيد الإجازات',
  description: 'عرض رصيد الإجازات للموظف'
};

type PageProps = {
  params: Promise<{ employeeId: string }>;
  searchParams: Promise<{ leaveType?: string }>;
};

const page = async (props: PageProps) => {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const employeeId = params.employeeId;
  const leaveType = searchParams.leaveType
    ? parseInt(searchParams.leaveType)
    : undefined;

  const data = await leaveBalanceService.getLeaveBalanceByEmployeeId(
    employeeId,
    leaveType
  );
  const balances = (data?.data || []) as LeaveBalance[];

  const employeeName = balances[0]?.employeeName;
  const employeeNumber = balances[0]?.employeeNumber;

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title={`رصيد الإجازات`}
            description={`الموظف: ${employeeName || employeeId} ${
              employeeNumber ? `(${employeeNumber})` : ''
            }`}
          />
          <Button variant='outline'>
            <IconRefresh className='mr-2 h-4 w-4' />
            مزامنة
          </Button>
        </div>
        <Separator />
        <Suspense fallback={<FormCardSkeleton />}>
          <LeaveBalanceDisplay
            balances={balances}
            employeeId={employeeId}
            employeeName={employeeName}
          />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default page;

