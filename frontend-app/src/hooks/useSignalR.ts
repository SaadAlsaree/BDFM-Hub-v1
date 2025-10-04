'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getSignalRInstance, disposeSignalRInstance } from '@/lib/signalr';
import { SignalREvents, SignalRConnectionState } from '@/types/notifications';

export function useSignalR() {
    const { data: session, status } = useSession();
    const signalRRef = useRef<ReturnType<typeof getSignalRInstance> | null>(null);
    const [connectionState, setConnectionState] = useState<SignalRConnectionState>({
        isConnected: false,
        isConnecting: false,
        error: null,
        lastReconnectAttempt: null
    });
    const previousTokenRef = useRef<string | null>(null);
    const connectionStateHandlerRef = useRef<((state: SignalRConnectionState) => void) | null>(null);

    // Initialize connection when session is available
    useEffect(() => {
        // Handle session loading state
        if (status === 'loading') {
            return;
        }
        // console.log(useSession)

        // Handle session error (token expired or invalid)
        if (session?.error === 'RefreshAccessTokenError' || session?.error) {
            // console.warn('Session error detected, disposing SignalR connection:', session.error);
            if (signalRRef.current) {
                // Clean up previous connection state handler
                if (connectionStateHandlerRef.current) {
                    signalRRef.current.offConnectionStateChange(connectionStateHandlerRef.current);
                    connectionStateHandlerRef.current = null;
                }

                signalRRef.current.dispose();
                signalRRef.current = null;
            }

            setConnectionState({
                isConnected: false,
                isConnecting: false,
                error: 'Session expired - please refresh the page',
                lastReconnectAttempt: new Date()
            });

            previousTokenRef.current = null;
            return;
        }

        // Handle valid session with token
        if (session?.accessToken) {
            const currentToken = session.accessToken;

            // Check if token has changed or if we don't have a SignalR instance
            if (previousTokenRef.current !== currentToken || !signalRRef.current) {
                // console.log('🔔 [useSignalR] Session token changed or SignalR instance missing, updating connection');

                // Clean up previous connection state handler if exists
                if (connectionStateHandlerRef.current && signalRRef.current) {
                    signalRRef.current.offConnectionStateChange(connectionStateHandlerRef.current);
                    connectionStateHandlerRef.current = null;
                }

                // Update token reference
                previousTokenRef.current = currentToken;

                // Get or create SignalR instance
                const signalR = getSignalRInstance(currentToken);
                signalRRef.current = signalR;

                // Set up connection state listener
                const handleConnectionStateChange = (state: SignalRConnectionState) => {
                    // console.log('🔔 [useSignalR] SignalR connection state changed:', state);
                    setConnectionState(state);

                    // Log additional diagnostics when connected
                    if (state.isConnected) {
                        // console.log('🔔 [useSignalR] Successfully connected to SignalR hub');
                    }
                };

                connectionStateHandlerRef.current = handleConnectionStateChange;
                signalR.onConnectionStateChange(handleConnectionStateChange);

                // Start connection with error handling
                signalR.start().catch(error => {
                    // console.error('🔔 [useSignalR] Failed to start SignalR connection:', error);
                    setConnectionState({
                        isConnected: false,
                        isConnecting: false,
                        error: error?.message || 'Failed to connect',
                        lastReconnectAttempt: new Date()
                    });
                });
            }
        } else if (status === 'unauthenticated') {
            // Clean up when user is not authenticated
            // console.log('🔔 [useSignalR] User unauthenticated, cleaning up SignalR connection');

            if (connectionStateHandlerRef.current && signalRRef.current) {
                signalRRef.current.offConnectionStateChange(connectionStateHandlerRef.current);
                connectionStateHandlerRef.current = null;
            }

            if (signalRRef.current) {
                signalRRef.current.dispose();
                signalRRef.current = null;
            }

            previousTokenRef.current = null;
            setConnectionState({
                isConnected: false,
                isConnecting: false,
                error: 'Not authenticated',
                lastReconnectAttempt: null
            });
        }

        // Cleanup function
        return () => {
            if (connectionStateHandlerRef.current && signalRRef.current) {
                signalRRef.current.offConnectionStateChange(connectionStateHandlerRef.current);
                connectionStateHandlerRef.current = null;
            }
        };
    }, [session?.accessToken, session?.error, status]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // console.log('useSignalR unmounting, disposing SignalR instance');

            if (connectionStateHandlerRef.current && signalRRef.current) {
                signalRRef.current.offConnectionStateChange(connectionStateHandlerRef.current);
                connectionStateHandlerRef.current = null;
            }

            disposeSignalRInstance();
            previousTokenRef.current = null;
        };
    }, []);

    // Event subscription methods with improved error handling
    const onNotificationEvent = useCallback(<K extends keyof SignalREvents>(
        eventName: K,
        callback: SignalREvents[K]
    ) => {
        if (signalRRef.current) {
            try {
                signalRRef.current.onNotificationEvent(eventName, callback);
                // console.debug(`Subscribed to SignalR event: ${eventName}`);
            } catch (error) {
                // console.error(`Error subscribing to SignalR event ${eventName}:`, error);
            }
        } else {
            // console.warn('SignalR not available for event subscription:', eventName);
        }
    }, []);

    const offNotificationEvent = useCallback(<K extends keyof SignalREvents>(
        eventName: K,
        callback: SignalREvents[K]
    ) => {
        if (signalRRef.current) {
            try {
                signalRRef.current.offNotificationEvent(eventName, callback);
                // console.debug(`Unsubscribed from SignalR event: ${eventName}`);
            } catch (error) {
                // console.error(`Error unsubscribing from SignalR event ${eventName}:`, error);
            }
        }
    }, []);

    // Connection control methods
    const connect = useCallback(async () => {
        if (signalRRef.current && session?.accessToken && !session.error) {
            try {
                const result = await signalRRef.current.start();
                // console.log('SignalR connection result:', result);
                return result;
            } catch (error) {
                // console.error('Error connecting to SignalR:', error);
                return false;
            }
        }
        // console.warn('Cannot connect: SignalR not available or session invalid');
        return false;
    }, [session?.accessToken, session?.error]);

    const disconnect = useCallback(async () => {
        if (signalRRef.current) {
            try {
                await signalRRef.current.stop();
                // console.log('SignalR disconnected successfully');
            } catch (error) {
                // console.error('Error disconnecting SignalR:', error);
            }
        }
    }, []);

    const reconnect = useCallback(async () => {
        if (signalRRef.current && session?.accessToken && !session.error) {
            try {
                const result = await signalRRef.current.forceReconnect();
                // console.log('SignalR reconnection result:', result);
                return result;
            } catch (error) {
                // console.error('Error reconnecting SignalR:', error);
                return false;
            }
        }
        // console.warn('Cannot reconnect: SignalR not available or session invalid');
        return false;
    }, [session?.accessToken, session?.error]);

    // Check if SignalR is available (not in auth error state)
    const isSignalRAvailable = useCallback(() => {
        return !!(session?.accessToken && !session.error && signalRRef.current);
    }, [session?.accessToken, session?.error]);

    // Get connection diagnostics
    const getConnectionDiagnostics = useCallback(() => {
        // Get base diagnostics from SignalR instance first
        const signalRDiagnostics = signalRRef.current ? signalRRef.current.getConnectionDiagnostics() : {
            reconnectAttempts: 0,
            maxReconnectAttempts: 0
        };

        const diagnostics = {
            // Additional diagnostics from SignalR instance
            ...signalRDiagnostics,

            // Override/add connection state info from our hook
            isConnected: connectionState.isConnected,
            isConnecting: connectionState.isConnecting,
            error: connectionState.error,
            lastReconnectAttempt: connectionState.lastReconnectAttempt,

            // Session info
            hasToken: !!session?.accessToken,
            tokenLength: session?.accessToken?.length || 0,
            sessionStatus: status,
            sessionError: session?.error,

            // SignalR instance info
            hasSignalRInstance: !!signalRRef.current,
            isDisposed: !signalRRef.current,
        };

        // console.log('🔔 [useSignalR] Connection Diagnostics:', JSON.stringify(diagnostics, null, 2));
        return diagnostics;
    }, [session?.accessToken, status, session?.error, connectionState]);

    // Helper function to test SignalR connection and troubleshoot issues
    const testConnection = useCallback(async () => {
        // console.log('🔔 [useSignalR] Starting connection test...');
        const diagnostics = getConnectionDiagnostics();

        if (!session?.accessToken) {
            // console.error('🔔 [useSignalR] Test failed: No access token available');
            return false;
        }

        if (session.error) {
            //      console.error('🔔 [useSignalR] Test failed: Session error:', session.error);
            return false;
        }

        if (!signalRRef.current) {
            // console.error('🔔 [useSignalR] Test failed: No SignalR instance');
            return false;
        }

        if (!connectionState.isConnected) {
            // console.log('🔔 [useSignalR] Not connected, attempting to connect...');
            try {
                const result = await connect();
                // console.log('🔔 [useSignalR] Connection attempt result:', result);
                return result;
            } catch (error) {
                // console.error('🔔 [useSignalR] Connection attempt failed:', error);
                return false;
            }
        }

        // console.log('🔔 [useSignalR] Connection test passed - already connected');
        return true;
    }, [session?.accessToken, session?.error, connectionState.isConnected, getConnectionDiagnostics, connect]);

    return {
        connectionState,
        isConnected: connectionState.isConnected,
        isConnecting: connectionState.isConnecting,
        error: connectionState.error,
        isSignalRAvailable: isSignalRAvailable(),
        onNotificationEvent,
        offNotificationEvent,
        connect,
        disconnect,
        reconnect,
        getConnectionDiagnostics,
        testConnection
    };
} 