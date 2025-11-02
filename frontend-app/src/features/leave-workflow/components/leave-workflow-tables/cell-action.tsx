'use client';

import { useState } from 'react';
import { Copy, MoreHorizontal, Eye, Trash } from 'lucide-react';
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
import { LeaveWorkflowList } from '@/features/leave-workflow/types/leave-workflow';
import { leaveWorkflowService } from '@/features/leave-workflow/api/leave-workflow.service';
import { useAuthApi } from '@/hooks/use-auth-api';
import { AlertModal } from '@/components/modal/alert-modal';

interface CellActionProps {
  data: LeaveWorkflowList;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { authApiCall } = useAuthApi();

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success('تم نسخ المعرف');
  };

  const onDelete = async () => {
    try {
      setLoading(true);

      const response = await authApiCall(() =>
        leaveWorkflowService.deleteLeaveWorkflow(data.id!)
      );

      if (response?.succeeded) {
        router.refresh();
        toast.success('تم حذف مسار العمل بنجاح');
      } else {
        toast.error('فشل حذف مسار العمل');
      }
    } catch (error) {
      toast.error('حدث خطأ');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
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
            onClick={() => router.push(`/leave-workflow/${data.id}`)}
          >
            <Eye className='mr-2 h-4 w-4' />
            عرض التفاصيل
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/leave-workflow/${data.id}/edit`)}
          >
            <Eye className='mr-2 h-4 w-4' />
            تعديل
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className='mr-2 h-4 w-4' />
            حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

