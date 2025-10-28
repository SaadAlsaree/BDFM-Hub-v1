'use client';

import React, { useState } from 'react';
import { Bell, Wifi, WifiOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthApi } from '@/hooks/use-auth-api';
import { useSignalR } from '@/hooks/useSignalR';
import { useNotificationContext } from '@/contexts/NotificationProvider';
import { notificationsApi } from '@/features/notifications/api/notifications-api';
import { NotificationItem } from './NotificationItem';
import { NotificationEmpty } from './NotificationEmpty';
import { NotificationSkeleton } from './NotificationSkeleton';
import { cn } from '@/lib/utils';
import { NotificationBellProps } from '@/types/notifications';
import { toast } from 'sonner';
import Link from 'next/link';

export function NotificationBell({ className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { authApiCall } = useAuthApi();
  const { isConnected } = useSignalR();
  const { soundEnabled, toggleSound } = useNotificationContext();

  // Get recent notifications for dropdown (limit to 8) - simplified version without event listeners
  const {
    data: notificationsResponse,
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['notifications', { page: 1, pageSize: 8 }],
    queryFn: async () => {
      return await authApiCall(
        async () =>
          await notificationsApi.getUserNotificationsClient({
            page: 1,
            pageSize: 8
          })
      );
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: !isConnected ? 60 * 1000 : false, // Only poll when SignalR is disconnected
    refetchOnWindowFocus: !isConnected,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false;
      }
      return failureCount < 3;
    }
  });

  // Get unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: async () => {
      return await authApiCall(
        async () => await notificationsApi.getUnreadCount()
      );
    },
    staleTime: 30 * 1000,
    refetchInterval: !isConnected ? 60 * 1000 : false,
    refetchOnWindowFocus: !isConnected,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false;
      }
      return failureCount < 3;
    }
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return await authApiCall(
        async () => await notificationsApi.markAsRead(id)
      );
    },
    onSuccess: (result, id) => {
      if (result?.succeeded) {
        // Optimistically update the cache
        queryClient.setQueryData(
          ['notifications', { page: 1, pageSize: 8 }],
          (oldData: any) => {
            if (!oldData?.data?.items) return oldData;

            return {
              ...oldData,
              data: {
                ...oldData.data,
                items: oldData.data.items.map((notification: any) =>
                  notification.id === id
                    ? { ...notification, isRead: true }
                    : notification
                )
              }
            };
          }
        );

        // Update unread count
        queryClient.setQueryData(
          ['notifications', 'unreadCount'],
          (prev: number) => Math.max(0, (prev || 0) - 1)
        );

        toast.success('Notification marked as read');
      } else {
        toast.error('Failed to mark notification as read');
      }
    },
    onError: (error) => {
      // console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read', {
        description: error.message
      });
    }
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return await authApiCall(
        async () => await notificationsApi.markAllAsRead()
      );
    },
    onSuccess: (result) => {
      if (result?.succeeded) {
        // Optimistically update the cache
        queryClient.setQueryData(
          ['notifications', { page: 1, pageSize: 8 }],
          (oldData: any) => {
            if (!oldData?.data?.items) return oldData;

            return {
              ...oldData,
              data: {
                ...oldData.data,
                items: oldData.data.items.map((notification: any) => ({
                  ...notification,
                  isRead: true
                }))
              }
            };
          }
        );

        // Reset unread count
        queryClient.setQueryData(['notifications', 'unreadCount'], 0);

        toast.success('All notifications marked as read');
      } else {
        toast.error('Failed to mark all notifications as read');
      }
    },
    onError: (error) => {
      // console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read', {
        description: error.message
      });
    }
  });

  const notifications = notificationsResponse?.data?.items || [];

  const handleNotificationClick = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
    } catch (error) {
      // console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);
  };

  // Log for debugging
  // console.log(
  //   '🔔 [NotificationBell] Render - Connected:',
  //   isConnected,
  //   'Unread:',
  //   unreadCount,
  //   'Notifications:',
  //   notifications.length
  // );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className={cn('relative h-9 w-9 p-0', className)}
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <Badge
              className='absolute -top-1 -right-1 h-5 min-w-[1.25rem] rounded-full px-1 text-xs font-medium'
              variant='destructive'
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}

          {/* Connection status indicator */}
        </Button>
      </PopoverTrigger>

      <PopoverContent className='w-80 p-0' align='end' sideOffset={8}>
        <div className='flex items-center justify-between border-b px-4 py-3'>
          <h3 className='font-semibold'>الإشعارات</h3>
          <div className='flex items-center gap-2'>
            {/* Sound toggle button */}
            <Button
              variant='ghost'
              size='sm'
              className='h-auto p-1'
              onClick={toggleSound}
              title={soundEnabled ? 'إيقاف الصوت' : 'تفعيل الصوت'}
            >
              {soundEnabled ? (
                <Volume2 className='h-4 w-4' />
              ) : (
                <VolumeX className='h-4 w-4' />
              )}
            </Button>

            {unreadCount > 0 && (
              <Button
                variant='ghost'
                size='sm'
                className='h-auto p-1 text-xs'
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
              >
                {markAllAsReadMutation.isPending
                  ? 'جاري التحديث...'
                  : 'تحديث جميع الإشعارات'}
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className='h-[200px]'>
          <div className='p-2'>
            {loading ? (
              <div className='gap-2 space-y-2'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <NotificationSkeleton key={i} compact />
                ))}
              </div>
            ) : error ? (
              <div className='text-muted-foreground p-4 text-center text-sm'>
                <p>فشل تحميل الإشعارات</p>
                <p className='text-xs'>{error.message}</p>
              </div>
            ) : notifications.length === 0 ? (
              <NotificationEmpty compact />
            ) : (
              <div className='space-y-1'>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    compact
                    onClick={() => handleNotificationClick(notification.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <Separator />
            <div className='p-2'>
              <Link href='/notifications' onClick={handleViewAll}>
                <Button
                  variant='ghost'
                  className='w-full justify-center text-sm'
                >
                  عرض جميع الإشعارات
                </Button>
              </Link>
            </div>
          </>
        )}

        {/* Connection status footer */}
        <div className='bg-muted/30 border-t px-3 py-2'>
          <div className='text-muted-foreground flex items-center justify-between text-xs'>
            <span>
              {isConnected
                ? 'التحديثات الحقيقية مفعلة'
                : 'يتم التحديث كل 30 ثانية'}
            </span>
            <div className='flex items-center gap-1'>
              {isConnected ? (
                <Wifi className='h-3 w-3 text-green-500' />
              ) : (
                <WifiOff className='h-3 w-3' />
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
