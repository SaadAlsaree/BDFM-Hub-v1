'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSignalR } from '@/hooks/useSignalR';
import {
  SignalREvents,
  SignalRConnectionState
} from '@/types/notifications';
import { getNotificationSoundManager } from '@/lib/notification-sound';
import { toast } from 'sonner';

interface NotificationProviderProps {
  children: React.ReactNode;
}

interface NotificationContextValue {
  connectionState: SignalRConnectionState;
  isConnected: boolean;
  soundEnabled: boolean;
  toggleSound: () => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(
  null
);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotificationContext must be used within NotificationProvider'
    );
  }
  return context;
};

/**
 * NotificationProvider - Centralized notification management
 *
 * This provider:
 * 1. Manages SignalR connection and event subscriptions
 * 2. Handles notification sounds
 * 3. Refreshes notification queries when events are received
 * 4. Re-registers event listeners on reconnection
 * 5. Shows toast notifications for important events
 */
export function NotificationProvider({ children }: NotificationProviderProps) {
  const queryClient = useQueryClient();
  const {
    connectionState,
    isConnected,
    onNotificationEvent,
    offNotificationEvent
  } = useSignalR();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundManager = useRef(getNotificationSoundManager());
  const eventHandlersRef = useRef<Map<keyof SignalREvents, any>>(new Map());

  /**
   * Play notification sound
   */
  const playNotificationSound = useCallback(() => {
    if (soundEnabled && soundManager.current.isEnabled()) {
      soundManager.current.play({ type: 'default', volume: 0.5 });
    }
  }, [soundEnabled]);

  /**
   * Refresh notification queries
   */
  const refreshNotifications = useCallback(() => {
    // Invalidate notification queries to trigger refetch
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['notifications', 'unreadCount'] });
  }, [queryClient]);

  /**
   * Handle correspondence assigned to module
   */
  const handleCorrespondenceAssignedToModule = useCallback(
    (data: Parameters<SignalREvents['CorrespondenceAssignedToModule']>[0]) => {
      /* console.log(
        '🔔 [NotificationProvider] Correspondence assigned to module:',
        data
      ); */

      // Play sound
      playNotificationSound();

      // Show toast
      toast.info('تحويل كتاب جديد', {
        description: data.message || `تم تحويل الكتاب: ${data.subject}`,
        duration: 5000
      });

      // Refresh notifications
      refreshNotifications();

      // Refresh correspondence lists
      queryClient.invalidateQueries({ queryKey: ['correspondences'] });
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
    [playNotificationSound, refreshNotifications, queryClient]
  );

  /**
   * Handle correspondence status changed with notification
   */
  const handleCorrespondenceStatusChanged = useCallback(
    (
      data: Parameters<
        SignalREvents['CorrespondenceStatusChangedWithNotification']
      >[0]
    ) => {
      /* console.log(
        '🔔 [NotificationProvider] Correspondence status changed:',
        data
      ); */

      // Play sound
      playNotificationSound();

      // Show toast
      toast.info('تحديث حالة الكتاب', {
        description: data.message || `تم تحديث الحالة إلى: ${data.newStatus}`,
        duration: 5000
      });

      // Refresh notifications
      refreshNotifications();

      // Refresh correspondence data
      queryClient.invalidateQueries({ queryKey: ['correspondences'] });
      queryClient.invalidateQueries({
        queryKey: ['correspondence', data.correspondenceId]
      });
    },
    [playNotificationSound, refreshNotifications, queryClient]
  );

  /**
   * Handle workflow step created
   */
  const handleWorkflowStepCreated = useCallback(
    (data: Parameters<SignalREvents['WorkflowStepCreated']>[0]) => {
      // console.log('🔔 [NotificationProvider] Workflow step created:', data);

      // Play sound
      playNotificationSound();

      // Show toast
      toast.info('خطوة عمل جديدة', {
        description: data.message || 'تم إنشاء خطوة عمل جديدة',
        duration: 5000
      });

      // Refresh notifications
      refreshNotifications();

      // Refresh correspondence data
      queryClient.invalidateQueries({
        queryKey: ['correspondence', data.correspondenceId]
      });
      queryClient.invalidateQueries({ queryKey: ['workflow'] });
    },
    [playNotificationSound, refreshNotifications, queryClient]
  );

  /**
   * Handle workflow step status changed (NEW)
   */
  const handleWorkflowStepStatusChanged = useCallback(
    (data: Parameters<SignalREvents['WorkflowStepStatusChanged']>[0]) => {
      /* console.log(
        '🔔 [NotificationProvider] Workflow step status changed:',
        data
      ); */

      // Play sound
      playNotificationSound();

      // Show toast
      toast.info('تحديث خطوة العمل', {
        description: data.message || `تم تحديث الحالة إلى: ${data.newStatus}`,
        duration: 5000
      });

      // Refresh notifications
      refreshNotifications();

      // Refresh correspondence and workflow data
      queryClient.invalidateQueries({
        queryKey: ['correspondence', data.correspondenceId]
      });
      queryClient.invalidateQueries({ queryKey: ['workflow'] });
    },
    [playNotificationSound, refreshNotifications, queryClient]
  );

  /**
   * Handle correspondence created
   */
  const handleCorrespondenceCreated = useCallback(
    (data: Parameters<SignalREvents['CorrespondenceCreated']>[0]) => {
      // console.log('🔔 [NotificationProvider] Correspondence created:', data);

      // Play sound for new correspondence
      playNotificationSound();

      // Refresh notifications and correspondences
      refreshNotifications();
      queryClient.invalidateQueries({ queryKey: ['correspondences'] });
    },
    [playNotificationSound, refreshNotifications, queryClient]
  );

  /**
   * Handle correspondence updated
   */
  const handleCorrespondenceUpdated = useCallback(
    (data: Parameters<SignalREvents['CorrespondenceUpdated']>[0]) => {
      // console.log('🔔 [NotificationProvider] Correspondence updated:', data);

      // Refresh specific correspondence
      queryClient.invalidateQueries({
        queryKey: ['correspondence', data.correspondenceId]
      });
      queryClient.invalidateQueries({ queryKey: ['correspondences'] });
    },
    [queryClient]
  );

  /**
   * Handle inbox updated
   */
  const handleInboxUpdated = useCallback(
    (data: Parameters<SignalREvents['InboxUpdated']>[0]) => {
      // console.log('🔔 [NotificationProvider] Inbox updated:', data);

      // Refresh inbox and notification counts
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unreadCount'] });
    },
    [queryClient]
  );

  /**
   * Handle workflow step completed
   */
  const handleWorkflowStepCompleted = useCallback(
    (data: Parameters<SignalREvents['WorkflowStepCompleted']>[0]) => {
      // console.log('🔔 [NotificationProvider] Workflow step completed:', data);

      // Play sound
      playNotificationSound();

      // Refresh data
      refreshNotifications();
      queryClient.invalidateQueries({
        queryKey: ['correspondence', data.correspondenceId]
      });
      queryClient.invalidateQueries({ queryKey: ['workflow'] });
    },
    [playNotificationSound, refreshNotifications, queryClient]
  );

  /**
   * Handle workflow step assigned
   */
  const handleWorkflowStepAssigned = useCallback(
    (data: Parameters<SignalREvents['WorkflowStepAssigned']>[0]) => {
      // console.log('🔔 [NotificationProvider] Workflow step assigned:', data);

      // Play sound
      playNotificationSound();

      // Show toast
      toast.info('تكليف جديد', {
        description: 'تم تكليفك بخطوة عمل جديدة',
        duration: 5000
      });

      // Refresh data
      refreshNotifications();
      queryClient.invalidateQueries({
        queryKey: ['correspondence', data.correspondenceId]
      });
      queryClient.invalidateQueries({ queryKey: ['workflow'] });
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
    [playNotificationSound, refreshNotifications, queryClient]
  );

  /**
   * Register all event handlers
   */
  const registerEventHandlers = useCallback(() => {
    // console.log('🔔 [NotificationProvider] Registering event handlers...');

    // Store handlers in ref to allow cleanup
    const handlers: Partial<SignalREvents> = {
      CorrespondenceAssignedToModule: handleCorrespondenceAssignedToModule,
      CorrespondenceStatusChangedWithNotification:
        handleCorrespondenceStatusChanged,
      WorkflowStepCreated: handleWorkflowStepCreated,
      WorkflowStepStatusChanged: handleWorkflowStepStatusChanged,
      CorrespondenceCreated: handleCorrespondenceCreated,
      CorrespondenceUpdated: handleCorrespondenceUpdated,
      InboxUpdated: handleInboxUpdated,
      WorkflowStepCompleted: handleWorkflowStepCompleted,
      WorkflowStepAssigned: handleWorkflowStepAssigned
    };

    // Register all handlers
    Object.entries(handlers).forEach(([eventName, handler]) => {
      const typedEventName = eventName as keyof SignalREvents;
      onNotificationEvent(typedEventName, handler as any);
      eventHandlersRef.current.set(typedEventName, handler);
    });

    /* console.log(
      '🔔 [NotificationProvider] Event handlers registered:',
      Object.keys(handlers)
    ); */
  }, [
    handleCorrespondenceAssignedToModule,
    handleCorrespondenceStatusChanged,
    handleWorkflowStepCreated,
    handleWorkflowStepStatusChanged,
    handleCorrespondenceCreated,
    handleCorrespondenceUpdated,
    handleInboxUpdated,
    handleWorkflowStepCompleted,
    handleWorkflowStepAssigned,
    onNotificationEvent
  ]);

  /**
   * Unregister all event handlers
   */
  const unregisterEventHandlers = useCallback(() => {
    // console.log('🔔 [NotificationProvider] Unregistering event handlers...');

    eventHandlersRef.current.forEach((handler, eventName) => {
      offNotificationEvent(eventName, handler);
    });

    eventHandlersRef.current.clear();
    // console.log('🔔 [NotificationProvider] Event handlers unregistered');
  }, [offNotificationEvent]);

  /**
   * Register event handlers when connected
   * Re-register when connection state changes to connected
   */
  useEffect(() => {
    if (isConnected) {
      /* console.log(
        '🔔 [NotificationProvider] Connected - registering event handlers'
      ); */
      registerEventHandlers();

      // Refresh notifications when connection is established
      refreshNotifications();
    } else {
      /* console.log(
        '🔔 [NotificationProvider] Disconnected - unregistering event handlers'
      ); */
      unregisterEventHandlers();
    }

    // Cleanup on unmount or when connection state changes
    return () => {
      unregisterEventHandlers();
    };
  }, [isConnected, registerEventHandlers, unregisterEventHandlers, refreshNotifications]);

  /**
   * Toggle sound on/off
   */
  const toggleSound = useCallback(() => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    soundManager.current.setEnabled(newSoundEnabled);

    // Save preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'notificationSoundEnabled',
        JSON.stringify(newSoundEnabled)
      );
    }

    toast.success(
      newSoundEnabled ? 'تم تفعيل الصوت' : 'تم إيقاف الصوت',
      {
        duration: 2000
      }
    );
  }, [soundEnabled]);

  /**
   * Load sound preference from localStorage
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPreference = localStorage.getItem('notificationSoundEnabled');
      if (savedPreference !== null) {
        const enabled = JSON.parse(savedPreference);
        setSoundEnabled(enabled);
        soundManager.current.setEnabled(enabled);
      }
    }
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      unregisterEventHandlers();
    };
  }, [unregisterEventHandlers]);

  const value: NotificationContextValue = {
    connectionState,
    isConnected,
    soundEnabled,
    toggleSound,
    refreshNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
