'use client';

import { useState } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import {
  CustomWorkflowDetails,
  CustomWorkflowStepDetails
} from '@/features/customWorkflow/types/customWorkflow';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  formatDate,
  getCorrespondenceTypeDisplay
} from '../utils/customWorkflow';
import { Button } from '@/components/ui/button';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import Link from 'next/link';
import CustomWorkflowStepDialog from './custom-workflow-step-dialog';
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
import { customWorkflowService } from '@/features/customWorkflow/api/customWorkflow.service';
import { useAuthApi } from '@/hooks/use-auth-api';
import { toast } from 'sonner';

type CustomWorkflowViewPageProps = {
  workflow: CustomWorkflowDetails;
};

export default function CustomWorkflowViewPage({
  workflow
}: CustomWorkflowViewPageProps) {
  const [isStepDialogOpen, setIsStepDialogOpen] = useState(false);
  const [stepToEdit, setStepToEdit] =
    useState<CustomWorkflowStepDetails | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingStepId, setPendingStepId] = useState<string | null>(null);
  const { authApiCall } = useAuthApi();

  const handleStepDialogSuccess = () => {
    // Refresh the page or refetch data
    window.location.reload();
  };

  const handleEditStep = (stepId: string) => {
    const step = workflow.steps?.find((step) => step.id === stepId);
    if (step) {
      // Map list item to details shape expected by the dialog
      const details: CustomWorkflowStepDetails = {
        id: step.id,
        workflowId: step.workflowId,
        stepOrder: step.stepOrder,
        actionType: step.actionType as number,
        targetType: step.targetType as number,
        targetIdentifier: step.targetIdentifier || '',
        defaultInstructionText: step.defaultInstructionText || '',
        defaultDueDateOffsetDays: step.defaultDueDateOffsetDays ?? 0,
        // Fill system fields with reasonable defaults (dialog only uses a subset)
        createAt: new Date().toISOString(),
        lastUpdateAt: new Date().toISOString(),
        createBy: '',
        lastUpdateBy: '',
        statusId: 0,
        statusName: ''
      };

      setStepToEdit(details);
      setIsStepDialogOpen(true);
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    try {
      const response = await authApiCall(async () =>
        customWorkflowService.deleteCustomWorkflowStep(stepId)
      );

      if (response?.succeeded) {
        toast.success('تم حذف خطوة سير العمل بنجاح!');
        window.location.reload();
      } else {
        toast.error('فشل في حذف خطوة سير العمل!');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء حذف خطوة سير العمل!');
    }
  };

  return (
    <div className='flex flex-col gap-4 p-6'>
      <div className='flex items-center justify-between'>
        <Heading
          title={`سير العمل: ${workflow.workflowName}`}
          description='عرض تفاصيل سير العمل'
        />
        <div className='flex gap-2'>
          <Link href={`/custom-workflow/${workflow.id}/edit`}>
            <Button variant='outline'>
              <IconEdit className='mr-2 h-4 w-4' />
              تعديل
            </Button>
          </Link>
          {/* <Link href={`/custom-workflow/${workflow.id}/steps`}>
            <Button>
              <IconPlus className='mr-2 h-4 w-4' />
              إدارة الخطوات
            </Button>
          </Link> */}
        </div>
      </div>
      <Separator />

      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>المعلومات الأساسية</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <label className='text-muted-foreground text-sm font-medium'>
                اسم سير العمل
              </label>
              <p className='text-sm'>{workflow.workflowName}</p>
            </div>
            <div>
              <label className='text-muted-foreground text-sm font-medium'>
                نوع المراسلة المحفزة
              </label>
              <p className='text-sm'>
                {getCorrespondenceTypeDisplay(
                  workflow.triggeringCorrespondenceType
                )}
              </p>
            </div>
            <div>
              <label className='text-muted-foreground text-sm font-medium'>
                الجهة
              </label>
              <div className='mt-1'>
                <Badge>{workflow.triggeringUnitName}</Badge>
              </div>
            </div>
            <div>
              <label className='text-muted-foreground text-sm font-medium'>
                الوصف
              </label>
              <p className='text-sm'>{workflow.description || 'لا يوجد وصف'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>معلومات النظام</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <label className='text-muted-foreground text-sm font-medium'>
                تاريخ الإنشاء
              </label>
              <p className='text-sm'>
                {formatDate(workflow.createAt ?? undefined)}
              </p>
            </div>
            <div>
              <label className='text-muted-foreground text-sm font-medium'>
                آخر تحديث
              </label>
              <p className='text-sm'>
                {formatDate(workflow.lastUpdateAt ?? undefined)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className='flex items-center justify-between gap-2'>
            <CardTitle>
              خطوات سير العمل ({workflow.steps?.length || 0})
            </CardTitle>
            <Button onClick={() => setIsStepDialogOpen(true)} className='mt-4'>
              <IconPlus className='mr-2 h-4 w-4' />
              إضافة خطوة
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {workflow.steps && workflow.steps.length > 0 ? (
            <div className='space-y-4'>
              {workflow.steps.map((step) => (
                <div
                  key={step.id}
                  className='flex items-center justify-between rounded-lg border p-4'
                >
                  <div className='flex items-center gap-4'>
                    <div className='bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium'>
                      {step.stepOrder}
                    </div>
                    <div>
                      <p className='font-medium'>{step.targetTypeName}</p>
                      <p className='text-muted-foreground text-sm'>
                        {step.defaultInstructionText || 'لا توجد تعليمات'}
                      </p>
                    </div>
                  </div>
                  {/* قم بإضافة زر التعديل الخاص بالخطوة هنا */}
                  <div className='flex items-center gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => handleEditStep(step.id)}
                    >
                      تعديل
                    </Button>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => {
                        setPendingStepId(step.id);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <IconTrash className='ml-2 h-4 w-4' />
                      حذف
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='py-8 text-center'>
              <p className='text-muted-foreground mb-4'>
                لا توجد خطوات في سير العمل
              </p>
              <Button
                onClick={() => setIsStepDialogOpen(true)}
                className='mt-4'
              >
                <IconPlus className='mr-2 h-4 w-4' />
                إضافة خطوة
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CustomWorkflowStepDialog
        isOpen={isStepDialogOpen}
        workflowId={workflow.id}
        initialData={stepToEdit}
        onClose={() => {
          setIsStepDialogOpen(false);
          setStepToEdit(null);
        }}
        onSuccess={handleStepDialogSuccess}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) setPendingStepId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف خطوة سير العمل</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد أنك تريد حذف هذه الخطوة؟ لا يمكن التراجع عن هذا
              الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (pendingStepId) await handleDeleteStep(pendingStepId);
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
