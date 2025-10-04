# Real-Time Notification System

A comprehensive notification center for the BDFM application with real-time updates, filtering, and modern UI components.

## Features

### 🔔 Core Functionality

- **Real-time notifications** via SignalR
- **REST API integration** for notification management
- **Unread count tracking** with live updates
- **Mark as read/unread** functionality
- **Bulk operations** (mark all as read)
- **Notification filtering** by type and status
- **Search functionality** across notifications
- **Pagination** for large notification lists

### 🎨 UI Components

- **Notification Bell** - Header component with unread badge
- **Dropdown/Popover** - Quick notification preview
- **Full Page Center** - Complete notification management
- **Responsive Design** - Mobile, tablet, and desktop optimized
- **Arabic RTL Support** - Full localization
- **Loading States** - Skeleton components and spinners
- **Empty States** - User-friendly empty notification views

### 🔊 Advanced Features

- **Browser Notifications** - Native push notifications
- **Sound Alerts** - Customizable notification sounds
- **User Preferences** - Configurable notification settings
- **Connection Status** - Real-time connection monitoring
- **Offline Support** - Graceful degradation when offline
- **Auto-reconnection** - Automatic SignalR reconnection

## Architecture

### File Structure

```
src/features/notifications/
├── api/
│   └── notifications-api.ts      # REST API service
├── components/
│   ├── NotificationBell.tsx      # Header bell component
│   ├── NotificationItem.tsx      # Individual notification
│   ├── NotificationEmpty.tsx     # Empty state component
│   └── NotificationSkeleton.tsx  # Loading skeleton
├── README.md                     # This documentation
└── index.ts                      # Feature exports

src/hooks/
├── useNotifications.ts           # Main notifications hook
├── useSignalR.ts                # SignalR connection hook
└── useNotificationPreferences.ts # User preferences hook

src/lib/
└── signalr.ts                   # SignalR connection service

src/types/
└── notifications.ts             # TypeScript interfaces

src/app/(routes)/
└── notifications/
    └── page.tsx                 # Full notification center page
```

## Usage

### Basic Implementation

1. **Add to Header** (already implemented):

```tsx
import { NotificationBell } from '@/features/notifications';

function Header() {
  return (
    <header>
      {/* Other header items */}
      <NotificationBell />
    </header>
  );
}
```

2. **Use the Hook**:

```tsx
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } =
    useNotifications();

  return (
    <div>
      <p>Unread: {unreadCount}</p>
      {notifications.map((notification) => (
        <div key={notification.id}>
          {notification.message}
          <button onClick={() => markAsRead(notification.id)}>
            Mark as read
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Advanced Usage

#### Custom Filtering

```tsx
const { notifications } = useNotifications({
  page: 1,
  pageSize: 20,
  isRead: false, // Only unread
  notificationType: NotificationType.NewMail
});
```

#### SignalR Events

```tsx
import { useSignalR } from '@/hooks/useSignalR';

function MyComponent() {
  const { onNotificationEvent, isConnected } = useSignalR();

  useEffect(() => {
    const handler = (data) => {
      console.log('New correspondence assigned:', data);
    };

    onNotificationEvent('CorrespondenceAssignedToModule', handler);

    return () => {
      offNotificationEvent('CorrespondenceAssignedToModule', handler);
    };
  }, []);
}
```

#### User Preferences

```tsx
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';

