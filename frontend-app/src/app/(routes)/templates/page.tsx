'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { TemplateSelection } from '@/features/templates/components/template-selection';
import PdfRenderer from '@/features/templates/components/pdf-renderer';
import { DataEditor } from '@/features/templates/components/data-editor';
import { useTemplateStore } from '@/features/templates/store/use-template-store';
import { TResumeEditFormValues } from '@/features/templates/utils/form-schema';
import { getAllTemplates } from '@/features/templates/templates/registry';
import { CorrespondenceDetails } from '@/features/correspondence/inbox-list/types/correspondence-details';

// Mock data for demonstration
const mockResumeData: TResumeEditFormValues = {
  personal_details: {
    resume_job_title: 'مهندس برمجيات أول',
    fname: 'أحمد',
    lname: 'محمد',
    email: 'ahmed.mohamed@example.com',
    phone: '966123456789',
    country: 'المملكة العربية السعودية',
    city: 'الرياض',
    summary:
      'مهندس برمجيات ماهر ومحفز بخبرة تزيد عن 3 سنوات في تطوير وصيانة التطبيقات عالية الجودة. قدرة مثبتة على التعاون بفعالية مع الفرق متعددة التخصصات لتقديم تجارب مستخدم استثنائية. خبرة في Flutter و Dart و RESTful APIs ومنهجيات Agile. أسعى للحصول على دور تحدي كمهندس برمجيات واجهة أمامية لاستغلال مهاراتي والمساهمة في نجاح منظمة ديناميكية.'
  },
  jobs: [
    {
      id: 1,
      jobTitle: 'مهندس برمجيات',
      employer: 'شركة التقنية',
      description: 'دور تطوير البرمجيات',
      startDate: '2020-01-01',
      endDate: '2023-12-31',
      city: 'الرياض'
    },
    {
      id: 2,
      jobTitle: 'مطور مبتدئ',
      employer: 'شركة ناشئة',
      description: 'منصب تطوير مبتدئ',
      startDate: '2018-06-01',
      endDate: '2019-12-31',
      city: 'جدة'
    }
  ],
  educations: [
    {
      id: 1,
      school: 'جامعة التقنية',
      degree: 'بكالوريوس',
      field: 'علوم الحاسوب',
      description: 'أكملت درجة البكالوريوس في علوم الحاسوب',
      startDate: '2016-09-01',
      endDate: '2022-06-30',
      city: 'الرياض'
    }
  ],
  skills: [
    { skill_name: 'Flutter', proficiency_level: 'متقدم' },
    { skill_name: 'Dart', proficiency_level: 'متقدم' },
    { skill_name: 'RESTful APIs', proficiency_level: 'متوسط' },
    { skill_name: 'Agile/Scrum', proficiency_level: 'متوسط' },
    { skill_name: 'Git', proficiency_level: 'متقدم' },
    { skill_name: 'حل المشاكل', proficiency_level: 'متقدم' }
  ],
  tools: [
    { tool_name: 'Figma', proficiency_level: 'متوسط' },
    { tool_name: 'Adobe XD', proficiency_level: 'مبتدئ' },
    { tool_name: 'Git', proficiency_level: 'متقدم' }
  ],
  languages: [
    { lang_name: 'العربية', proficiency_level: 'لغة أم' },
    { lang_name: 'الإنجليزية', proficiency_level: 'متقدم' }
  ]
};

export default function TemplatesPage() {
  const {
    selectedTemplate,
    currentTemplate,
    setSelectedTemplate,
    applyTemplate
  } = useTemplateStore();

  const [previewData, setPreviewData] =
    useState<TResumeEditFormValues>(mockResumeData);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [showDataEditor, setShowDataEditor] = useState(false);
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
              <Button
                size='sm'
                variant='outline'
                onClick={handleQuickDownload}
                disabled={!downloadUrl}
                className='mt-1'
              >
                <Icons.arrowRight className='mr-2 h-4 w-4' />
                تحميل سريع
              </Button>
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
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='flex items-center justify-between text-lg'>
                  <span>تخصيص البيانات</span>
                  <Button
                    size='sm'
                    variant={showDataEditor ? 'default' : 'outline'}
                    onClick={() => setShowDataEditor(!showDataEditor)}
                  >
                    <Icons.settings className='mr-2 h-4 w-4' />
                    {showDataEditor ? 'إخفاء' : 'إظهار'}
                  </Button>
                </CardTitle>
              </CardHeader>
              {showDataEditor && (
                <CardContent>
                  <DataEditor
                    data={previewData}
                    onDataChange={setPreviewData}
                  />
                </CardContent>
              )}
            </Card>

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
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg'>ملخص البيانات</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='space-y-2 text-sm'>
                  <div>
                    <span className='font-medium'>الاسم:</span>{' '}
                    {previewData.personal_details?.fname}{' '}
                    {previewData.personal_details?.lname}
                  </div>
                  <div>
                    <span className='font-medium'>المنصب:</span>{' '}
                    {previewData.personal_details?.resume_job_title}
                  </div>
                  <div>
                    <span className='font-medium'>الخبرات:</span>{' '}
                    {previewData.jobs?.length} وظيفة
                  </div>
                  <div>
                    <span className='font-medium'>المهارات:</span>{' '}
                    {previewData.skills?.length} مهارة
                  </div>
                  <div>
                    <span className='font-medium'>التعليم:</span>{' '}
                    {previewData.educations?.length} شهادة
                  </div>
                </div>
              </CardContent>
            </Card>
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
              formData={previewData as CorrespondenceDetails}
              templateId={selectedTemplate}
              onDownloadReady={onDownloadReady}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
