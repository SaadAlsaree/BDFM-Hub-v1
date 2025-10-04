'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useSignalR } from '@/hooks/useSignalR';
import { toast } from 'sonner';

interface NotificationTesterProps {
  position?: 'top' | 'bottom';
  visible?: boolean;
}

export function NotificationTester({
  position = 'bottom',
  visible = true
}: NotificationTesterProps) {
  const [testUserId, setTestUserId] = useState('');
  const [testOrgUnitId, setTestOrgUnitId] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const { isConnected, getConnectionDiagnostics } = useSignalR();

  const handleTestNotifications = async () => {
    if (!testUserId.trim()) {
      toast.error('Please enter a test user ID');
      return;
    }

    setIsTesting(true);
    try {
      console.log('🔔 [NotificationTester] Testing notifications...');

      const params = new URLSearchParams({
        testUserId: testUserId.trim()
      });

      if (testOrgUnitId.trim()) {
        params.append('testOrgUnitId', testOrgUnitId.trim());
      }

      const response = await fetch(`/api/test/debug-signalr-groups?${params}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        console.log('🔔 [NotificationTester] Test results:', result);
        toast.success('Notification tests sent! Check console for events.');
      } else {
        console.error('🔔 [NotificationTester] Test failed:', result);
        toast.error(`Test failed: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('🔔 [NotificationTester] Error:', error);
      toast.error('Failed to send test notifications');
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestConnection = async () => {
    console.log('🔔 [NotificationTester] Testing SignalR connection...');
    const diagnostics = getConnectionDiagnostics();
    console.log('🔔 [NotificationTester] Connection diagnostics:', diagnostics);

    if (isConnected) {
      toast.success('SignalR is connected! Check console for details.');
    } else {
      toast.warning('SignalR is not connected. Check console for diagnostics.');
    }
  };

  if (!visible) return null;

  const positionClasses = position === 'top' ? 'top-4' : 'bottom-4';

  return (
    <div className={`fixed left-4 ${positionClasses} z-[9998] w-80`}>
      <Card className='border-orange-200 bg-orange-50 shadow-lg'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm text-orange-800'>
            🧪 Notification Tester
          </CardTitle>
          <CardDescription className='text-xs text-orange-600'>
            Test real-time notifications across pages
          </CardDescription>
        </CardHeader>

        <CardContent className='space-y-3'>
          {/* Connection Status */}
          <div className='flex items-center justify-between text-xs'>
            <span className='text-orange-700'>SignalR Status:</span>
            <span
              className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}
            >
              {isConnected ? '✅ Connected' : '❌ Disconnected'}
            </span>
          </div>

          <Separator />

          {/* Test Form */}
          <div className='space-y-2'>
            <div>
              <Label htmlFor='testUserId' className='text-xs text-orange-700'>
                Test User ID *
              </Label>
              <Input
                id='testUserId'
                placeholder='Enter user GUID'
                value={testUserId}
                onChange={(e) => setTestUserId(e.target.value)}
                className='h-8 text-xs'
              />
            </div>

            <div>
              <Label
                htmlFor='testOrgUnitId'
                className='text-xs text-orange-700'
              >
                Org Unit ID (optional)
              </Label>
              <Input
                id='testOrgUnitId'
                placeholder='Enter org unit GUID'
                value={testOrgUnitId}
                onChange={(e) => setTestOrgUnitId(e.target.value)}
                className='h-8 text-xs'
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className='space-y-2'>
            <Button
              onClick={handleTestNotifications}
              disabled={isTesting || !testUserId.trim()}
              className='h-8 w-full bg-orange-600 text-xs hover:bg-orange-700'
            >
              {isTesting ? 'Testing...' : 'Test Notifications'}
            </Button>

            <Button
              onClick={handleTestConnection}
              variant='outline'
              className='h-8 w-full border-orange-300 text-xs text-orange-700 hover:bg-orange-100'
            >
              Test Connection
            </Button>
          </div>

          {/* Instructions */}
          <div className='rounded border bg-orange-100 p-2 text-xs text-orange-600'>
            <p className='mb-1 font-medium'>Instructions:</p>
            <ul className='space-y-1 text-xs'>
              <li>• Enter your user ID to test notifications</li>
              <li>• Watch browser console for 🔔 logs</li>
              <li>• Notifications should appear as toasts</li>
              <li>• Bell icon should update in real-time</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
