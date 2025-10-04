'use client';

import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSignalR } from '@/hooks/useSignalR';
import { toast } from 'sonner';

// Example usage hook for correspondence real-time updates
export function useCorrespondenceRealtime() {
    const queryClient = useQueryClient();
    const { onNotificationEvent, offNotificationEvent, isConnected } = useSignalR();
    const handlersRef = useRef<Set<Function>>(new Set());

    // Helper to refresh correspondence queries
    const refetchCorrespondenceData = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['correspondence'] });
        queryClient.invalidateQueries({ queryKey: ['inbox'] });
        queryClient.invalidateQueries({ queryKey: ['workflow-steps'] });
    }, [queryClient]);

    // Handler for module assignments
    const handleCorrespondenceAssignedToModule = useCallback((notification: {
        correspondenceId: string;
        moduleId: string;
        moduleName: string;
        subject: string;
        message: string;
    }) => {
        toast.success(`New assignment: ${notification.message}`);

        // Refresh module workload or inbox
        refetchCorrespondenceData();

        // Update specific correspondence in cache if needed
        queryClient.setQueryData(['correspondence', notification.correspondenceId], (oldData: any) => {
            if (oldData) {
                return {
                    ...oldData,
                    assignedModule: notification.moduleName,
                    assignedModuleId: notification.moduleId
                };
            }
            return oldData;
        });
    }, [refetchCorrespondenceData, queryClient]);

    // Handler for status changes with notifications
    const handleCorrespondenceStatusChangedWithNotification = useCallback((notification: {
        correspondenceId: string;
        newStatus: string;
        message: string;
        userId: string;
    }) => {
        toast.info(`Status update: ${notification.message}`);

        // Update specific correspondence in state
        queryClient.setQueryData(['correspondence', notification.correspondenceId], (oldData: any) => {
            if (oldData) {
                return {
                    ...oldData,
                    status: notification.newStatus,
                    statusName: notification.newStatus
                };
            }
            return oldData;
        });

        refetchCorrespondenceData();
    }, [queryClient, refetchCorrespondenceData]);

    // Handler for workflow step creation
    const handleWorkflowStepCreated = useCallback((notification: {
        workflowStepId: string;
        correspondenceId: string;
        recipientType: string;
        message: string;
    }) => {
        toast.info(`New workflow step: ${notification.message}`);

        // Refresh workflow steps
        queryClient.invalidateQueries({ queryKey: ['workflow-steps', notification.correspondenceId] });
        queryClient.invalidateQueries({ queryKey: ['correspondence', notification.correspondenceId] });
    }, [queryClient]);

    // Set up event listeners
    const setupEventListeners = useCallback(() => {
        // Clear existing handlers
        handlersRef.current.forEach(handler => {
            // Note: We'd need the specific event names to clean up properly
            // This is a simplified cleanup
        });
        handlersRef.current.clear();

        // Register new handlers
        onNotificationEvent('CorrespondenceAssignedToModule', handleCorrespondenceAssignedToModule);
        onNotificationEvent('CorrespondenceStatusChangedWithNotification', handleCorrespondenceStatusChangedWithNotification);
        onNotificationEvent('WorkflowStepCreated', handleWorkflowStepCreated);

        // Store handlers for cleanup
        handlersRef.current.add(handleCorrespondenceAssignedToModule);
        handlersRef.current.add(handleCorrespondenceStatusChangedWithNotification);
        handlersRef.current.add(handleWorkflowStepCreated);

        return () => {
            offNotificationEvent('CorrespondenceAssignedToModule', handleCorrespondenceAssignedToModule);
            offNotificationEvent('CorrespondenceStatusChangedWithNotification', handleCorrespondenceStatusChangedWithNotification);
            offNotificationEvent('WorkflowStepCreated', handleWorkflowStepCreated);
            handlersRef.current.clear();
        };
    }, [
        onNotificationEvent,
        offNotificationEvent,
        handleCorrespondenceAssignedToModule,
        handleCorrespondenceStatusChangedWithNotification,
        handleWorkflowStepCreated
    ]);

    return {
        isConnected,
        setupEventListeners,
        refetchCorrespondenceData,

        // Individual handlers for custom usage
        handleCorrespondenceAssignedToModule,
        handleCorrespondenceStatusChangedWithNotification,
        handleWorkflowStepCreated
    };
}

/**
 * Example usage in a component:
 * 
 * export function CorrespondenceInboxPage() {
 *     const { 
 *         isConnected, 
 *         setupEventListeners,
 *         refetchCorrespondenceData 
 *     } = useCorrespondenceRealtime();
 * 
 *     // Set up listeners when component mounts
 *     useEffect(() => {
 *         const cleanup = setupEventListeners();
 *         return cleanup;
 *     }, [setupEventListeners]);
 * 
 *     // Manual refresh button
 *     const handleRefresh = () => {
 *         refetchCorrespondenceData();
 *     };
 * 
 *     return (
 *         <div>
 *             <div className="flex items-center gap-2 mb-4">
 *                 <Badge variant={isConnected ? "default" : "destructive"}>
 *                     {isConnected ? "Connected" : "Disconnected"}
 *                 </Badge>
 *                 <Button onClick={handleRefresh} variant="outline" size="sm">
 *                     Refresh
 *                 </Button>
 *             </div>
 *             
 *             {/* Your inbox content 
 * </div>
    *     );
 * }
 */ 