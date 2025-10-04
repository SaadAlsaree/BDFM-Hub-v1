# Real-Time Notification Center - Frontend Implementation Prompt

## Overview

Build a comprehensive real-time notification center for a Next.js v15 application using shadcn/ui components and Tailwind CSS. The backend is already implemented with SignalR for real-time notifications and REST APIs for notification management.

## Backend Integration Details

### SignalR Hub Configuration

**Hub URL**: `/correspondenceHub`
**Authentication**: Bearer token required

**Real-time Events**:

```typescript
// Event Types
interface SignalREvents {
   CorrespondenceAssignedToModule: (data: {
      correspondenceId: string;
      moduleId: string;
      moduleName: string;
      subject: string;
      message: string;
   }) => void;

   CorrespondenceStatusChangedWithNotification: (data: {
      correspondenceId: string;
      newStatus: string;
      message: string;
      userId: string;
   }) => void;

   WorkflowStepCreated: (data: { workflowStepId: string; correspondenceId: string; recipientType: string; message: string }) => void;
}
```

### REST API Endpoints

**Base URL**: `/BDFM/v1/api/Notification`

#### Get User Notifications

```
GET /GetUserNotifications?page=1&pageSize=10&isRead=false&notificationType=NewMail
```

**Query Parameters**:

-  `page` (int): Page number (default: 1)
-  `pageSize` (int): Items per page (default: 10)
-  `isRead` (bool, optional): Filter by read status
-  `notificationType` (enum, optional): Filter by type

#### Mark Notification as Read

```
PUT /MarkAsRead/{id}
```

#### Mark All Notifications as Read

```
PUT /MarkAllAsRead
```

### API Response Format

```typescript
interface ApiResponse<T> {
   succeeded: boolean;
   data: T;
   message: string;
   code: string;
   errors?: string[];
}

interface PagedResult<T> {
   items: T[];
   totalCount: number;
}

interface Notification {
   id: string;
   message: string;
   notificationType: NotificationType;
   notificationTypeName: string;
   isRead: boolean;
   createAt: string; // ISO date string
   linkToCorrespondenceId?: string;
   linkToWorkflowStepId?: string;
   correspondenceSubject?: string;
   correspondenceMailNum?: string;
}

enum NotificationType {
   NewMail = 0,
   StatusUpdate = 1,
   WorkflowAssignment = 2,
   SystemAlert = 3
}
```

## Requirements

### 1. Notification Bell Icon Component

**Location**: Header/Navbar
**Features**:

-  Bell icon with unread count badge
-  Red dot indicator for unread notifications
-  Click to open notification dropdown
-  Real-time count updates

**Design**:

```tsx
// Example structure
<Button variant='ghost' size='sm' className='relative'>
   <Bell className='h-5 w-5' />
   {unreadCount > 0 && (
      <Badge className='absolute -top-1 -right-1 h-5 w-5 rounded-full p-0'>{unreadCount > 99 ? '99+' : unreadCount}</Badge>
   )}
</Button>
```

### 2. Notification Dropdown/Popover

**Trigger**: Bell icon click
**Features**:

-  Show 5-10 recent notifications
-  Compact notification items
-  "View All" button to open full page
-  "Mark All as Read" quick action
-  Auto-close on outside click

**Components**: Use shadcn/ui Popover or DropdownMenu

### 3. Full Notification Center Page

**Route**: `/notifications`
**Features**:

-  Paginated notification list
-  Filter controls (type, read status)
-  Search functionality
-  Bulk actions (select multiple, mark as read)
-  Responsive design

**Layout**:

```
┌─────────────────────────────────────┐
│ Notifications                       │
├─────────────────────────────────────┤
│ [Filters] [Search] [Mark All Read]  │
├─────────────────────────────────────┤
│ ┌─ Notification Item 1 ────────────┐│
│ │ [Icon] Title          [Time]    ││
│ │        Message content          ││
│ └─────────────────────────────────┘│
│ ┌─ Notification Item 2 ────────────┐│
│ │ [Icon] Title          [Time]    ││
│ │        Message content          ││
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│ [Pagination Controls]               │
└─────────────────────────────────────┘
```

