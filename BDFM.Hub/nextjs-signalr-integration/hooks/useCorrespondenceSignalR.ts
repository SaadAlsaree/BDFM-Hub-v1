import { useEffect, useRef, useCallback } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

interface CorrespondenceNotification {
    type: string;
    correspondenceId?: string;
    newStatus?: string;
    message: string;
    timestamp: string;
}

interface UseCorrespondenceSignalRProps {
    accessToken: string | null;
    onInboxUpdate?: () => void;
    onCorrespondenceCreated?: (notification: CorrespondenceNotification) => void;
    onCorrespondenceUpdated?: (notification: CorrespondenceNotification) => void;
    onCorrespondenceDeleted?: (notification: CorrespondenceNotification) => void;
    onCorrespondenceStatusChanged?: (notification: CorrespondenceNotification) => void;
}

export const useCorrespondenceSignalR = ({
    accessToken,
    onInboxUpdate,
    onCorrespondenceCreated,
    onCorrespondenceUpdated,
    onCorrespondenceDeleted,
    onCorrespondenceStatusChanged,
}: UseCorrespondenceSignalRProps) => {
    const connectionRef = useRef<HubConnection | null>(null);
    const isConnectedRef = useRef(false);

    const startConnection = useCallback(async () => {
        // Only run on client side
        if (typeof window === 'undefined' || !accessToken) return;

        try {
            const connection = new HubConnectionBuilder()
                .withUrl(`${process.env.NEXT_PUBLIC_API_URL}/correspondencehub`, {
                    accessTokenFactory: () => accessToken,
                    withCredentials: true,
                })
                .withAutomaticReconnect([0, 2000, 10000, 30000])
                .configureLogging(LogLevel.Information)
                .build();

            // Set up event handlers
            connection.on('InboxUpdated', (notification: CorrespondenceNotification) => {
                console.log('📬 Inbox updated:', notification);
                onInboxUpdate?.();
            });

            connection.on('CorrespondenceCreated', (notification: CorrespondenceNotification) => {
                console.log('✉️ New correspondence:', notification);
                onCorrespondenceCreated?.(notification);
                onInboxUpdate?.(); // Also refresh inbox
            });

            connection.on('CorrespondenceUpdated', (notification: CorrespondenceNotification) => {
                console.log('📝 Correspondence updated:', notification);
                onCorrespondenceUpdated?.(notification);
                onInboxUpdate?.(); // Also refresh inbox
            });

            connection.on('CorrespondenceDeleted', (notification: CorrespondenceNotification) => {
                console.log('🗑️ Correspondence deleted:', notification);
                onCorrespondenceDeleted?.(notification);
                onInboxUpdate?.(); // Also refresh inbox
            });

            connection.on('CorrespondenceStatusChanged', (notification: CorrespondenceNotification) => {
                console.log('🔄 Status changed:', notification);
                onCorrespondenceStatusChanged?.(notification);
                onInboxUpdate?.(); // Also refresh inbox
            });

            // Handle connection events
            connection.onreconnecting(() => {
                console.log('🔄 SignalR reconnecting...');
                isConnectedRef.current = false;
            });

            connection.onreconnected(() => {
                console.log('✅ SignalR reconnected');
                isConnectedRef.current = true;
            });

            connection.onclose(() => {
                console.log('❌ SignalR connection closed');
                isConnectedRef.current = false;
            });

            await connection.start();
            connectionRef.current = connection;
            isConnectedRef.current = true;
            console.log('🚀 SignalR connected to CorrespondenceHub');
        } catch (error) {
            console.error('❌ SignalR connection error:', error);
        }
    }, [accessToken, onInboxUpdate, onCorrespondenceCreated, onCorrespondenceUpdated, onCorrespondenceDeleted, onCorrespondenceStatusChanged]);

    const stopConnection = useCallback(async () => {
        if (connectionRef.current) {
            try {
                await connectionRef.current.stop();
                console.log('🛑 SignalR connection stopped');
            } catch (error) {
                console.error('❌ Error stopping SignalR connection:', error);
            } finally {
                connectionRef.current = null;
                isConnectedRef.current = false;
            }
        }
    }, []);

    const joinCorrespondenceGroup = useCallback(async (correspondenceId: string) => {
        if (connectionRef.current && isConnectedRef.current) {
            try {
                await connectionRef.current.invoke('JoinCorrespondenceGroup', correspondenceId);
                console.log(`📌 Joined correspondence group: ${correspondenceId}`);
            } catch (error) {
                console.error('❌ Error joining correspondence group:', error);
            }
        }
    }, []);

    const leaveCorrespondenceGroup = useCallback(async (correspondenceId: string) => {
        if (connectionRef.current && isConnectedRef.current) {
            try {
                await connectionRef.current.invoke('LeaveCorrespondenceGroup', correspondenceId);
                console.log(`📌 Left correspondence group: ${correspondenceId}`);
            } catch (error) {
                console.error('❌ Error leaving correspondence group:', error);
            }
        }
    }, []);

    useEffect(() => {
        startConnection();

        return () => {
            stopConnection();
        };
    }, [startConnection, stopConnection]);

    return {
        isConnected: isConnectedRef.current,
        joinCorrespondenceGroup,
        leaveCorrespondenceGroup,
        reconnect: startConnection,
    };
}; 