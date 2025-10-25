'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/spinner';
import { useAuthApi } from '@/hooks/use-auth-api';
import { workflowStepService } from '../api/workflow-step.service';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface CompleteWorkflowStepDialogProps {
  workflowStepId: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function CompleteWorkflowStepDialog({
  workflowStepId,
  trigger,
  onSuccess
}: CompleteWorkflowStepDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { authApiCall } = useAuthApi();
  const router = useRouter();

  const handleComplete = async () => {
    setLoading(true);

    try {
      const result = await authApiCall(() =>
        workflowStepService.completeWorkflowStep(workflowStepId)
      );

      if (result?.data) {
        toast.success('تم إكمال أجراء التحويل بنجاح');
        setOpen(false);
        onSuccess?.();
        router.refresh();
      } else {
        toast.error('حدث خطأ أثناء إكمال أجراء التحويل');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء إكمال أجراء التحويل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant='outline' size='sm'>
            <CheckCircle className='mr-2 h-4 w-4' />
            إكمال الإجراء
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <CheckCircle className='h-5 w-5 text-green-600' />
            إكمال أجراء التحويل
          </DialogTitle>
          <DialogDescription>
            هل أنت متأكد من أنك تريد إكمال هذا الإجراء؟ لا يمكن التراجع عن هذا
            الإجراء.
          </DialogDescription>
        </DialogHeader>

        <div className='flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4'>
          <AlertTriangle className='h-5 w-5 flex-shrink-0 text-amber-600' />
          <div className='text-sm text-amber-800'>
            <p className='font-medium'>تحذير:</p>
            <p>
              سيتم إكمال هذا الإجراء وستنتقل المراسلة إلى الخطوة التالية في سير
              العمل.
            </p>
          </div>
        </div>

        <div className='flex justify-end gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleComplete}
            disabled={loading}
            className='bg-green-600 hover:bg-green-700'
          >
            {loading ? (
              <>
                <Spinner variant='default' className='mr-2 h-4 w-4' />
                جاري الإكمال...
              </>
            ) : (
              <>
                <CheckCircle className='mr-2 h-4 w-4' />
                إكمال الإجراء
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CompleteWorkflowStepDialog;
