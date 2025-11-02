'use client';

import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconEye
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LeaveWorkflowStepTemplate } from '@/features/leave-workflow-step-template/types/leave-workflow-step-template';
import { Separator } from '@/components/ui/separator';
import { leaveWorkflowStepTemplateService } from '@/features/leave-workflow-step-template/api/leave-workflow-step-template.service';
import { toast } from 'sonner';
import { useAuthApi } from '@/hooks/use-auth-api';

interface CellActionProps {
  data: LeaveWorkflowStepTemplate;
}

export function CellAction({ data }: CellActionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { authApiCall } = useAuthApi();

  const onDelete = async () => {
    try {
      setLoading(true);
      const response = await authApiCall(() =>
        leaveWorkflowStepTemplateService.deleteLeaveWorkflowStepTemplate(
          data.id!
        )
      );
      if (response?.succeeded) {
        toast.success('تم حذف قالب الخطوة بنجاح!');
        router.refresh();
      } else {
        toast.error('فشل في حذف قالب الخطوة!');
      }
    } catch (error) {
      console.error({ error });
      toast.error('حدث خطأ أثناء حذف قالب الخطوة!');
    } finally {
      setOpen(false);
      setLoading(false);
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
            <span className='sr-only'>Open menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>العمليات</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() =>
              router.push(
                `/leave-workflow/${data.workflowId}/step-template/${data.id}/edit`
              )
            }
          >
            <div className='flex w-full items-center justify-between gap-2'>
              تعديل
              <IconEdit className='mr-2 h-4 w-4' />
            </div>
          </DropdownMenuItem>
          <Separator />
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <div className='flex w-full items-center justify-between gap-2'>
              حذف
              <IconTrash className='mr-2 h-4 w-4 text-red-500' />
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

