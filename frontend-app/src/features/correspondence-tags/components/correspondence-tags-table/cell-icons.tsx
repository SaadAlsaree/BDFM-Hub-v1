import { Mail, MailOpen, Star, Clock, BellRing, BellOff } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { InboxList } from '@/features/correspondence/types/register-incoming-external-mail';
import { TaggedCorrespondenceItem } from '../../types/tags';
import { Button } from '@/components/ui/button';
import { useAuthApi } from '@/hooks/use-auth-api';
import { correspondenceService } from '@/features/correspondence/api/correspondence.service';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface CellIconsProps {
  data: InboxList | TaggedCorrespondenceItem;
}

const CellIcons = ({ data }: CellIconsProps) => {
  const isRead = data.userCorrespondenceInteraction?.isRead;
  const isStarred = data.userCorrespondenceInteraction?.isStarred;
  const isPostponed = data.userCorrespondenceInteraction?.isPostponed;
  const isInTrash = data.userCorrespondenceInteraction?.isInTrash;
  const isReceiveNotification =
    data.userCorrespondenceInteraction?.receiveNotifications;
  const isOverdue =
    data.dueDate &&
    new Date(data.dueDate) < new Date() &&
    (data.status == 1 || data.status == 2);
  const { authApiCall } = useAuthApi();
  const router = useRouter();

  // TODO: Implement isStarred
  const onIsStarred = async () => {
    if (!data.correspondenceId) {
      toast.error('Invalid correspondence ID');
      return;
    }
    const response = await authApiCall(() =>
      correspondenceService.isStarred(!isStarred, data.correspondenceId!)
    );

    if (response?.succeeded) {
      router.refresh();
      toast.success('تم تحديث حالة متابعة الكتابة بنجاح');
    } else {
      toast.error('فشل في تحديث حالة متابعة الكتابة');
    }
  };
  // TODO: Implement receiveNotification
  const onReceiveNotification = async () => {
    if (!data.correspondenceId) {
      toast.error('Invalid correspondence ID');
      return;
    }

    const response = await authApiCall(() =>
      correspondenceService.receiveNotification(
        !isReceiveNotification,
        data.correspondenceId!
      )
    );

    if (response?.succeeded) {
      router.refresh();
      toast.success('تم تحديث حالة الإشعارات بنجاح');
    } else {
      toast.error('فشل في تحديث حالة الإشعارات');
    }
  };

  return (
    <div className='flex items-center gap-1'>
      {/* Mail status icon */}
      <div className='relative'>
        <Button
          variant='ghost'
          size='icon'
          title={isRead ? 'Mark as unread' : 'Mark as read'}
        >
          {!isRead ? (
            <>
              <Mail className='text-primary h-4 w-4' />
              <Badge
                variant='default'
                className='absolute -top-1 -right-1 h-2 w-2 rounded-full p-0'
              />
            </>
          ) : (
            <MailOpen className='h-4 w-4 text-zinc-500 dark:text-zinc-400' />
          )}
        </Button>
      </div>

      {/* Star icon */}
      <Button
        variant='ghost'
        size='icon'
        onClick={onIsStarred}
        className='m-0 p-0'
      >
        <Star
          className={`h-4 w-4 ${
            data.userCorrespondenceInteraction?.isStarred
              ? 'fill-current text-yellow-500'
              : 'text-zinc-500 hover:text-yellow-500 dark:text-zinc-400'
          }`}
        />
      </Button>

      {/* Due date indicator */}
      {/* <Button
        variant='ghost'
        size='icon'
        title={
          data.dueDate
            ? `Starred: ${data.userCorrespondenceInteraction?.isStarred}`
            : ''
        }
      >
        <Clock
          className={`h-4 w-4 ${
            isOverdue ? 'text-orange-500' : 'text-zinc-500 dark:text-zinc-400'
          }`}
        />
      </Button> */}

      {/* Notes/Details */}
      <Button
        variant='ghost'
        size='icon'
        onClick={onReceiveNotification}
        title='View notes and details'
      >
        {isReceiveNotification ? (
          <BellRing className='h-4 w-4 text-zinc-500 dark:text-zinc-400' />
        ) : (
          <BellRing className='text-primary h-4 w-4' />
        )}
      </Button>
    </div>
  );
};

export default CellIcons;
