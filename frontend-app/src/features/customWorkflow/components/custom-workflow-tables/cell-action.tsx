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
  IconEye,
  IconPlus
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CustomWorkflowList } from '@/features/customWorkflow/types/customWorkflow';
import { Separator } from '@/components/ui/separator';
import { customWorkflowService } from '@/features/customWorkflow/api/customWorkflow.service';
import { toast } from 'sonner';
import { useAuthApi } from '@/hooks/use-auth-api';
interface CellActionProps {
  data: CustomWorkflowList;
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
        customWorkflowService.deleteCustomWorkflow(data.id!)
      );
      if (response?.succeeded) {
        toast.success('تم حذف سير العمل بنجاح!');
        router.refresh();
      } else {
        toast.error('فشل في حذف سير العمل!');
      }
    } catch (error) {
      console.error({ error });
      toast.error('حدث خطأ أثناء حذف سير العمل!');
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
            onClick={() => router.push(`/custom-workflow/${data.id}`)}
          >
            <div className='flex w-full items-center justify-between gap-2'>
              عرض
              <IconEye className='mr-2 h-4 w-4' />
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/custom-workflow/${data.id}/edit`)}
          >
            <div className='flex w-full items-center justify-between gap-2'>
              تعديل
              <IconEdit className='mr-2 h-4 w-4' />
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/custom-workflow/${data.id}/steps`)}
          >
            <div className='flex w-full items-center justify-between gap-2'>
              إدارة الخطوات
              <IconPlus className='mr-2 h-4 w-4' />
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