function NotificationSettings() {
  const {
    preferences,
    updatePreferences,
    playNotificationSound,
    requestNotificationPermission
  } = useNotificationPreferences();

  return (
    <div>
      <label>
        <input
          type='checkbox'
          checked={preferences.soundEnabled}
          onChange={(e) =>
            updatePreferences({ soundEnabled: e.target.checked })
          }
        />
        Enable sounds
      </label>

      <button onClick={() => playNotificationSound('chime')}>Test sound</button>

      <button onClick={requestNotificationPermission}>
        Enable browser notifications
      </button>
    </div>
  );
}
```

## API Integration

### Backend Endpoints

The system integrates with the following backend endpoints:

#### Get Notifications

```
GET /BDFM/v1/api/Notification/GetUserNotifications
Query Parameters:
- page: number (default: 1)
- pageSize: number (default: 10)
- isRead: boolean (optional)
- notificationType: enum (optional)
```

#### Mark as Read

```
PUT /BDFM/v1/api/Notification/MarkAsRead/{id}
```

#### Mark All as Read

```
PUT /BDFM/v1/api/Notification/MarkAllAsRead
```

### SignalR Hub

**Hub URL**: `/correspondenceHub`
**Authentication**: Bearer token required

**Events**:

- `CorrespondenceAssignedToModule`
- `CorrespondenceStatusChangedWithNotification`
- `WorkflowStepCreated`

## Notification Types

```typescript
enum NotificationType {
  NewMail = 0, // بريد جديد
  StatusUpdate = 1, // تحديث الحالة
  WorkflowAssignment = 2, // مهمة سير العمل
  SystemAlert = 3 // تنبيه النظام
}
```

## Styling & Theming

The notification system uses shadcn/ui components and Tailwind CSS:

- **Colors**: Semantic color system with proper contrast
- **Typography**: Consistent font sizes and weights
- **Spacing**: Uniform padding and margins
- **Animations**: Smooth transitions (200-300ms)
- **Icons**: Lucide React icons with proper sizing

### Color Coding

- **New Mail**: Blue (`text-blue-500`, `border-l-blue-500`)
- **Status Update**: Green (`text-green-500`, `border-l-green-500`)
- **Workflow**: Purple (`text-purple-500`, `border-l-purple-500`)
- **System Alert**: Orange (`text-orange-500`, `border-l-orange-500`)

## Performance Optimizations

### React Query Caching

- **Stale Time**: 30 seconds for notification data
- **Refetch Interval**: 60 seconds when SignalR is disconnected
- **Optimistic Updates**: Immediate UI updates for mark as read

### SignalR Connection

- **Automatic Reconnection**: Exponential backoff strategy
- **Connection Pooling**: Singleton instance management
- **Error Handling**: Graceful fallback to polling

### Bundle Optimization

- **Code Splitting**: Notification center page is lazy-loaded
- **Tree Shaking**: Only required components are imported
- **Memoization**: React.memo for notification items

## Accessibility

### ARIA Support

- **Labels**: Proper labeling for screen readers
- **Roles**: Semantic HTML roles
- **Live Regions**: Announcements for new notifications

### Keyboard Navigation

- **Tab Order**: Logical tab sequence
- **Shortcuts**: Keyboard shortcuts for common actions
- **Focus Management**: Visible focus indicators

### Screen Reader Support

- **Announcements**: New notification announcements
- **Context**: Clear context for each notification
- **Actions**: Accessible action buttons

## Testing

### Unit Tests

```bash
# Run notification tests
npm test -- notifications
```

### Integration Tests

```bash
# Test SignalR integration
npm run test:integration
```

### E2E Tests

```bash
# Test complete notification flow
npm run test:e2e -- notifications
```

## Troubleshooting

### Common Issues

1. **SignalR Connection Failed**

   - Check backend URL configuration
   - Verify authentication token
   - Check network connectivity

2. **Notifications Not Updating**

   - Check SignalR connection status
   - Verify event handler registration
   - Check browser console for errors

3. **Browser Notifications Not Working**
   - Check notification permissions
   - Verify HTTPS connection (required for notifications)
   - Check browser compatibility

### Debug Mode

Enable debug logging:

```typescript
// In development
localStorage.setItem('debug', 'notifications:*');
```

### Connection Status

Monitor SignalR connection:

```tsx
const { connectionState } = useSignalR();
console.log('Connection state:', connectionState);
```

## 🔧 Troubleshooting SignalR Notifications

If you're not receiving notifications, follow these debugging steps:

### 🚨 **CRITICAL FIX IMPLEMENTED**

**Issue**: The main problem was that the SignalR Hub had authorization disabled (`[Authorize]` was commented out), causing users to connect without proper authentication context. This meant users were not added to their personal `User_{userId}` or module `Module_{organizationalUnitId}` groups, preventing targeted notifications.

**Solution**: Authorization has been enabled and fallback authentication logic added to extract user info from SignalR context when `CurrentUserService` fails.

### 1. **Quick Debug Setup**

Add the debug panel to your app temporarily:

```typescript
import { SignalRDebugPanel } from '@/components/SignalRDebugPanel';

