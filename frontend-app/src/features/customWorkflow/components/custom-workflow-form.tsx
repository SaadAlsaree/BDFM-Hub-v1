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
  CustomWorkflowDetails,
  CreateWorkflowPayload,
  CorrespondenceTypeEnum,
  CorrespondenceTypeEnumNames
} from '@/features/customWorkflow/types/customWorkflow';
import { customWorkflowService } from '@/features/customWorkflow/api/customWorkflow.service';
import { useAuthApi } from '@/hooks/use-auth-api';

import {
  customWorkflowFormSchema,
  CustomWorkflowFormValues
} from '../utils/customWorkflow';
import { Spinner } from '@/components/spinner';
import { IOrganizationalUnitList } from '@/features/organizational-unit/types/organizational';

type CustomWorkflowFormProps = {
  initialData: CustomWorkflowDetails | null;
  pageTitle: string;
  organizationalUnits: IOrganizationalUnitList[];
};

export default function CustomWorkflowForm({
  initialData,
  pageTitle,
  organizationalUnits = []
}: CustomWorkflowFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { authApiCall } = useAuthApi();

  const orgOptions = organizationalUnits.map((unit) => ({
    label: unit.unitName,
    value: unit.id
  }));

  // initial values
  const defaultValues = initialData
    ? {
        workflowName: initialData.workflowName,
        triggeringUnitId: initialData.triggeringUnitId,
        triggeringCorrespondenceType: initialData.triggeringCorrespondenceType,
        description: initialData.description || '',
        isEnabled: initialData.isEnabled
      }
    : {
        isEnabled: true
      };

  // form
  const form = useForm<CustomWorkflowFormValues>({
    resolver: zodResolver(customWorkflowFormSchema(initialData)),
    defaultValues
  });

  // submit
  const onSubmit = async (data: CustomWorkflowFormValues) => {
    try {
      setLoading(true);

      if (initialData) {
        const workflowToUpdate = {
          id: initialData.id,
          ...data
        };
        const response = await customWorkflowService.updateCustomWorkflow(
          workflowToUpdate as CreateWorkflowPayload
        );
        if (response?.succeeded) {
          toast.success('تم تحديث سير العمل بنجاح!');
          router.push('/custom-workflow');
          setLoading(false);
        } else {
          toast.error('لم يتم تحديث سير العمل!');
          setLoading(false);
        }
      } else {
        const response = await authApiCall(() =>
          customWorkflowService.createCustomWorkflow(
            data as CreateWorkflowPayload
          )
        );
        if (response?.succeeded) {
          toast.success('تم إنشاء سير العمل بنجاح!');
          router.push('/custom-workflow');
          setLoading(false);
        } else {
          toast.error('لم يتم إنشاء سير العمل!');
          setLoading(false);
        }
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col gap-4 p-6'>
      <div className='flex items-center justify-between'>
        <Heading title={pageTitle} description='إدارة تفاصيل سير العمل' />
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full space-y-8'
        >
          <div className='grid gap-8 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='workflowName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم سير العمل</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='اسم سير العمل'
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
              name='triggeringUnitId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الجهة</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl className='w-full'>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder='اختر الجهة'
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {orgOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value || ''}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='triggeringCorrespondenceType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع المراسلة المحفزة</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl className='w-full'>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value?.toString()}
                          placeholder='اختر نوع المراسلة'
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(CorrespondenceTypeEnumNames).map(
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
              name='isEnabled'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>تفعيل سير العمل</FormLabel>
                    <div className='text-muted-foreground text-sm'>
                      تحديد ما إذا كان سير العمل مفعل أم لا
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>الوصف</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='وصف سير العمل'
                    disabled={loading}
                    {...field}
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={loading} className='ml-auto' type='submit'>
            {loading && <Spinner className='mr-2 h-4 w-4' />}
            {initialData ? 'تحديث' : 'إنشاء'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
