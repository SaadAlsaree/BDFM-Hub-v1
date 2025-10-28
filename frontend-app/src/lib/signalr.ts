import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
  HubConnectionState,
  HttpTransportType
} from '@microsoft/signalr';
import { SignalREvents, SignalRConnectionState } from '@/types/notifications';

export class NotificationSignalR {
  private connection: HubConnection | null = null;
  private accessToken: string | null = null;
  private connectionStateCallbacks: ((
    state: SignalRConnectionState
  ) => void)[] = [];
  private reconnectCallbacks: (() => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isDisposed = false;
  private isManualDisconnect = false;
  private startInProgress = false; // Prevent multiple concurrent start attempts

  constructor(accessToken?: string) {
    if (accessToken) {
      this.accessToken = accessToken;
      this.initializeConnection();
    }
  }

  private initializeConnection(): boolean {
    if (!this.accessToken || this.isDisposed) {
      // console.warn('🔔 [SignalR] Cannot initialize - no token or disposed');
      return false;
    }

    // Clean up existing connection
    if (this.connection) {
      this.cleanupConnection();
    }

    // Double-check we're still not disposed after cleanup
    if (this.isDisposed) {
      // console.warn('🔔 [SignalR] Disposed during connection cleanup');
      return false;
    }

    let apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    if (!apiUrl) {
      // console.error('🔔 [SignalR] NEXT_PUBLIC_API_URL is not configured');
      this.notifyConnectionState({
        isConnected: false,
        isConnecting: false,
        error: 'API URL not configured',
        lastReconnectAttempt: new Date()
      });
      return false;
    }

    // Fixed hub URL casing to match backend
    // Normalise apiUrl to avoid double slashes
    apiUrl = apiUrl.replace(/\/+$/g, '');
    const hubUrl = `${apiUrl}/correspondenceHub`;

    // Debug logging for connection URL
    // console.log('🔔 [SignalR] Initializing connection to:', hubUrl);

    // Create the new connection immediately (no null gap)
    this.connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => {
          if (!this.accessToken) {
            console.warn(
              '🔔 [SignalR] Access token not available for SignalR connection'
            );
            return '';
          }
          return this.accessToken;
        },
        // Use LongPolling as primary transport to avoid WebSocket issues
        // LongPolling is more reliable than WebSockets in many environments
        transport: HttpTransportType.LongPolling,
        withCredentials: false,
        // Add timeout configuration
        timeout: 30000,
        // Enable negotiation for proper transport selection
        skipNegotiation: false
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff with jitter: 1s, 2s, 4s, 8s, 16s
          const baseDelay = Math.min(
            1000 * Math.pow(2, retryContext.previousRetryCount),
            16000
          );
          const jitterDelay = baseDelay + Math.random() * 1000; // Add up to 1s jitter
          // console.log(`SignalR reconnect attempt ${retryContext.previousRetryCount + 1} in ${Math.round(jitterDelay)}ms`);
          return jitterDelay;
        }
      })
      .configureLogging(LogLevel.Warning)
      .build();

    this.setupConnectionEvents();
    // console.log('🔔 [SignalR] Connection initialized successfully');
    return true;
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
          'WorkflowStepAssigned',
          'WorkflowStepStatusChanged'
        ];

        events.forEach((eventName) => {
          try {
            this.connection?.off(eventName);
          } catch (error) {
            console.warn(
              `🔔 [SignalR] Error removing listener for ${eventName}:`,
              error
            );
          }
        });

        // Stop the connection if it's not already disconnected
        if (this.connection.state !== HubConnectionState.Disconnected) {
          this.connection.stop().catch((error) => {
            console.warn(
              '🔔 [SignalR] Error stopping connection during cleanup:',
              error
            );
          });
        }
      } catch (error) {
        console.error(
          '🔔 [SignalR] Error cleaning up SignalR connection:',
          error
        );
      } finally {
        // Ensure connection is set to null after cleanup
        this.connection = null;
      }
    }
  }

  private validateConnection(): boolean {
    if (!this.connection) {
      console.error('🔔 [SignalR] Connection is null - cannot proceed');
      return false;
    }

    if (this.isDisposed) {
      console.error('🔔 [SignalR] Instance is disposed - cannot proceed');
      return false;
    }

    // Additional check - if connection exists but is in a bad state, try to reinitialize
    if (this.connection && this.accessToken && !this.isDisposed) {
      const state = this.connection.state;
      if (state === HubConnectionState.Disconnected && this.accessToken) {
        // Connection exists but is disconnected, this is still valid for starting
        return true;
      }
    }

    return true;
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
          const hasPersonalGroup = info.Groups.some((g: string) =>
            g.startsWith(`User_${info.UserId}`)
          );
          const hasModuleGroup = info.Groups.some((g: string) =>
            g.startsWith('Module_')
          );
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
      if (
        !this.isManualDisconnect &&
        !this.isDisposed &&
        !this.isAuthError(error)
      ) {
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

    this.connection.onreconnected(() => {
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

      // Notify reconnect callbacks to re-register event listeners
      this.notifyReconnectCallbacks();
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
    return (
      errorMessage.includes('401') ||
      errorMessage.includes('403') ||
      errorMessage.includes('Unauthorized') ||
      errorMessage.includes('Forbidden') ||
      errorMessage.includes('AuthorizationPolicy')
    );
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private async testEndpointAvailability(): Promise<void> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error('API URL not configured');
    }

    const hubUrl = `${apiUrl.replace(/\/+$/g, '')}/correspondenceHub`;
    const negotiateUrl = `${hubUrl}/negotiate`;

    try {
      console.log('🔔 [SignalR] Testing endpoint availability:', negotiateUrl);

      const response = await fetch(negotiateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('🔔 [SignalR] Endpoint is available and responding');
    } catch (error) {
      // console.error('🔔 [SignalR] Endpoint test failed:', error);
      throw new Error(
        `SignalR endpoint not available: ${(error as Error).message}`
      );
    }
  }

  private async startWithTransportFallback(): Promise<void> {
    const transports = [
      { type: HttpTransportType.LongPolling, name: 'LongPolling' },
      { type: HttpTransportType.WebSockets, name: 'WebSockets' },
      { type: HttpTransportType.ServerSentEvents, name: 'ServerSentEvents' }
    ];

    let lastError: Error | null = null;

    for (const transport of transports) {
      try {
        // console.log(
        //   `🔔 [SignalR] Attempting connection with ${transport.name}...`
        // );

        // Create a new connection with the specific transport
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const hubUrl = `${apiUrl?.replace(/\/+$/g, '')}/correspondenceHub`;

        const testConnection = new HubConnectionBuilder()
          .withUrl(hubUrl, {
            accessTokenFactory: () => this.accessToken || '',
            transport: transport.type,
            withCredentials: false,
            timeout: 15000
          })
          .configureLogging(LogLevel.Warning)
          .build();

        await testConnection.start();

        // console.log(
        //   `🔔 [SignalR] Successfully connected with ${transport.name}`
        // );

        // Stop the test connection and update our main connection
        await testConnection.stop();

        // Update our main connection to use the working transport
        this.updateConnectionTransport(transport.type);
        await this.connection!.start();

        return;
      } catch (error) {
        lastError = error as Error;
        // console.warn(`🔔 [SignalR] ${transport.name} failed:`, error);
      }
    }

    // If all transports failed, throw the last error
    throw lastError || new Error('All transport methods failed');
  }

  private updateConnectionTransport(transport: HttpTransportType): void {
    if (!this.connection) return;

    // We need to recreate the connection with the new transport
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const hubUrl = `${apiUrl?.replace(/\/+$/g, '')}/correspondenceHub`;

    // Clean up existing connection
    this.cleanupConnection();

    // Create new connection with the working transport
    this.connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => this.accessToken || '',
        transport: transport,
        withCredentials: false,
        timeout: 30000,
        skipNegotiation: false
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          const baseDelay = Math.min(
            1000 * Math.pow(2, retryContext.previousRetryCount),
            16000
          );
          const jitterDelay = baseDelay + Math.random() * 1000;
          return jitterDelay;
        }
      })
      .configureLogging(LogLevel.Warning)
      .build();

    this.setupConnectionEvents();
  }

  async start(): Promise<boolean> {
    // First check if we have a valid token and not disposed
    if (!this.accessToken || this.isDisposed) {
      // console.warn('🔔 [SignalR] Cannot start - no token or disposed');
      return false;
    }

    // Prevent concurrent start attempts
    if (this.startInProgress) {
      // console.log('🔔 [SignalR] Start already in progress, skipping...');
      return false;
    }

    this.startInProgress = true;

    try {
      // Initialize connection if it doesn't exist
      if (!this.connection) {
        // console.log('🔔 [SignalR] No connection found, initializing...');
        const initialized = this.initializeConnection();
        if (!initialized) {
          // console.error('🔔 [SignalR] Failed to initialize connection');
          return false;
        }
      }

      // Validate connection after potential initialization
      if (!this.validateConnection()) {
        // console.error('🔔 [SignalR] Connection validation failed');
        return false;
      }

      if (this.connection!.state === HubConnectionState.Connected) {
        // console.log('🔔 [SignalR] Already connected');
        return true;
      }

      if (this.connection!.state === HubConnectionState.Connecting) {
        // console.log('🔔 [SignalR] Connection already in progress');
        return false;
      }
      this.isManualDisconnect = false;
      this.notifyConnectionState({
        isConnected: false,
        isConnecting: true,
        error: null,
        lastReconnectAttempt: null
      });

      // Test endpoint availability before attempting connection
      await this.testEndpointAvailability();

      // Re-validate connection after async endpoint test
      // This is where the race condition often occurs - during the async endpoint test,
      // the component might unmount and dispose the connection
      if (!this.connection) {
        // console.error('🔔 [SignalR] Connection became null during endpoint test');

        // Check if we're disposed (component unmounted)
        if (this.isDisposed) {
          this.notifyConnectionState({
            isConnected: false,
            isConnecting: false,
            error: 'Component unmounted during connection',
            lastReconnectAttempt: new Date()
          });
          return false;
        }

        // Try to reinitialize if we still have a token and not disposed
        if (this.accessToken) {
          const reinitialized = this.initializeConnection();
          if (!reinitialized || !this.connection) {
            this.notifyConnectionState({
              isConnected: false,
              isConnecting: false,
              error: 'Connection lost during initialization',
              lastReconnectAttempt: new Date()
            });
            return false;
          }
        } else {
          this.notifyConnectionState({
            isConnected: false,
            isConnecting: false,
            error: 'No access token available',
            lastReconnectAttempt: new Date()
          });
          return false;
        }
      }

      // Final validation before starting
      if (!this.validateConnection()) {
        this.notifyConnectionState({
          isConnected: false,
          isConnecting: false,
          error: 'Connection validation failed before start',
          lastReconnectAttempt: new Date()
        });
        return false;
      }

      // console.log('🔔 [SignalR] Starting connection...');
      await this.connection!.start();

      // console.log('🔔 [SignalR] Connected successfully');
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
      // console.error('🔔 [SignalR] Connection Error:', error);

      const isAuthError = this.isAuthError(error as Error);

      this.notifyConnectionState({
        isConnected: false,
        isConnecting: false,
        error: isAuthError
          ? 'Authentication required - SignalR unavailable'
          : errorMessage,
        lastReconnectAttempt: new Date()
      });

      // Enhanced error logging for debugging
      // console.error('🔔 [SignalR] Error details:', {
      //   message: (error as any)?.message,
      //   name: (error as any)?.name,
      //   stack: (error as any)?.stack,
      //   isAuthError,
      //   hubUrl: `${process.env.NEXT_PUBLIC_API_URL}/correspondenceHub`,
      //   connectionExists: !!this.connection,
      //   connectionState: this.connection?.state,
      //   isDisposed: this.isDisposed,
      //   hasToken: !!this.accessToken
      // });

      // For auth errors, don't schedule immediate reconnect but allow manual retry
      if (!isAuthError && !this.isDisposed) {
        this.scheduleReconnect();
      } else if (isAuthError) {
        // console.warn(
        //   '🔔 [SignalR] Authentication failed - falling back to polling mode'
        // );
        // Reset reconnect attempts for potential future token refresh
        this.reconnectAttempts = 0;
      }

      return false;
    } finally {
      this.startInProgress = false;
    }
  }

  private scheduleReconnect() {
    if (
      this.isDisposed ||
      this.isManualDisconnect ||
      this.reconnectAttempts >= this.maxReconnectAttempts
    ) {
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

    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      30000
    );
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

    if (
      this.connection &&
      this.connection.state !== HubConnectionState.Disconnected
    ) {
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
    if (!this.validateConnection()) {
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

      this.connection!.on(eventName, wrappedCallback);
      // console.debug(`Registered SignalR event listener for: ${eventName}`);
    } catch (error) {
      // console.error(`Error registering SignalR event listener for ${eventName}:`, error);
    }
  }

  offNotificationEvent<K extends keyof SignalREvents>(
    eventName: K,
    callback: SignalREvents[K]
  ): void {
    if (!this.validateConnection()) return;

    try {
      this.connection!.off(eventName, callback);
      // console.debug(`Removed SignalR event listener for: ${eventName}`);
    } catch (error) {
      // console.error(`Error removing SignalR event listener for ${eventName}:`, error);
    }
  }

  // Connection state management
  onConnectionStateChange(
    callback: (state: SignalRConnectionState) => void
  ): void {
    this.connectionStateCallbacks.push(callback);
  }

  offConnectionStateChange(
    callback: (state: SignalRConnectionState) => void
  ): void {
    const index = this.connectionStateCallbacks.indexOf(callback);
    if (index > -1) {
      this.connectionStateCallbacks.splice(index, 1);
    }
  }

  private notifyConnectionState(state: SignalRConnectionState): void {
    this.connectionStateCallbacks.forEach((callback) => {
      try {
        callback(state);
      } catch (error) {
        // console.error('Error in connection state callback:', error);
      }
    });
  }

  private notifyReconnectCallbacks(): void {
    // console.log('🔔 [SignalR] Notifying reconnect callbacks:', this.reconnectCallbacks.length);
    this.reconnectCallbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        // console.error('Error in reconnect callback:', error);
      }
    });
  }

  // Reconnect callback management
  onReconnected(callback: () => void): void {
    this.reconnectCallbacks.push(callback);
  }

  offReconnected(callback: () => void): void {
    const index = this.reconnectCallbacks.indexOf(callback);
    if (index > -1) {
      this.reconnectCallbacks.splice(index, 1);
    }
  }

  // Utility methods
  get isConnected(): boolean {
    return this.connection?.state === HubConnectionState.Connected;
  }

  get connectionState(): HubConnectionState | null {
    return this.connection?.state || null;
  }

  get disposed(): boolean {
    return this.isDisposed;
  }

  async updateAccessToken(token: string): Promise<void> {
    if (this.isDisposed) return;

    const tokenChanged = this.accessToken !== token;
    this.accessToken = token;
    this.reconnectAttempts = 0; // Reset reconnect attempts with new token

    // If we have an existing connection and token changed, restart it with the new token
    if (this.connection && tokenChanged) {
      // console.log('🔔 [SignalR] Updating access token and reconnecting...');
      try {
        await this.stop();
        // Check if we're still not disposed after stop
        if (!this.isDisposed) {
          // Add small delay to ensure cleanup is complete
          await new Promise(resolve => setTimeout(resolve, 100));

          const initialized = this.initializeConnection();
          if (initialized && !this.isDisposed) {
            await this.start();
          }
        }
      } catch (error) {
        // console.error('🔔 [SignalR] Error during token update reconnection:', error);
      }
    } else if (!this.connection && !this.isDisposed) {
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
    await new Promise((resolve) => setTimeout(resolve, 500));

    return await this.start();
  }

  // Get connection diagnostics
  getConnectionDiagnostics() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const hubUrl = apiUrl
      ? `${apiUrl.replace(/\/+$/g, '')}/correspondenceHub`
      : 'Not configured';

    return {
      isConnected: this.isConnected,
      connectionState: this.connectionState,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      hasToken: !!this.accessToken,
      isDisposed: this.isDisposed,
      hubUrl,
      apiUrl,
      transport: 'LongPolling (WebSocket fallback disabled)'
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
    // console.log('🔔 [SignalR] Disposing SignalR instance');
    this.isDisposed = true;
    this.isManualDisconnect = true;
    this.clearReconnectTimer();
    this.connectionStateCallbacks = [];

    if (this.connection) {
      this.cleanupConnection();
    }

    // Ensure connection is null after disposal
    this.connection = null;
  }
}

// Singleton instance
let signalRInstance: NotificationSignalR | null = null;

export const getSignalRInstance = (
  accessToken?: string
): NotificationSignalR => {
  // If we have an instance but it's disposed, clear it
  if (signalRInstance && signalRInstance.disposed) {
    signalRInstance = null;
  }

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