// Add to your layout or page
<SignalRDebugPanel position="top-right" visible={true} />
```

### 2. **Check Browser Console**

Open browser dev tools (F12) and look for:

```
🔔 [useSignalR] ✅ User authenticated: username (user-id)
🔔 [useSignalR] 👥 Joined Groups: User_xxx, CorrespondenceUpdates, Module_xxx
🔔 [useSignalR] ✅ User properly configured for notifications
```

### 3. **Test SignalR Groups with API**

Use the new debug endpoint to test group membership:

```bash
POST /api/test/debug-signalr-groups?testUserId={your-user-id}&testOrgUnitId={your-org-unit-id}
```

### 4. **Expected Console Output**

When working correctly, you should see:

**Connection Logs:**

```
🔔 [useSignalR] Session token changed or SignalR instance missing, updating connection
🔔 [useSignalR] SignalR connection state changed: { isConnected: true, ... }
🔔 [useSignalR] ✅ User authenticated: john.doe (12345678-1234-...)
🔔 [useSignalR] 🏢 Organization Unit: 87654321-4321-...
🔔 [useSignalR] 👥 Joined Groups: User_12345678-1234-..., CorrespondenceUpdates, Module_87654321-4321-...
```

**Event Reception:**

```
🔔 [useNotifications] Received CorrespondenceAssignedToModule event: {
  "correspondenceId": "...",
  "moduleName": "...",
  "message": "تم تحويل الكتاب لوحدتك: ..."
}
```

### 5. **Common Issues & Solutions**

#### ❌ User Not in Personal Group

**Symptoms**: `⚠️ User not in personal group - targeted notifications may not work`
**Cause**: Authentication context not properly established
**Solution**: Verify `[Authorize]` attribute is enabled on SignalR hub

#### ❌ Authentication Context Missing

**Symptoms**: `❌ User not authenticated - this may cause notification issues`
**Cause**: JWT token not properly processed by SignalR
**Solution**: Check JWT configuration and SignalR authentication setup

#### ❌ No Organizational Unit

**Symptoms**: `⚠️ User not in module group despite having organizational unit`
**Cause**: User profile missing organizational unit assignment
**Solution**: Verify user has `OrganizationalUnitId` set in database

#### ❌ Events Not Received

**Symptoms**: Connected but no event logs appear
**Solution**: Use the debug API endpoint to test specific group notifications

### 6. **Backend Server Logs to Check**

Look for these log messages on the server:

**Successful Connection:**

```
✅ Added user john.doe (12345...) to personal group User_12345...
✅ User john.doe (12345...) added to module group Module_87654...
🔔 Authenticated user john.doe (12345...) successfully connected
```

**Notification Sending:**

```
✅ Test 1: General inbox update sent
✅ Test 2: User-specific notification sent to User_12345...
✅ Test 3: Module-specific notification sent to Module_87654...
```

### 7. **Manual Testing Steps**

1. **Open browser console** and enable debug mode
2. **Use debug panel** to check connection status and group membership
3. **Test with API endpoints**:
   - General: `POST /api/test/inbox-update`
   - User-specific: `POST /api/test/debug-signalr-groups?testUserId={id}`
   - Module-specific: `POST /api/test/debug-signalr-groups?testOrgUnitId={id}`
4. **Trigger real actions** (change correspondence status, assign to module)
5. **Verify events appear** in console with proper data structure

### 8. **Debug Panel Usage**

The debug panel provides:

- **Connection Status**: Real-time connection state
- **User Info**: Authentication details and group membership
- **Test Buttons**: Quick actions to test different notification types
- **Live Updates**: Automatic refresh of connection information

### 9. **If Issues Persist**

1. **Check JWT Token Claims**: Ensure token contains `uid`, `sub`, and `org_unit_id` claims
2. **Verify Database**: Confirm user has correct `OrganizationalUnitId`
3. **Network Issues**: Check if WebSocket connections are blocked
4. **Browser Compatibility**: Test with different browsers
5. **Server Configuration**: Verify SignalR is properly configured with authentication

### 10. **Quick Fix Commands**

Enable debug mode in development:

```typescript
const signalR = useCorrespondenceSignalR({
  debugMode: process.env.NODE_ENV === 'development', // Now enabled by default
  enableToastNotifications: true,
  autoRefreshQueries: true
});
```

### 🎯 **Expected Behavior After Fixes**

- Users should be automatically added to personal and module groups on connection
- Status change notifications should appear immediately without page reload
- Module assignment notifications should reach all users in the target module
- Debug console should show clear success/failure indicators with emoji markers

## Future Enhancements

### Planned Features

- [ ] **Notification Categories** - Group notifications by category
- [ ] **Custom Sounds** - Upload custom notification sounds
- [ ] **Email Digest** - Daily/weekly notification summaries
- [ ] **Mobile App Integration** - Push notifications for mobile
- [ ] **Advanced Filtering** - Date ranges, custom queries
- [ ] **Notification Templates** - Customizable notification formats

### Performance Improvements

- [ ] **Virtual Scrolling** - For large notification lists
- [ ] **Service Worker** - Background notification handling
- [ ] **Offline Caching** - Cache notifications for offline viewing
- [ ] **Compression** - Optimize SignalR message size

## Contributing

### Development Setup

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Run tests: `npm test`

### Code Style

- Follow the existing TypeScript/React patterns
- Use functional components with hooks
- Implement proper error handling
- Add comprehensive JSDoc comments

### Pull Request Process

1. Create feature branch from `main`
2. Implement changes with tests
3. Update documentation
4. Submit pull request with description

## License

This notification system is part of the BDFM project and follows the same licensing terms.
