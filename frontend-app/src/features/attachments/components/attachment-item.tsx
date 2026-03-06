import React from 'react';
import { FileAttachmentList } from '../types/attachment';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Eye,
  Printer,
  FileText,
  Image,
  Video,
  Music,
  File,
  Calendar,
  User,
  HardDrive
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/file-utils';
import { format } from 'date-fns';

type Props = {
  attachment: FileAttachmentList;
  onDownload?: (attachment: FileAttachmentList) => void;
  onPrint?: (attachment: FileAttachmentList) => void;
  className?: string;
};

const getFileIcon = (extension: string | undefined) => {
  if (!extension) return File;

  const ext = extension.toLowerCase().replace('.', '');

  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(ext)) {
    return Image;
  }
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(ext)) {
    return Video;
  }
  if (['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(ext)) {
    return Music;
  }
  if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) {
    return FileText;
  }

  return File;
};

const getFileTypeColor = (extension: string | undefined) => {
  if (!extension) return 'bg-gray-100 text-gray-600';

  const ext = extension.toLowerCase().replace('.', '');

  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(ext)) {
    return 'bg-blue-100 text-blue-600';
  }
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(ext)) {
    return 'bg-purple-100 text-purple-600';
  }
  if (['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(ext)) {
    return 'bg-pink-100 text-pink-600';
  }
  if (['pdf'].includes(ext)) {
    return 'bg-red-100 text-red-600';
  }
  if (['doc', 'docx'].includes(ext)) {
    return 'bg-blue-100 text-blue-600';
  }

  return 'bg-gray-100 text-gray-600';
};

const AttachmentItem = ({
  attachment,
  onDownload,
  onPrint,
  className
}: Props) => {
  const FileIcon = getFileIcon(attachment.fileExtension);
  const fileTypeColor = getFileTypeColor(attachment.fileExtension);

  const onViewAttachment = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (attachment.id) {
      window.open(`/attachments/${attachment.id}`, '_blank');
    }
  };

  const onDownloadAttachment = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDownload?.(attachment);
  };

  const onPrintAttachment = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onPrint?.(attachment);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <>
      <Card
        className={cn(
          'group hover:border-primary/20 cursor-pointer transition-all duration-200 hover:shadow-lg',
          className
        )}
      >
        <CardHeader className='pb-3'>
          <div className='flex items-start justify-between'>
            <div className='flex items-center space-x-3'>
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-lg',
                  fileTypeColor
                )}
              >
                <FileIcon className='h-6 w-6' />
              </div>
              <div className='min-w-0 flex-1'>
                <CardTitle
                  className='line-clamp-1 truncate text-sm font-medium'
                  title={attachment.fileName}
                >
                  {attachment.fileName || 'Untitled file'}
                </CardTitle>
                <CardDescription className='mt-1 text-xs'>
                  {attachment.fileExtension?.toUpperCase() || 'Unknown'} •{' '}
                  {formatFileSize(attachment.fileSize || 0)}
                </CardDescription>
              </div>
            </div>
            <Badge
              variant={attachment.status === 1 ? 'default' : 'secondary'}
              className='shrink-0'
            >
              {attachment.statusName || 'Unknown'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className='pb-3'>
          {attachment.description && (
            <p className='text-muted-foreground mb-3 line-clamp-2 text-sm'>
              {attachment.description}
            </p>
          )}

          <div className='text-muted-foreground flex flex-wrap gap-2 text-xs'>
            {attachment.createAt && (
              <div className='flex items-center space-x-1'>
                <Calendar className='h-3 w-3' />
                <span>{formatDate(attachment.createAt)}</span>
              </div>
            )}
            {attachment.createByName && (
              <div className='flex items-center space-x-1'>
                <User className='h-3 w-3' />
                <span className='max-w-20 truncate'>
                  {attachment.createByName}
                </span>
              </div>
            )}
            {attachment.fileSize && (
              <div className='flex items-center space-x-1'>
                <HardDrive className='h-3 w-3' />
                <span>{formatFileSize(attachment.fileSize)}</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className='pt-0'>
          <div className='flex w-full space-x-2'>
            <Button
              variant='outline'
              size='sm'
              className='flex-1'
              onClick={onViewAttachment}
            >
              <Eye className='mr-2 h-4 w-4' />
              عرض
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='flex-1'
              onClick={onDownloadAttachment}
            >
              <Download className='mr-2 h-4 w-4' />
              تحميل
            </Button>
            <Button variant='outline' size='sm' onClick={onPrintAttachment}>
              <Printer className='h-4 w-4' />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default AttachmentItem;
