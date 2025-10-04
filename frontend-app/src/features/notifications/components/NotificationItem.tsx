'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Mail,
  MailOpen,
  Workflow,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { NotificationItemProps, NotificationType } from '@/types/notifications';
import { useRouter } from 'next/navigation';

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.NewMail:
      return <Mail className='h-4 w-4 text-blue-500' />;
    case NotificationType.StatusUpdate:
      return <CheckCircle className='h-4 w-4 text-green-500' />;
    case NotificationType.WorkflowAssignment:
      return <Workflow className='h-4 w-4 text-purple-500' />;
    case NotificationType.SystemAlert:
      return <AlertCircle className='h-4 w-4 text-orange-500' />;
    default:
      return <AlertCircle className='h-4 w-4 text-gray-500' />;
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case NotificationType.NewMail:
      return 'border-l-blue-500';
    case NotificationType.StatusUpdate:
      return 'border-l-green-500';
    case NotificationType.WorkflowAssignment:
      return 'border-l-purple-500';
    case NotificationType.SystemAlert:
      return 'border-l-orange-500';
    default:
      return 'border-l-gray-500';
  }
};

export function NotificationItem({
  notification,
  onMarkAsRead,
  onClick,
  compact = false
}: NotificationItemProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(notification);
    }

    // Navigate to correspondence if link is available
    if (notification.linkToCorrespondenceId) {
      router.push(
        `/correspondence/view/${notification.linkToCorrespondenceId}`
      );
    } else if (notification.linkToWorkflowStepId) {
      router.push(`/workflow/${notification.linkToWorkflowStepId}`);
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkAsRead && !notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  if (compact) {
    return (
      <div
        className={cn(
          'hover:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-lg border-l-2 p-3 transition-colors',
          getNotificationColor(notification.notificationType),
          !notification.isRead && 'bg-muted/30'
        )}
        onClick={handleClick}
      >
        <div className='flex-shrink-0 pt-0.5'>
          {getNotificationIcon(notification.notificationType)}
        </div>

        <div className='min-w-0 flex-1'>
          <div className='flex items-start justify-between gap-2'>
            <div className='min-w-0 flex-1'>
              <p
                className={cn(
                  'text-sm leading-tight',
                  !notification.isRead && 'font-medium'
                )}
              >
                {notification.message}
              </p>

              {notification.correspondenceSubject && (
                <p className='text-muted-foreground mt-1 text-xs'>
                  {notification.correspondenceSubject}
                </p>
              )}
            </div>

            <div className='flex flex-shrink-0 items-center gap-1'>
              {!notification.isRead && (
                <div className='h-2 w-2 rounded-full bg-blue-500' />
              )}

              <span className='text-muted-foreground text-xs'>
                {formatDate(notification.createAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        'hover:bg-muted/50 cursor-pointer transition-colors',
        !notification.isRead && 'border-l-4',
        getNotificationColor(notification.notificationType)
      )}
    >
      <CardContent className='p-4' onClick={handleClick}>
        <div className='flex items-start gap-4'>
          <div className='flex-shrink-0 pt-1'>
            {getNotificationIcon(notification.notificationType)}
          </div>

          <div className='min-w-0 flex-1'>
            <div className='flex items-start justify-between gap-4'>
              <div className='min-w-0 flex-1'>
                <div className='mb-1 flex items-center gap-2'>
                  <Badge variant='secondary' className='text-xs'>
                    {notification.notificationTypeName}
                  </Badge>

                  {!notification.isRead && (
                    <Badge variant='default' className='text-xs'>
                      جديد
                    </Badge>
                  )}
                </div>

                <p
                  className={cn(
                    'text-sm leading-relaxed',
                    !notification.isRead && 'font-medium'
                  )}
                >
                  {notification.message}
                </p>

                {notification.correspondenceSubject && (
                  <div className='text-muted-foreground mt-2 flex items-center gap-2 text-xs'>
                    <Mail className='h-3 w-3' />
                    <span>{notification.correspondenceSubject}</span>
                  </div>
                )}

                {notification.correspondenceMailNum && (
                  <div className='text-muted-foreground mt-1 flex items-center gap-2 text-xs'>
                    <span>
                      رقم الكتاب: {notification.correspondenceMailNum}
                    </span>
                  </div>
                )}
              </div>

              <div className='flex flex-shrink-0 flex-col items-end gap-2'>
                <div className='text-muted-foreground flex items-center gap-1 text-xs'>
                  <Clock className='h-3 w-3' />
                  <span>{formatDate(notification.createAt)}</span>
                </div>

                {(notification.linkToCorrespondenceId ||
                  notification.linkToWorkflowStepId) && (
                  <ExternalLink className='text-muted-foreground h-3 w-3' />
                )}
              </div>
            </div>

            {!notification.isRead && onMarkAsRead && (
              <div className='mt-3 flex justify-end'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleMarkAsRead}
                  className='h-8 text-xs'
                >
                  <MailOpen className='mr-1 h-3 w-3' />
                  تحديث حالة الإشعار
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
