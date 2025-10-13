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
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { CustomWorkflowItem } from '@/features/custom-workflow/types/custom-workflow';
import { customWorkflowService } from '@/features/custom-workflow/api/custom-workflow.service';
import { useAuthApi } from '@/hooks/use-auth-api';
import {
  customWorkflowCreateSchema,
  customWorkflowUpdateSchema
} from '@/features/custom-workflow/utils/custom-workflow';
import { Spinner } from '@/components/spinner';

interface CustomWorkflowFormProps {
  initialData: CustomWorkflowItem | null;
  pageTitle: string;
}

type FormValues = Partial<{
  workflowName: string;
  triggeringUnitId: string | null;
  triggeringCorrespondenceType: number;
  description: string | null;
  isEnabled: boolean;
}>;

export default function CustomWorkflowForm({
  initialData,
  pageTitle
}: CustomWorkflowFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {} = useAuthApi();

  const defaultValues: FormValues = initialData
    ? {
        workflowName: initialData.workflowName || '',
        triggeringUnitId: initialData.triggeringUnitId || null,
        triggeringCorrespondenceType: initialData.triggeringCorrespondenceType,
        description: initialData.description ?? '',
        isEnabled: initialData.isEnabled
      }
    : { description: '' };

  const form = useForm<FormValues>({
    resolver: zodResolver(
      initialData ? customWorkflowUpdateSchema : customWorkflowCreateSchema
    ),
    defaultValues
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        const payload = {
          id: initialData.id,
          workflowName: data.workflowName,
          triggeringUnitId: data.triggeringUnitId ?? null,
          triggeringCorrespondenceType: data.triggeringCorrespondenceType ?? 0,
          description: data.description ?? null,
          isEnabled: data.isEnabled ?? initialData.isEnabled
        };

        const response = await customWorkflowService.updateCustomWorkflow(
          payload as any
        );
        if (response?.succeeded) {
          toast.success('تم تعديل سير العمل بنجاح!');
          router.push('/custom-workflow');
          router.refresh();
        } else {
          toast.error('لم يتم تعديل سير العمل!');
        }
      } else {
        const payload = {
          workflowName: data.workflowName,
          triggeringUnitId: data.triggeringUnitId ?? null,
          triggeringCorrespondenceType: data.triggeringCorrespondenceType ?? 0,
          description: data.description ?? null,
          isEnabled: data.isEnabled ?? true
        };

        const response = await customWorkflowService.createCustomWorkflow(
          payload as any
        );
        if (response?.succeeded) {
          toast.success('تم إنشاء سير العمل بنجاح!');
          router.push('/custom-workflow');
          router.refresh();
        } else {
          toast.error('لم يتم إنشاء سير العمل!');
        }
      }
    } catch (error) {
      toast.error('حدث خطأ!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-right text-2xl font-bold'>
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
            <div className='grid gap-4 py-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='workflowName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم سير العمل</FormLabel>
                    <FormControl>
                      <Input placeholder='أدخل اسم سير العمل' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='isEnabled'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الحالة</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(v === 'true')}
                      defaultValue={field.value ? 'true' : 'false'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='اختر الحالة' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='true'>مفعل</SelectItem>
                        <SelectItem value='false'>غير مفعل</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => {
                const { onChange, onBlur, name, ref, value } = field;
                return (
                  <FormItem>
                    <FormLabel>الوصف</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='أدخل وصف سير العمل'
                        onChange={onChange}
                        onBlur={onBlur}
                        name={name}
                        ref={ref}
                        value={(value ?? '') as string}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <Button disabled={loading} type='submit' className='mr-auto'>
              {initialData ? 'تعديل' : 'إنشاء'}
              {loading && (
                <Spinner variant='default' className='mr-2 h-4 w-4' />
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
