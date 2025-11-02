import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { leaveWorkflowStepTemplateService } from '@/features/leave-workflow-step-template/api/leave-workflow-step-template.service';
import LeaveWorkflowStepTemplateViewPage from '@/features/leave-workflow-step-template/components/leave-workflow-step-template-view-page';
import { LeaveWorkflowStepTemplate } from '@/features/leave-workflow-step-template/types/leave-workflow-step-template';
import React, { Suspense } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { leaveWorkflowService } from '@/features/leave-workflow/api/leave-workflow.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ActionTypeEnum,
  ActionTypeDisplay,
  CustomWorkflowTargetTypeEnum,
  CustomWorkflowTargetTypeDisplay
} from '@/features/leave-workflow-step-template/types/leave-workflow-step-template';
import { formatDate } from '@/features/leave-workflow-step-template/utils/leave-workflow-step-template';
import { IconCheck, IconX, IconEdit, IconTrash } from '@tabler/icons-react';

export const metadata = {
  title: 'تفاصيل قالب خطوة مسار العمل',
  description: 'عرض تفاصيل قالب خطوة مسار العمل'
};

type PageProps = {
  params: Promise<{ id: string }>;
};

const page = async (props: PageProps) => {
  const params = await props.params;
  const templateId = params.id;

  const templateData =
    await leaveWorkflowStepTemplateService.getLeaveWorkflowStepTemplateById(
      templateId
    );
  const template = templateData?.data as LeaveWorkflowStepTemplate;

  if (!template) {
    return (
      <PageContainer scrollable>
        <div className='flex-1 space-y-4'>
          <Heading
            title='قالب خطوة مسار العمل'
            description='لم يتم العثور على القالب'
          />
        </div>
      </PageContainer>
    );
  }

  const workflowData = await leaveWorkflowService.getLeaveWorkflowById(
    template.workflowId!
  );

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title={`قالب خطوة مسار العمل #${template.stepOrder || '-'}`}
            description={`مسار العمل: ${
              workflowData?.data?.workflowName || template.workflowId
            }`}
          />
          <div className='flex gap-2'>
            <Link
              href={`/leave-workflow/${template.workflowId}/step-template/${template.id}/edit`}
            >
              <Button variant='outline'>
                <IconEdit className='mr-2 h-4 w-4' />
                تعديل
              </Button>
            </Link>
            <Link href={`/leave-workflow/${template.workflowId}/step-templates`}>
              <Button variant='outline'>العودة إلى القوالب</Button>
            </Link>
          </div>
        </div>
        <Separator />

        <Suspense fallback={<FormCardSkeleton />}>
          <Card>
            <CardHeader>
              <CardTitle>معلومات القالب</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    ترتيب الخطوة
                  </p>
                  <p className='text-sm'>{template.stepOrder || '-'}</p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    نوع الإجراء
                  </p>
                  <p className='text-sm'>
                    {template.actionType
                      ? ActionTypeDisplay[
                          template.actionType as ActionTypeEnum
                        ]
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>نوع الهدف</p>
                  <p className='text-sm'>
                    {template.targetType
                      ? CustomWorkflowTargetTypeDisplay[
                          template.targetType as CustomWorkflowTargetTypeEnum
                        ]
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    معرف الهدف
                  </p>
                  <p className='text-sm'>
                    {template.targetIdentifier || '-'}
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    أيام التأخير الافتراضية
                  </p>
                  <p className='text-sm'>
                    {template.defaultDueDateOffsetDays || 0} يوم
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>الحالة</p>
                  <Badge variant={template.isActive ? 'default' : 'outline'}>
                    {template.isActive ? (
                      <>
                        <IconCheck className='mr-1 h-3 w-3' />
                        نشط
                      </>
                    ) : (
                      <>
                        <IconX className='mr-1 h-3 w-3' />
                        غير نشط
                      </>
                    )}
                  </Badge>
                </div>
              </div>

              {template.defaultInstructionText && (
                <div className='mt-4'>
                  <p className='text-sm font-medium text-gray-500'>
                    نص التعليمات الافتراضي
                  </p>
                  <p className='mt-1 text-sm'>{template.defaultInstructionText}</p>
                </div>
              )}

              <Separator />

              <div className='grid grid-cols-2 gap-4 text-xs text-gray-500'>
                <div>
                  <p>تاريخ الإنشاء: {formatDate(template.createAt)}</p>
                </div>
                {template.lastUpdateAt && (
                  <div>
                    <p>آخر تحديث: {formatDate(template.lastUpdateAt)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default page;

