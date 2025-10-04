'use client';

import { useState, useEffect } from 'react';
import { useSignalR } from '@/hooks/useSignalR';
import { useNotifications } from '@/hooks/useNotifications';
import { useCorrespondenceSignalR } from '@/hooks/useCorrespondenceSignalR';

interface SignalRDebugPanelProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  visible?: boolean;
}

export function SignalRDebugPanel({
  position = 'top-right',
  visible = true
}: SignalRDebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<any>(null);

  const signalR = useSignalR();
  const notifications = useNotifications();
  const correspondence = useCorrespondenceSignalR({ debugMode: true });

  useEffect(() => {
    // Listen for connection info updates
    const checkConnectionInfo = () => {
      const info = (window as any).signalRConnectionInfo;
      if (info) {
        setConnectionInfo(info);
      }
    };

    const interval = setInterval(checkConnectionInfo, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleTestConnection = async () => {
    console.log('🔔 [Debug] Testing SignalR connection...');
    const result = await signalR.testConnection();
    console.log('🔔 [Debug] Connection test result:', result);
  };

  const handleGetDiagnostics = () => {
    console.log('🔔 [Debug] Getting connection diagnostics...');
    const diagnostics = signalR.getConnectionDiagnostics();
    console.log('🔔 [Debug] Diagnostics:', diagnostics);
  };

  const handleRequestConnectionInfo = async () => {
    console.log('🔔 [Debug] Requesting connection info...');
    try {
      // This will trigger the backend to send ConnectionInfo event
      await fetch('/api/test/inbox-update', { method: 'POST' });
      console.log(
        '🔔 [Debug] Connection info request sent - check console for response'
      );
    } catch (error) {
      console.error('🔔 [Debug] Failed to request connection info:', error);
    }
  };

  const handleTestNotifications = async () => {
    console.log('🔔 [Debug] Testing notifications...');
    const userId = connectionInfo?.UserId;
    const orgUnitId = connectionInfo?.OrganizationalUnitId;

    if (!userId) {
      console.error('🔔 [Debug] No user ID available for testing');
      return;
    }

    try {
      const response = await fetch(
        `/api/test/debug-signalr-groups?testUserId=${userId}${orgUnitId ? `&testOrgUnitId=${orgUnitId}` : ''}`,
        { method: 'POST' }
      );
      const result = await response.json();
      console.log('🔔 [Debug] Notification test results:', result);
    } catch (error) {
      console.error('🔔 [Debug] Failed to test notifications:', error);
    }
  };

  if (!visible) return null;

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-[9999] max-w-sm rounded-lg border border-gray-300 bg-white shadow-lg`}
    >
      <div
        className='flex cursor-pointer items-center justify-between rounded-t-lg bg-blue-500 p-3 text-white'
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className='font-medium'>🔔 SignalR Debug</span>
        <span className='text-sm'>{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <div className='space-y-3 p-4'>
          {/* Connection Status */}
          <div className='text-sm'>
            <div className='mb-1 font-medium'>Connection Status:</div>
            <div
              className={`flex items-center space-x-2 ${signalR.isConnected ? 'text-green-600' : 'text-red-600'}`}
            >
              <span>{signalR.isConnected ? '✅' : '❌'}</span>
              <span>{signalR.isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            {signalR.error && (
              <div className='mt-1 text-xs text-red-500'>
                Error: {signalR.error}
              </div>
            )}
          </div>

          {/* Connection Info */}
          {connectionInfo && (
            <div className='text-sm'>
              <div className='mb-1 font-medium'>User Info:</div>
              <div className='space-y-1 text-xs'>
                <div>
                  User: {connectionInfo.UserName} ({connectionInfo.UserId})
                </div>
                <div>
                  Org Unit: {connectionInfo.OrganizationalUnitId || 'None'}
                </div>
                <div>Auth: {connectionInfo.AuthenticationSource}</div>
                <div>Groups: {connectionInfo.Groups?.join(', ') || 'None'}</div>
              </div>
            </div>
          )}

          {/* Notification Stats */}
          <div className='text-sm'>
            <div className='mb-1 font-medium'>Notifications:</div>
            <div className='text-xs'>
              <div>Unread: {notifications.unreadCount}</div>
              <div>Total: {notifications.totalCount}</div>
              <div>
                Available: {notifications.isSignalRAvailable ? 'Yes' : 'No'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='space-y-2'>
            <button
              onClick={handleTestConnection}
              className='w-full rounded bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600'
            >
              Test Connection
            </button>

            <button
              onClick={handleGetDiagnostics}
              className='w-full rounded bg-gray-500 px-3 py-1 text-xs text-white hover:bg-gray-600'
            >
              Get Diagnostics
            </button>

            <button
              onClick={handleRequestConnectionInfo}
              className='w-full rounded bg-green-500 px-3 py-1 text-xs text-white hover:bg-green-600'
            >
              Request Connection Info
            </button>

            <button
              onClick={handleTestNotifications}
              className='w-full rounded bg-purple-500 px-3 py-1 text-xs text-white hover:bg-purple-600'
              disabled={!connectionInfo?.UserId}
            >
              Test Notifications
            </button>
          </div>

          <div className='mt-2 text-xs text-gray-500'>
            Check browser console for detailed logs with 🔔 emoji
          </div>
        </div>
      )}
    </div>
  );
}
