'use client';

import { useState } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import {
  LeaveWorkflowStepTemplate
} from '@/features/leave-workflow-step-template/types/leave-workflow-step-template';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '../utils/leave-workflow-step-template';
import { Button } from '@/components/ui/button';
import {
  IconEdit,
  IconPlus,
  IconTrash,
  IconCheck,
  IconX
} from '@tabler/icons-react';
import Link from 'next/link';
import LeaveWorkflowStepTemplateDialog from './leave-workflow-step-template-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { leaveWorkflowStepTemplateService } from '@/features/leave-workflow-step-template/api/leave-workflow-step-template.service';
import { useAuthApi } from '@/hooks/use-auth-api';
import { toast } from 'sonner';
import {
  ActionTypeEnum,
  ActionTypeDisplay,
  CustomWorkflowTargetTypeEnum,
  CustomWorkflowTargetTypeDisplay
} from '../types/leave-workflow-step-template';

type LeaveWorkflowStepTemplateViewPageProps = {
  workflowId: string;
  templates: LeaveWorkflowStepTemplate[];
};

export default function LeaveWorkflowStepTemplateViewPage({
  workflowId,
  templates
}: LeaveWorkflowStepTemplateViewPageProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] =
    useState<LeaveWorkflowStepTemplate | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(
    null
  );
  const { authApiCall } = useAuthApi();

  const handleDialogSuccess = () => {
    window.location.reload();
  };

  const handleEditTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setTemplateToEdit(template);
      setIsDialogOpen(true);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const response = await authApiCall(async () =>
        leaveWorkflowStepTemplateService.deleteLeaveWorkflowStepTemplate(
          templateId
        )
      );

      if (response?.succeeded) {
        toast.success('تم حذف قالب الخطوة بنجاح!');
        window.location.reload();
      } else {
        toast.error('فشل في حذف قالب الخطوة!');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('حدث خطأ أثناء حذف قالب الخطوة!');
    } finally {
      setShowDeleteDialog(false);
      setPendingTemplateId(null);
    }
  };

  const handleAddTemplate = () => {
    setTemplateToEdit(null);
    setIsDialogOpen(true);
  };

  const sortedTemplates = [...templates].sort(
    (a, b) => (a.stepOrder || 0) - (b.stepOrder || 0)
  );

  return (
    <div className='flex flex-col gap-4 p-6'>
      <div className='flex items-center justify-between'>
        <Heading
          title='إدارة قوالب خطوات مسار العمل'
          description='إضافة وتعديل وحذف قوالب خطوات مسار العمل'
        />
        <Button onClick={handleAddTemplate}>
          <IconPlus className='mr-2 h-4 w-4' />
          إضافة قالب خطوة
        </Button>
      </div>
      <Separator />

      <div className='grid gap-4'>
        {sortedTemplates.length > 0 ? (
          sortedTemplates.map((template, index) => (
            <Card key={template.id} className='relative'>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium'>
                      {template.stepOrder || index + 1}
                    </div>
                    <CardTitle className='text-lg'>
                      قالب خطوة {template.stepOrder || index + 1}
                    </CardTitle>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleEditTemplate(template.id!)}
                    >
                      <IconEdit className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        setPendingTemplateId(template.id!);
                        setShowDeleteDialog(true);
                      }}
                      className='text-red-500 hover:text-red-700'
                    >
                      <IconTrash className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm font-medium text-gray-500'>نوع الإجراء</p>
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
                    <p className='text-sm'>{template.targetIdentifier || '-'}</p>
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-500'>
                      أيام التأخير الافتراضية
                    </p>
                    <p className='text-sm'>
                      {template.defaultDueDateOffsetDays || 0} يوم
                    </p>
                  </div>
                  <div className='col-span-2'>
                    <p className='text-sm font-medium text-gray-500'>
                      نص التعليمات الافتراضي
                    </p>
                    <p className='text-sm'>
                      {template.defaultInstructionText || '-'}
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
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

                <div className='border-t pt-2 text-xs text-gray-500'>
                  <div>تاريخ الإنشاء: {formatDate(template.createAt)}</div>
                  {template.lastUpdateAt && (
                    <div>آخر تحديث: {formatDate(template.lastUpdateAt)}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className='pt-6'>
              <p className='text-center text-gray-500'>
                لا توجد قوالب خطوات. اضغط على &quot;إضافة قالب خطوة&quot;
                لإنشاء واحد جديد.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <LeaveWorkflowStepTemplateDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setTemplateToEdit(null);
        }}
        workflowId={workflowId}
        initialData={templateToEdit}
        onSuccess={handleDialogSuccess}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف قالب الخطوة هذا
              نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingTemplateId) {
                  handleDeleteTemplate(pendingTemplateId);
                }
              }}
              className='bg-red-600 hover:bg-red-700'
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

