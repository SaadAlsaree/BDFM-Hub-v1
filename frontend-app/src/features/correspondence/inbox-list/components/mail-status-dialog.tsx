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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  CorrespondenceStatusEnum,
  CorrespondenceStatusEnumArabicMap,
  CorrespondenceTypeEnum,
  UpdateCorrespondenceStatusPayload
} from '../../types/register-incoming-external-mail';
import { useAuthApi } from '@/hooks/use-auth-api';
import { useState, useMemo, useEffect } from 'react';
// services
import { correspondenceService } from '../../api/correspondence.service';
import { useRouter } from 'next/navigation';
import { CorrespondenceTypeEnumNames } from '@/features/customWorkflow/types/customWorkflow';
import { useCurrentUser } from '@/hooks/use-current-user';
import { hasAnyRole } from '@/utils/auth/auth-utils';
import { UserDto } from '@/utils/auth/auth';

interface MailStatusDialogProps {
  correspondenceId: string;
  currentStatus: CorrespondenceStatusEnum | undefined;
  children: React.ReactNode;
  correspondenceType: CorrespondenceTypeEnum | undefined;
}

const MailStatusDialog = ({
  correspondenceId,
  currentStatus,
  children,
  correspondenceType: initialCorrespondenceType
}: MailStatusDialogProps) => {
  const [status, setStatus] = useState<CorrespondenceStatusEnum | undefined>(
    currentStatus
  );
  const [correspondenceType, setCorrespondenceType] = useState<
    CorrespondenceTypeEnum | undefined
  >(initialCorrespondenceType);
  const [reason, setReason] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [pendingCorrespondenceType, setPendingCorrespondenceType] = useState<
    CorrespondenceTypeEnum | undefined
  >();
  const { authApiCall } = useAuthApi();
  const { toast } = useToast();
  const router = useRouter();

  const { user } = useCurrentUser();

  // دالة لتحديد الحالات المتاحة بناءً على الحالة الحالية
  const getAvailableStatuses = useMemo(() => {
    let allStatuses = Object.entries(CorrespondenceStatusEnumArabicMap);

    // Remove 'Signed' option from the global statuses list for non-Managers so
    // it cannot be returned by any branch below. This centralizes the role
    // gating and prevents accidental exposure of Signed via specific case logic.
    if (!hasAnyRole(user as UserDto, ['Manager'])) {
      allStatuses = allStatuses.filter(
        ([key]) => parseInt(key) !== CorrespondenceStatusEnum.Signed
      );
    }

    // إذا لم تكن هناك حالة حالية (كتاب جديد)، اعرض جميع الحالات
    if (!currentStatus) return allStatuses;

    // تحديد التسلسل المنطقي للحالات
    switch (currentStatus) {
      case CorrespondenceStatusEnum.PendingReferral: // قيد الانتظار (2)
        // يمكن الانتقال إلى أي حالة
        return allStatuses;

      case CorrespondenceStatusEnum.UnderProcessing: // قيد المعالجة (3)
        // لا يمكن العودة إلى قيد الانتظار
        return allStatuses.filter(
          ([key]) => parseInt(key) !== CorrespondenceStatusEnum.PendingReferral
        );

      case CorrespondenceStatusEnum.Postponed:
        // لا يمكن العودة إلى قيد الانتظار
        return allStatuses.filter(
          ([key]) => parseInt(key) !== CorrespondenceStatusEnum.PendingReferral
        );

      case CorrespondenceStatusEnum.PendingApproval: // قيد الموافقة (4)
        // لا يمكن العودة إلى (قيد الانتظار، قيد المعالجة)
        return allStatuses.filter(([key]) => {
          const statusValue = parseInt(key) as CorrespondenceStatusEnum;
          return ![
            CorrespondenceStatusEnum.PendingReferral,
            CorrespondenceStatusEnum.UnderProcessing
          ].includes(statusValue);
        });

      case CorrespondenceStatusEnum.Approved: // موافق (5)
        // لا يمكن العودة إلى الحالات السابقة
        return allStatuses.filter(([key]) => {
          const statusValue = parseInt(key) as CorrespondenceStatusEnum;
          return ![
            CorrespondenceStatusEnum.PendingReferral,
            CorrespondenceStatusEnum.UnderProcessing,
            CorrespondenceStatusEnum.PendingApproval
          ].includes(statusValue);
        });

      case CorrespondenceStatusEnum.InSignatureAgenda: // قيد التوقيع (6)
        // لا يمكن العودة إلى الحالات السابقة
        return allStatuses.filter(([key]) => {
          const statusValue = parseInt(key) as CorrespondenceStatusEnum;
          return ![
            CorrespondenceStatusEnum.PendingReferral,
            CorrespondenceStatusEnum.UnderProcessing,
            CorrespondenceStatusEnum.PendingApproval,
            CorrespondenceStatusEnum.Approved
          ].includes(statusValue);
        });

      case CorrespondenceStatusEnum.Signed: // موقع (7)
        // ONLY Managers should be able to see/select the 'Signed' status.
        // If the current user is not a Manager, remove the Signed option entirely
        // from available statuses. Managers will see the Signed option but cannot
        // return to previous workflow states listed below.
        if (!hasAnyRole(user as UserDto, ['Manager'])) {
          return allStatuses.filter(
            ([key]) => parseInt(key) !== CorrespondenceStatusEnum.Signed
          );
        }

        // For Managers, Signed is available but we prevent reverting to earlier states
        return allStatuses.filter(([key]) => {
          const statusValue = parseInt(key) as CorrespondenceStatusEnum;
          return ![
            CorrespondenceStatusEnum.PendingReferral,
            CorrespondenceStatusEnum.UnderProcessing,
            CorrespondenceStatusEnum.PendingApproval,
            CorrespondenceStatusEnum.Approved,
            CorrespondenceStatusEnum.InSignatureAgenda
          ].includes(statusValue);
        });

      case CorrespondenceStatusEnum.Completed: // مكتمل (9)
      case CorrespondenceStatusEnum.ReturnedForModification: // إرجاع للتعديل (11)
      case CorrespondenceStatusEnum.Cancelled: // ملغي (13)
        // للحالات النهائية، يمكن الانتقال فقط بين الحالات النهائية
        return allStatuses.filter(([key]) => {
          const statusValue = parseInt(key) as CorrespondenceStatusEnum;
          return [
            CorrespondenceStatusEnum.Completed,
            CorrespondenceStatusEnum.ReturnedForModification,
            CorrespondenceStatusEnum.Postponed,
            CorrespondenceStatusEnum.Cancelled
          ].includes(statusValue);
        });

      default:
        // للحالات غير المعروفة، اعرض جميع الحالات
        return allStatuses;
    }
  }, [currentStatus, user]);

  // تحديث الحالة المختارة عند تغيير الحالة الحالية أو الحالات المتاحة
  useEffect(() => {
    const availableStatusValues = getAvailableStatuses.map(
      ([key]) => parseInt(key) as CorrespondenceStatusEnum
    );

    // إذا كانت الحالة المختارة حالياً غير متاحة في القائمة الجديدة
    if (status && !availableStatusValues.includes(status)) {
      if (availableStatusValues.length > 0) {
        // اختيار أول حالة متاحة
        setStatus(availableStatusValues[0]);
      }
    } else if (!status) {
      // إذا لم تكن هناك حالة مختارة، اختر الحالة الحالية
      setStatus(currentStatus);
    }
  }, [currentStatus, status, getAvailableStatuses, user]);

  // دالة للتحقق من تغيير نوع الكتاب من Draft إلى نوع آخر
  const handleCorrespondenceTypeChange = (newType: CorrespondenceTypeEnum) => {
    // إذا كان النوع الحالي Draft والنوع الجديد مختلف
    if (
      initialCorrespondenceType === CorrespondenceTypeEnum.Draft &&
      newType !== CorrespondenceTypeEnum.Draft
    ) {
      setPendingCorrespondenceType(newType);
      setShowConfirmationDialog(true);
    } else {
      setCorrespondenceType(newType);
    }
  };

  // دالة تأكيد تغيير النوع
  const confirmTypeChange = () => {
    if (pendingCorrespondenceType) {
      setCorrespondenceType(pendingCorrespondenceType);
    }
    setShowConfirmationDialog(false);
    setPendingCorrespondenceType(undefined);
  };

  // دالة إلغاء تغيير النوع
  const cancelTypeChange = () => {
    setShowConfirmationDialog(false);
    setPendingCorrespondenceType(undefined);
  };

  const onSubmit = async () => {
    if (!status || status === currentStatus) {
      toast({
        title: 'تنبيه',
        description: 'لم يتم تغيير الحالة',
        variant: 'default'
      });
      return;
    }

    setIsLoading(true);
    const payload: UpdateCorrespondenceStatusPayload = {
      correspondenceId,
      newStatus: status,
      correspondenceType: correspondenceType || CorrespondenceTypeEnum.Draft,
      reason: reason.trim()
    };

    try {
      const response = await authApiCall(() =>
        correspondenceService.changeCorrespondenceStatus(payload)
      );

      if (response?.succeeded) {
        toast({
          title: 'نجح',
          description: 'تم تحديث حالة المراسلة بنجاح',
          variant: 'default'
        });
        setIsOpen(false);
        setReason('');
        router.refresh();
      } else {
        toast({
          title: 'خطأ',
          description: response?.message || 'فشل في تحديث حالة المراسلة',
          variant: 'destructive'
        });
      }
    } catch (error) {
      // console.error('Error updating correspondence status:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث حالة المراسلة',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onCancel = () => {
    setStatus(currentStatus || undefined);
    setReason('');
    setIsOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild disabled={!currentStatus}>
          {children}
        </DialogTrigger>
        <DialogContent className='sm:max-w-[425px]' from='bottom'>
          <DialogHeader>
            <DialogTitle>تحديث حالة الكتاب</DialogTitle>
            <DialogDescription>
              قم بتحديث حالة الكتاب وإدخال سبب التغيير
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
                  setStatus(Number(value) as CorrespondenceStatusEnum)
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
            {initialCorrespondenceType === CorrespondenceTypeEnum.Draft && (
              <div className='space-y-2'>
                <Label htmlFor='correspondenceType' className='text-right'>
                  نوع الكتاب
                </Label>
                <Select
                  value={correspondenceType?.toString()}
                  onValueChange={(value) => {
                    handleCorrespondenceTypeChange(
                      parseInt(value) as CorrespondenceTypeEnum
                    );
                  }}
                >
                  <SelectTrigger className='w-full text-right'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='w-full'>
                    {Object.entries(CorrespondenceTypeEnumNames).map(
                      ([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className='grid gap-2'>
              <Label htmlFor='reason'>سبب التغيير</Label>
              <Textarea
                id='reason'
                placeholder='أدخل سبب تغيير الحالة...'
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
            <Button onClick={onSubmit} disabled={isLoading || !currentStatus}>
              {isLoading ? 'جاري التحديث...' : 'تحديث'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* رسالة التأكيد لتغيير نوع الكتاب من Draft */}
      <AlertDialog
        open={showConfirmationDialog}
        onOpenChange={setShowConfirmationDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد تغيير نوع الكتاب</AlertDialogTitle>
            <AlertDialogDescription>
              أنت على وشك تغيير نوع الكتاب من &quot;مسودة&quot; إلى نوع آخر.
              <br />
              <strong>تحذير:</strong> بعد تغيير نوع الكتاب، لن تتمكن من تعديل
              هذا الكتاب مرة أخرى.
              <br />
              هل أنت متأكد من أنك تريد المتابعة؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelTypeChange}>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmTypeChange}>
              تأكيد التغيير
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MailStatusDialog;
