'use client';

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
import {
  LeaveRequestStatus,
  LeaveRequestStatusDisplay
} from '../types/leave-request';
import { useAuthApi } from '@/hooks/use-auth-api';
import { useState, useMemo, useEffect } from 'react';
import { leaveRequestService } from '../api/leave-request.service';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Spinner } from '@/components/spinner';

interface LeaveRequestStatusDialogProps {
  leaveRequestId: string;
  currentStatus: LeaveRequestStatus | number | undefined;
  children: React.ReactNode;
}

const LeaveRequestStatusDialog = ({
  leaveRequestId,
  currentStatus,
  children
}: LeaveRequestStatusDialogProps) => {
  const [status, setStatus] = useState<LeaveRequestStatus | undefined>(
    currentStatus as LeaveRequestStatus | undefined
  );
  const [reason, setReason] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { authApiCall } = useAuthApi();
  const router = useRouter();

  // دالة لتحديد الحالات المتاحة بناءً على الحالة الحالية
  const getAvailableStatuses = useMemo(() => {
    const allStatuses = Object.entries(LeaveRequestStatusDisplay);

    // إذا لم تكن هناك حالة حالية، اعرض جميع الحالات
    if (!currentStatus) return allStatuses;

    const current = currentStatus as LeaveRequestStatus;

    // تحديد التسلسل المنطقي للحالات
    switch (current) {
      case LeaveRequestStatus.Draft: // مسودة (1)
        // يمكن الانتقال إلى قيد الموافقة
        return allStatuses.filter(
          ([key]) =>
            parseInt(key) === LeaveRequestStatus.Draft ||
            parseInt(key) === LeaveRequestStatus.PendingApproval
        );

      case LeaveRequestStatus.PendingApproval: // قيد الموافقة (2)
        // يمكن الانتقال إلى موافق عليه أو مرفوض
        return allStatuses.filter(
          ([key]) =>
            parseInt(key) === LeaveRequestStatus.PendingApproval ||
            parseInt(key) === LeaveRequestStatus.Approved ||
            parseInt(key) === LeaveRequestStatus.Rejected
        );

      case LeaveRequestStatus.Approved: // موافق عليه (3)
        // يمكن الانتقال إلى ملغي أو مقطوع أو منتهية
        return allStatuses.filter(
          ([key]) =>
            parseInt(key) === LeaveRequestStatus.Approved ||
            parseInt(key) === LeaveRequestStatus.Cancelled ||
            parseInt(key) === LeaveRequestStatus.Interrupted ||
            parseInt(key) === LeaveRequestStatus.Completed
        );

      case LeaveRequestStatus.Rejected: // مرفوض (4)
        // لا يمكن تغيير الحالة بعد الرفض
        return allStatuses.filter(
          ([key]) => parseInt(key) === LeaveRequestStatus.Rejected
        );

      case LeaveRequestStatus.Cancelled: // ملغي (5)
        // لا يمكن تغيير الحالة بعد الإلغاء
        return allStatuses.filter(
          ([key]) => parseInt(key) === LeaveRequestStatus.Cancelled
        );

      case LeaveRequestStatus.Interrupted: // مقطوع (6)
        // يمكن الانتقال إلى منتهية
        return allStatuses.filter(
          ([key]) =>
            parseInt(key) === LeaveRequestStatus.Interrupted ||
            parseInt(key) === LeaveRequestStatus.Completed
        );

      case LeaveRequestStatus.Completed: // منتهية (7)
        // لا يمكن تغيير الحالة بعد الإنهاء
        return allStatuses.filter(
          ([key]) => parseInt(key) === LeaveRequestStatus.Completed
        );

      default:
        // للحالات غير المعروفة، اعرض جميع الحالات
        return allStatuses;
    }
  }, [currentStatus]);

  // تحديث الحالة المختارة عند تغيير الحالة الحالية أو الحالات المتاحة
  useEffect(() => {
    const availableStatusValues = getAvailableStatuses.map(
      ([key]) => parseInt(key) as LeaveRequestStatus
    );

    // إذا كانت الحالة المختارة حالياً غير متاحة في القائمة الجديدة
    if (status && !availableStatusValues.includes(status)) {
      if (availableStatusValues.length > 0) {
        // اختيار أول حالة متاحة
        setStatus(availableStatusValues[0]);
      }
    } else if (!status) {
      // إذا لم تكن هناك حالة مختارة، اختر الحالة الحالية
      setStatus(currentStatus as LeaveRequestStatus | undefined);
    }
  }, [currentStatus, status, getAvailableStatuses]);

  // إعادة تعيين الحالة المختارة عند فتح الحوار
  useEffect(() => {
    if (isOpen) {
      setStatus(currentStatus as LeaveRequestStatus | undefined);
      setReason('');
    }
  }, [isOpen, currentStatus]);

  const onSubmit = async () => {
    if (!status || !leaveRequestId) {
      toast.error('يرجى اختيار حالة صحيحة');
      return;
    }

    if (status === currentStatus) {
      toast.info('الحالة الحالية هي نفس الحالة المختارة');
      setIsOpen(false);
      return;
    }

    setIsLoading(true);

    try {
      // استخدام APIs المناسبة بناءً على الحالة الجديدة
      if (status === LeaveRequestStatus.Approved) {
        const response = await authApiCall(() =>
          leaveRequestService.approveLeaveRequest({
            id: leaveRequestId,
            notes: reason.trim() || undefined
          })
        );

        if (response?.data) {
          toast.success('تم تحديث حالة طلب الإجازة بنجاح');
          setIsOpen(false);
          setReason('');
          router.refresh();
        } else {
          toast.error('فشل في تحديث حالة طلب الإجازة');
        }
      } else if (status === LeaveRequestStatus.Rejected) {
        if (!reason.trim()) {
          toast.error('يرجى إدخال سبب الرفض');
          setIsLoading(false);
          return;
        }

        const response = await authApiCall(() =>
          leaveRequestService.rejectLeaveRequest({
            id: leaveRequestId,
            rejectionReason: reason.trim()
          })
        );

        if (response?.data) {
          toast.success('تم رفض طلب الإجازة بنجاح');
          setIsOpen(false);
          setReason('');
          router.refresh();
        } else {
          toast.error('فشل في رفض طلب الإجازة');
        }
      } else if (status === LeaveRequestStatus.Cancelled) {
        const response = await authApiCall(() =>
          leaveRequestService.cancelLeaveRequest({
            id: leaveRequestId,
            cancellationReason: reason.trim() || undefined
          })
        );

        if (response?.data) {
          toast.success('تم إلغاء طلب الإجازة بنجاح');
          setIsOpen(false);
          setReason('');
          router.refresh();
        } else {
          toast.error('فشل في إلغاء طلب الإجازة');
        }
      } else {
        // للحالات الأخرى، يمكن استخدام API عام إذا كان متاحاً
        // أو عرض رسالة للمستخدم
        toast.info('يتم العمل على دعم هذه الحالة');
        setIsOpen(false);
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث الحالة');
    } finally {
      setIsLoading(false);
    }
  };

  const onCancel = () => {
    setStatus(currentStatus as LeaveRequestStatus | undefined);
    setReason('');
    setIsOpen(false);
  };

  const requiresReason =
    status === LeaveRequestStatus.Rejected ||
    (status === LeaveRequestStatus.Cancelled && !reason.trim());

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild disabled={!currentStatus}>
        {children}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]' from='bottom'>
        <DialogHeader>
          <DialogTitle>تحديث حالة طلب الإجازة</DialogTitle>
          <DialogDescription>
            قم بتحديث حالة طلب الإجازة وإدخال سبب التغيير إن لزم الأمر
          </DialogDescription>
        </DialogHeader>
        {!currentStatus && (
          <div className='py-4 text-center text-red-600'>
            لا يمكن تحديث الحالة - الحالة الحالية غير متوفرة
          </div>
        )}
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label htmlFor='status'>الحالة الجديدة</Label>
            <Select
              value={status?.toString() || ''}
              onValueChange={(value) =>
                setStatus(parseInt(value) as LeaveRequestStatus)
              }
              disabled={!currentStatus}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='اختر الحالة الجديدة' />
              </SelectTrigger>
              <SelectContent>
                {getAvailableStatuses.map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='reason'>
              {status === LeaveRequestStatus.Rejected
                ? 'سبب الرفض *'
                : status === LeaveRequestStatus.Cancelled
                  ? 'سبب الإلغاء'
                  : 'ملاحظات'}
            </Label>
            <Textarea
              id='reason'
              placeholder={
                status === LeaveRequestStatus.Rejected
                  ? 'أدخل سبب الرفض...'
                  : status === LeaveRequestStatus.Cancelled
                    ? 'أدخل سبب الإلغاء (اختياري)...'
                    : 'أدخل ملاحظات...'
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className='min-h-[100px]'
              disabled={!currentStatus}
            />
          </div>
        </div>
        <div className='flex justify-end gap-2'>
          <Button
            variant='outline'
            onClick={onCancel}
            disabled={isLoading || !currentStatus}
          >
            إلغاء
          </Button>
          <Button
            onClick={onSubmit}
            disabled={
              isLoading ||
              !currentStatus ||
              !status ||
              status === currentStatus ||
              (status === LeaveRequestStatus.Rejected && !reason.trim())
            }
          >
            {isLoading ? (
              <>
                <Spinner className='ml-2 h-4 w-4' />
                جاري التحديث...
              </>
            ) : (
              'تحديث'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveRequestStatusDialog;

