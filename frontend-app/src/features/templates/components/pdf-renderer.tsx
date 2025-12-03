'use client';

import { pdf } from '@react-pdf/renderer';
import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { getTemplate } from '../templates/registry';
import { Icons } from '@/components/icons';
import { useAsync } from 'react-use';
import { Button } from '@/components/ui/button';
import { CorrespondenceDetails } from '@/features/correspondence/inbox-list/types/correspondence-details';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

type TPdfRendererProps = {
  formData: CorrespondenceDetails;
  templateId: string;
  onDownloadReady?: (url: string) => void;
  attachments?: number;
};

const PdfRenderer = ({
  formData,
  templateId,
  onDownloadReady,
  attachments
}: TPdfRendererProps) => {
  const [numPages, setNumPages] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [previousRenderValue, setPreviousRenderValue] = useState<string | null>(
    null
  );
  // const { setDownloadLink } = useResumeDownload();

  const template = getTemplate(templateId);
  const Template = template?.component;

  const render = useAsync(async () => {
    if (!formData) return null;

    const blob = await pdf(
      <Template formData={formData} attachments={attachments} />
    ).toBlob();
    const url = URL.createObjectURL(blob);

    return url;
  }, [formData, templateId]);

  // Notify parent when download is ready - separate effect to avoid infinite loop
  useEffect(() => {
    if (render.value && onDownloadReady) {
      onDownloadReady(render.value);
    }
  }, [render.value, onDownloadReady]);

  console.log('render=>>>>', render.value);

  // useEffect(() => setDownloadLink(render?.value!), [render.value]);

  // useEffect(() => onUrlChange(render?.value!), [render.value]);

  // useEffect(() => onRenderError(render.error), [render.error]);

  const onPreviousPage = () => {
    setCurrentPage((prev) => prev - 1);
  };

  const onNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const onDocumentLoad = (d: any) => {
    setNumPages(d.numPages);
    setCurrentPage((prev) => Math.min(prev, d.numPages));
  };

  const isFirstRendering = !previousRenderValue;

  const isLatestValueRendered = previousRenderValue === render.value;
  const isBusy = render.loading || !isLatestValueRendered;

  const shouldShowTextLoader = isFirstRendering && isBusy;
  const shouldShowPreviousDocument = !isFirstRendering && isBusy;

  function generateDownloadFilename() {
    const timestamp = new Date().getTime();
    return `next-resume-${timestamp}.pdf`;
  }

  const handlePrint = () => {
    if (!render.value) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.src = render.value;

    document.body.appendChild(iframe);

    iframe.onload = () => {
      try {
        iframe.contentWindow?.print();
      } catch (error) {
        console.error('Error printing:', error);
        // Fallback: open in new window
        window.open(render.value || '', '_blank');
      }
      // Clean up after printing
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    };
  };

  return (
    <div className='flex h-full flex-col'>
      <div className='flex-1 overflow-auto'>
        <div className='flex min-h-full flex-col items-center justify-start p-6'>
          {shouldShowPreviousDocument && previousRenderValue ? (
            <Document
              key={previousRenderValue}
              className='opacity-50'
              file={previousRenderValue}
              loading={null}
            >
              <Page
                key={currentPage}
                pageNumber={currentPage}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className='mb-4 shadow-lg'
              />
            </Document>
          ) : null}
          <div id='resume-pdf-preview' className='flex w-full justify-center'>
            <Document
              key={render.value}
              className={shouldShowPreviousDocument ? 'absolute' : ''}
              file={render.value}
              loading={
                <div className='flex min-h-[400px] items-center justify-center p-8'>
                  <div className='text-center'>
                    <Icons.spinner className='mx-auto mb-2 h-8 w-8 animate-spin' />
                    <p className='text-muted-foreground text-sm'>
                      جاري تحميل القالب...
                    </p>
                  </div>
                </div>
              }
              onLoadSuccess={onDocumentLoad}
              error={
                <div className='flex min-h-[400px] items-center justify-center p-8'>
                  <div className='text-center'>
                    <Icons.warning className='mx-auto mb-2 h-8 w-8 text-red-500' />
                    <p className='text-sm text-red-500'>خطأ في تحميل القالب</p>
                  </div>
                </div>
              }
            >
              <Page
                key={currentPage}
                pageNumber={currentPage}
                onRenderSuccess={() => setPreviousRenderValue(render.value!)}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className='border border-gray-200 bg-white shadow-lg'
                scale={1.2}
              />
            </Document>
          </div>
        </div>
      </div>

      {/* Controls - Fixed at bottom */}
      <div className='border-t bg-gray-50 p-4'>
        <div className='flex items-center justify-between'>
          {/* Page Navigation */}
          <div className='flex items-center gap-3'>
            {numPages && numPages > 1 && (
              <>
                <Button
                  size={'sm'}
                  variant='outline'
                  onClick={onPreviousPage}
                  disabled={currentPage <= 1}
                  className='disabled:opacity-50'
                >
                  <Icons.chevronLeft className='mr-1 h-4 w-4' />
                  السابق
                </Button>
                <span className='rounded border bg-white px-3 py-1 text-sm'>
                  صفحة {currentPage} من {numPages}
                </span>
                <Button
                  size={'sm'}
                  variant='outline'
                  onClick={onNextPage}
                  disabled={currentPage >= numPages}
                  className='disabled:opacity-50'
                >
                  التالي
                  <Icons.chevronRight className='ml-1 h-4 w-4' />
                </Button>
              </>
            )}
            {numPages === 1 && (
              <span className='text-muted-foreground text-sm'>
                مستند من صفحة واحدة
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className='flex items-center gap-2'>
            {/* Print Button */}
            <Button
              size='sm'
              variant='outline'
              onClick={handlePrint}
              disabled={!render.value || render.loading}
            >
              <Icons.printer className='mr-2 h-4 w-4' />
              طباعة
            </Button>

            {/* Download Button */}
            <Button
              size='sm'
              className='bg-primary hover:bg-primary/90'
              disabled={!render.value || render.loading}
              asChild={!!render.value && !render.loading}
            >
              {render.value && !render.loading ? (
                <a href={render.value} download={generateDownloadFilename()}>
                  <Icons.arrowRight className='mr-2 h-4 w-4' />
                  تحميل PDF
                </a>
              ) : (
                <>
                  <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
                  جاري التحضير...
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PdfRenderer;
