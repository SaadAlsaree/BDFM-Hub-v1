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

  // دالة لتحديد الحالات المتاحة - عرض جميع الحالات بدون قيود
  const getAvailableStatuses = useMemo(() => {
    let allStatuses = Object.entries(CorrespondenceStatusEnumArabicMap);

    // Remove 'PendingReferral' option from the global statuses list for non-Managers
    if (!hasAnyRole(user as UserDto, ['Manager'])) {
      allStatuses = allStatuses.filter(
        ([key]) => parseInt(key) !== CorrespondenceStatusEnum.PendingReferral
      );
    }

    // عرض جميع الحالات المتاحة بدون أي قيود
    return allStatuses;
  }, [user]);

  // تحديث الحالة المختارة عند فتح الحوار
  useEffect(() => {
    if (isOpen) {
      // إعادة تعيين الحالة عند فتح الحوار
      setStatus(currentStatus || undefined);
    } else {
      // إعادة تعيين عند إغلاق الحوار
      setStatus(currentStatus || undefined);
      setReason('');
    }
  }, [isOpen, currentStatus]);

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
    if (!status) {
      toast({
        title: 'تنبيه',
        description: 'يرجى اختيار حالة',
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
          description: 'تم تحديث حالة الكتاب بنجاح',
          variant: 'default'
        });
        setIsOpen(false);
        setReason('');
        router.refresh();
      } else {
        toast({
          title: 'خطأ',
          description: response?.message || 'فشل في تحديث حالة الكتاب',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث حالة الكتاب',
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
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className='sm:max-w-[425px]' from='bottom'>
          <DialogHeader>
            <DialogTitle>تحديث حالة الكتاب</DialogTitle>
            <DialogDescription>
              قم بتحديث حالة الكتاب وإدخال سبب التغيير
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='status'>الحالة الجديدة</Label>
              <Select
                value={status?.toString() || ''}
                onValueChange={(value) =>
                  setStatus(Number(value) as CorrespondenceStatusEnum)
                }
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
              />
            </div>
          </div>
          <div className='flex justify-end gap-2'>
            <Button
              variant='outline'
              onClick={onCancel}
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button
              type='button'
              onClick={onSubmit}
              disabled={isLoading || !status}
            >
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
