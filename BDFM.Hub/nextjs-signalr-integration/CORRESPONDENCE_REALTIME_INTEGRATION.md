# BDFM Correspondence Real-time Integration Guide

## Overview

This document explains how to integrate with the real-time correspondence features implemented using SignalR in the BDFM system. The real-time functionality automatically notifies connected clients when correspondences are created, updated, deleted, or when their status changes.

## Backend Implementation

### SignalR Hub

The `CorrespondenceHub` is located at `/correspondencehub` and handles real-time communication between the server and connected clients.

**Hub URL**: `https://your-api-domain.com/correspondencehub`

### Authentication

The hub requires authentication using the "Auth" policy. Clients must provide a valid JWT token when connecting.

### Notification Types

The system sends the following types of notifications:

1. **InboxUpdated** - General inbox refresh notification
2. **CorrespondenceCreated** - When a new correspondence is created
3. **CorrespondenceUpdated** - When a correspondence is modified
4. **CorrespondenceDeleted** - When a correspondence is permanently deleted
5. **CorrespondenceStatusChanged** - When a correspondence status changes

### Message Format

All notifications follow this structure:

```json
{
   "type": "NotificationType",
   "correspondenceId": "guid-here", // Optional, depends on notification type
   "newStatus": "StatusName", // Only for status change notifications
   "message": "Human readable message",
   "timestamp": "2024-01-01T12:00:00Z"
}
```

## Frontend Integration

### Prerequisites

Install the SignalR client library:

```bash
# For npm
npm install @microsoft/signalr

# For yarn
yarn add @microsoft/signalr
```

### Basic Connection Setup

```typescript
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

const connection = new HubConnectionBuilder()
   .withUrl('https://your-api-domain.com/correspondencehub', {
      accessTokenFactory: () => yourJwtToken,
      withCredentials: true
   })
   .withAutomaticReconnect()
   .build();

// Start the connection
await connection.start();
```

### Event Handlers

Set up handlers for different notification types:

```typescript
// Handle inbox updates
connection.on('InboxUpdated', (notification) => {
   console.log('Inbox updated:', notification);
   // Refresh your inbox data
   refreshInboxData();
});

// Handle new correspondence
connection.on('CorrespondenceCreated', (notification) => {
   console.log('New correspondence:', notification);
   // Add to local state or refresh inbox
   showNotification('New correspondence received');
});

// Handle correspondence updates
connection.on('CorrespondenceUpdated', (notification) => {
   console.log('Correspondence updated:', notification);
   // Update specific correspondence in local state
});

// Handle correspondence deletion
connection.on('CorrespondenceDeleted', (notification) => {
   console.log('Correspondence deleted:', notification);
   // Remove from local state
});

// Handle status changes
connection.on('CorrespondenceStatusChanged', (notification) => {
   console.log('Status changed:', notification);
   // Update correspondence status in UI
});
```

### Optional: Join Specific Correspondence Groups

```typescript
// Join a specific correspondence group for targeted updates
await connection.invoke('JoinCorrespondenceGroup', correspondenceId);

// Leave a correspondence group
await connection.invoke('LeaveCorrespondenceGroup', correspondenceId);
```

## Integration Examples

### React Hook Example

```typescript
import { useEffect, useRef } from 'react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

export const useCorrespondenceSignalR = (accessToken: string) => {
   const connectionRef = useRef<HubConnection | null>(null);

   useEffect(() => {
      const startConnection = async () => {
         const connection = new HubConnectionBuilder()
            .withUrl('/correspondencehub', {
               accessTokenFactory: () => accessToken
            })
            .withAutomaticReconnect()
            .build();

         // Set up event handlers
         connection.on('InboxUpdated', () => {
            // Trigger inbox refresh
         });

         await connection.start();
         connectionRef.current = connection;
      };

      if (accessToken) {
         startConnection();
      }

      return () => {
         connectionRef.current?.stop();
      };
   }, [accessToken]);

   return connectionRef.current;
};
```

### Vue Composition API Example

