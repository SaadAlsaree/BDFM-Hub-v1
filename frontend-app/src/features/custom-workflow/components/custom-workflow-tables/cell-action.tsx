'use client';

import { useState } from 'react';
import {
  MoreHorizontal,
  FileEdit,
  Eye,
  Trash,
  Check,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CustomWorkflowItem } from '@/features/custom-workflow/types/custom-workflow';
import { customWorkflowService } from '@/features/custom-workflow/api/custom-workflow.service';
import { Spinner } from '@/components/spinner';
import { AlertModal } from '@/components/modal/alert-modal';

interface CellActionProps {
  data: CustomWorkflowItem;
}

export function CellAction({ data }: CellActionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);

  const onToggleEnable = async (enable: boolean) => {
    try {
      setLoading(true);
      // The updateCustomWorkflow endpoint expects the upsert dto - reuse existing fields from the list item
      const payload = {
        id: data.id,
        workflowName: data.workflowName,
        triggeringUnitId: data.triggeringUnitId,
        triggeringCorrespondenceType: data.triggeringCorrespondenceType,
        description: data.description,
        isEnabled: enable
      } as any;

      const response =
        await customWorkflowService.updateCustomWorkflow(payload);
      if (response?.succeeded) {
        toast.success(enable ? 'تم تفعيل سير العمل' : 'تم تعطيل سير العمل');
        router.refresh();
      } else {
        toast.error('لم يتم تحديث حالة سير العمل');
      }
    } catch (error) {
      toast.error('حدث خطأ عند تحديث الحالة');
    } finally {
      setLoading(false);
    }
  };

  const onConfirmDelete = async () => {
    try {
      setLoading(true);
      const response = await customWorkflowService.deleteCustomWorkflow(
        data.id
      );
      if (response?.succeeded) {
        toast.success('تم حذف سير العمل بنجاح!');
        router.refresh();
      } else {
        toast.error('فشل في حذف سير العمل!');
      }
      setOpenAlert(false);
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={openAlert}
        onClose={() => setOpenAlert(false)}
        onConfirm={onConfirmDelete}
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
          <DropdownMenuLabel>العمليات</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => router.push(`/custom-workflow/${data.id}`)}
          >
            <Eye className='ml-2 h-4 w-4' /> عرض
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/custom-workflow/${data.id}/edit`)}
          >
            <FileEdit className='ml-2 h-4 w-4' /> تعديل
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/custom-workflow/${data.id}/steps`)}
          >
            <Plus className='ml-2 h-4 w-4' /> إدارة الخطوات
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setOpenAlert(true)}
            disabled={loading}
          >
            <Trash className='ml-2 h-4 w-4' /> حذف
            {loading && <Spinner className='ml-2 h-4 w-4' />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onToggleEnable(!data.isEnabled)}
            disabled={loading}
          >
            <Check className='ml-2 h-4 w-4' />{' '}
            {data.isEnabled ? 'تعطيل' : 'تفعيل'}
            {loading && <Spinner className='ml-2 h-4 w-4' />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
