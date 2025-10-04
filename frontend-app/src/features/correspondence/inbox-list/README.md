# User Inbox List Components

This module provides components for managing and displaying user inbox correspondence items following the established patterns from the role components.

## Components Structure

### Table Components

- **`UserInboxListTable`** (`components/user-inbox-list-tables/index.tsx`): Main table component for displaying inbox items
- **`columns`** (`components/user-inbox-list-tables/columns.tsx`): Column definitions for the table
- **`CellAction`** (`components/user-inbox-list-tables/cell-action.tsx`): Action buttons for each row

### View & Listing Components

- **`UserInboxListViewPage`** (`components/user-inbox-list-view-page.tsx`): Detailed view of a single inbox item
- **`UserInboxListListing`** (`components/user-inbox-list-listing.tsx`): Server component that fetches data and renders the table

## Features

### Table Features

- **Search & Filtering**: Support for searching by subject, internal number, external reference, etc.
- **Priority & Secrecy Levels**: Visual badges for different priority and secrecy levels
- **Read/Unread Status**: Visual indicators for read/unread items
- **Star System**: Ability to star/unstar important correspondence
- **Due Date Indicators**: Warning indicators for overdue items

### Actions Available

- **View Details**: Navigate to detailed view of correspondence
- **Star/Unstar**: Mark correspondence as important
- **Mark as Read**: Mark unread correspondence as read
- **Archive**: Archive correspondence
- **Move to Trash**: Soft delete correspondence

### View Page Features

- **Comprehensive Details**: Shows all correspondence information including metadata
- **Interactive Actions**: Quick action buttons for star, mark as read, archive
- **Status Indicators**: Visual representation of priority, secrecy, and status
- **Date Management**: Clear display of received date, due date, and last read time
- **User Interaction Settings**: Shows user-specific settings like notifications, star status

## Usage

### Basic Table Usage

```typescript
import { UserInboxListListing } from '@/features/correspondence/user-inbox-list/components';

// In a page component
<UserInboxListListing />
```

### View Page Usage

```typescript
import { UserInboxListViewPage } from '@/features/correspondence/user-inbox-list/components';

// With data
<UserInboxListViewPage data={inboxItem} />
```

## API Integration

The components integrate with the correspondence service:

- **`getUserInbox()`**: Fetches inbox items with filtering and pagination
- **TODO**: Additional methods for user interactions (star, mark as read, archive, etc.)

## Routes

### Main Inbox Page

- **Path**: `/correspondence/inbox`
- **Component**: Uses `UserInboxListListing` to display all inbox items
- **Features**: Search, filter, pagination

### Individual Item View

- **Path**: `/correspondence/inbox/[id]`
- **Component**: Uses `UserInboxListViewPage` to display detailed view
- **Features**: Full correspondence details, quick actions

## Data Types

The components work with the `UserInboxList` interface which includes:

- Basic correspondence information (subject, type, numbers)
- Priority and secrecy levels
- Status and workflow information
- User interaction data (starred, read status, etc.)
- File and attachment references

## Future Enhancements

### TODO Items

1. **API Integration**: Implement actual API calls for user interactions
2. **Real-time Updates**: Add WebSocket support for real-time notifications
3. **Bulk Actions**: Support for bulk operations (mark all as read, bulk archive)
4. **Advanced Filtering**: More sophisticated filtering options
5. **Attachment Preview**: Quick preview of attachments
6. **Response Interface**: Direct reply functionality from the view page

## Styling

The components follow the established design system:

- **Shadcn UI**: Consistent with other components in the application
- **Tailwind CSS**: For responsive design and styling
- **Arabic RTL**: Proper right-to-left text direction support
- **Accessibility**: ARIA labels and keyboard navigation support
