# Attachments Feature

A modern, reactive UI system for managing file attachments with support for various file types, preview capabilities, and comprehensive metadata display.

## Components

### 1. AttachmentItem

A card-based component for displaying individual attachment items with file type indicators, metadata, and action buttons.

**Features:**

- File type icons with color coding
- Hover effects and animations
- Action buttons (View, Download, Print)
- File metadata display (size, date, creator)
- Status badges
- Responsive design

**Usage:**

```tsx
import AttachmentItem from './attachment-item';

<AttachmentItem
  attachment={attachmentData}
  onDownload={(attachment) => handleDownload(attachment)}
  onPrint={(attachment) => handlePrint(attachment)}
  className='custom-class'
/>;
```

### 2. AttachmentsList

A comprehensive list/grid view for displaying multiple attachments with search, filtering, and sorting capabilities.

**Features:**

- Grid and list view modes
- Real-time search functionality
- File type filtering
- Multi-column sorting (name, date, size, type)
- Loading states with skeleton UI
- Empty state handling
- Bulk download functionality
- Responsive design

**Usage:**

```tsx
import AttachmentsList from './attachments-list';

<AttachmentsList
  attachments={attachments}
  isLoading={isLoading}
  onDownloadAll={handleDownloadAll}
  className='w-full'
/>;
```

### 3. AttachmentItemViewDialog

A full-featured modal dialog for viewing attachment details with file preview capabilities.

**Features:**

- Tabbed interface (Preview, Details, OCR Text)
- Multi-format file preview:
  - Images (JPG, PNG, GIF, etc.)
  - Videos (MP4, AVI, MOV, etc.)
  - Audio files (MP3, WAV, OGG, etc.)
  - PDF documents
- Comprehensive metadata display
- OCR text extraction display
- Download and print functionality
- Error handling for failed previews
- Responsive design

**Usage:**

```tsx
import AttachmentItemViewDialog from './attachment-item-view-dialog';

<AttachmentItemViewDialog
  attachmentId={attachmentId}
  isOpen={isDialogOpen}
  onClose={() => setIsDialogOpen(false)}
/>;
```

## File Type Support

### Supported Preview Types

**Images:**

- JPG, JPEG, PNG, GIF, BMP, SVG, WebP
- Full-size preview with zoom capabilities
- Print functionality

**Videos:**

- MP4, AVI, MOV, WMV, FLV, WebM, MKV
- Native HTML5 video player with controls
- Fallback error handling

**Audio:**

- MP3, WAV, OGG, FLAC, AAC, M4A
- Native HTML5 audio player with controls
- Visual audio icon display

**Documents:**

- PDF: Embedded iframe preview
- Other documents: Download prompt

### File Type Indicators

Each file type has a unique color-coded icon:

- **Images**: Blue background with Image icon
- **Videos**: Purple background with Video icon
- **Audio**: Pink background with Music icon
- **PDFs**: Red background with FileText icon
- **Documents**: Blue background with FileText icon
- **Other**: Gray background with File icon

## Utilities

### File Utils (`/lib/file-utils.ts`)

Comprehensive utility functions for file handling:

```tsx
// Format file sizes
formatFileSize(1024); // "1 KB"
formatFileSize(1048576); // "1 MB"

// File type checking
isImageFile('.jpg'); // true
isVideoFile('.mp4'); // true
isAudioFile('.mp3'); // true
isDocumentFile('.pdf'); // true

// File operations
downloadFileFromBase64(base64Data, filename, mimeType);
sanitizeFilename(filename);
getFileExtension(filename);
```

## API Integration

The components integrate with the attachment service API:

```tsx
// Get attachment list
attachmentService.getAttachmentList(queryParams);

// Get attachment details
attachmentService.getAttachmentDetail(attachmentId);

// Download attachment
attachmentService.downloadAttachment(attachmentId);

// Create attachment
attachmentService.createAttachment(payload);
attachmentService.createAttachmentFormData(file, metadata);
```

## Styling

Built with modern design principles using:

- **Tailwind CSS** for utility-first styling
- **Shadcn UI** components for consistent design
- **Lucide React** icons for visual elements
- **CSS Grid** and **Flexbox** for responsive layouts
- **Smooth animations** and hover effects

## Accessibility

- Keyboard navigation support
- Screen reader friendly
- High contrast color schemes
- Focus indicators
- Semantic HTML structure

## Performance

- **Lazy loading** for non-critical components
- **Virtualization** for large lists
- **Optimized images** with proper sizing
- **Efficient re-renders** with React.memo and useMemo
- **Skeleton loading** states

## Example Usage

```tsx
import React from 'react';
import { AttachmentsExample } from '@/features/attachments/components';

function DocumentPage({ documentId }) {
  return (
    <div className='container mx-auto p-6'>
      <h1 className='mb-6 text-2xl font-bold'>Document Attachments</h1>

      <AttachmentsExample
        primaryTableId={documentId}
        tableName={1} // Document table type
      />
    </div>
  );
}
```

## Dependencies

- React 18+
- TypeScript
- Tailwind CSS
- Shadcn UI
- Lucide React
- TanStack Query
- date-fns

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

- Drag and drop file upload
- Bulk operations (delete, move)
- File versioning
- Advanced search with filters
- Thumbnail generation
- Real-time collaboration
- File sharing capabilities
