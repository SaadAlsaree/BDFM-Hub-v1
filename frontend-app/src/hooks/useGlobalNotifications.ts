'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSignalR } from './useSignalR';
import { useNotificationPreferences } from './useNotificationPreferences';
import { Notification, NotificationType } from '@/types/notifications';
import { toast } from 'sonner';

/**
 * Global notification listener hook that ensures real-time notifications
 * work across all pages, not just the notifications page.
 * This should be used in a global provider or layout component.
 */
export function useGlobalNotifications() {
    const queryClient = useQueryClient();
    const {
        onNotificationEvent,
        offNotificationEvent,
        isSignalRAvailable,
        isConnected
    } = useSignalR();
    const {
        isNotificationTypeEnabled,
        playNotificationSound,
        showBrowserNotification,
        preferences
    } = useNotificationPreferences();

    const handlersRef = useRef<Set<Function>>(new Set());
    const lastNotificationIdRef = useRef<string | null>(null);

    // Invalidate all notification-related queries
    const invalidateNotificationQueries = useCallback(() => {
        // Invalidate all possible notification query variations
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notifications', 'unreadCount'] });

        // Force refetch unread count for immediate UI updates
        queryClient.refetchQueries({
            queryKey: ['notifications', 'unreadCount'],
            type: 'active'
        });
    }, [queryClient]);

    // Enhanced notification handler for real-time updates
    const handleNewNotification = useCallback((notification: Partial<Notification>) => {
        // Prevent duplicate notifications
        if (lastNotificationIdRef.current === notification.id) {
            return;
        }
        lastNotificationIdRef.current = notification.id || null;

        const notificationType = notification.notificationType || NotificationType.SystemAlert;

        // Check if this notification type is enabled
        const typeKeyMap = {
            [NotificationType.NewMail]: 'newMail' as const,
            [NotificationType.StatusUpdate]: 'statusUpdates' as const,
            [NotificationType.WorkflowAssignment]: 'workflowAssignments' as const,
            [NotificationType.SystemAlert]: 'systemAlerts' as const
        };

        const typeKey = typeKeyMap[notificationType];
        if (!typeKey || !isNotificationTypeEnabled(typeKey)) {
            return;
        }

        try {
            // console.log('🔔 [GlobalNotifications] Processing new notification:', notification.message);

            // Create new notification object
            const newNotification: Notification = {
                id: notification.id || Date.now().toString(),
                message: notification.message || '',
                notificationType,
                notificationTypeName: notification.notificationTypeName || 'System Alert',
                isRead: false,
                createAt: new Date().toISOString(),
                ...notification
            };

            // Update all notification queries in cache
            const notificationQueryKeys = [
                ['notifications'],
                ['notifications', { page: 1, pageSize: 8 }],
                ['notifications', { page: 1, pageSize: 10 }],
                ['notifications', { page: 1, pageSize: 20 }],
                ['notifications', { page: 1, pageSize: 50 }]
            ];

            notificationQueryKeys.forEach(queryKey => {
                queryClient.setQueryData(queryKey, (oldData: any) => {
                    if (!oldData?.data?.items) return oldData;

                    // Check if notification already exists
                    const exists = oldData.data.items.some((item: Notification) => item.id === newNotification.id);
                    if (exists) return oldData;

                    return {
                        ...oldData,
                        data: {
                            ...oldData.data,
                            items: [newNotification, ...oldData.data.items].slice(0, oldData.data.items.length + 1),
                            totalCount: oldData.data.totalCount + 1
                        }
                    };
                });
            });

            // Update unread count
            queryClient.setQueryData(['notifications', 'unreadCount'], (prev: number = 0) => prev + 1);

            // Play notification sound
            playNotificationSound('default');

            // Show browser notification
            showBrowserNotification(
                notification.notificationTypeName || 'إشعار جديد',
                {
                    body: notification.message,
                    tag: notification.id || Date.now().toString(),
                    requireInteraction: false
                }
            );

            // Show toast notification
            toast.info(notification.message || 'تم استلام إشعار جديد', {
                action: {
                    label: 'عرض',
                    onClick: () => {
                        window.location.href = '/notifications';
                    }
                }
            });

            // Invalidate queries to ensure all components update
            invalidateNotificationQueries();

        } catch (error) {
            // console.error('🔔 [GlobalNotifications] Error handling new notification:', error);
        }
    }, [isNotificationTypeEnabled, playNotificationSound, showBrowserNotification, queryClient, invalidateNotificationQueries]);

    // Set up global SignalR event listeners
    useEffect(() => {
        if (!isSignalRAvailable) {
            // console.log('🔔 [GlobalNotifications] SignalR not available, skipping global event setup');
            return;
        }

        // console.log('🔔 [GlobalNotifications] Setting up global SignalR notification listeners');

        const correspondenceAssignedHandler = (data: any) => {
            // console.log('🔔 [GlobalNotifications] Received CorrespondenceAssignedToModule event:', JSON.stringify(data, null, 2));
            handleNewNotification({
                message: data.message || `تم تحويل الكتاب لوحدتك: ${data.moduleName}`,
                notificationType: NotificationType.NewMail,
                notificationTypeName: 'New Mail',
                linkToCorrespondenceId: data.correspondenceId,
                correspondenceSubject: data.subject
            });
        };

        const statusChangedHandler = (data: any) => {
            // console.log('🔔 [GlobalNotifications] Received CorrespondenceStatusChangedWithNotification event:', JSON.stringify(data, null, 2));
            handleNewNotification({
                message: data.message || `تم تحديث حالة الكتاب إلى ${data.newStatus}`,
                notificationType: NotificationType.StatusUpdate,
                notificationTypeName: 'Status Update',
                linkToCorrespondenceId: data.correspondenceId
            });
        };

        const workflowStepHandler = (data: any) => {
            // console.log('🔔 [GlobalNotifications] Received WorkflowStepCreated event:', JSON.stringify(data, null, 2));
            handleNewNotification({
                message: data.message || 'تم إنشاء خطوة عمل جديدة',
                notificationType: NotificationType.WorkflowAssignment,
                notificationTypeName: 'Workflow Assignment',
                linkToWorkflowStepId: data.workflowStepId,
                linkToCorrespondenceId: data.correspondenceId
            });
        };

        const workflowAssignedHandler = (data: any) => {
            // console.log('🔔 [GlobalNotifications] Received WorkflowStepAssigned event:', JSON.stringify(data, null, 2));
            handleNewNotification({
                message: 'تم تعيين خطوة عمل جديدة لك',
                notificationType: NotificationType.WorkflowAssignment,
                notificationTypeName: 'Workflow Assignment',
                linkToWorkflowStepId: data.workflowStepId,
                linkToCorrespondenceId: data.correspondenceId
            });
        };

        // Handle general inbox updates (affects unread count)
        const inboxUpdateHandler = (data: any) => {
            // console.log('🔔 [GlobalNotifications] Received InboxUpdated event:', JSON.stringify(data, null, 2));
            invalidateNotificationQueries();
        };

        // Register handlers
        onNotificationEvent('CorrespondenceAssignedToModule', correspondenceAssignedHandler);
        onNotificationEvent('CorrespondenceStatusChangedWithNotification', statusChangedHandler);
        onNotificationEvent('WorkflowStepCreated', workflowStepHandler);
        onNotificationEvent('WorkflowStepAssigned', workflowAssignedHandler);
        onNotificationEvent('InboxUpdated', inboxUpdateHandler);

        // Store handlers for cleanup
        handlersRef.current.add(correspondenceAssignedHandler);
        handlersRef.current.add(statusChangedHandler);
        handlersRef.current.add(workflowStepHandler);
        handlersRef.current.add(workflowAssignedHandler);
        handlersRef.current.add(inboxUpdateHandler);

        // console.log('🔔 [GlobalNotifications] Global event listeners registered successfully');

        return () => {
            //  console.log('🔔 [GlobalNotifications] Cleaning up global notification event listeners');
            // Cleanup handlers
            offNotificationEvent('CorrespondenceAssignedToModule', correspondenceAssignedHandler);
            offNotificationEvent('CorrespondenceStatusChangedWithNotification', statusChangedHandler);
            offNotificationEvent('WorkflowStepCreated', workflowStepHandler);
            offNotificationEvent('WorkflowStepAssigned', workflowAssignedHandler);
            offNotificationEvent('InboxUpdated', inboxUpdateHandler);

            handlersRef.current.clear();
        };
    }, [onNotificationEvent, offNotificationEvent, handleNewNotification, isSignalRAvailable, invalidateNotificationQueries]);

    return {
        isConnected,
        isSignalRAvailable,
        invalidateNotificationQueries
    };
} 