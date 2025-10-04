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
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { WorkflowStepTodoPayload } from '@/features/correspondence/inbox-list/types/correspondence-details';
import { correspondenceService } from '@/features/correspondence/api/correspondence.service';
import { useAuthApi } from '@/hooks/use-auth-api';
import {
  TodoFormValues,
  todoFormSchema,
  convertFormValuesToPayload,
  convertPayloadToFormValues
} from './utils/todo';
import { Spinner } from '@/components/spinner';

interface TodoFormProps {
  initialData: WorkflowStepTodoPayload | null;
  workflowStepId: string;
  pageTitle: string;
  onSuccess?: (todo?: WorkflowStepTodoPayload) => void;
  onCancel?: () => void;
}

export default function TodoForm({
  initialData,
  workflowStepId,
  pageTitle,
  onSuccess,
  onCancel
}: TodoFormProps) {
  const [loading, setLoading] = useState(false);
  const { authApiCall } = useAuthApi();

  // Initial values
  const defaultValues = initialData
    ? convertPayloadToFormValues(initialData)
    : {
        title: '',
        description: '',
        isCompleted: false,
        dueDate: undefined,
        notes: ''
      };

  // Form
  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoFormSchema(initialData)),
    defaultValues
  });

  // Submit
  const onSubmit = async (data: TodoFormValues) => {
    try {
      setLoading(true);

      const payload = convertFormValuesToPayload(
        data,
        workflowStepId,
        initialData?.id
      );

      if (initialData) {
        // Update existing todo
        const response = await authApiCall(() =>
          correspondenceService.updateWorkflowStepTodo(payload)
        );

        if (response?.succeeded) {
          toast.success('تم تحديث المهمة بنجاح!');
          onSuccess?.(payload);
        } else {
          toast.error('لم يتم تحديث المهمة!');
        }
      } else {
        // Create new todo
        const response = await authApiCall(() =>
          correspondenceService.createWorkflowStepTodo(payload)
        );

        if (response?.succeeded) {
          toast.success('تم إنشاء المهمة بنجاح!');
          onSuccess?.(payload);
        } else {
          toast.error('لم يتم إنشاء المهمة!');
        }
      }
    } catch (error) {
      toast.error('حدث خطأ!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-right text-2xl font-bold'>
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Separator className='my-4' />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='w-full space-y-4'
          >
            <div className='grid gap-4 md:grid-cols-1'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان المهمة</FormLabel>
                    <FormControl>
                      <Input placeholder='أدخل عنوان المهمة' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid gap-4 md:grid-cols-1'>
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وصف المهمة</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='أدخل وصف المهمة (اختياري)'
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid gap-4 md:grid-cols-1'>
              <FormField
                control={form.control}
                name='dueDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ الاستحقاق</FormLabel>
                    <FormControl>
                      <Input
                        type='date'
                        placeholder='اختر تاريخ الاستحقاق'
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) => {
                          const dateValue = e.target.value;
                          if (dateValue) {
                            field.onChange(new Date(dateValue));
                          } else {
                            field.onChange(undefined);
                          }
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='flex justify-end space-x-2 space-x-reverse'>
              {onCancel && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={onCancel}
                  disabled={loading}
                >
                  إلغاء
                </Button>
              )}
              <Button disabled={loading} type='submit'>
                {initialData ? 'تحديث' : 'إنشاء'}
                {loading && (
                  <Spinner variant='default' className='mr-2 h-4 w-4' />
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </div>
  );
}
