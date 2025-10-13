'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';

import {
  CustomWorkflowStepList,
  CustomWorkflowStepDetails,
  CustomWorkflowDetails
} from '@/features/customWorkflow/types/customWorkflow';
import { customWorkflowService } from '@/features/customWorkflow/api/customWorkflow.service';
import { getTargetTypeDisplay } from '../utils/customWorkflow';
import CustomWorkflowStepDialog from './custom-workflow-step-dialog';
import { AlertModal } from '@/components/modal/alert-modal';

interface CustomWorkflowStepsManagementProps {
  workflow: CustomWorkflowDetails;
}

export default function CustomWorkflowStepsManagement({
  workflow
}: CustomWorkflowStepsManagementProps) {
  const [steps, setSteps] = useState<CustomWorkflowStepList[]>(
    workflow.steps || []
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStep, setEditingStep] =
    useState<CustomWorkflowStepDetails | null>(null);
  const [deletingStepId, setDeletingStepId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSteps = async () => {
    try {
      const response = await customWorkflowService.getCustomWorkflowStepList({
        workflowId: workflow.id
      });
      if (response?.succeeded) {
        setSteps(response.data?.items || []);
      }
    } catch (error) {
      console.error('Error fetching steps:', error);
    }
  };

  const onAddStep = () => {
    setEditingStep(null);
    setIsDialogOpen(true);
  };

  const onEditStep = async (stepId: string) => {
    try {
      const response =
        await customWorkflowService.getCustomWorkflowStepById(stepId);
      if (response?.succeeded && response.data) {
        setEditingStep(response.data);
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching step details:', error);
      toast.error('فشل في تحميل تفاصيل الخطوة!');
    }
  };

  const onDeleteStep = async (stepId: string) => {
    try {
      setLoading(true);
      const response =
        await customWorkflowService.deleteCustomWorkflowStep(stepId);
      if (response?.succeeded) {
        toast.success('تم حذف الخطوة بنجاح!');
        await fetchSteps();
      } else {
        toast.error('فشل في حذف الخطوة!');
      }
    } catch (error) {
      console.error('Error deleting step:', error);
      toast.error('حدث خطأ أثناء حذف الخطوة!');
    } finally {
      setLoading(false);
      setDeletingStepId(null);
    }
  };

  const onDialogSuccess = () => {
    fetchSteps();
  };

  const sortedSteps = [...steps].sort((a, b) => a.stepOrder - b.stepOrder);

  return (
    <div className='flex flex-col gap-4 p-6'>
      <div className='flex items-center justify-between'>
        <Heading
          title={`إدارة خطوات سير العمل: ${workflow.workflowName}`}
          description='إضافة وتعديل وحذف خطوات سير العمل'
        />
        <Button onClick={onAddStep}>
          <IconPlus className='mr-2 h-4 w-4' />
          إضافة خطوة
        </Button>
      </div>
      <Separator />

      <div className='grid gap-4'>
        {sortedSteps.length > 0 ? (
          sortedSteps.map((step, index) => (
            <Card key={step.id} className='relative'>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium'>
                      {step.stepOrder}
                    </div>
                    <CardTitle className='text-lg'>
                      خطوة {step.stepOrder}
                    </CardTitle>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onEditStep(step.id)}
                    >
                      <IconEdit className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setDeletingStepId(step.id)}
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
                    <label className='text-muted-foreground text-sm font-medium'>
                      نوع الإجراء
                    </label>
                    <p className='text-sm'>
                      <Badge variant='outline'>{step.actionTypeName}</Badge>
                    </p>
                  </div>
                  <div>
                    <label className='text-muted-foreground text-sm font-medium'>
                      نوع الجهة المستهدفة
                    </label>
                    <p className='text-sm'>
                      {getTargetTypeDisplay(step.targetType)}
                    </p>
                  </div>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    ألى
                  </label>
                  <p className='text-primary text-xl font-semibold'>
                    {step.targetIdentifierName}
                  </p>
                </div>
                {step.defaultInstructionText && (
                  <div>
                    <label className='text-muted-foreground text-sm font-medium'>
                      التعليمات الافتراضية
                    </label>
                    <p className='text-sm'>{step.defaultInstructionText}</p>
                  </div>
                )}
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    عدد أيام الاستحقاق
                  </label>
                  <p className='text-sm'>{step.defaultDueDateOffsetDays} يوم</p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className='flex flex-col items-center justify-center py-12'>
              <p className='text-muted-foreground mb-4'>
                لا توجد خطوات في سير العمل
              </p>
              <Button onClick={onAddStep}>
                <IconPlus className='mr-2 h-4 w-4' />
                إضافة أول خطوة
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <CustomWorkflowStepDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        workflowId={workflow.id}
        initialData={editingStep}
        onSuccess={onDialogSuccess}
      />

      <AlertModal
        isOpen={!!deletingStepId}
        onClose={() => setDeletingStepId(null)}
        onConfirm={() => deletingStepId && onDeleteStep(deletingStepId)}
        loading={loading}
      />
    </div>
  );
}
