'use client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Heading } from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  LeaveWorkflowStepTemplate,
  CreateLeaveWorkflowStepTemplatePayload
} from '@/features/leave-workflow-step-template/types/leave-workflow-step-template';
import { leaveWorkflowStepTemplateService } from '@/features/leave-workflow-step-template/api/leave-workflow-step-template.service';
import { useAuthApi } from '@/hooks/use-auth-api';

import {
  createLeaveWorkflowStepTemplateSchema,
  updateLeaveWorkflowStepTemplateSchema,
  CreateLeaveWorkflowStepTemplateFormValues,
  UpdateLeaveWorkflowStepTemplateFormValues
} from '../utils/leave-workflow-step-template';
import { Spinner } from '@/components/spinner';
import {
  ActionTypeEnum,
  ActionTypeDisplay,
  CustomWorkflowTargetTypeEnum,
  CustomWorkflowTargetTypeDisplay
} from '../types/leave-workflow-step-template';

type LeaveWorkflowStepTemplateFormProps = {
  initialData: LeaveWorkflowStepTemplate | null;
  pageTitle: string;
  workflowId: string;
};

export default function LeaveWorkflowStepTemplateForm({
  initialData,
  pageTitle,
  workflowId
}: LeaveWorkflowStepTemplateFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { authApiCall } = useAuthApi();

  // initial values
  const defaultValues = initialData
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
      };

  // form
  const form = useForm<
    CreateLeaveWorkflowStepTemplateFormValues | UpdateLeaveWorkflowStepTemplateFormValues
  >({
    resolver: zodResolver(
      initialData
        ? updateLeaveWorkflowStepTemplateSchema
        : createLeaveWorkflowStepTemplateSchema
    ),
    defaultValues
  });

  // submit
  const onSubmit = async (
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
          router.push(`/leave-workflow/${workflowId}`);
          router.refresh();
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
          router.push(`/leave-workflow/${workflowId}`);
          router.refresh();
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
  };

  return (
    <div className='flex flex-col gap-4 p-6'>
      <Heading title={pageTitle} description='إدارة قالب خطوة مسار العمل' />
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full space-y-4'
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

          <div className='space-y-4'>
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
          </div>

          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.back()}
            >
              إلغاء
            </Button>
            <Button disabled={loading} type='submit'>
              {initialData ? 'تعديل' : 'إنشاء'}
              {loading && (
                <Spinner variant='default' className='ml-2 h-4 w-4' />
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

