import { HubConnection, HubConnectionBuilder, LogLevel, HubConnectionState } from '@microsoft/signalr';
import { SignalREvents, SignalRConnectionState } from '@/types/notifications';

export class NotificationSignalR {
    private connection: HubConnection | null = null;
    private accessToken: string | null = null;
    private connectionStateCallbacks: ((state: SignalRConnectionState) => void)[] = [];
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000; // Start with 1 second
    private reconnectTimer: NodeJS.Timeout | null = null;
    private isDisposed = false;
    private isManualDisconnect = false;

    constructor(accessToken?: string) {
        if (accessToken) {
            this.accessToken = accessToken;
            this.initializeConnection();
        }
    }

    private initializeConnection() {
        if (!this.accessToken || this.isDisposed) return;

        // Clean up existing connection
        if (this.connection) {
            this.cleanupConnection();
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
            console.error('NEXT_PUBLIC_API_URL is not configured');
            this.notifyConnectionState({
                isConnected: false,
                isConnecting: false,
                error: 'API URL not configured',
                lastReconnectAttempt: new Date()
            });
            return;
        }

        // Fixed hub URL casing to match backend
        const hubUrl = `${apiUrl}/correspondenceHub`;

        this.connection = new HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => {
                    if (!this.accessToken) {
                        // console.warn('Access token not available for SignalR connection');
                        return '';
                    }
                    return this.accessToken;
                },
                withCredentials: false
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    // Exponential backoff with jitter: 1s, 2s, 4s, 8s, 16s
                    const baseDelay = Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 16000);
                    const jitterDelay = baseDelay + (Math.random() * 1000); // Add up to 1s jitter
                    // console.log(`SignalR reconnect attempt ${retryContext.previousRetryCount + 1} in ${Math.round(jitterDelay)}ms`);
                    return jitterDelay;
                }
            })
            .configureLogging(LogLevel.Warning)
            .build();

        this.setupConnectionEvents();
    }

    private cleanupConnection() {
        if (this.connection) {
            try {
                // Remove all event listeners to prevent memory leaks
                const events: (keyof SignalREvents)[] = [
                    'CorrespondenceAssignedToModule',
                    'CorrespondenceStatusChangedWithNotification',
                    'WorkflowStepCreated',
                    'CorrespondenceCreated',
                    'CorrespondenceUpdated',
                    'CorrespondenceDeleted',
                    'CorrespondenceStatusChanged',
                    'InboxUpdated',
                    'WorkflowStepCompleted',
                    'WorkflowStepAssigned'
                ];

                events.forEach(eventName => {
                    try {
                        this.connection?.off(eventName);
                    } catch (error) {
                        // console.warn(`Error removing listener for ${eventName}:`, error);
                    }
                });

                // Stop the connection if it's not already disconnected
                if (this.connection.state !== HubConnectionState.Disconnected) {
                    this.connection.stop();
                }
            } catch (error) {
                // console.error('Error cleaning up SignalR connection:', error);
            }
        }
    }

    private setupConnectionEvents() {
        if (!this.connection) return;

        // Handle server-side connection errors
        this.connection.on('ConnectionError', (errorInfo: any) => {
            // console.error('SignalR Connection Error from server:', errorInfo);
            this.notifyConnectionState({
                isConnected: false,
                isConnecting: false,
                error: `Server error: ${errorInfo.Error || errorInfo}`,
                lastReconnectAttempt: new Date()
            });
        });

        // Handle connection info for debugging
        this.connection.on('ConnectionInfo', (info: any) => {
            // console.log('🔔 [SignalR] Connection Info received:', JSON.stringify(info, null, 2));

            // Store connection info for debugging and log key details
            (window as any).signalRConnectionInfo = info;

            if (info.IsAuthenticated) {
                // console.log(`🔔 [SignalR] ✅ User authenticated: ${info.UserName} (${info.UserId})`);
                // console.log(`🔔 [SignalR] 🏢 Organization Unit: ${info.OrganizationalUnitId || 'None'}`);
                // console.log(`🔔 [SignalR] 👥 Joined Groups: ${info.Groups?.join(', ') || 'None'}`);
                // console.log(`🔔 [SignalR] 🔑 Auth Source: ${info.AuthenticationSource}`);

                if (info.Groups && Array.isArray(info.Groups)) {
                    const hasPersonalGroup = info.Groups.some((g: string) => g.startsWith(`User_${info.UserId}`));
                    const hasModuleGroup = info.Groups.some((g: string) => g.startsWith('Module_'));
                    const hasGeneralGroup = info.Groups.includes('CorrespondenceUpdates');

                    if (!hasPersonalGroup) {
                        // console.warn('🔔 [SignalR] ⚠️ User not in personal group - targeted notifications may not work');
                    }
                    if (!hasModuleGroup && info.OrganizationalUnitId) {
                        // console.warn('🔔 [SignalR] ⚠️ User not in module group despite having organizational unit');
                    }
                    if (!hasGeneralGroup) {
                        // console.warn('🔔 [SignalR] ⚠️ User not in general updates group');
                    }

                    if (hasPersonalGroup && hasGeneralGroup) {
                        // console.log('🔔 [SignalR] ✅ User properly configured for notifications');
                    }
                }
            } else {
                // console.warn('🔔 [SignalR] ❌ User not authenticated - this may cause notification issues');
                // console.log(`🔔 [SignalR] 🔍 Debug Info:`, info.DebugInfo);

                if (info.Error) {
                    // console.error(`🔔 [SignalR] Error: ${info.Error}`);
                }
            }
        });

        this.connection.onclose((error) => {
            // console.warn('SignalR connection closed:', error);

            const errorMessage = this.parseConnectionError(error);

            this.notifyConnectionState({
                isConnected: false,
                isConnecting: false,
                error: errorMessage,
                lastReconnectAttempt: new Date()
            });

            // Only attempt reconnection if it wasn't a manual disconnect and we're not disposed
            if (!this.isManualDisconnect && !this.isDisposed && !this.isAuthError(error)) {
                this.scheduleReconnect();
            }
        });

        this.connection.onreconnecting((error) => {
            // console.log('SignalR reconnecting:', error);
            this.notifyConnectionState({
                isConnected: false,
                isConnecting: true,
                error: error?.message || null,
                lastReconnectAttempt: new Date()
            });
        });

        this.connection.onreconnected((connectionId) => {
            // console.log('SignalR reconnected:', connectionId);
            this.reconnectAttempts = 0;
            this.isManualDisconnect = false;
            this.clearReconnectTimer();
            this.notifyConnectionState({
                isConnected: true,
                isConnecting: false,
                error: null,
                lastReconnectAttempt: null
            });

            // Request connection info after successful connection
            this.requestConnectionInfo();
        });
    }

    private parseConnectionError(error: Error | undefined): string {
        if (!error) return 'Connection closed unexpectedly';

        const errorMessage = error.message || error.toString();

        // Check for common error patterns
        if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
            return 'Authentication required - please refresh the page';
        }

        if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
            return 'Access denied - insufficient permissions';
        }

        if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
            return 'SignalR hub not found - service may be unavailable';
        }

        if (errorMessage.includes('Failed to complete negotiation')) {
            return 'Failed to establish connection - check network connectivity';
        }

        if (errorMessage.includes('Network')) {
            return 'Network connection lost';
        }

        return errorMessage || 'Connection error occurred';
    }

    private isAuthError(error: Error | undefined): boolean {
        if (!error) return false;

        const errorMessage = error.message || error.toString();
        return errorMessage.includes('401') ||
            errorMessage.includes('403') ||
            errorMessage.includes('Unauthorized') ||
            errorMessage.includes('Forbidden') ||
            errorMessage.includes('AuthorizationPolicy');
    }

    private clearReconnectTimer() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    async start(): Promise<boolean> {
        if (this.isDisposed) {
            // console.warn('SignalR instance is disposed');
            return false;
        }

        if (!this.connection) {
            //      console.error('SignalR connection not initialized');
            return false;
        }

        if (this.connection.state === HubConnectionState.Connected) {
            return true;
        }

        if (this.connection.state === HubConnectionState.Connecting) {
            // console.log('SignalR connection already in progress');
            return false;
        }

        try {
            this.isManualDisconnect = false;
            this.notifyConnectionState({
                isConnected: false,
                isConnecting: true,
                error: null,
                lastReconnectAttempt: null
            });

            await this.connection.start();

            // console.log('SignalR Connected successfully');
            this.reconnectAttempts = 0;
            this.clearReconnectTimer();

            this.notifyConnectionState({
                isConnected: true,
                isConnecting: false,
                error: null,
                lastReconnectAttempt: null
            });

            return true;
        } catch (error) {
            const errorMessage = this.parseConnectionError(error as Error);
            // console.error('SignalR Connection Error:', error);

            const isAuthError = this.isAuthError(error as Error);

            this.notifyConnectionState({
                isConnected: false,
                isConnecting: false,
                error: isAuthError ? 'Authentication required - SignalR unavailable' : errorMessage,
                lastReconnectAttempt: new Date()
            });

            // For auth errors, don't schedule immediate reconnect but allow manual retry
            if (!isAuthError && !this.isDisposed) {
                this.scheduleReconnect();
            } else if (isAuthError) {
                // console.warn('SignalR authentication failed - falling back to polling mode');
                // Reset reconnect attempts for potential future token refresh
                this.reconnectAttempts = 0;
            }

            return false;
        }
    }

    private scheduleReconnect() {
        if (this.isDisposed || this.isManualDisconnect || this.reconnectAttempts >= this.maxReconnectAttempts) {
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                // console.error('Max reconnection attempts reached');
                this.notifyConnectionState({
                    isConnected: false,
                    isConnecting: false,
                    error: 'Max reconnection attempts reached - manual retry required',
                    lastReconnectAttempt: new Date()
                });
            }
            return;
        }

        this.clearReconnectTimer();

        const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 30000);
        this.reconnectAttempts++;

        this.reconnectTimer = setTimeout(() => {
            if (!this.isDisposed && !this.isManualDisconnect) {
                // console.log(`Attempting SignalR reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                this.start();
            }
        }, delay);
    }

    async stop(): Promise<void> {
        this.isManualDisconnect = true;
        this.clearReconnectTimer();

        if (this.connection && this.connection.state !== HubConnectionState.Disconnected) {
            try {
                await this.connection.stop();
                // console.log('SignalR connection stopped');
            } catch (error) {
                // console.error('Error stopping SignalR connection:', error);
            }
        }
    }

    // Event listeners with improved error handling
    onNotificationEvent<K extends keyof SignalREvents>(
        eventName: K,
        callback: SignalREvents[K]
    ): void {
        if (!this.connection) {
            // console.warn('Cannot register event listener: SignalR connection not initialized');
            return;
        }

        try {
            // Wrap callback with error handling
            const wrappedCallback = (data: any) => {
                try {
                    callback(data);
                } catch (error) {
                    // console.error(`Error in SignalR event handler for ${eventName}:`, error);
                }
            };

            this.connection.on(eventName, wrappedCallback);
            // console.debug(`Registered SignalR event listener for: ${eventName}`);
        } catch (error) {
            // console.error(`Error registering SignalR event listener for ${eventName}:`, error);
        }
    }

    offNotificationEvent<K extends keyof SignalREvents>(
        eventName: K,
        callback: SignalREvents[K]
    ): void {
        if (!this.connection) return;

        try {
            this.connection.off(eventName, callback);
            // console.debug(`Removed SignalR event listener for: ${eventName}`);
        } catch (error) {
            // console.error(`Error removing SignalR event listener for ${eventName}:`, error);
        }
    }

    // Connection state management
    onConnectionStateChange(callback: (state: SignalRConnectionState) => void): void {
        this.connectionStateCallbacks.push(callback);
    }

    offConnectionStateChange(callback: (state: SignalRConnectionState) => void): void {
        const index = this.connectionStateCallbacks.indexOf(callback);
        if (index > -1) {
            this.connectionStateCallbacks.splice(index, 1);
        }
    }

    private notifyConnectionState(state: SignalRConnectionState): void {
        this.connectionStateCallbacks.forEach(callback => {
            try {
                callback(state);
            } catch (error) {
                // console.error('Error in connection state callback:', error);
            }
        });
    }

    // Utility methods
    get isConnected(): boolean {
        return this.connection?.state === HubConnectionState.Connected;
    }

    get connectionState(): HubConnectionState | null {
        return this.connection?.state || null;
    }

    updateAccessToken(token: string): void {
        if (this.isDisposed) return;

        const tokenChanged = this.accessToken !== token;
        this.accessToken = token;
        this.reconnectAttempts = 0; // Reset reconnect attempts with new token

        // If we have an existing connection and token changed, restart it with the new token
        if (this.connection && tokenChanged) {
            // console.log('Updating SignalR access token and reconnecting...');
            this.stop().then(() => {
                if (!this.isDisposed) {
                    this.initializeConnection();
                    this.start();
                }
            }).catch(error => {
                // console.error('Error during token update reconnection:', error);
            });
        } else if (!this.connection) {
            this.initializeConnection();
        }
    }

    // Force reconnection (useful for manual retry after auth errors)
    async forceReconnect(): Promise<boolean> {
        if (this.isDisposed) return false;

        // console.log('Force reconnecting SignalR...');
        this.reconnectAttempts = 0; // Reset attempts for forced reconnection
        this.isManualDisconnect = false;

        await this.stop();

        // Give a small delay before reconnecting
        await new Promise(resolve => setTimeout(resolve, 500));

        return await this.start();
    }

    // Get connection diagnostics
    getConnectionDiagnostics() {
        return {
            isConnected: this.isConnected,
            connectionState: this.connectionState,
            reconnectAttempts: this.reconnectAttempts,
            maxReconnectAttempts: this.maxReconnectAttempts,
            hasToken: !!this.accessToken,
            isDisposed: this.isDisposed
        };
    }

    private async requestConnectionInfo(): Promise<void> {
        if (this.connection && this.isConnected) {
            try {
                await this.connection.invoke('GetConnectionInfo');
            } catch (error) {
                // console.warn('Failed to request connection info:', error);
            }
        }
    }

    // Cleanup
    dispose(): void {
        // console.log('Disposing SignalR instance');
        this.isDisposed = true;
        this.isManualDisconnect = true;
        this.clearReconnectTimer();
        this.connectionStateCallbacks = [];

        if (this.connection) {
            this.cleanupConnection();
            this.connection = null;
        }
    }
}

// Singleton instance
let signalRInstance: NotificationSignalR | null = null;

export const getSignalRInstance = (accessToken?: string): NotificationSignalR => {
    if (!signalRInstance) {
        signalRInstance = new NotificationSignalR(accessToken);
    } else if (accessToken) {
        signalRInstance.updateAccessToken(accessToken);
    }

    return signalRInstance;
};

export const disposeSignalRInstance = (): void => {
    if (signalRInstance) {
        signalRInstance.dispose();
        signalRInstance = null;
    }
}; 