### 4. Real-time Updates

**Requirements**:

-  Automatic SignalR connection on app load
-  Reconnection handling for network issues
-  Real-time notification list updates
-  Toast notifications for important alerts
-  Optimistic UI updates

### 5. Notification Item Design

**Visual Elements**:

-  Type-specific icons (Mail, Workflow, System, Status)
-  Read/unread visual distinction
-  Relative timestamps ("2 minutes ago")
-  Click-to-navigate for correspondence links
-  Hover states and animations

**States**:

-  Unread: Bold text, colored background
-  Read: Normal text, muted colors
-  Loading: Skeleton placeholder
-  Error: Error state with retry option

## Technical Implementation

### SignalR Connection Setup

```typescript
// lib/signalr.ts
import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr';

export class NotificationSignalR {
   private connection: HubConnection;

   constructor(accessToken: string) {
      this.connection = new HubConnectionBuilder()
         .withUrl('/correspondenceHub', {
            accessTokenFactory: () => accessToken
         })
         .withAutomaticReconnect()
         .configureLogging(LogLevel.Information)
         .build();
   }

   async start() {
      try {
         await this.connection.start();
         console.log('SignalR Connected');
      } catch (err) {
         console.error('SignalR Connection Error:', err);
      }
   }

   onNotification(callback: (notification: any) => void) {
      this.connection.on('CorrespondenceAssignedToModule', callback);
      this.connection.on('CorrespondenceStatusChangedWithNotification', callback);
      this.connection.on('WorkflowStepCreated', callback);
   }
}
```

### State Management Options

1. **React Context + useReducer** (Recommended for simplicity)
2. **Zustand** (Lightweight state management)
3. **TanStack Query** (For server state management)

### Required Hooks

```typescript
// hooks/useNotifications.ts
export function useNotifications() {
   // Fetch notifications with pagination
   // Handle real-time updates
   // Manage loading/error states
}

// hooks/useSignalR.ts
export function useSignalR() {
   // SignalR connection management
   // Event listeners
   // Connection status
}

// hooks/useNotificationActions.ts
export function useNotificationActions() {
   // Mark as read
   // Mark all as read
   // Delete notifications
}
```

## Component Architecture

### File Structure

```
featuer/
├── notifications/
│   ├── NotificationBell.tsx          # Header bell icon
│   ├── NotificationDropdown.tsx      # Quick view popover
│   ├── NotificationCenter.tsx        # Full page component
│   ├── NotificationItem.tsx          # Individual notification
│   ├── NotificationList.tsx          # Paginated list
│   ├── NotificationFilters.tsx       # Filter controls
│   ├── NotificationEmpty.tsx         # Empty state
│   └── NotificationSkeleton.tsx      # Loading skeleton
├── hooks/
├── ├── useNotifications.ts
├── ├──useSignalR.ts
├── ├──useNotificationActions.ts
│   ├──useNotificationPreferences.ts
│
├──api
├── ├── notifications-api.ts
lib/
├── signalr.ts
└── utils.ts
types/
└── notifications.ts
app/
├── notifications/
│   └── page.tsx
└── layout.tsx (include NotificationBell)
```

### Key Components

#### NotificationBell Component

```tsx
interface NotificationBellProps {
   className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
   // Implementation with:
   // - Unread count badge
   // - Dropdown trigger
   // - Real-time updates
}
```

#### NotificationItem Component

```tsx
interface NotificationItemProps {
   notification: Notification;
   onMarkAsRead?: (id: string) => void;
   onClick?: (notification: Notification) => void;
   compact?: boolean; // For dropdown vs full page
}

export function NotificationItem({ notification, onMarkAsRead, onClick, compact }: NotificationItemProps) {
   // Implementation with:
   // - Type-specific icons
   // - Read/unread styling
   // - Click handlers
   // - Timestamp formatting
}
```

## UI/UX Requirements

### Design System

