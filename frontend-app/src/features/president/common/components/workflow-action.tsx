import { Spinner } from '@/components/spinner';
import { Button } from '@/components/ui/button';
import { WorkflowStep } from '@/features/correspondence/inbox-list/types/correspondence-details';
import {
  InternalActionTypeEnum,
  WorkflowStepStatus
} from '@/features/leave-workflow-step';
import { workflowStepService } from '@/features/workflow-step/api/workflow-step.service';
import { useAuthApi } from '@/hooks/use-auth-api';
import { Check, RotateCcw, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface WorkflowActionProps {
  workflowStep: WorkflowStep;
}
const WorkflowAction = ({ workflowStep }: WorkflowActionProps) => {
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);
  const [loadingReferral, setLoadingReferral] = useState(false);
  const { authApiCall } = useAuthApi();
  const router = useRouter();

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

  // return to edit the workflow step
  const handleReferral = async (workflowStepId: string) => {
    try {
      setLoadingReferral(true);
      const result = await authApiCall(() =>
        workflowStepService.logRecipientInternalAction({
          workflowStepId: workflowStepId,
          internalActionType: InternalActionTypeEnum.Referral,
          actionDescription: 'مرجع',
          notes: 'مرجع',
          actionTimestamp: new Date()
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
      setLoadingReferral(false);
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
            className='bg-orange-500 hover:bg-orange-600 active:bg-orange-500'
            onClick={() => handleReferral(workflowStep.id)}
          >
            <RotateCcw className='h-4 w-4' />
            مرجع{' '}
            {loadingReferral ? (
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
      </div>
    </div>
  );
};

export default WorkflowAction;
