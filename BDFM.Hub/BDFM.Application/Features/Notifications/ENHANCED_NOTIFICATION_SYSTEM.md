# Enhanced Real-Time Notification System for BDFM

## Overview

This document describes the enhanced real-time notification system implemented for the BDFM correspondence management system. The system provides both real-time SignalR notifications and persistent database notifications for two specific scenarios:

1. **Module Assignment Notifications**: When correspondences are assigned to organizational units (modules), all users within that module receive notifications.
2. **User Preference Notifications**: Users who have enabled notifications for specific correspondences receive status change notifications.

## Architecture Components

### 1. Enhanced SignalR Services

#### ICorrespondenceNotificationService (Extended)

```csharp
// New methods added to existing interface
Task NotifyCorrespondenceAssignedToModuleAsync(Guid correspondenceId, Guid organizationalUnitId, string moduleName);
Task NotifyCorrespondenceStatusChangedToUsersWithNotificationsAsync(Guid correspondenceId, string newStatus);
Task NotifyWorkflowStepCreatedAsync(Guid workflowStepId, Guid correspondenceId, Guid? organizationalUnitId = null);
```

#### INotificationService (New)

```csharp
Task<Notification> CreateNotificationAsync(Guid userId, string message, NotificationTypeEnum notificationType, ...);
Task CreateModuleNotificationsAsync(Guid organizationalUnitId, string message, NotificationTypeEnum notificationType, ...);
Task CreateNotificationsForUsersWithCorrespondenceNotificationsAsync(Guid correspondenceId, string message, NotificationTypeEnum notificationType, ...);
Task MarkNotificationAsReadAsync(Guid notificationId, CancellationToken cancellationToken = default);
Task MarkAllUserNotificationsAsReadAsync(Guid userId, CancellationToken cancellationToken = default);
```

### 2. Enhanced SignalR Hub

#### CorrespondenceHub (Enhanced)

-  **Auto-join Module Groups**: Users automatically join their organizational unit group on connection
-  **Module-specific Methods**: `JoinModuleGroup()`, `LeaveModuleGroup()`
-  **Connection Info**: Debug method to view current group memberships

#### SignalR Groups Structure

-  `User_{userId}` - Individual user notifications
-  `Module_{organizationalUnitId}` - All users in an organizational unit
-  `CorrespondenceUpdates` - General broadcast notifications
-  `Correspondence_{correspondenceId}` - Correspondence-specific notifications (optional)

### 3. Notification Events

#### Real-Time Events

1. **CorrespondenceAssignedToModule**

   -  Triggered when a workflow step assigns correspondence to an organizational unit
   -  Sent to all users in the target module
   -  Includes correspondence ID, module ID, and module name

2. **CorrespondenceStatusChangedWithNotification**

   -  Triggered when correspondence status changes
   -  Sent only to users who have enabled notifications for that correspondence
   -  Includes correspondence ID, new status, and personalized message

3. **WorkflowStepCreated**
   -  Triggered when new workflow steps are created
   -  Sent to relevant users/modules based on recipient type

#### Persistent Notifications

-  All real-time notifications also create persistent database records
-  Users can view notification history
-  Notifications can be marked as read/unread
-  Support for different notification types (NewMail, StatusUpdate, etc.)

## Implementation Details

### 1. Workflow Step Creation Handler Enhancement

When a new workflow step is created with `RecipientTypeEnum.Unit`:

```csharp
// Real-time notification
await _correspondenceNotificationService.NotifyCorrespondenceAssignedToModuleAsync(
    correspondenceId, organizationalUnitId, moduleName);

// Persistent notification
await _notificationService.CreateModuleNotificationsAsync(
    organizationalUnitId,
    $"A correspondence has been assigned to your module: {moduleName}",
    NotificationTypeEnum.NewMail,
    correspondenceId,
    workflowStepId);
```

### 2. Correspondence Status Change Handler Enhancement

When correspondence status changes:

```csharp
// General real-time notification
await _correspondenceNotificationService.NotifyCorrespondenceStatusChangedAsync(
    correspondenceId, newStatus);

// Targeted notification to users with notifications enabled
await _correspondenceNotificationService.NotifyCorrespondenceStatusChangedToUsersWithNotificationsAsync(
    correspondenceId, newStatus);

// Persistent notifications for users with notifications enabled
await _notificationService.CreateNotificationsForUsersWithCorrespondenceNotificationsAsync(
    correspondenceId,
    $"Correspondence status changed to {newStatus}",
    NotificationTypeEnum.StatusUpdate);
```

### 3. User Notification Preferences

Users can enable/disable notifications per correspondence using the existing `UserCorrespondenceInteraction.ReceiveNotifications` flag:

