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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { LeaveWorkflow, LeaveType, LeaveTypeDisplay } from '../types/leave-workflow';
import { leaveWorkflowService } from '../api/leave-workflow.service';
import { useAuthApi } from '@/hooks/use-auth-api';
import {
  createLeaveWorkflowSchema,
  updateLeaveWorkflowSchema,
  CreateLeaveWorkflowFormValues,
  UpdateLeaveWorkflowFormValues
} from '../utils/leave-workflow';
import { Spinner } from '@/components/spinner';
import { CustomSwitch } from '@/components/ui/custom-switch';

interface LeaveWorkflowFormProps {
  initialData: LeaveWorkflow | null;
  pageTitle: string;
}

export default function LeaveWorkflowForm({
  initialData,
  pageTitle
}: LeaveWorkflowFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { authApiCall } = useAuthApi();

  // initial values
  const defaultValues = initialData
    ? {
        id: initialData.id!,
        workflowName: initialData.workflowName || '',
        triggeringUnitId: initialData.triggeringUnitId || '',
        triggeringLeaveType: initialData.triggeringLeaveType || undefined,
        description: initialData.description || '',
        isEnabled: initialData.isEnabled ?? true
      }
    : {
        workflowName: '',
        triggeringUnitId: '',
        triggeringLeaveType: undefined,
        description: '',
        isEnabled: true
      };

  // form
  const form = useForm<
    CreateLeaveWorkflowFormValues | UpdateLeaveWorkflowFormValues
  >({
    resolver: zodResolver(
      initialData ? updateLeaveWorkflowSchema : createLeaveWorkflowSchema
    ),
    defaultValues
  });

  // submit
  const onSubmit = async (
    data: CreateLeaveWorkflowFormValues | UpdateLeaveWorkflowFormValues
  ) => {
    try {
      setLoading(true);

      if (initialData) {
        const response = await authApiCall(() =>
          leaveWorkflowService.updateLeaveWorkflow(
            data as UpdateLeaveWorkflowFormValues
          )
        );

        if (response?.succeeded) {
          toast.success('تم تعديل مسار العمل بنجاح!');
          router.push('/leave-workflow');
          router.refresh();
        } else {
          toast.error('لم يتم تعديل مسار العمل!');
        }
      } else {
        const response = await authApiCall(() =>
          leaveWorkflowService.createLeaveWorkflow(
            data as CreateLeaveWorkflowFormValues
          )
        );

        if (response?.succeeded) {
          toast.success('تم إنشاء مسار العمل بنجاح!');
          router.push('/leave-workflow');
          router.refresh();
        } else {
          toast.error('لم يتم إنشاء مسار العمل!');
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
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Separator />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='w-full space-y-4'
          >
            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='workflowName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم مسار العمل</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='أدخل اسم مسار العمل'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='triggeringUnitId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوحدة المحفزة (اختياري)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='أدخل معرف الوحدة'
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
                name='triggeringLeaveType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع الإجازة المحفز (اختياري)</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(
                            value ? parseInt(value) : undefined
                          )
                        }
                        value={field.value?.toString() || ''}
                      >
                        <FormControl className='w-full'>
                          <SelectTrigger>
                            <SelectValue placeholder='اختر نوع الإجازة' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value=''>الكل</SelectItem>
                          {Object.keys(LeaveTypeDisplay).map((key) => {
                            const typeValue = parseInt(key);
                            return (
                              <SelectItem key={key} value={key}>
                                {LeaveTypeDisplay[typeValue as LeaveType]}
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
                name='isEnabled'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base'>مفعل</FormLabel>
                    </div>
                    <FormControl>
                      <CustomSwitch
                        label=''
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
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوصف</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='أدخل وصف مسار العمل (اختياري)'
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button disabled={loading} type='submit' className='ml-auto'>
              {initialData ? 'تعديل' : 'إنشاء'}
              {loading && (
                <Spinner variant='default' className='ml-2 h-4 w-4' />
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

