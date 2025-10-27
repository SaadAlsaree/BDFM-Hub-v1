'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getSignalRInstance } from '@/lib/signalr';

export function SignalRConnectionTester() {
  const { data: session } = useSession();
  const [connectionState, setConnectionState] = useState<any>(null);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const addTestResult = (message: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`
    ]);
  };

  const testConnection = async () => {
    setIsTesting(true);
    setTestResults([]);

    try {
      addTestResult('Starting SignalR connection test...');

      // Check environment variables
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      addTestResult(`API URL: ${apiUrl || 'NOT SET'}`);

      if (!apiUrl) {
        addTestResult('❌ NEXT_PUBLIC_API_URL is not configured');
        return;
      }

      // Check if user is authenticated
      if (!session?.accessToken) {
        addTestResult('❌ No access token available');
        return;
      }

      addTestResult(
        `✅ User authenticated: ${session.user?.name || 'Unknown'}`
      );

      // Test endpoint availability
      const hubUrl = `${apiUrl.replace(/\/+$/g, '')}/correspondenceHub`;
      const negotiateUrl = `${hubUrl}/negotiate`;

      addTestResult(`Testing endpoint: ${negotiateUrl}`);

      try {
        const response = await fetch(negotiateUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.accessToken}`
          },
          signal: AbortSignal.timeout(10000)
        });

        if (response.ok) {
          addTestResult('✅ Endpoint is accessible');
        } else {
          addTestResult(
            `❌ Endpoint returned ${response.status}: ${response.statusText}`
          );
        }
      } catch (error) {
        addTestResult(`❌ Endpoint test failed: ${(error as Error).message}`);
      }

      // Test SignalR connection
      addTestResult('Attempting SignalR connection...');
      const signalR = getSignalRInstance(session.accessToken);

      // Show connection diagnostics
      const diagnostics = signalR.getConnectionDiagnostics();
      addTestResult(`Diagnostics: ${JSON.stringify(diagnostics, null, 2)}`);

      // Set up connection state listener
      signalR.onConnectionStateChange((state) => {
        setConnectionState(state);
        addTestResult(`Connection state: ${JSON.stringify(state)}`);
      });

      const connected = await signalR.start();

      if (connected) {
        addTestResult('✅ SignalR connected successfully');
        addTestResult(`Transport: ${diagnostics.transport}`);
      } else {
        addTestResult('❌ SignalR connection failed');
      }
    } catch (error) {
      addTestResult(`❌ Test failed: ${(error as Error).message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setConnectionState(null);
  };

  return (
    <div className='fixed right-4 bottom-4 max-h-96 max-w-md overflow-auto rounded-lg border border-gray-300 bg-white p-4 shadow-lg'>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>SignalR Connection Tester</h3>
        <div className='flex gap-2'>
          <button
            onClick={testConnection}
            disabled={isTesting}
            className='rounded bg-blue-500 px-3 py-1 text-sm text-white disabled:opacity-50'
          >
            {isTesting ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            onClick={clearResults}
            className='rounded bg-gray-500 px-3 py-1 text-sm text-white'
          >
            Clear
          </button>
        </div>
      </div>

      {connectionState && (
        <div className='mb-4 rounded bg-gray-100 p-2'>
          <h4 className='font-medium'>Connection State:</h4>
          <div className='text-sm'>
            <div>Connected: {connectionState.isConnected ? '✅' : '❌'}</div>
            <div>Connecting: {connectionState.isConnecting ? '🔄' : '⏸️'}</div>
            {connectionState.error && (
              <div className='text-red-600'>Error: {connectionState.error}</div>
            )}
          </div>
        </div>
      )}

      <div className='space-y-1'>
        <h4 className='font-medium'>Test Results:</h4>
        <div className='max-h-48 overflow-auto font-mono text-sm'>
          {testResults.length === 0 ? (
            <div className='text-gray-500'>
              Click &quot;Test Connection&quot; to start
            </div>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className='mb-1'>
                {result}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
