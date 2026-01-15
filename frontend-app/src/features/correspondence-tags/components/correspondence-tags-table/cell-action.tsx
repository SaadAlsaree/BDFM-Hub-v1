'use client';

import { useState } from 'react';
import {
  Copy,
  MoreHorizontal,
  Eye,
  Star,
  MailOpen,
  Trash,
  Archive,
  Edit
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { TaggedCorrespondenceItem } from '../../types/tags';
import { AlertModal } from '@/components/modal/alert-modal';

interface CellActionProps {
  data: TaggedCorrespondenceItem;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success('تم نسخ المعرف إلى الحافظة.');
  };

  const onEdit = () => {
    router.push(`/correspondence/mail-form/${data.correspondenceId}`);
  };

  const onToggleStar = async () => {
    setLoading(true);
    try {
      // TODO: Implement star/unstar functionality
      // await correspondenceService.toggleStar(data.correspondenceId);
      toast.success(
        data.userCorrespondenceInteraction?.isStarred
          ? 'تم إلغاء التمييز بالنجمة'
          : 'تم التمييز بالنجمة'
      );
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث التمييز بالنجمة');
    } finally {
      setLoading(false);
    }
  };

  const onMarkAsRead = async () => {
    setLoading(true);
    try {
      // TODO: Implement mark as read functionality
      // await correspondenceService.markAsRead(data.correspondenceId);
      toast.success('تم تمييز الكتاب كمقروء');
    } catch (error) {
      toast.error('حدث خطأ أثناء تمييز الكتاب كمقروء');
    } finally {
      setLoading(false);
    }
  };

  const onMoveToTrash = async () => {
    setLoading(true);
    try {
      // TODO: Implement move to trash functionality
      // await correspondenceService.moveToTrash(data.correspondenceId);
      toast.success('تم نقل الكتاب إلى سلة المهملات');
      setOpen(false);
    } catch (error) {
      toast.error('حدث خطأ أثناء نقل الكتاب إلى سلة المهملات');
    } finally {
      setLoading(false);
    }
  };

  const onArchive = async () => {
    setLoading(true);
    try {
      // TODO: Implement archive functionality
      // await correspondenceService.archive(data.correspondenceId);
      toast.success('تم أرشفة الكتاب');
    } catch (error) {
      toast.error('حدث خطأ أثناء أرشفة الكتاب');
    } finally {
      setLoading(false);
    }
  };

  const isRead = data.userCorrespondenceInteraction?.isRead;
  const isStarred = data.userCorrespondenceInteraction?.isStarred;
  const isInTrash = data.userCorrespondenceInteraction?.isInTrash;

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onMoveToTrash}
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

          <DropdownMenuItem onClick={() => onCopy(data.correspondenceId || '')}>
            <Copy className='mr-2 h-4 w-4' />
            نسخ معرف الكتاب
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onEdit}>
            <Edit className='mr-2 h-4 w-4' />
            تعديل
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={onToggleStar} disabled={loading}>
            <Star
              className={`mr-2 h-4 w-4 ${isStarred ? 'fill-current text-yellow-500' : ''}`}
            />
            {isStarred ? 'إلغاء التمييز بالنجمة' : 'تمييز بالنجمة'}
          </DropdownMenuItem>

          {!isRead && (
            <DropdownMenuItem onClick={onMarkAsRead} disabled={loading}>
              <MailOpen className='mr-2 h-4 w-4' />
              تمييز كمقروءة
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={onArchive} disabled={loading}>
            <Archive className='mr-2 h-4 w-4' />
            أرشفة
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {!isInTrash && (
            <DropdownMenuItem
              onClick={() => setOpen(true)}
              className='text-red-600'
            >
              <Trash className='mr-2 h-4 w-4' />
              نقل إلى سلة المهملات
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
