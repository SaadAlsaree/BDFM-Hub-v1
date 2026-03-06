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
  Info,
  ChevronLeft,
  ChevronRight
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
  isAudioFile,
  getMimeTypeFromExtension,
  downloadFileFromBase64,
  downloadFileFromBlob,
  printFileFromBase64
} from '@/lib/file-utils';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

type Props = {
  attachmentId: string;
  isOpen: boolean;
  onClose: () => void;
};

const AttachmentItemViewDialog = ({ attachmentId, isOpen, onClose }: Props) => {
  const [activeTab, setActiveTab] = useState('preview');
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
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

  // Create PDF blob URL when PDF data is available
  useEffect(() => {
    if (
      attachmentData?.fileBase64 &&
      attachmentData.fileExtension?.toLowerCase() === '.pdf'
    ) {
      try {
        const byteCharacters = atob(attachmentData.fileBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);

        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (error) {
        console.error('Error creating PDF blob:', error);
        setPdfError('فشل في تحميل ملف PDF');
      }
    } else {
      setPdfBlobUrl(null);
      setPdfError(null);
    }
  }, [attachmentData?.fileBase64, attachmentData?.fileExtension]);

  // Reset page number when PDF changes
  useEffect(() => {
    if (pdfBlobUrl) {
      setPageNumber(1);
      setNumPages(null);
    }
  }, [pdfBlobUrl]);

  const onDownload = async () => {
    try {
      const response = await authApiCall(() =>
        attachmentService.downloadAttachmentClient(attachmentId)
      );

      if (response instanceof Blob && attachmentData) {
        downloadFileFromBlob(
          response,
          attachmentData.fileName || 'download'
        );

        toast({
          title: 'نجح',
          description: 'تم تحميل الملف بنجاح'
        });
      } else {
        toast({
          title: 'خطأ',
          description: 'فشل تحميل الملف',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل الملف',
        variant: 'destructive'
      });
    }
  };

  const onPrint = async () => {
    if (!attachmentData?.fileBase64) {
      toast({
        title: 'خطأ',
        description: 'لا يوجد محتوى للطباعة',
        variant: 'destructive'
      });
      return;
    }

    try {
      const extension = attachmentData.fileExtension || '';
      const mimeType = getMimeTypeFromExtension(extension);

      await printFileFromBase64(
        attachmentData.fileBase64,
        attachmentData.fileName || 'file',
        mimeType,
        extension
      );

      toast({
        title: 'نجح',
        description: 'تم فتح نافذة الطباعة'
      });
    } catch (error) {
      console.error('Print error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'فشل في فتح نافذة الطباعة';

      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive'
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
      if (pdfError) {
        return (
          <div className='text-muted-foreground flex h-64 flex-col items-center justify-center'>
            <FileText className='mb-4 h-16 w-16' />
            <p className='text-center'>{pdfError}</p>
            <Button onClick={onDownload} className='mt-4' variant='outline'>
              <Download className='mr-2 h-4 w-4' />
              تحميل للعرض
            </Button>
          </div>
        );
      }

      if (!pdfBlobUrl) {
        return (
          <div className='flex h-64 items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin' />
          </div>
        );
      }

      return (
        <div className='flex flex-col items-center space-y-4 p-4'>
          <div className='flex items-center justify-center rounded-lg border bg-white'>
            <Document
              file={pdfBlobUrl}
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
                setPdfError(null);
              }}
              onLoadError={(error) => {
                console.error('PDF load error:', error);
                setPdfError('فشل في تحميل ملف PDF');
              }}
              loading={
                <div className='flex h-96 items-center justify-center'>
                  <Loader2 className='h-8 w-8 animate-spin' />
                </div>
              }
              error={
                <div className='text-muted-foreground flex h-64 flex-col items-center justify-center'>
                  <FileText className='mb-4 h-16 w-16' />
                  <p className='text-center'>فشل في تحميل ملف PDF</p>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                className='border border-gray-200'
                renderTextLayer={true}
                renderAnnotationLayer={true}
                scale={1.2}
              />
            </Document>
          </div>

          {numPages && numPages > 1 && (
            <div className='flex items-center space-x-4'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
                disabled={pageNumber <= 1}
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <span className='text-sm'>
                صفحة {pageNumber} من {numPages}
              </span>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  setPageNumber((prev) => Math.min(numPages, prev + 1))
                }
                disabled={pageNumber >= numPages}
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          )}
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
        <DialogContent className='max-h-screen max-w-6xl'>
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
        <DialogContent className='max-h-screen max-w-6xl'>
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
      <DialogContent className='max-h-screen w-[680px]'>
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