```csharp
// Enable notifications for a correspondence
var command = new ReceiveNotificationsCommand
{
    CorrespondenceId = correspondenceId,
    ReceiveNotifications = true
};
```

## Frontend Integration

### Enhanced SignalR Hook

```typescript
// New event handlers for enhanced notifications
const { isConnected } = useCorrespondenceSignalR({
   accessToken,
   onCorrespondenceAssignedToModule: (notification) => {
      showNotification(`New assignment: ${notification.message}`);
      refreshModuleWorkload();
   },
   onCorrespondenceStatusChangedWithNotification: (notification) => {
      showNotification(`Status update: ${notification.message}`);
      updateCorrespondenceStatus(notification.correspondenceId, notification.newStatus);
   },
   onWorkflowStepCreated: (notification) => {
      refreshWorkflowSteps();
   }
});
```

### Module Group Management

```typescript
// Join specific module group
await connection.invoke('JoinModuleGroup', organizationalUnitId);

// Leave module group
await connection.invoke('LeaveModuleGroup', organizationalUnitId);

// Get connection info for debugging
await connection.invoke('GetConnectionInfo');
```

## API Endpoints

### Notification Management

```http
GET /BDFM/v1/api/Notification/GetUserNotifications
POST /BDFM/v1/api/Notification/MarkNotificationAsRead
POST /BDFM/v1/api/Notification/MarkAllNotificationsAsRead
```

### User Correspondence Interaction

```http
POST /BDFM/v1/api/UserCorrespondenceInteraction/ReceiveNotification
```

## Database Schema

### Enhanced Notification Entity

```sql
-- Existing Notification table supports the new features
-- Key fields:
-- UserId: Target user
-- Message: Notification text
-- NotificationType: Type of notification (NewMail, StatusUpdate, etc.)
-- LinkToCorrespondenceId: Optional link to correspondence
-- LinkToWorkflowStepId: Optional link to workflow step
-- IsRead: Read status
```

### UserCorrespondenceInteraction

```sql
-- Existing table with ReceiveNotifications flag
-- ReceiveNotifications: Boolean flag to enable/disable notifications per correspondence
```

## Configuration and Registration

### Service Registration (ApplicationServiceRegistration.cs)

```csharp
services.AddScoped<INotificationService, NotificationService>();
// ICorrespondenceNotificationService already registered
```

### SignalR Configuration

```csharp
// SignalR already configured in existing setup
// Enhanced hub automatically handles module groups
```

## Security Considerations

1. **Authorization**: All SignalR connections require "Auth" policy
2. **User Isolation**: Users only receive notifications for correspondences they have access to
3. **Module Access**: Module notifications respect organizational unit membership
4. **Permission Validation**: Existing permission validation service ensures proper access control

## Performance Optimizations

1. **Efficient Queries**: Uses indexed queries for user and module lookups
2. **Batch Operations**: Bulk creation of notifications for module assignments
3. **Group Management**: Automatic group membership reduces targeting overhead
4. **Error Handling**: Notification failures don't affect core business operations

## Monitoring and Logging

All notification operations include comprehensive logging:

-  User connection/disconnection events
-  Module group membership changes
-  Notification delivery success/failure
-  Database operation performance
-  Error handling and recovery

## Testing Scenarios

### Module Assignment Testing

1. Create workflow step with `RecipientTypeEnum.Unit`
2. Verify all users in the module receive real-time notifications
3. Verify persistent notifications are created in database
4. Test with empty modules (no users)

### User Preference Testing

1. Enable notifications for specific correspondence
2. Change correspondence status
3. Verify only users with notifications enabled receive targeted notifications
4. Test with multiple users having different preferences

### SignalR Group Testing

1. Test automatic module group joining on connection
2. Test manual group joining/leaving
3. Verify group isolation (users only get relevant notifications)
4. Test reconnection scenarios

## Future Enhancements

1. **Email Notifications**: Extend to send email notifications for critical events
2. **Mobile Push Notifications**: Integration with mobile app notifications
3. **Notification Templates**: Configurable message templates
4. **Notification Scheduling**: Delayed or scheduled notifications
5. **Advanced Filtering**: More granular notification preferences
6. **Analytics**: Notification delivery and engagement metrics

## Migration Guide

### From Existing System

1. Enhanced services are backward compatible
2. Existing SignalR functionality remains unchanged
3. New notification features are opt-in
4. Database schema requires no changes (uses existing tables)

### Deployment Steps

1. Deploy enhanced SignalR services
2. Update frontend to handle new notification types
3. Configure notification preferences UI
4. Test module assignment workflows
5. Monitor notification delivery performance

This enhanced notification system provides a robust, scalable solution for real-time correspondence management notifications while maintaining backward compatibility with the existing system.
