import React, { useState, useMemo } from 'react';
//use router
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
// hooks
import { useAuthApi } from '@/hooks/use-auth-api';
//services
import { workflowStepService } from '../api/workflow-step.service';
// Types
import {
  WorkflowStepStatus,
  WorkflowStepStatusDisplay,
  UpdateStatusInput
} from '../types/workflow-step';
import { Spinner } from '@/components/spinner';
import { toast } from 'sonner';

type Props = {
  id: string;
  status: WorkflowStepStatus;
  trigger?: React.ReactNode;
};

const UpdateWorkflowStatusDialog = ({
  id,
  status,
  trigger,
}: Props) => {
  const router = useRouter();
  const { authApiCall } = useAuthApi();

  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] =
    useState<WorkflowStepStatus>(status);

  // مراقبة تغييرات الحالة المختارة
  React.useEffect(() => {
    // console.log('Selected status updated to:', selectedStatus, WorkflowStepStatusDisplay[selectedStatus]);
  }, [selectedStatus]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // دالة لتحديد الحالات المتاحة بناءً على الحالة الحالية
  const getAvailableStatuses = useMemo(() => {
    const allStatuses = Object.entries(WorkflowStepStatusDisplay);

    // قواعد بسيطة وواضحة للحالات المتاحة
    return allStatuses.filter(([key]) => {
      const statusValue = parseInt(key) as WorkflowStepStatus;

      // إذا كانت الحالة الحالية "قيد الانتظار"، يمكن الانتقال إلى أي حالة
      if (status === WorkflowStepStatus.Pending) {
        return true;
      }

      // إذا كانت الحالة الحالية "قيد التنفيذ"، يمكن الانتقال إلى أي حالة ما عدا "قيد الانتظار"
      if (status === WorkflowStepStatus.InProgress) {
        return statusValue !== WorkflowStepStatus.Pending;
      }

      // إذا كانت الحالة "مكتمل"، يمكن الانتقال إلى "مرفوض" أو "تعيين" فقط
      if (status === WorkflowStepStatus.Completed) {
        return statusValue === WorkflowStepStatus.Rejected || 
               statusValue === WorkflowStepStatus.Delegated;
      }

      // إذا كانت الحالة "مرفوض"، يمكن الانتقال إلى "قيد التنفيذ" أو "تعيين"
      if (status === WorkflowStepStatus.Rejected) {
        return statusValue === WorkflowStepStatus.InProgress || 
               statusValue === WorkflowStepStatus.Delegated;
      }

      // إذا كانت الحالة "تعيين"، يمكن الانتقال إلى "قيد التنفيذ" أو "مكتمل" أو "مرفوض"
      if (status === WorkflowStepStatus.Delegated) {
        return statusValue === WorkflowStepStatus.InProgress || 
               statusValue === WorkflowStepStatus.Completed ||
               statusValue === WorkflowStepStatus.Rejected;
      }

      // افتراضي: السماح بجميع الحالات
      return true;
    });
  }, [status]);

  const onSubmit = async () => {
    if (selectedStatus === status && !notes.trim()) {
      setOpen(false);
      return;
    }

    setLoading(true);

    const payload: UpdateStatusInput = {
      workflowStepId: id,
      status: selectedStatus,
      notes: notes.trim() || undefined
    };

    const result = await authApiCall(() =>
      workflowStepService.updateStatus(payload)
    );

    
    setLoading(false);

    if (result?.succeeded) {
      setOpen(false);
      setNotes('');
      toast.success('تم تحديث حالة خطوة العمل بنجاح');
      router.refresh();
    }
  };

  const onCancel = () => {
    setSelectedStatus(status);
    setNotes('');
    setOpen(false);
  };

  // تحديث الحالة المختارة عند تغيير الحالة الحالية فقط
  React.useEffect(() => {
    const availableStatusValues = getAvailableStatuses.map(
      ([key]) => parseInt(key) as WorkflowStepStatus
    );

    // إذا كانت الحالة المختارة حالياً غير متاحة في القائمة الجديدة
    if (!availableStatusValues.includes(selectedStatus)) {
      if (availableStatusValues.length > 0) {
        // اختيار أول حالة متاحة
        setSelectedStatus(availableStatusValues[0]);
      }
    }
    // إزالة إعادة تعيين الحالة المختارة إلى الحالة الأصلية لتجنب منع المستخدم من الاختيار
  }, [status, getAvailableStatuses, selectedStatus]);

  // إعادة تعيين الحالة المختارة عند فتح الحوار
  React.useEffect(() => {
    if (open) {
      setSelectedStatus(status);
      setNotes('');
    }
  }, [open, status]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant='outline' size='sm'>
            تحديث الحالة
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-right'>
            تحديث حالة خطوة العمل
          </DialogTitle>
          <DialogDescription className='text-right'>
            قم بتحديث حالة خطوة العمل وإضافة ملاحظات إضافية إذا لزم الأمر
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='status' className='text-right'>
              الحالة الجديدة
            </Label>
            <Select
              value={selectedStatus.toString()}
              onValueChange={(value) => {
                // console.log('Selected status changed to:', value);
                setSelectedStatus(parseInt(value) as WorkflowStepStatus);
              }}
            >
              <SelectTrigger className='w-full text-right'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='w-full'>
                {getAvailableStatuses.map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getAvailableStatuses.length === 0 && (
              <p className='text-sm text-muted-foreground text-right'>
                لا توجد حالات متاحة للتغيير
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='notes' className='text-right'>
              ملاحظات 
            </Label>
            <Textarea
              id='notes'
              placeholder='أدخل أي ملاحظات إضافية حول تحديث الحالة'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className='min-h-[80px] text-right'
              dir='rtl'
            />
          </div>
        </div>

        <div className='flex justify-end gap-2 pt-4'>
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            disabled={loading}
          >
            إلغاء
          </Button>
          <Button onClick={onSubmit} disabled={loading}>
            تحديث الحالة
            {loading && <Spinner variant='default' className='ml-2 h-4 w-4' />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateWorkflowStatusDialog;
