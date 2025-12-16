import { Spinner } from '@/components/spinner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { WorkflowStep } from '@/features/correspondence/inbox-list/types/correspondence-details';
import {
  InternalActionTypeEnum,
  WorkflowStepStatus
} from '@/features/leave-workflow-step';
import { workflowStepService } from '@/features/workflow-step/api/workflow-step.service';
import {
  UpdateStatusDialogSchema,
  type UpdateStatusDialogFormData
} from '@/features/workflow-step/utils/workflow-step';
import {
  WorkflowStepStatusDisplay,
  InternalActionTypeDisplay
} from '@/features/workflow-step/types/workflow-step';
import { useAuthApi } from '@/hooks/use-auth-api';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, RotateCcw, X, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

interface WorkflowActionProps {
  workflowStep: WorkflowStep;
}
const WorkflowAction = ({ workflowStep }: WorkflowActionProps) => {
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);
  const [loadingReferral, setLoadingReferral] = useState(false);
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] =
    useState(false);
  const [loadingUpdateStatus, setLoadingUpdateStatus] = useState(false);
  const { authApiCall } = useAuthApi();
  const router = useRouter();

  const form = useForm<UpdateStatusDialogFormData>({
    resolver: zodResolver(UpdateStatusDialogSchema),
    defaultValues: {
      workflowStepId: workflowStep.id,
      status: workflowStep.status as WorkflowStepStatus,
      internalActionType: InternalActionTypeEnum.Answer,
      actionDescription: ''
    }
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (isUpdateStatusDialogOpen) {
      form.reset({
        workflowStepId: workflowStep.id,
        status: workflowStep.status as WorkflowStepStatus,
        internalActionType: InternalActionTypeEnum.Answer,
        actionDescription: ''
      });
    }
  }, [isUpdateStatusDialogOpen, workflowStep.id, workflowStep.status, form]);

  // approve the workflow step
  const handleApprove = async (workflowStepId: string) => {
    try {
      setLoadingApprove(true);
      const result = await authApiCall(() =>
        workflowStepService.logRecipientInternalAction({
          workflowStepId: workflowStepId,
          internalActionType: InternalActionTypeEnum.Answer,
          actionDescription: 'موافق',
          notes: 'موافق',
          actionTimestamp: new Date()
        })
      );
      await authApiCall(() =>
        workflowStepService.completeWorkflowStep(workflowStepId)
      );
      if (result?.succeeded) {
        toast.success('تم إكمال أجراء التحويل بنجاح');
        router.refresh();
      } else {
        toast.error('حدث خطأ أثناء إكمال أجراء التحويل');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء إكمال أجراء التحويل');
    } finally {
      setLoadingApprove(false);
    }
  };

  // reject the workflow step
  const handleReject = async (workflowStepId: string) => {
    try {
      setLoadingReject(true);
      const result = await authApiCall(() =>
        workflowStepService.logRecipientInternalAction({
          workflowStepId: workflowStepId,
          internalActionType: InternalActionTypeEnum.Reject,
          actionDescription: 'مرفوض',
          notes: 'مرفوض',
          actionTimestamp: new Date()
        })
      );
      await authApiCall(() =>
        workflowStepService.updateStatus({
          workflowStepId: workflowStepId,
          status: WorkflowStepStatus.Rejected,
          notes: 'مرفوض'
        })
      );
      if (result?.succeeded) {
        toast.success('تم إكمال أجراء التحويل بنجاح');
        router.refresh();
      } else {
        toast.error('حدث خطأ أثناء إكمال أجراء التحويل');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء إكمال أجراء التحويل');
    } finally {
      setLoadingReject(false);
    }
  };

  // update status handler - executes both logRecipientInternalAction and updateStatus
  const onUpdateStatusSubmit = async (data: UpdateStatusDialogFormData) => {
    try {
      setLoadingUpdateStatus(true);

      // First: log recipient internal action
      const logResult = await authApiCall(() =>
        workflowStepService.logRecipientInternalAction({
          workflowStepId: data.workflowStepId,
          internalActionType: data.internalActionType,
          actionDescription: data.actionDescription,
          actionTimestamp: new Date()
        })
      );

      // Second: update status
      const updateResult = await authApiCall(() =>
        workflowStepService.updateStatus({
          workflowStepId: data.workflowStepId,
          status: data.status
        })
      );

      if (logResult?.succeeded && updateResult?.succeeded) {
        toast.success('تم تحديث الحالة بنجاح');
        setIsUpdateStatusDialogOpen(false);
        form.reset();
        router.refresh();
      } else {
        toast.error('حدث خطأ أثناء تحديث الحالة');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث الحالة');
    } finally {
      setLoadingUpdateStatus(false);
    }
  };
  return (
    <div className='flex justify-end'>
      <div className='flex items-center gap-2'>
        {workflowStep.recipientActions.length === 0 && (
          <Button
            variant='default'
            size='sm'
            className='bg-red-500 hover:bg-red-600 active:bg-red-500'
            onClick={() => handleReject(workflowStep.id)}
          >
            <X className='h-4 w-4' />
            مرفوض{' '}
            {loadingReject ? (
              <Spinner variant='default' className='h-4 w-4' />
            ) : (
              ''
            )}
          </Button>
        )}

        {workflowStep.recipientActions.length === 0 && (
          <Button
            variant='default'
            size='sm'
            className='bg-green-500 hover:bg-green-600 active:bg-green-500'
            onClick={() => handleApprove(workflowStep.id)}
          >
            <Check className='h-4 w-4' />
            موافق{' '}
            {loadingApprove ? (
              <Spinner variant='default' className='h-4 w-4' />
            ) : (
              ''
            )}
          </Button>
        )}

        {/* Update Status Dialog */}
        {workflowStep.recipientActions.length === 0 && (
          <Dialog
            open={isUpdateStatusDialogOpen}
            onOpenChange={setIsUpdateStatusDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size='sm'>
                {/* <Edit className='h-4 w-4' /> */}
                أجراء مع هامش
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle> أجراء خطوة سير العمل</DialogTitle>
                <DialogDescription>
                  أجراء خطوة سير العمل وإضافة ملاحظات إضافية إذا لزم الأمر
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onUpdateStatusSubmit)}
                  className='space-y-4'
                >
                  <FormField
                    control={form.control}
                    name='internalActionType'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع الإجراء</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(
                              Number(value) as InternalActionTypeEnum
                            )
                          }
                          value={String(field.value)}
                        >
                          <FormControl className='w-full'>
                            <SelectTrigger>
                              <SelectValue placeholder='اختر نوع الإجراء' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(InternalActionTypeDisplay).map(
                              ([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='actionDescription'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف الإجراء</FormLabel>
                        <FormControl>
                          <Textarea placeholder='أدخل وصف الإجراء' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='status'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الحالة</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value) as WorkflowStepStatus)
                          }
                          value={String(field.value)}
                        >
                          <FormControl className='w-full'>
                            <SelectTrigger>
                              <SelectValue placeholder='اختر الحالة' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(WorkflowStepStatusDisplay).map(
                              ([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => setIsUpdateStatusDialogOpen(false)}
                      disabled={loadingUpdateStatus}
                    >
                      إلغاء
                    </Button>
                    <Button type='submit' disabled={loadingUpdateStatus}>
                      {loadingUpdateStatus ? (
                        <>
                          <Spinner variant='default' className='h-4 w-4' />
                          جاري الحفظ...
                        </>
                      ) : (
                        'حفظ'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default WorkflowAction;
