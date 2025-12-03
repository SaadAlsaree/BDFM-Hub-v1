'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { TemplateSelection } from '@/features/templates/components/template-selection';
import PdfRenderer from '@/features/templates/components/pdf-renderer';
import { useTemplateStore } from '@/features/templates/store/use-template-store';
import { getAllTemplates } from '@/features/templates/templates/registry';
import { CorrespondenceDetails } from '@/features/correspondence/inbox-list/types/correspondence-details';

// Mock data for demonstration
type Props = {
  formData: CorrespondenceDetails;
};
export default function TemplatesView({ formData }: Props) {
  const {
    selectedTemplate,
    currentTemplate,
    setSelectedTemplate,
    applyTemplate
  } = useTemplateStore();

  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const templates = getAllTemplates();

  const onTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const onApplyTemplate = (templateId: string) => {
    applyTemplate(templateId);
  };

  const onDownloadReady = useCallback((url: string) => {
    setDownloadUrl(url);
  }, []);

  const handleQuickDownload = useCallback(() => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `resume-${selectedTemplate}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [downloadUrl, selectedTemplate]);

  const handlePrint = useCallback(() => {
    if (!downloadUrl) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.src = downloadUrl;

    document.body.appendChild(iframe);

    iframe.onload = () => {
      try {
        iframe.contentWindow?.print();
      } catch (error) {
        // Fallback: open in new window
        window.open(downloadUrl, '_blank');
      }
      // Clean up after printing
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    };
  }, [downloadUrl]);

  const currentTemplateInfo = templates.find((t) => t.id === selectedTemplate);

  return (
    <div className='flex h-screen flex-col'>
      {/* Header Section - Fixed */}
      <div className='bg-background border-b p-4 shadow-sm'>
        <div className='container mx-auto'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>
                معرض القوالب
              </h1>
              <p className='text-muted-foreground text-sm'>
                اختر القوالب وخصص البيانات مع المعاينة المباشرة
              </p>
            </div>
            <div className='text-right'>
              {currentTemplateInfo && (
                <div className='text-sm'>
                  <span className='text-muted-foreground'>القالب الحالي: </span>
                  <span className='font-medium'>
                    {currentTemplateInfo.name}
                  </span>
                </div>
              )}
              <div className='mt-1 flex gap-2'>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={handlePrint}
                  disabled={!downloadUrl}
                >
                  <Icons.printer className='mr-2 h-4 w-4' />
                  طباعة
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={handleQuickDownload}
                  disabled={!downloadUrl}
                >
                  <Icons.arrowRight className='mr-2 h-4 w-4' />
                  تحميل سريع
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Full Height */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Left Sidebar - Controls */}
        <div className='bg-muted/30 w-96 overflow-y-auto border-r'>
          <div className='space-y-4 p-4'>
            {/* Data Editor Toggle */}

            {/* Template Selection */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg'>اختيار القالب</CardTitle>
              </CardHeader>
              <CardContent>
                <TemplateSelection
                  selectedTemplate={selectedTemplate}
                  onTemplateSelect={onTemplateSelect}
                  onApplyTemplate={onApplyTemplate}
                  currentTemplate={currentTemplate}
                  compact={true}
                />
              </CardContent>
            </Card>

            {/* Quick Data Summary */}
          </div>
        </div>

        {/* Right Side - Full Template Preview */}
        <div className='flex flex-1 flex-col bg-gray-50'>
          <div className='border-b bg-white p-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium'>معاينة:</span>
                <span className='text-muted-foreground text-sm'>
                  قالب {currentTemplateInfo?.name}
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <span className='text-muted-foreground text-xs'>
                  التحديث المباشر مفعل
                </span>
                <div className='flex items-center gap-1 text-xs'>
                  <div
                    className={`h-2 w-2 rounded-full ${downloadUrl ? 'bg-green-500' : 'bg-yellow-500'}`}
                  ></div>
                  <span className='text-muted-foreground'>
                    {downloadUrl ? 'جاهز للتحميل' : 'جاري التحضير'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className='flex-1 overflow-hidden'>
            <PdfRenderer
              formData={formData}
              templateId={selectedTemplate}
              onDownloadReady={onDownloadReady}
              attachments={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
