import React, { useState, useMemo } from 'react';
import { FileAttachmentList } from '../types/attachment';
import AttachmentItem from './attachment-item';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Search,
  Filter,
  Download,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  FileText,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthApi } from '@/hooks/use-auth-api';
import { attachmentService } from '../api/attachment.service';
import { downloadFileFromBase64, downloadFileFromBlob, printFileFromBlob } from '@/lib/file-utils';
import { useToast } from '@/components/ui/use-toast';

interface AttachmentsListProps {
  attachments: FileAttachmentList[];
  isLoading?: boolean;
  onDownloadAll?: () => void;
  className?: string;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'date' | 'size' | 'type';
type SortOrder = 'asc' | 'desc';

const AttachmentsList = ({
  attachments,
  isLoading = false,
  onDownloadAll,
  className
}: AttachmentsListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const { authApiCall } = useAuthApi();
  const { toast } = useToast();

  // Get unique file types for filter
  const fileTypes = useMemo(() => {
    const types = new Set(
      attachments
        .map((att) => att.fileExtension?.toLowerCase().replace('.', ''))
        .filter((ext): ext is string => Boolean(ext))
    );
    return Array.from(types).sort();
  }, [attachments]);

  // Filter and sort attachments
  const filteredAndSortedAttachments = useMemo(() => {
    let filtered = attachments;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (att) =>
          att.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          att.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by file type
    if (selectedType !== 'all') {
      filtered = filtered.filter(
        (att) =>
          att.fileExtension?.toLowerCase().replace('.', '') === selectedType
      );
    }

    // Sort attachments
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.fileName?.toLowerCase() || '';
          bValue = b.fileName?.toLowerCase() || '';
          break;
        case 'date':
          aValue = new Date(a.createAt || 0).getTime();
          bValue = new Date(b.createAt || 0).getTime();
          break;
        case 'size':
          aValue = a.fileSize || 0;
          bValue = b.fileSize || 0;
          break;
        case 'type':
          aValue = a.fileExtension?.toLowerCase() || '';
          bValue = b.fileExtension?.toLowerCase() || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [attachments, searchQuery, selectedType, sortBy, sortOrder]);

  const onDownloadAttachment = async (attachment: FileAttachmentList) => {
    console.log('Initiating download for attachment:', attachment.id);
    if (!attachment.id) {
      toast({
        title: 'Error',
        description: 'Attachment ID is missing',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log('Calling API to download attachment...');
      const response = await authApiCall(() =>
        attachmentService.downloadAttachmentClient(attachment.id!)
      );
      
      console.log('Download API response type:', typeof response);

      if (response instanceof Blob) {
        console.log('File blob found, initiating browser download... size:', response.size);
        downloadFileFromBlob(
          response,
          attachment.fileName || 'download'
        );
        toast({
          title: 'Success',
          description: 'File downloaded successfully'
        });
      } else {
        console.log('No valid blob found in response. Response was:', response);
        toast({
          title: 'Error',
          description: 'No file data received from server',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to download file',
        variant: 'destructive'
      });
    }
  };

  const onPrintAttachment = async (attachment: FileAttachmentList) => {
    console.log('Initiating print for attachment:', attachment.id);
    if (!attachment.id) {
      toast({
        title: 'Error',
        description: 'Attachment ID is missing',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log('Calling API to download attachment for printing...', attachment.id);
      const response = await authApiCall(() =>
        attachmentService.downloadAttachmentClient(attachment.id!)
      );
      
      console.log('Print API response type:', typeof response, response instanceof Blob);

      if (response instanceof Blob) {
        toast({
          title: 'جاري التجهيز',
          description: 'جاري تجهيز الملف للطباعة...'
        });
        console.log('File blob found, initiating print... size:', response.size);
        await printFileFromBlob(
          response,
          attachment.fileName || 'print',
          attachment.fileExtension || ''
        );
        console.log('Print dialog should be open now');
      } else {
        toast({
          title: 'Error',
          description: 'No file data received for printing',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Print error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to print file',
        variant: 'destructive'
      });
    }
  };

  const toggleSort = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4'>
          <div className='bg-muted h-10 flex-1 animate-pulse rounded-md' />
          <div className='bg-muted h-10 w-32 animate-pulse rounded-md' />
          <div className='bg-muted h-10 w-32 animate-pulse rounded-md' />
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className='bg-muted h-64 animate-pulse rounded-lg' />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className='flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0'>
        <div className='flex items-center space-x-2'>
          <FileText className='text-muted-foreground h-5 w-5' />
          <h2 className='text-lg font-semibold'>الرافقات</h2>
          <Badge variant='secondary' className='ml-2'>
            {filteredAndSortedAttachments.length}
          </Badge>
        </div>
        {/* {onDownloadAll && (
          <Button onClick={onDownloadAll} variant='outline' size='sm'>
            <Download className='mr-2 h-4 w-4' />
            تحميل الكل
          </Button>
        )} */}
      </div>

      {/* Search and Filters */}
      <div className='flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4'>
        <div className='relative flex-1'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
          <Input
            placeholder='Search attachments...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-9'
          />
        </div>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className='w-full md:w-40'>
            <Filter className='mr-2 h-4 w-4' />
            <SelectValue placeholder='نوع الملف' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>كل الأنواع</SelectItem>
            {fileTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type?.toUpperCase() || 'Unknown'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className='flex space-x-2'>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size='icon'
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className='h-4 w-4' />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size='icon'
            onClick={() => setViewMode('list')}
          >
            <List className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Sort Controls */}
      <div className='flex flex-wrap gap-2'>
        <Button
          variant={sortBy === 'name' ? 'default' : 'outline'}
          size='sm'
          onClick={() => toggleSort('name')}
        >
          الاسم
          {sortBy === 'name' &&
            (sortOrder === 'asc' ? (
              <SortAsc className='ml-1 h-3 w-3' />
            ) : (
              <SortDesc className='ml-1 h-3 w-3' />
            ))}
        </Button>
        <Button
          variant={sortBy === 'date' ? 'default' : 'outline'}
          size='sm'
          onClick={() => toggleSort('date')}
        >
          <Calendar className='mr-1 h-3 w-3' />
          التاريخ
          {sortBy === 'date' &&
            (sortOrder === 'asc' ? (
              <SortAsc className='ml-1 h-3 w-3' />
            ) : (
              <SortDesc className='ml-1 h-3 w-3' />
            ))}
        </Button>
        <Button
          variant={sortBy === 'size' ? 'default' : 'outline'}
          size='sm'
          onClick={() => toggleSort('size')}
        >
          الحجم
          {sortBy === 'size' &&
            (sortOrder === 'asc' ? (
              <SortAsc className='ml-1 h-3 w-3' />
            ) : (
              <SortDesc className='ml-1 h-3 w-3' />
            ))}
        </Button>
        <Button
          variant={sortBy === 'type' ? 'default' : 'outline'}
          size='sm'
          onClick={() => toggleSort('type')}
        >
          النوع
          {sortBy === 'type' &&
            (sortOrder === 'asc' ? (
              <SortAsc className='ml-1 h-3 w-3' />
            ) : (
              <SortDesc className='ml-1 h-3 w-3' />
            ))}
        </Button>
      </div>

      {/* Attachments Grid/List */}
      {filteredAndSortedAttachments.length === 0 ? (
        <div className='py-12 text-center'>
          <FileText className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
          <h3 className='text-muted-foreground mb-2 text-lg font-semibold'>
            لا يوجد رافقات
          </h3>
          <p className='text-muted-foreground text-sm'>
            {searchQuery || selectedType !== 'all'
              ? 'حاول تعديل البحث أو المرشحات'
              : 'لا يوجد رافقات مرفوعة بعد'}
          </p>
        </div>
      ) : (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'space-y-3'
          )}
        >
          {filteredAndSortedAttachments.map((attachment) => (
            <AttachmentItem
              key={attachment.id}
              attachment={attachment}
              onDownload={onDownloadAttachment}
              onPrint={onPrintAttachment}
              className={viewMode === 'list' ? 'max-w-none' : ''}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AttachmentsList;
