'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthApi } from './use-auth-api';
import { useSignalR } from './useSignalR';
import { useNotificationPreferences } from './useNotificationPreferences';
import { notificationsApi } from '@/features/notifications/api/notifications-api';
import {
  Notification,
  NotificationQuery,
  NotificationType
} from '@/types/notifications';
import { toast } from 'sonner';

// Debounce utility
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

export function useNotifications(
  query: NotificationQuery = {},
  options: { skipGlobalListeners?: boolean } = {}
) {
  const queryClient = useQueryClient();
  const { authApiCall } = useAuthApi();
  const {
    onNotificationEvent,
    offNotificationEvent,
    isConnected,
    isSignalRAvailable,
    connectionState,
    reconnect
  } = useSignalR();
  const {
    preferences,
    isNotificationTypeEnabled,
    playNotificationSound,
    showBrowserNotification
  } = useNotificationPreferences();
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationHandlersRef = useRef<Set<Function>>(new Set());
  const lastNotificationIdRef = useRef<string | null>(null);

  // Query key for caching
  const queryKey = ['notifications', query];
  const unreadCountKey = ['notifications', 'unreadCount'];

  // Determine polling strategy based on SignalR availability
  const shouldPoll = !isSignalRAvailable || !isConnected;
  const pollingInterval = shouldPoll ? 60 * 1000 : false; // Increased to 60s when SignalR unavailable

  // Debounced query invalidation to prevent excessive API calls
  const debouncedInvalidateNotifications = useRef(
    debounce(() => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: unreadCountKey });
    }, 1000)
  ).current;

  // Fetch notifications
  const {
    data: notificationsResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      return await authApiCall(
        async () => await notificationsApi.getUserNotificationsClient(query)
      );
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: pollingInterval,
    refetchOnWindowFocus: !isConnected, // Only refetch on focus if SignalR not connected
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false;
      }
      return failureCount < 3;
    }
  });

  // Fetch unread count
  const { data: unreadCountData, refetch: refetchUnreadCount } = useQuery({
    queryKey: unreadCountKey,
    queryFn: async () => {
      return await authApiCall(
        async () => await notificationsApi.getUnreadCount()
      );
    },
    staleTime: 30 * 1000,
    refetchInterval: pollingInterval,
    refetchOnWindowFocus: !isConnected,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false;
      }
      return failureCount < 3;
    }
  });

  // Update local unread count when data changes
  useEffect(() => {
    if (typeof unreadCountData === 'number') {
      setUnreadCount(unreadCountData);
    }
  }, [unreadCountData]);

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
        queryClient.setQueryData(queryKey, (oldData: any) => {
          if (!oldData?.data?.items) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              items: oldData.data.items.map((notification: Notification) =>
                notification.id === id
                  ? { ...notification, isRead: true }
                  : notification
              )
            }
          };
        });

        // Update unread count
        setUnreadCount((prev) => Math.max(0, prev - 1));
        queryClient.setQueryData(unreadCountKey, (prev: number) =>
          Math.max(0, (prev || 0) - 1)
        );

        toast.success('Notification marked as read');
      } else {
        toast.error('Failed to mark notification as read');
      }
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
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
        queryClient.setQueryData(queryKey, (oldData: any) => {
          if (!oldData?.data?.items) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              items: oldData.data.items.map((notification: Notification) => ({
                ...notification,
                isRead: true
              }))
            }
          };
        });

        // Reset unread count
        setUnreadCount(0);
        queryClient.setQueryData(unreadCountKey, 0);

        toast.success('All notifications marked as read');
      } else {
        toast.error('Failed to mark all notifications as read');
      }
    },
    onError: (error) => {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  });

  // Enhanced real-time notification handler
  const handleNewNotification = useCallback(
    (notification: Partial<Notification>) => {
      // Prevent duplicate notifications
      if (lastNotificationIdRef.current === notification.id) {
        // console.debug('Duplicate notification prevented:', notification.id);
        return;
      }
      lastNotificationIdRef.current = notification.id || null;

      const notificationType =
        notification.notificationType || NotificationType.SystemAlert;

      // Check if this notification type is enabled
      const typeKey = {
        [NotificationType.NewMail]: 'newMail',
        [NotificationType.StatusUpdate]: 'statusUpdates',
        [NotificationType.WorkflowAssignment]: 'workflowAssignments',
        [NotificationType.SystemAlert]: 'systemAlerts'
      }[notificationType] as keyof typeof preferences.notificationTypes;

      if (!isNotificationTypeEnabled(typeKey)) {
        // console.debug('Notification type disabled, skipping:', typeKey);
        return;
      }

      try {
        // Create new notification object
        const newNotification: Notification = {
          id: notification.id || Date.now().toString(),
          message: notification.message || '',
          notificationType,
          notificationTypeName:
            notification.notificationTypeName || 'System Alert',
          isRead: false,
          createAt: new Date().toISOString(),
          ...notification
        };

        // Add to cache
        queryClient.setQueryData(queryKey, (oldData: any) => {
          if (!oldData?.data?.items) return oldData;

          // Check if notification already exists
          const exists = oldData.data.items.some(
            (item: Notification) => item.id === newNotification.id
          );
          if (exists) {
            // console.debug('Notification already exists in cache:', newNotification.id);
            return oldData;
          }

          return {
            ...oldData,
            data: {
              ...oldData.data,
              items: [newNotification, ...oldData.data.items].slice(
                0,
                query.pageSize || 50
              ), // Limit cache size
              totalCount: oldData.data.totalCount + 1
            }
          };
        });

        // Update unread count
        setUnreadCount((prev) => prev + 1);

        // Play notification sound
        if (preferences.soundEnabled) {
          playNotificationSound('default');
        }

        // Show browser notification
        if (preferences.pushNotifications) {
          showBrowserNotification(
            notification.notificationTypeName || 'إشعار جديد',
            {
              body: notification.message,
              tag: notification.id || Date.now().toString(),
              requireInteraction: false
            }
          );
        }

        // Show toast notification
        toast.info(notification.message || 'تم استلام إشعار جديد', {
          action: {
            label: 'عرض',
            onClick: () => {
              window.location.href = '/notifications';
            }
          }
        });

        // Debounced cache invalidation
        debouncedInvalidateNotifications();
      } catch (error) {
        console.error('Error handling new notification:', error);
      }
    },
    [
      queryClient,
      queryKey,
      isNotificationTypeEnabled,
      preferences,
      playNotificationSound,
      showBrowserNotification,
      debouncedInvalidateNotifications,
      query.pageSize
    ]
  );

  // Set up SignalR event listeners only if not skipping global listeners
  useEffect(() => {
    // Skip if global listeners are being handled elsewhere
    if (options.skipGlobalListeners) {
      console.log(
        '🔔 [useNotifications] Skipping event listeners - using global listeners'
      );
      return;
    }

    if (!isSignalRAvailable) {
      // console.debug('SignalR not available, skipping event listeners');
      return;
    }

    // console.debug('Setting up SignalR notification event listeners');

    const correspondenceAssignedHandler = (data: any) => {
      console.log(
        '🔔 [useNotifications] Received CorrespondenceAssignedToModule event:',
        JSON.stringify(data, null, 2)
      );
      handleNewNotification({
        message: data.message || `تم تحويل الكتاب لوحدتك: ${data.moduleName}`,
        notificationType: NotificationType.NewMail,
        notificationTypeName: 'New Mail',
        linkToCorrespondenceId: data.correspondenceId,
        correspondenceSubject: data.subject
      });
    };

    const statusChangedHandler = (data: any) => {
      console.log(
        '🔔 [useNotifications] Received CorrespondenceStatusChangedWithNotification event:',
        JSON.stringify(data, null, 2)
      );
      handleNewNotification({
        message: data.message || `تم تحديث حالة الكتاب إلى ${data.newStatus}`,
        notificationType: NotificationType.StatusUpdate,
        notificationTypeName: 'Status Update',
        linkToCorrespondenceId: data.correspondenceId
      });
    };

    const workflowStepHandler = (data: any) => {
      console.log(
        '🔔 [useNotifications] Received WorkflowStepCreated event:',
        JSON.stringify(data, null, 2)
      );
      handleNewNotification({
        message: data.message || 'تم إنشاء خطوة عمل جديدة',
        notificationType: NotificationType.WorkflowAssignment,
        notificationTypeName: 'Workflow Assignment',
        linkToWorkflowStepId: data.workflowStepId,
        linkToCorrespondenceId: data.correspondenceId
      });
    };

    const workflowAssignedHandler = (data: any) => {
      console.log(
        '🔔 [useNotifications] Received WorkflowStepAssigned event:',
        JSON.stringify(data, null, 2)
      );
      handleNewNotification({
        message: 'تم تعيين خطوة عمل جديدة لك',
        notificationType: NotificationType.WorkflowAssignment,
        notificationTypeName: 'Workflow Assignment',
        linkToWorkflowStepId: data.workflowStepId,
        linkToCorrespondenceId: data.correspondenceId
      });
    };

    // Register handlers
    console.log('🔔 [useNotifications] Registering SignalR event handlers');
    onNotificationEvent(
      'CorrespondenceAssignedToModule',
      correspondenceAssignedHandler
    );
    onNotificationEvent(
      'CorrespondenceStatusChangedWithNotification',
      statusChangedHandler
    );
    onNotificationEvent('WorkflowStepCreated', workflowStepHandler);
    onNotificationEvent('WorkflowStepAssigned', workflowAssignedHandler);

    // Store handlers for cleanup
    notificationHandlersRef.current.add(correspondenceAssignedHandler);
    notificationHandlersRef.current.add(statusChangedHandler);
    notificationHandlersRef.current.add(workflowStepHandler);
    notificationHandlersRef.current.add(workflowAssignedHandler);

    return () => {
      // console.debug('Cleaning up notification event listeners');
      // Cleanup handlers
      offNotificationEvent(
        'CorrespondenceAssignedToModule',
        correspondenceAssignedHandler
      );
      offNotificationEvent(
        'CorrespondenceStatusChangedWithNotification',
        statusChangedHandler
      );
      offNotificationEvent('WorkflowStepCreated', workflowStepHandler);
      offNotificationEvent('WorkflowStepAssigned', workflowAssignedHandler);

      notificationHandlersRef.current.clear();
    };
  }, [
    onNotificationEvent,
    offNotificationEvent,
    handleNewNotification,
    isSignalRAvailable,
    options.skipGlobalListeners
  ]);

  // Public methods
  const markAsRead = useCallback(
    async (id: string) => {
      try {
        await markAsReadMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },
    [markAsReadMutation]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [markAllAsReadMutation]);

  const refreshNotifications = useCallback(async () => {
    try {
      await Promise.all([refetch(), refetchUnreadCount()]);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  }, [refetch, refetchUnreadCount]);

  // Manual reconnection for SignalR
  const retrySignalRConnection = useCallback(async () => {
    if (isSignalRAvailable) {
      try {
        const success = await reconnect();
        if (success) {
          toast.success('تم إعادة الاتصال بنجاح');
          // Refresh notifications after successful reconnection
          await refreshNotifications();
        } else {
          toast.error('فشل في إعادة الاتصال');
        }
        return success;
      } catch (error) {
        console.error('Error during manual reconnection:', error);
        toast.error('حدث خطأ أثناء إعادة الاتصال');
        return false;
      }
    } else {
      toast.warning('الاتصال غير متاح حالياً');
      return false;
    }
  }, [isSignalRAvailable, reconnect, refreshNotifications]);

  return {
    notifications: notificationsResponse?.data?.items || [],
    totalCount: notificationsResponse?.data?.totalCount || 0,
    unreadCount,
    loading: isLoading,
    error: error?.message || null,
    isConnected,
    isSignalRAvailable,
    connectionState,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    retrySignalRConnection,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    preferences
  };
}
