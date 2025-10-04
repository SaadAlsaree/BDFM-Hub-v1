'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import AttachmentForm from './attachment-form';

interface AttachmentFormExampleProps {
  correspondenceId?: string;
  tableName?: number; // 1 for correspondence, 2 for mail files, etc.
}

/**
 * Example component showing how to use AttachmentForm with correspondence or other tables
 *
 * Usage:
 * 1. For Correspondence: <AttachmentFormExample correspondenceId="uuid" tableName={1} />
 * 2. For Mail Files: <AttachmentFormExample correspondenceId="uuid" tableName={2} />
 * 3. For standalone use: <AttachmentFormExample />
 */
const AttachmentFormExample: React.FC<AttachmentFormExampleProps> = ({
  correspondenceId = 'example-uuid-123',
  tableName = 1 // Default to correspondence table
}) => {
  const [attachments, setAttachments] = useState<any[]>([]);

  // Handle attachment changes - you can use this to sync with parent form
  const onAttachmentsChange = (newAttachments: any[]) => {
    setAttachments(newAttachments);
    console.log('Attachments updated:', newAttachments);
  };

  // Handle save completion
  const onSave = (success: boolean) => {
    if (success) {
      toast.success('تم حفظ المرفقات بنجاح!');
      // You can redirect or update parent state here
    } else {
      toast.error('فشل في حفظ المرفقات');
    }
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='text-right'>
            مثال على استخدام نموذج المرفقات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='text-muted-foreground text-right text-sm'>
              <p>معرف الجدول الأساسي: {correspondenceId}</p>
              <p>نوع الجدول: {tableName}</p>
              <p>عدد المرفقات المحملة: {attachments.length}</p>
            </div>

            {/* Attachment Form */}
            <AttachmentForm
              primaryTableId={correspondenceId}
              tableName={tableName}
              onAttachmentsChange={onAttachmentsChange}
              onSave={onSave}
              title='مرفقات المراسلة'
              description='أضف المرفقات المتعلقة بهذه المراسلة'
              maxFiles={5}
              maxFileSize={10} // 10MB
              acceptedFileTypes={[
                '.pdf',
                '.doc',
                '.docx',
                '.jpg',
                '.jpeg',
                '.png'
              ]}
              showSaveButton={true}
            />

            {/* Example buttons for different scenarios */}
            <div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-3'>
              <Card className='p-4'>
                <h4 className='mb-2 text-right font-medium'>للمراسلات</h4>
                <p className='text-muted-foreground mb-2 text-right text-sm'>
                  استخدم tableName = 1
                </p>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => window.location.reload()}
                  className='w-full'
                >
                  إعادة التحميل
                </Button>
              </Card>

              <Card className='p-4'>
                <h4 className='mb-2 text-right font-medium'>
                  للملفات البريدية
                </h4>
                <p className='text-muted-foreground mb-2 text-right text-sm'>
                  استخدم tableName = 2
                </p>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => toast.info('مثال للملفات البريدية')}
                  className='w-full'
                >
                  عرض مثال
                </Button>
              </Card>

              <Card className='p-4'>
                <h4 className='mb-2 text-right font-medium'>استخدام مستقل</h4>
                <p className='text-muted-foreground mb-2 text-right text-sm'>
                  بدون حفظ تلقائي
                </p>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => toast.info('النموذج بدون حفظ تلقائي')}
                  className='w-full'
                >
                  عرض مثال
                </Button>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Example of standalone usage without save button */}
      <Card>
        <CardHeader>
          <CardTitle className='text-right'>استخدام بدون زر الحفظ</CardTitle>
        </CardHeader>
        <CardContent>
          <AttachmentForm
            onAttachmentsChange={(attachments) =>
              console.log('Standalone attachments:', attachments)
            }
            title='رفع مؤقت للملفات'
            description='يمكنك رفع الملفات وسيتم التعامل معها لاحقاً'
            maxFiles={3}
            maxFileSize={5} // 5MB
            showSaveButton={false} // No save button - handled externally
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AttachmentFormExample;
