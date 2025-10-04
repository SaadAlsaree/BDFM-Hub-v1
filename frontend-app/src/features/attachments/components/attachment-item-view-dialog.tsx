import React, { useState, useEffect } from 'react';
import { attachmentService } from '../api/attachment.service';
import { useQuery } from '@tanstack/react-query';
import { useAuthApi } from '@/hooks/use-auth-api';
import {
  Loader2,
  Download,
  Printer,
  X,
  FileText,
  Image,
  Video,
  Music,
  File,
  Eye,
  Info
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  formatFileSize,
  isImageFile,
  isVideoFile,
  isAudioFile
} from '@/lib/file-utils';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

type Props = {
  attachmentId: string;
  isOpen: boolean;
  onClose: () => void;
};

const AttachmentItemViewDialog = ({ attachmentId, isOpen, onClose }: Props) => {
  const [activeTab, setActiveTab] = useState('preview');
  const { authApiCall } = useAuthApi();
  const { toast } = useToast();

  // Get attachment details
  const {
    data: attachment,
    isLoading,
    error
  } = useQuery({
    queryKey: ['attachment', attachmentId],
    queryFn: async () =>
      await authApiCall(() =>
        attachmentService.getAttachmentDetail(attachmentId)
      ),
    enabled: isOpen && !!attachmentId
  });

  const attachmentData = attachment?.data;

  const onDownload = async () => {
    try {
      const response = await authApiCall(() =>
        attachmentService.downloadAttachment(attachmentId)
      );

      if (response?.data) {
        const link = document.createElement('a');
        link.href = `data:application/octet-stream;base64,${response.data}`;
        link.download = attachmentData?.fileName || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: 'Success',
          description: 'File downloaded successfully'
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to download file',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive'
      });
    }
  };

  const onPrint = () => {
    if (
      attachmentData?.fileBase64 &&
      isImageFile(attachmentData.fileExtension || '')
    ) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Print ${attachmentData.fileName}</title></head>
            <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;">
              <img src="data:image/${attachmentData.fileExtension?.replace('.', '')};base64,${attachmentData.fileBase64}" 
                   style="max-width:100%;max-height:100%;object-fit:contain;" 
                   onload="window.print();window.close();" />
            </body>
          </html>
        `);
      }
    } else {
      toast({
        title: 'Print',
        description: `Print functionality for ${attachmentData?.fileName}`
      });
    }
  };

  const renderFilePreview = () => {
    if (!attachmentData?.fileBase64) {
      return (
        <div className='text-muted-foreground flex h-64 flex-col items-center justify-center'>
          <File className='mb-4 h-16 w-16' />
          <p>لا يوجد معاينة متاحة</p>
        </div>
      );
    }

    const extension = attachmentData.fileExtension || '';
    const base64Data = attachmentData.fileBase64;

    if (isImageFile(extension)) {
      return (
        <div className='flex items-center justify-center p-4'>
          <img
            src={`data:image/${extension.replace('.', '')};base64,${base64Data}`}
            alt={attachmentData.fileName}
            className='max-h-96 max-w-full rounded-lg object-contain shadow-md'
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const nextElement = e.currentTarget
                .nextElementSibling as HTMLElement;
              if (nextElement) nextElement.style.display = 'flex';
            }}
          />
          <div className='text-muted-foreground hidden h-64 flex-col items-center justify-center'>
            <Image className='mb-4 h-16 w-16' />
            <p>فشل تحميل الصورة</p>
          </div>
        </div>
      );
    }

    if (isVideoFile(extension)) {
      return (
        <div className='flex items-center justify-center p-4'>
          <video
            controls
            className='max-h-96 max-w-full rounded-lg shadow-md'
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const nextElement = e.currentTarget
                .nextElementSibling as HTMLElement;
              if (nextElement) nextElement.style.display = 'flex';
            }}
          >
            <source
              src={`data:video/${extension.replace('.', '')};base64,${base64Data}`}
            />
            لا يدعم متصفحك علامة الفيديو.
          </video>
          <div className='text-muted-foreground hidden h-64 flex-col items-center justify-center'>
            <Video className='mb-4 h-16 w-16' />
            <p>لا يدعم متصفحك علامة الفيديو</p>
          </div>
        </div>
      );
    }

    if (isAudioFile(extension)) {
      return (
        <div className='flex items-center justify-center p-4'>
          <div className='w-full max-w-md'>
            <div className='mb-4 flex items-center justify-center'>
              <Music className='text-muted-foreground h-16 w-16' />
            </div>
            <audio
              controls
              className='w-full'
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const nextElement = e.currentTarget
                  .nextElementSibling as HTMLElement;
                if (nextElement) nextElement.style.display = 'block';
              }}
            >
              <source
                src={`data:audio/${extension.replace('.', '')};base64,${base64Data}`}
              />
              لا يدعم متصفحك علامة الصوت.
            </audio>
            <p className='text-muted-foreground mt-4 hidden text-center'>
              فشل تحميل الصوت
            </p>
          </div>
        </div>
      );
    }

    if (extension === '.pdf') {
      return (
        <div className='flex items-center justify-center p-4'>
          <iframe
            src={`data:application/pdf;base64,${base64Data}`}
            className='h-96 w-full rounded-lg border'
            title={attachmentData.fileName}
          />
        </div>
      );
    }

    // Default preview for other file types
    return (
      <div className='text-muted-foreground flex h-64 flex-col items-center justify-center'>
        <FileText className='mb-4 h-16 w-16' />
        <p className='text-center'>
          لا يوجد معاينة متاحة ل {extension.toUpperCase()}
        </p>
        <Button onClick={onDownload} className='mt-4' variant='outline'>
          <Download className='mr-2 h-4 w-4' />
          تحميل للعرض
        </Button>
      </div>
    );
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPP p');
    } catch {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='max-h-[100vh] max-w-6xl'>
          <div className='flex h-96 items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin' />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !attachmentData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='max-h-[100vh] max-w-6xl'>
          <div className='text-muted-foreground flex flex-col items-center justify-center py-8'>
            <FileText className='mb-4 h-16 w-16' />
            <h3 className='mb-2 text-lg font-semibold'>فشل تحميل الملف</h3>
            <p className='text-center text-sm'>
              لا يمكن تحميل الملف. يرجى المحاولة مرة أخرى لاحقًا.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-h-[100vh] w-[680px]'>
        <DialogHeader className='p-6 pb-0'>
          <div className='flex items-start justify-between'>
            <div className='min-w-0 flex-1'>
              <DialogTitle
                className='line-clamp-1 text-xl font-semibold'
                title={attachmentData.fileName}
              >
                {attachmentData.fileName || 'Untitled file'}
              </DialogTitle>
              <DialogDescription className='mt-1'>
                {attachmentData.fileExtension?.toUpperCase() || 'Unknown'} •{' '}
                {formatFileSize(attachmentData.fileSize || 0)}
                {attachmentData.createAt && (
                  <> • تم إنشاؤه {formatDate(attachmentData.createAt)}</>
                )}
              </DialogDescription>
            </div>
            <div className='ml-4 flex items-center space-x-2'>
              <Badge
                variant={
                  attachmentData.statusId === 1 ? 'default' : 'secondary'
                }
              >
                {attachmentData.statusName || 'Unknown'}
              </Badge>
              <Button variant='ghost' size='icon' onClick={onClose}>
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className='flex-1 overflow-hidden'>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='flex h-full flex-col'
          >
            <div className='border-b px-6'>
              <TabsList className='grid w-full grid-cols-3'>
                <TabsTrigger
                  value='preview'
                  className='flex items-center space-x-2'
                >
                  <Eye className='h-4 w-4' />
                  <span>عرض</span>
                </TabsTrigger>
                <TabsTrigger
                  value='details'
                  className='flex items-center space-x-2'
                >
                  <Info className='h-4 w-4' />
                  <span>التفاصيل</span>
                </TabsTrigger>
                {attachmentData.ocrText && (
                  <TabsTrigger
                    value='text'
                    className='flex items-center space-x-2'
                  >
                    <FileText className='h-4 w-4' />
                    <span>النص المستخرج</span>
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <div className='flex-1 overflow-hidden'>
              <TabsContent value='preview' className='m-0 h-full p-6'>
                <ScrollArea className='h-full'>
                  {renderFilePreview()}
                </ScrollArea>
              </TabsContent>

              <TabsContent value='details' className='m-0 h-full p-6'>
                <ScrollArea className='h-full'>
                  <div className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                      <div className='space-y-4'>
                        <h3 className='font-semibold'>معلومات الملف</h3>
                        <div className='space-y-3'>
                          <div className='flex items-center justify-between'>
                            <span className='text-muted-foreground text-sm'>
                              اسم الملف
                            </span>
                            <span className='text-sm font-medium'>
                              {attachmentData.fileName || 'N/A'}
                            </span>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span className='text-muted-foreground text-sm'>
                              حجم الملف
                            </span>
                            <span className='text-sm font-medium'>
                              {formatFileSize(attachmentData.fileSize || 0)}
                            </span>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span className='text-muted-foreground text-sm'>
                              نوع الملف
                            </span>
                            <span className='text-sm font-medium'>
                              {attachmentData.fileExtension?.toUpperCase() ||
                                'Unknown'}
                            </span>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span className='text-muted-foreground text-sm'>
                              الحالة
                            </span>
                            <Badge
                              variant={
                                attachmentData.statusId === 1
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {attachmentData.statusName || 'Unknown'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className='space-y-4'>
                        <h3 className='font-semibold'>البيانات الوصفية</h3>
                        <div className='space-y-3'>
                          <div className='flex items-center justify-between'>
                            <span className='text-muted-foreground text-sm'>
                              تم إنشاؤه
                            </span>
                            <span className='text-sm font-medium'>
                              {formatDate(attachmentData.createAt)}
                            </span>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span className='text-muted-foreground text-sm'>
                              تم إنشاؤه بواسطة
                            </span>
                            <span className='text-sm font-medium'>
                              {attachmentData.createByName || 'N/A'}
                            </span>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span className='text-muted-foreground text-sm'>
                              آخر تحديث
                            </span>
                            <span className='text-sm font-medium'>
                              {formatDate(attachmentData.lastUpdateAt)}
                            </span>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span className='text-muted-foreground text-sm'>
                              تم التحديث بواسطة
                            </span>
                            <span className='text-sm font-medium'>
                              {attachmentData.lastUpdateBy || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {attachmentData.description && (
                      <>
                        <Separator />
                        <div>
                          <h3 className='mb-2 font-semibold'>الوصف</h3>
                          <p className='text-muted-foreground text-sm'>
                            {attachmentData.description}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              {attachmentData.ocrText && (
                <TabsContent value='text' className='m-0 h-full p-6'>
                  <ScrollArea className='h-full'>
                    <div className='space-y-4'>
                      <div className='flex items-center space-x-2'>
                        <FileText className='text-muted-foreground h-5 w-5' />
                        <h3 className='font-semibold'>النص المستخرج (OCR)</h3>
                      </div>
                      <div className='bg-muted/50 rounded-lg p-4'>
                        <pre className='font-mono text-sm whitespace-pre-wrap'>
                          {attachmentData.ocrText}
                        </pre>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              )}
            </div>
          </Tabs>
        </div>

        <div className='border-t p-6'>
          <div className='flex items-center justify-between'>
            <div className='flex space-x-2'>
              <Button onClick={onDownload} variant='outline'>
                <Download className='mr-2 h-4 w-4' />
                تحميل
              </Button>
              <Button onClick={onPrint} variant='outline'>
                <Printer className='mr-2 h-4 w-4' />
                طباعة
              </Button>
            </div>
            <Button onClick={onClose} variant='secondary'>
              اغلاق
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttachmentItemViewDialog;
