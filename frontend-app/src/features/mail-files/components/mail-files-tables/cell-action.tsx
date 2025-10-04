'use client';

import { useState } from 'react';
import { MoreHorizontal, FileEdit, Eye, Trash, Check } from 'lucide-react';
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
import { IMailFileList } from '@/features/mail-files/types/mail-files';
import { mailFilesService } from '@/features/mail-files/api/mail-files.service';
import {
  MailFileStatus,
  isMailFileActive
} from '@/features/mail-files/utils/mail-files';
import { Spinner } from '@/components/spinner';
import { AlertModal } from '@/components/modal/alert-modal';

interface CellActionProps {
  data: IMailFileList;
}

export function CellAction({ data }: CellActionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);

  const onUpdateStatus = async (id: string | undefined, status: number) => {
    if (!id) {
      toast.error('معرّف الملف غير موجود!');
      return;
    }
    try {
      setLoading(true);
      const response = await mailFilesService.updateMailFileStatus(id, status);

      if (response?.succeeded) {
        toast.success('تم تغيير حالة الملف بنجاح!');
        router.refresh();
      } else {
        toast.error('لم يتم تغيير حالة الملف!');
      }
    } catch (error) {
      // Error handled with toast notification
      toast.error('حدث خطأ!');
    } finally {
      setLoading(false);
    }
  };

  const onConfirmDelete = async () => {
    try {
      setLoading(true);
      await onUpdateStatus(data.id, MailFileStatus.Deleted);
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
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">فتح القائمة</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>العمليات</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => router.push(`/mail-files/${data.id}`)}
          >
            <Eye className="ml-2 h-4 w-4" /> عرض
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/mail-files/${data.id}/edit`)}
          >
            <FileEdit className="ml-2 h-4 w-4" /> تعديل
          </DropdownMenuItem>
          {data.status !== MailFileStatus.Deleted && (
            <DropdownMenuItem
              onClick={() => setOpenAlert(true)}
              disabled={loading}
            >
              <Trash className="ml-2 h-4 w-4" /> حذف
              {loading && <Spinner className="ml-2 h-4 w-4" />}
            </DropdownMenuItem>
          )}
          {data.status === MailFileStatus.Inactive && (
            <DropdownMenuItem
              onClick={() => onUpdateStatus(data.id, MailFileStatus.Active)}
              disabled={loading}
            >
              <Check className="ml-2 h-4 w-4" /> تفعيل
              {loading && <Spinner className="ml-2 h-4 w-4" />}
            </DropdownMenuItem>
          )}
          {isMailFileActive(data.status || MailFileStatus.Active) && (
            <DropdownMenuItem
              onClick={() => onUpdateStatus(data.id, MailFileStatus.Inactive)}
              disabled={loading}
            >
              <Trash className="ml-2 h-4 w-4" /> تعطيل
              {loading && <Spinner className="ml-2 h-4 w-4" />}
            </DropdownMenuItem>
          )}
          {data.status !== MailFileStatus.Archived && (
            <DropdownMenuItem
              onClick={() => onUpdateStatus(data.id, MailFileStatus.Archived)}
              disabled={loading}
            >
              <Check className="ml-2 h-4 w-4" /> أرشفة
              {loading && <Spinner className="ml-2 h-4 w-4" />}
            </DropdownMenuItem>
          )}
          {data.status !== MailFileStatus.Completed && (
            <DropdownMenuItem
              onClick={() => onUpdateStatus(data.id, MailFileStatus.Completed)}
              disabled={loading}
            >
              <Check className="ml-2 h-4 w-4" /> إنهاء
              {loading && <Spinner className="ml-2 h-4 w-4" />}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}