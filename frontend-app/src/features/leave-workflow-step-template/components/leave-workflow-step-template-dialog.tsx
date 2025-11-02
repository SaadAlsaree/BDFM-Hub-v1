'use client';

import { useCallback, useEffect, useState } from 'react';
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
import { Switch } from '@/components/ui/switch';

import {
  ActionTypeEnum,
  ActionTypeDisplay,
  CustomWorkflowTargetTypeEnum,
  CustomWorkflowTargetTypeDisplay,
  LeaveWorkflowStepTemplate
} from '@/features/leave-workflow-step-template/types/leave-workflow-step-template';
import { leaveWorkflowStepTemplateService } from '@/features/leave-workflow-step-template/api/leave-workflow-step-template.service';
import {
  createLeaveWorkflowStepTemplateSchema,
  updateLeaveWorkflowStepTemplateSchema,
  CreateLeaveWorkflowStepTemplateFormValues,
  UpdateLeaveWorkflowStepTemplateFormValues
} from '../utils/leave-workflow-step-template';
import { useAuthApi } from '@/hooks/use-auth-api';

interface LeaveWorkflowStepTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workflowId: string;
  initialData?: LeaveWorkflowStepTemplate | null;
  onSuccess?: () => void;
}

export default function LeaveWorkflowStepTemplateDialog({
  isOpen,
  onClose,
  workflowId,
  initialData = null,
  onSuccess
}: LeaveWorkflowStepTemplateDialogProps) {
  const [loading, setLoading] = useState(false);
  const { authApiCall } = useAuthApi();

  const form = useForm<
    CreateLeaveWorkflowStepTemplateFormValues | UpdateLeaveWorkflowStepTemplateFormValues
  >({
    resolver: zodResolver(
      initialData
        ? updateLeaveWorkflowStepTemplateSchema
        : createLeaveWorkflowStepTemplateSchema
    ),
    defaultValues: initialData
      ? {
          id: initialData.id!,
          workflowId: initialData.workflowId || workflowId,
          stepOrder: initialData.stepOrder || 1,
          actionType: initialData.actionType || ActionTypeEnum.RequestApproval,
          targetType:
            initialData.targetType ||
            CustomWorkflowTargetTypeEnum.SpecificUser,
          targetIdentifier: initialData.targetIdentifier || '',
          defaultInstructionText: initialData.defaultInstructionText || '',
          defaultDueDateOffsetDays: initialData.defaultDueDateOffsetDays || 0,
          isActive: initialData.isActive ?? false
        }
      : {
          workflowId: workflowId,
          stepOrder: 1,
          actionType: ActionTypeEnum.RequestApproval,
          targetType: CustomWorkflowTargetTypeEnum.SpecificUser,
          targetIdentifier: '',
          defaultInstructionText: '',
          defaultDueDateOffsetDays: 0,
          isActive: false
        }
  });

  // Keep form in sync when editing
  useEffect(() => {
    if (initialData && isOpen) {
      form.reset({
        id: initialData.id!,
        workflowId: initialData.workflowId || workflowId,
        stepOrder: initialData.stepOrder || 1,
        actionType: initialData.actionType || ActionTypeEnum.RequestApproval,
        targetType:
          initialData.targetType ||
          CustomWorkflowTargetTypeEnum.SpecificUser,
        targetIdentifier: initialData.targetIdentifier || '',
        defaultInstructionText: initialData.defaultInstructionText || '',
        defaultDueDateOffsetDays: initialData.defaultDueDateOffsetDays || 0,
        isActive: initialData.isActive ?? false
      });
    } else if (!initialData && isOpen) {
      form.reset({
        workflowId: workflowId,
        stepOrder: 1,
        actionType: ActionTypeEnum.RequestApproval,
        targetType: CustomWorkflowTargetTypeEnum.SpecificUser,
        targetIdentifier: '',
        defaultInstructionText: '',
        defaultDueDateOffsetDays: 0,
        isActive: false
      });
    }
  }, [initialData, isOpen, workflowId, form]);

  const onSubmit = useCallback(
    async (
      data:
        | CreateLeaveWorkflowStepTemplateFormValues
        | UpdateLeaveWorkflowStepTemplateFormValues
    ) => {
      try {
        setLoading(true);

        if (initialData) {
          const response = await authApiCall(() =>
            leaveWorkflowStepTemplateService.updateLeaveWorkflowStepTemplate(
              data as UpdateLeaveWorkflowStepTemplateFormValues
            )
          );

          if (response?.succeeded) {
            toast.success('تم تعديل قالب الخطوة بنجاح!');
            onSuccess?.();
            onClose();
          } else {
            toast.error('لم يتم تعديل قالب الخطوة!');
          }
        } else {
          const response = await authApiCall(() =>
            leaveWorkflowStepTemplateService.createLeaveWorkflowStepTemplate(
              data as CreateLeaveWorkflowStepTemplateFormValues
            )
          );

          if (response?.succeeded) {
            toast.success('تم إنشاء قالب الخطوة بنجاح!');
            onSuccess?.();
            onClose();
          } else {
            toast.error('لم يتم إنشاء قالب الخطوة!');
          }
        }
      } catch (error) {
        console.error(error);
        toast.error('حدث خطأ!');
      } finally {
        setLoading(false);
      }
    },
    [initialData, authApiCall, onSuccess, onClose]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'تعديل قالب الخطوة' : 'إضافة قالب خطوة جديد'}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'قم بتعديل بيانات قالب الخطوة'
              : 'أدخل بيانات قالب الخطوة الجديد'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='stepOrder'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ترتيب الخطوة</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={1}
                        placeholder='أدخل ترتيب الخطوة'
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          field.onChange(isNaN(value) ? 1 : value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='actionType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع الإجراء</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        value={field.value?.toString() || ''}
                      >
                        <FormControl className='w-full'>
                          <SelectTrigger>
                            <SelectValue placeholder='اختر نوع الإجراء' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.keys(ActionTypeDisplay).map((key) => {
                            const actionValue = parseInt(key);
                            return (
                              <SelectItem key={key} value={key}>
                                {ActionTypeDisplay[actionValue as ActionTypeEnum]}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </FormControl>
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
                    <FormControl>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        value={field.value?.toString() || ''}
                      >
                        <FormControl className='w-full'>
                          <SelectTrigger>
                            <SelectValue placeholder='اختر نوع الهدف' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.keys(CustomWorkflowTargetTypeDisplay).map(
                            (key) => {
                              const targetValue = parseInt(key);
                              return (
                                <SelectItem key={key} value={key}>
                                  {
                                    CustomWorkflowTargetTypeDisplay[
                                      targetValue as CustomWorkflowTargetTypeEnum
                                    ]
                                  }
                                </SelectItem>
                              );
                            }
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='targetIdentifier'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>معرف الهدف (اختياري)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='أدخل معرف الهدف'
                        {...field}
                        value={field.value || ''}
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
                    <FormLabel>أيام التأخير الافتراضية (اختياري)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={0}
                        placeholder='أدخل عدد الأيام'
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          field.onChange(isNaN(value) ? undefined : value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='isActive'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base'>نشط</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='defaultInstructionText'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نص التعليمات الافتراضي (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='أدخل نص التعليمات'
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type='button' variant='outline' onClick={onClose}>
                إلغاء
              </Button>
              <Button disabled={loading} type='submit'>
                {initialData ? 'تعديل' : 'إنشاء'}
                {loading && (
                  <Spinner variant='default' className='ml-2 h-4 w-4' />
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

