'use client';

import { useState } from 'react';
import {
  Copy,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Ban
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  LeaveRequestList,
  LeaveRequestStatus
} from '@/features/leave-request/types/leave-request';
import { leaveRequestService } from '@/features/leave-request/api/leave-request.service';
import { useAuthApi } from '@/hooks/use-auth-api';

interface CellActionProps {
  data: LeaveRequestList;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { authApiCall } = useAuthApi();

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success('تم نسخ المعرف');
  };

  const canEdit =
    data.status === LeaveRequestStatus.Draft ||
    data.status === LeaveRequestStatus.PendingApproval;

  const canCancel = data.status === LeaveRequestStatus.Approved;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <span className='sr-only'>فتح القائمة</span>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onCopy(data.id!)}>
          <Copy className='mr-2 h-4 w-4' />
          نسخ المعرف
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push(`/leave-request/${data.id}`)}
        >
          <Eye className='mr-2 h-4 w-4' />
          عرض التفاصيل
        </DropdownMenuItem>
        {canEdit && (
          <DropdownMenuItem
            onClick={() => router.push(`/leave-request/${data.id}/edit`)}
          >
            <Eye className='mr-2 h-4 w-4' />
            تعديل
          </DropdownMenuItem>
        )}
        {data.status === LeaveRequestStatus.PendingApproval && (
          <>
            <DropdownMenuItem
              onClick={() => {
                // Handle approve action
                router.push(`/leave-request/${data.id}/approve`);
              }}
            >
              <CheckCircle className='mr-2 h-4 w-4' />
              الموافقة
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                // Handle reject action
                router.push(`/leave-request/${data.id}/reject`);
              }}
            >
              <XCircle className='mr-2 h-4 w-4' />
              الرفض
            </DropdownMenuItem>
          </>
        )}
        {canCancel && (
          <DropdownMenuItem
            onClick={() => {
              // Handle cancel action
              router.push(`/leave-request/${data.id}/cancel`);
            }}
          >
            <Ban className='mr-2 h-4 w-4' />
            إلغاء
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