```typescript
import { ref, onMounted, onUnmounted } from 'vue';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

export function useCorrespondenceSignalR(accessToken: string) {
   const connection = ref<HubConnection | null>(null);

   onMounted(async () => {
      connection.value = new HubConnectionBuilder()
         .withUrl('/correspondencehub', {
            accessTokenFactory: () => accessToken
         })
         .withAutomaticReconnect()
         .build();

      // Set up event handlers
      connection.value.on('InboxUpdated', () => {
         // Handle inbox update
      });

      await connection.value.start();
   });

   onUnmounted(() => {
      connection.value?.stop();
   });

   return { connection };
}
```

### Angular Service Example

```typescript
import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

@Injectable({ providedIn: 'root' })
export class CorrespondenceSignalRService {
   private connection: HubConnection | null = null;

   async startConnection(accessToken: string): Promise<void> {
      this.connection = new HubConnectionBuilder()
         .withUrl('/correspondencehub', {
            accessTokenFactory: () => accessToken
         })
         .withAutomaticReconnect()
         .build();

      this.connection.on('InboxUpdated', () => {
         // Handle inbox update
      });

      await this.connection.start();
   }

   async stopConnection(): Promise<void> {
      await this.connection?.stop();
   }
}
```

## Backend Handler Integration

The following correspondence handlers have been updated with real-time notifications:

-  `CreateInternalMailHandler`
-  `RegisterIncomingExternalMailHandler`
-  `UpdateCorrespondenceContentHandler`
-  `ChangeCorrespondenceStatusHandler`
-  `PermanentlyDeleteCorrespondenceHandler`

### Adding Notifications to New Handlers

To add real-time notifications to new correspondence handlers:

1. Inject `ICorrespondenceNotificationService`:

```csharp
private readonly ICorrespondenceNotificationService _notificationService;

public YourHandler(ICorrespondenceNotificationService notificationService)
{
    _notificationService = notificationService;
}
```

2. Call appropriate notification methods:

```csharp
// After creating a correspondence
await _notificationService.NotifyCorrespondenceCreatedAsync(correspondence.Id);
await _notificationService.NotifyInboxUpdateAsync();

// After updating a correspondence
await _notificationService.NotifyCorrespondenceUpdatedAsync(correspondence.Id);
await _notificationService.NotifyInboxUpdateAsync();

// After deleting a correspondence
await _notificationService.NotifyCorrespondenceDeletedAsync(correspondence.Id);
await _notificationService.NotifyInboxUpdateAsync();

// After changing status
await _notificationService.NotifyCorrespondenceStatusChangedAsync(
    correspondence.Id,
    newStatus.GetDisplayName());
await _notificationService.NotifyInboxUpdateAsync();
```

## User Groups

The system automatically manages user groups:

-  **User-specific groups**: `User_{userId}` - for targeted notifications to specific users
-  **General group**: `CorrespondenceUpdates` - for broadcast notifications to all connected users
-  **Correspondence-specific groups**: `Correspondence_{correspondenceId}` - for notifications about specific correspondences (optional)

## Best Practices

1. **Connection Management**: Always properly dispose of SignalR connections when components unmount
2. **Error Handling**: Implement proper error handling for connection failures
3. **Reconnection**: Use automatic reconnection for better user experience
4. **Performance**: Consider debouncing rapid updates to avoid overwhelming the UI
5. **User Feedback**: Provide visual feedback (notifications, badges) when real-time updates occur

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Ensure JWT token is valid and not expired
2. **CORS Issues**: Verify CORS policy allows SignalR connections
3. **Connection Failures**: Check network connectivity and server availability

### Debugging

Enable SignalR logging for debugging:

```typescript
const connection = new HubConnectionBuilder()
   .withUrl('/correspondencehub')
   .configureLogging(LogLevel.Debug) // Add this for debugging
   .build();
```

## Security Considerations

-  The hub requires authentication via JWT tokens
-  Users only receive notifications for correspondences they have access to
-  Consider implementing additional authorization checks based on your business rules

## Performance Considerations

-  The system uses SignalR groups to efficiently target notifications
-  Consider implementing message queuing for high-volume scenarios
-  Monitor connection counts and server resources in production
