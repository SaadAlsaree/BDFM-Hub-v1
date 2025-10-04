'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/spinner';

import {
  ActionTypeEnum,
  ActionTypeDisplay,
  CustomWorkflowTargetTypeEnum,
  CustomWorkflowTargetTypeEnumDisplay,
  CreateWorkflowStepPayload,
  CustomWorkflowStepDetails
} from '@/features/customWorkflow/types/customWorkflow';
import { customWorkflowService } from '@/features/customWorkflow/api/customWorkflow.service';
import {
  customWorkflowStepFormSchema,
  CustomWorkflowStepFormValues
} from '../utils/customWorkflow';
import { useAuthApi } from '@/hooks/use-auth-api';

interface CustomWorkflowStepDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workflowId: string;
  initialData?: CustomWorkflowStepDetails | null;
  onSuccess?: () => void;
}

export default function CustomWorkflowStepDialog({
  isOpen,
  onClose,
  workflowId,
  initialData = null,
  onSuccess
}: CustomWorkflowStepDialogProps) {
  const [loading, setLoading] = useState(false);
  const { authApiCall } = useAuthApi();

  const form = useForm<CustomWorkflowStepFormValues>({
    resolver: zodResolver(customWorkflowStepFormSchema),
    defaultValues: initialData
      ? {
          stepOrder: initialData.stepOrder,
          actionType: initialData.actionType as ActionTypeEnum,
          targetType: initialData.targetType as CustomWorkflowTargetTypeEnum,
          targetIdentifier: initialData.targetIdentifier,
          defaultInstructionText: initialData.defaultInstructionText || '',
          defaultDueDateOffsetDays: initialData.defaultDueDateOffsetDays
        }
      : {
          stepOrder: 1,
          defaultDueDateOffsetDays: 0
        }
  });

  const onSubmit = async (data: CustomWorkflowStepFormValues) => {
    try {
      setLoading(true);

      const payload: CreateWorkflowStepPayload = {
        ...data,
        workflowId
      };

      if (initialData) {
        payload.id = initialData.id;
        const response = await authApiCall(async () =>
          customWorkflowService.updateCustomWorkflowStep(payload)
        );

        if (response?.succeeded) {
          toast.success('تم تحديث خطوة سير العمل بنجاح!');
          onSuccess?.();
          onClose();
        } else {
          toast.error('فشل في تحديث خطوة سير العمل!');
        }
      } else {
        const response = await authApiCall(async () =>
          customWorkflowService.createCustomWorkflowStep(payload)
        );

        if (response?.succeeded) {
          toast.success('تم إنشاء خطوة سير العمل بنجاح!');
          onSuccess?.();
          onClose();
        } else {
          toast.error('فشل في إنشاء خطوة سير العمل!');
        }
      }
    } catch (error) {
      console.error({ error });
      toast.error('حدث خطأ أثناء حفظ خطوة سير العمل!');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'تعديل خطوة سير العمل' : 'إضافة خطوة سير العمل'}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'قم بتعديل تفاصيل خطوة سير العمل'
              : 'قم بإضافة خطوة جديدة إلى سير العمل'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='stepOrder'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ترتيب الخطوة</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='1'
                        disabled={loading}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='defaultDueDateOffsetDays'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عدد أيام الاستحقاق</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='0'
                        disabled={loading}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='actionType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الإجراء</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl className='col-span-1 w-full'>
                      <SelectTrigger>
                        <SelectValue placeholder='اختر نوع الإجراء' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(ActionTypeDisplay).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
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
              name='targetType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الهدف</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl className='col-span-1 w-full'>
                      <SelectTrigger>
                        <SelectValue placeholder='اختر نوع الهدف' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(CustomWorkflowTargetTypeEnumDisplay).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
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
              name='targetIdentifier'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>معرف الهدف</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='معرف الهدف'
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='defaultInstructionText'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نص التعليمات الافتراضي</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='أدخل التعليمات الافتراضية للخطوة...'
                      disabled={loading}
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={loading}
              >
                إلغاء
              </Button>
              <Button type='submit' disabled={loading}>
                {loading && <Spinner className='mr-2 h-4 w-4' />}
                {initialData ? 'تحديث' : 'إضافة'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
