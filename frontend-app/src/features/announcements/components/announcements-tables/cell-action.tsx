'use client';

import { useState } from 'react';
import { MoreHorizontal, FileEdit, Eye, Trash } from 'lucide-react';
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
import { IAnnouncementList } from '../../types/announcements';
import { announcementsService } from '../../api/announcements.service';

import { Spinner } from '@/components/spinner';
import { AlertModal } from '@/components/modal/alert-modal';

interface CellActionProps {
  data: IAnnouncementList;
}

export function CellAction({ data }: CellActionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);

  const onConfirmDelete = async () => {
    try {
      setLoading(true);
      const response = await announcementsService.deleteAnnouncement(data.id);

      if (response?.succeeded) {
        toast.success('تم حذف الإعلان بنجاح!');
        router.refresh();
      } else {
        toast.error('لم يتم حذف الإعلان!');
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
            onClick={() => router.push(`/announcements/${data.id}`)}
          >
            <Eye className='ml-2 h-4 w-4' /> عرض
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/announcements/${data.id}/edit`)}
          >
            <FileEdit className='ml-2 h-4 w-4' /> تعديل
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setOpenAlert(true)}
            disabled={loading}
          >
            <Trash className='ml-2 h-4 w-4' /> حذف
            {loading && <Spinner className='ml-2 h-4 w-4' />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
