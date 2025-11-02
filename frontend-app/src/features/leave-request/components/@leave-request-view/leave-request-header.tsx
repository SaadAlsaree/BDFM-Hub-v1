'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import { Badge } from '@/components/ui/badge';
import { LeaveRequest, LeaveRequestStatus } from '../../types/leave-request';
import moment from 'moment';
import { User, Building, Calendar, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  getLeaveRequestStatusText,
  statusLabels,
  formatDate
} from '../../utils/leave-request';
import { LeaveTypeDisplay, LeaveType } from '../../types/leave-request';
import { LeaveWorkflowStepFormDialog } from '@/features/leave-workflow-step/components/leave-workflow-step-form-dialog';
import LeaveWorkflowDialog from '../../components/leave-workflow-dialog';
import LeaveRequestStatusDialog from '../../components/leave-request-status-dialog';

interface LeaveRequestHeaderProps {
  data: LeaveRequest;
  loading?: boolean;
}

export function LeaveRequestHeader({ data, loading }: LeaveRequestHeaderProps) {
  const router = useRouter();

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-start justify-between'>
        <div className='space-y-1'>
          <Heading
            title={`طلب إجازة ${data.requestNumber || ''}`}
            description={`الموظف: ${data.employeeName || data.employeeId || 'غير محدد'} | تاريخ الإنشاء: ${moment(data.createAt).format('YYYY-MM-DD')}`}
          />
          <div className='flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300'>
            <Building className='h-4 w-4' />
            <span>{data.organizationalUnitName || ''}</span>
            {data.createdByUserName && (
              <>
                <Separator orientation='vertical' className='h-4' />
                <User className='h-4 w-4' />
                <span className='space-y-4'>
                  منشئ بواسطة: {data.createdByUserName}
                </span>
              </>
            )}
          </div>
        </div>

        <div className='flex gap-2'>
          {data.id && (
            <>
              <LeaveRequestStatusDialog
                leaveRequestId={data.id}
                currentStatus={data.status}
              >
                <Button variant='outline'>تحديث الحالة</Button>
              </LeaveRequestStatusDialog>
              <LeaveWorkflowDialog leaveRequestId={data.id}>
                <Button variant='default'>إنشاء مسار</Button>
              </LeaveWorkflowDialog>
              <LeaveWorkflowStepFormDialog
                leaveRequestId={data.id}
                trigger={
                  <Button variant='default'>
                    إنشاء إجراء
                  </Button>
                }
              />
            </>
          )}
          {(data.status === LeaveRequestStatus.Draft ||
            data.status === LeaveRequestStatus.PendingApproval) && (
            <Button
              onClick={() => router.push(`/leave-request/${data.id}/edit`)}
            >
              تعديل
            </Button>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className='flex flex-wrap items-center gap-3 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900'>
        <div className='flex items-center gap-2'>
          <Clock className='h-4 w-4 text-gray-500' />
          <Badge
            variant={
              statusLabels[data.status as LeaveRequestStatus]?.variant ||
              'outline'
            }
          >
            {getLeaveRequestStatusText(data.status || 0)}
          </Badge>
        </div>

        <Separator orientation='vertical' className='h-6' />

        <div className='flex items-center gap-2'>
          <Calendar className='h-4 w-4 text-gray-500' />
          <span className='text-sm font-medium'>نوع الإجازة:</span>
          <Badge variant='outline'>
            {data.leaveType
              ? LeaveTypeDisplay[data.leaveType as LeaveType]
              : 'غير محدد'}
          </Badge>
        </div>

        <Separator orientation='vertical' className='h-6' />

        <div className='flex items-center gap-2'>
          <Calendar className='h-4 w-4 text-gray-500' />
          <span className='text-sm font-medium'>من:</span>
          <span className='text-sm'>{formatDate(data.startDate)}</span>
        </div>

        <Separator orientation='vertical' className='h-6' />

        <div className='flex items-center gap-2'>
          <Calendar className='h-4 w-4 text-gray-500' />
          <span className='text-sm font-medium'>إلى:</span>
          <span className='text-sm'>{formatDate(data.endDate)}</span>
        </div>

        <Separator orientation='vertical' className='h-6' />

        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium'>عدد الأيام:</span>
          <Badge variant='secondary'>
            {data.requestedDays || 0} يوم
          </Badge>
        </div>
      </div>
    </div>
  );
}

