'use client';

import React, { useState, useEffect } from 'react';
import { attachmentService } from '../api/attachment.service';
import { useQuery } from '@tanstack/react-query';
import { useAuthApi } from '@/hooks/use-auth-api';
import {
  Loader2,
  Download,
  Printer,
  FileText,
  Image,
  Video,
  Music,
  File,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  formatFileSize,
  isImageFile,
  isVideoFile,
  isAudioFile,
  getMimeTypeFromExtension,
  downloadFileFromBase64,
  printFileFromBase64
} from '@/lib/file-utils';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useRouter } from 'next/navigation';
import { FileAttachmentDetail } from '../types/attachment';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

type Props = {
  attachmentId: string;
  initialData?: FileAttachmentDetail;
};

const AttachmentViewPage = ({ attachmentId, initialData }: Props) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const { authApiCall } = useAuthApi();
  const { toast } = useToast();
  const router = useRouter();

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
    enabled: !!attachmentId,
    initialData: initialData ? { data: initialData } : undefined
  });

  const attachmentData = attachment?.data || initialData;

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

  const onDownload = async () => {
    try {
      const response = await authApiCall(() =>
        attachmentService.downloadAttachment(attachmentId)
      );

      if (response?.data && attachmentData) {
        const extension = attachmentData.fileExtension || '';
        const mimeType = getMimeTypeFromExtension(extension);
        downloadFileFromBase64(
          response.data,
          attachmentData.fileName || 'download',
          mimeType
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

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPP p');
    } catch {
      return 'Invalid date';
    }
  };

  const renderFileContent = () => {
    if (!attachmentData?.fileBase64) {
      return (
        <div className='flex h-64 flex-col items-center justify-center text-gray-500'>
          <File className='mb-4 h-16 w-16' />
          <p>لا يوجد معاينة متاحة</p>
        </div>
      );
    }

    const extension = attachmentData.fileExtension || '';
    const base64Data = attachmentData.fileBase64;

    // Render PDF with all pages scrollable
    if (extension === '.pdf') {
      if (pdfError) {
        return (
          <div className='flex h-64 flex-col items-center justify-center text-gray-500'>
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
              <div className='flex h-64 flex-col items-center justify-center text-gray-500'>
                <FileText className='mb-4 h-16 w-16' />
                <p className='text-center'>فشل في تحميل ملف PDF</p>
              </div>
            }
          >
            <div className='space-y-4'>
              {numPages &&
                Array.from(new Array(numPages), (el, index) => (
                  <div
                    key={`page_${index + 1}`}
                    className='flex justify-center border-b border-gray-200 pb-4 last:border-b-0'
                  >
                    <Page
                      pageNumber={index + 1}
                      className='border border-gray-200 shadow-md'
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      scale={1.5}
                    />
                  </div>
                ))}
            </div>
          </Document>
        </div>
      );
    }

    // Render image with full size and scrollable
    if (isImageFile(extension)) {
      return (
        <div className='flex items-center justify-center p-4'>
          <img
            src={`data:image/${extension.replace('.', '')};base64,${base64Data}`}
            alt={attachmentData.fileName}
            className='max-h-none max-w-full rounded-lg object-contain shadow-md'
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const nextElement = e.currentTarget
                .nextElementSibling as HTMLElement;
              if (nextElement) nextElement.style.display = 'flex';
            }}
          />
          <div className='hidden h-64 flex-col items-center justify-center text-gray-500'>
            <Image className='mb-4 h-16 w-16' />
            <p>فشل تحميل الصورة</p>
          </div>
        </div>
      );
    }

    // Render video
    if (isVideoFile(extension)) {
      return (
        <div className='flex items-center justify-center p-4'>
          <video
            controls
            className='max-h-[80vh] max-w-full rounded-lg shadow-md'
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
          <div className='hidden h-64 flex-col items-center justify-center text-gray-500'>
            <Video className='mb-4 h-16 w-16' />
            <p>لا يدعم متصفحك علامة الفيديو</p>
          </div>
        </div>
      );
    }

    // Render audio
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

    // Default preview for other file types
    return (
      <div className='flex h-64 flex-col items-center justify-center text-gray-500'>
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

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (error || !attachmentData) {
    return (
      <div className='flex h-screen flex-col items-center justify-center text-gray-500'>
        <FileText className='mb-4 h-16 w-16' />
        <h3 className='mb-2 text-lg font-semibold'>فشل تحميل الملف</h3>
        <p className='text-center text-sm'>
          لا يمكن تحميل الملف. يرجى المحاولة مرة أخرى لاحقًا.
        </p>
        <Button
          onClick={() => router.back()}
          className='mt-4'
          variant='outline'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          العودة
        </Button>
      </div>
    );
  }

  return (
    <div className='flex h-screen flex-col bg-white'>
      {/* Toolbar */}
      <div className='border-b bg-white p-4 shadow-sm'>
        <div className='mx-auto flex max-w-7xl items-center justify-between'>
          {/* <div className='flex items-center space-x-4'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => router.back()}
              className='shrink-0'
            >
              <ArrowLeft className='h-5 w-5' />
            </Button>
            <div className='min-w-0 flex-1'>
              <h1 className='line-clamp-1 text-lg font-semibold'>
                {attachmentData.fileName || 'Untitled file'}
              </h1>
              <div className='mt-1 flex items-center space-x-2 text-sm text-gray-500'>
                <span>
                  {attachmentData.fileExtension?.toUpperCase() || 'Unknown'}
                </span>
                <span>•</span>
                <span>{formatFileSize(attachmentData.fileSize || 0)}</span>
                {attachmentData.createAt && (
                  <>
                    <span>•</span>
                    <span>تم إنشاؤه {formatDate(attachmentData.createAt)}</span>
                  </>
                )}
              </div>
            </div>
            <Badge
              variant={attachmentData.statusId === 1 ? 'default' : 'secondary'}
              className='shrink-0'
            >
              {attachmentData.statusName || 'Unknown'}
            </Badge>
          </div> */}
          <div className='flex items-center gap-2'>
            {/* <Button onClick={onDownload} variant='outline' size='sm'>
              <Download className='mr-2 h-4 w-4' />
              تحميل
            </Button> */}
            <Button onClick={onPrint} variant='outline' size='sm'>
              <Printer className='mr-2 h-4 w-4' />
              طباعة
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className='flex-1 overflow-y-auto bg-gray-50'>
        <div className='mx-auto max-w-7xl p-4'>{renderFileContent()}</div>
      </div>
    </div>
  );
};

export default AttachmentViewPage;
