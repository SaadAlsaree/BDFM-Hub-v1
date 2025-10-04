'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSignalR } from './useSignalR';
import { SignalREvents } from '@/types/notifications';
import { toast } from 'sonner';

// Simplified event handler types
type EventHandlerMap = {
    [K in keyof SignalREvents]?: (data: Parameters<SignalREvents[K]>[0]) => void;
};

// Types for the hook configuration
export interface CorrespondenceSignalRConfig extends EventHandlerMap {
    // Configuration options
    enableToastNotifications?: boolean;
    autoRefreshQueries?: boolean;
    debugMode?: boolean;
}

export function useCorrespondenceSignalR(config: CorrespondenceSignalRConfig = {}) {
    const queryClient = useQueryClient();
    const {
        onNotificationEvent,
        offNotificationEvent,
        isConnected,
        isSignalRAvailable,
        connectionState,
        reconnect
    } = useSignalR();

    const handlersRef = useRef<Map<string, any>>(new Map());

    // Enhanced config with default debug mode in development
    const enhancedConfig = {
        enableToastNotifications: true,
        autoRefreshQueries: true,
        debugMode: process.env.NODE_ENV === 'development', // Enable debug in development
        ...config
    };
    const configRef = useRef(enhancedConfig);

    // Update config ref when props change
    useEffect(() => {
        configRef.current = { ...enhancedConfig, ...config };
    }, [config]);

    // Helper function to log debug messages
    const debugLog = useCallback((message: string, data?: any) => {
        if (configRef.current.debugMode) {
            console.log(`🔔 [CorrespondenceSignalR] ${message}`, data ? JSON.stringify(data, null, 2) : '');
        }
    }, []);

    // Helper function to invalidate related queries with debouncing
    const invalidateCorrespondenceQueries = useCallback((correspondenceId?: string) => {
        if (!configRef.current.autoRefreshQueries) return;

        const queriesToInvalidate = [
            ['correspondence'],
            ['inbox'],
            ['notifications'],
            ['workflow-steps']
        ];

        if (correspondenceId) {
            queriesToInvalidate.push(['correspondence', correspondenceId]);
        }

        // Debounce invalidations to prevent excessive API calls
        const timeoutId = setTimeout(() => {
            queriesToInvalidate.forEach(queryKey => {
                queryClient.invalidateQueries({ queryKey });
            });
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [queryClient]);

    // Default event handlers aligned with backend response structure
    const createDefaultHandler = useCallback((eventName: string) => {
        return (data: any) => {
            debugLog(`Received ${eventName}`, data);

            try {
                // Default behavior based on event type with updated property names
                switch (eventName) {
                    case 'InboxUpdated':
                        if (configRef.current.enableToastNotifications) {
                            const count = data.correspondenceCount || 0;
                            toast.info(`صندوق الوارد محدث: ${count} مراسلة`);
                        }
                        invalidateCorrespondenceQueries();
                        break;

                    case 'CorrespondenceCreated':
                        if (configRef.current.enableToastNotifications) {
                            const subject = data.subject || 'مراسلة جديدة';
                            toast.success(`تم إنشاء مراسلة جديدة: ${subject}`);
                        }
                        invalidateCorrespondenceQueries();
                        break;

                    case 'CorrespondenceUpdated':
                        if (configRef.current.enableToastNotifications) {
                            const subject = data.subject || 'مراسلة';
                            toast.info(`تم تحديث المراسلة: ${subject}`);
                        }
                        invalidateCorrespondenceQueries(data.correspondenceId);
                        break;

                    case 'CorrespondenceDeleted':
                        if (configRef.current.enableToastNotifications) {
                            const subject = data.subject || 'مراسلة';
                            toast.warning(`تم حذف المراسلة: ${subject}`);
                        }
                        invalidateCorrespondenceQueries();
                        break;

                    case 'CorrespondenceStatusChanged':
                        if (configRef.current.enableToastNotifications) {
                            const { oldStatus = 'غير معروف', newStatus = 'جديد' } = data;
                            toast.info(`تغيرت حالة المراسلة من ${oldStatus} إلى ${newStatus}`);
                        }
                        invalidateCorrespondenceQueries(data.correspondenceId);
                        break;

                    case 'CorrespondenceAssignedToModule':
                        if (configRef.current.enableToastNotifications) {
                            const message = data.message || `تم تعيين مراسلة جديدة: ${data.moduleName}`;
                            toast.success(message);
                        }
                        invalidateCorrespondenceQueries(data.correspondenceId);
                        break;

                    case 'CorrespondenceStatusChangedWithNotification':
                        if (configRef.current.enableToastNotifications) {
                            const message = data.message || `تحديث الحالة: ${data.newStatus}`;
                            toast.info(message);
                        }
                        invalidateCorrespondenceQueries(data.correspondenceId);
                        break;

                    case 'WorkflowStepCreated':
                        if (configRef.current.enableToastNotifications) {
                            const message = data.message || 'تم إنشاء خطوة عمل جديدة';
                            toast.info(message);
                        }
                        invalidateCorrespondenceQueries(data.correspondenceId);
                        break;

                    case 'WorkflowStepCompleted':
                        if (configRef.current.enableToastNotifications) {
                            toast.success('تم إكمال خطوة العمل');
                        }
                        invalidateCorrespondenceQueries(data.correspondenceId);
                        break;

                    case 'WorkflowStepAssigned':
                        if (configRef.current.enableToastNotifications) {
                            toast.info('تم تعيين خطوة عمل جديدة');
                        }
                        invalidateCorrespondenceQueries(data.correspondenceId);
                        break;

                    default:
                        debugLog(`Unknown event: ${eventName}`);
                }
            } catch (error) {
                console.error(`Error in default handler for ${eventName}:`, error);
            }
        };
    }, [debugLog, invalidateCorrespondenceQueries]);

    // Create combined handler that calls both user and default handlers
    const createCombinedHandler = useCallback((eventName: keyof SignalREvents, userHandler?: (data: any) => void) => {
        const defaultHandler = createDefaultHandler(eventName);

        const handler = (data: any) => {
            // Call user-provided handler first
            if (userHandler) {
                try {
                    userHandler(data);
                } catch (error) {
                    console.error(`Error in user handler for ${eventName}:`, error);
                }
            }

            // Call default handler
            try {
                defaultHandler(data);
            } catch (error) {
                console.error(`Error in default handler for ${eventName}:`, error);
            }
        };

        return handler;
    }, [createDefaultHandler]);

    // Set up event listeners
    useEffect(() => {
        if (!isSignalRAvailable) {
            debugLog('SignalR not available, skipping event setup');
            return;
        }

        debugLog('Setting up SignalR event listeners');

        // Events to listen for
        const eventsToListen: (keyof SignalREvents)[] = [
            'InboxUpdated',
            'CorrespondenceCreated',
            'CorrespondenceUpdated',
            'CorrespondenceDeleted',
            'CorrespondenceStatusChanged',
            'CorrespondenceAssignedToModule',
            'CorrespondenceStatusChangedWithNotification',
            'WorkflowStepCreated',
            'WorkflowStepCompleted',
            'WorkflowStepAssigned'
        ];

        // Register handlers for each event
        eventsToListen.forEach(eventName => {
            try {
                const userHandler = config[eventName] as ((data: any) => void) | undefined;
                const combinedHandler = createCombinedHandler(eventName, userHandler);

                onNotificationEvent(eventName, combinedHandler);
                handlersRef.current.set(eventName, combinedHandler);

                debugLog(`Registered handler for event: ${eventName}`);
            } catch (error) {
                console.error(`Error registering handler for ${eventName}:`, error);
            }
        });

        // Cleanup function
        return () => {
            debugLog('Cleaning up SignalR event listeners');
            try {
                handlersRef.current.forEach((handler, eventName) => {
                    offNotificationEvent(eventName as keyof SignalREvents, handler);
                });
                handlersRef.current.clear();
            } catch (error) {
                console.error('Error cleaning up SignalR event listeners:', error);
            }
        };
    }, [
        isSignalRAvailable,
        onNotificationEvent,
        offNotificationEvent,
        createCombinedHandler,
        config,
        debugLog
    ]);

    // Manual refresh function with improved error handling
    const refreshCorrespondenceData = useCallback(async () => {
        debugLog('Manual refresh triggered');

        try {
            // Invalidate queries
            invalidateCorrespondenceQueries();

            // Try to reconnect if SignalR is available but not connected
            if (isSignalRAvailable && !isConnected) {
                debugLog('Attempting to reconnect SignalR');

                try {
                    const success = await reconnect();
                    if (success) {
                        toast.success('تم إعادة الاتصال بنجاح');
                        return true;
                    } else {
                        toast.error('فشل في إعادة الاتصال');
                        return false;
                    }
                } catch (error) {
                    debugLog('Reconnection failed', error);
                    toast.error('حدث خطأ أثناء إعادة الاتصال');
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.error('Error in refreshCorrespondenceData:', error);
            toast.error('حدث خطأ أثناء تحديث البيانات');
            return false;
        }
    }, [debugLog, invalidateCorrespondenceQueries, isSignalRAvailable, isConnected, reconnect]);

    // Get SignalR diagnostics
    const getDiagnostics = useCallback(() => {
        return {
            isSignalRAvailable,
            isConnected,
            connectionState,
            registeredHandlers: Array.from(handlersRef.current.keys()),
            config: {
                enableToastNotifications: configRef.current.enableToastNotifications,
                autoRefreshQueries: configRef.current.autoRefreshQueries,
                debugMode: configRef.current.debugMode
            }
        };
    }, [isSignalRAvailable, isConnected, connectionState]);

    return {
        // Connection state
        isConnected,
        isSignalRAvailable,
        connectionState,

        // Actions
        refreshCorrespondenceData,
        reconnect,

        // Utilities
        invalidateCorrespondenceQueries,
        getDiagnostics,

        // Debug info
        registeredHandlers: Array.from(handlersRef.current.keys()),
    };
} 