-  **Colors**: Use Tailwind CSS color palette
-  **Typography**: Consistent font sizes and weights
-  **Spacing**: Consistent padding and margins
-  **Shadows**: Subtle shadows for depth
-  **Animations**: Smooth transitions (200-300ms)

### Responsive Design

-  **Mobile**: Stack filters, smaller text, touch-friendly
-  **Tablet**: 2-column layout for filters and content
-  **Desktop**: Full layout with sidebar filters

### Accessibility

-  **ARIA Labels**: Proper labeling for screen readers
-  **Keyboard Navigation**: Tab order and shortcuts
-  **Focus Management**: Visible focus indicators
-  **Color Contrast**: WCAG AA compliance

### Loading States

-  **Initial Load**: Full page skeleton
-  **Pagination**: Loading spinner
-  **Real-time Updates**: Subtle loading indicators
-  **Actions**: Button loading states

### Error Handling

-  **Network Errors**: Retry mechanisms
-  **API Errors**: User-friendly error messages
-  **SignalR Disconnection**: Connection status indicator
-  **Fallback UI**: Graceful degradation

## Advanced Features

### 1. Notification Preferences

```tsx
interface NotificationPreferences {
   emailNotifications: boolean;
   pushNotifications: boolean;
   soundEnabled: boolean;
   notificationTypes: {
      newMail: boolean;
      statusUpdates: boolean;
      workflowAssignments: boolean;
      systemAlerts: boolean;
   };
}
```

### 2. Push Notifications

-  Browser notification API
-  Service worker for background notifications
-  Permission handling

### 3. Sound Notifications

-  Audio alerts for new notifications
-  Different sounds for different types
-  Volume control and mute option

### 4. Notification Categories

-  Group notifications by type
-  Collapsible sections
-  Category-specific actions

### 5. Advanced Filtering

-  Date range filtering
-  Multiple type selection
-  Custom search queries
-  Saved filter presets

## Performance Considerations

### Optimization Strategies

-  **Virtual Scrolling**: For large notification lists
-  **Debounced Search**: Prevent excessive API calls
-  **Memoization**: React.memo for notification items
-  **Lazy Loading**: Load images and content on demand
-  **Caching**: Cache notifications with TanStack Query

### Bundle Size

-  **Tree Shaking**: Import only needed components
-  **Code Splitting**: Lazy load notification center page
-  **Icon Optimization**: Use icon libraries efficiently

## Testing Strategy

### Unit Tests

-  Component rendering
-  Hook functionality
-  Utility functions
-  API integration

### Integration Tests

-  SignalR connection
-  Real-time updates
-  User interactions
-  Error scenarios

### E2E Tests

-  Complete notification flow
-  Cross-browser compatibility
-  Mobile responsiveness

## Implementation Checklist

### Phase 1: Basic Structure

-  [ ] Set up SignalR connection
-  [ ] Create basic notification API client
-  [ ] Implement NotificationBell component
-  [ ] Create notification types and interfaces

### Phase 2: Core Features

-  [ ] Build NotificationDropdown component
-  [ ] Implement NotificationCenter page
-  [ ] Add pagination and filtering
-  [ ] Real-time updates integration

### Phase 3: Enhanced UX

-  [ ] Add loading and error states
-  [ ] Implement responsive design
-  [ ] Add animations and transitions
-  [ ] Accessibility improvements

### Phase 4: Advanced Features

-  [ ] Push notifications
-  [ ] Sound alerts
-  [ ] Notification preferences
-  [ ] Performance optimizations

## Dependencies

### shadcn/ui Components Needed

-  Badge
-  Button
-  Card
-  Dialog
-  DropdownMenu
-  Input
-  Popover
-  Select
-  Sheet
-  Skeleton
-  Tabs
-  Toast

## Getting Started

1. **Install Dependencies**

```bash
npm install @microsoft/signalr

```

2. **Set Up SignalR Connection**
3. **Create Basic Components**
4. **Integrate with Backend APIs**
5. **Add Real-time Functionality**
6. **Style and Polish**

---

This prompt provides a comprehensive guide for implementing a production-ready notification center that integrates seamlessly with your BDFM backend while following modern React and Next.js best practices.
