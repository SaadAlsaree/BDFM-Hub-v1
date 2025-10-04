'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  RecipientTypeDisplay,
  RecipientTypeEnum
} from '../types/workflow-step-secondary';
import { useAuthApi } from '@/hooks/use-auth-api';
import { useQuery } from '@tanstack/react-query';
import { organizationalService } from '@/features/organizational-unit/api/organizational.service';
import { workflowStepSecondaryService } from '../api/workflow-step-secondary.service';
import {
  WorkflowStepSecondaryCreateSchema,
  WorkflowStepSecondaryUpdateSchema,
  type WorkflowStepSecondaryCreateFormData,
  type WorkflowStepSecondaryUpdateFormData
} from '../utils/workflow-step-secondary';
import { Plus, Edit } from 'lucide-react';
import { IOrganizationalUnitDetails } from '@/features/organizational-unit/types/organizational';
import { Spinner } from '@/components/spinner';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface WorkflowStepSecondaryFormDialogProps {
  stepId: string;
  trigger?: React.ReactNode;
  defaultValues?: Partial<
    WorkflowStepSecondaryCreateFormData | WorkflowStepSecondaryUpdateFormData
  >;
  mode?: 'create' | 'update';
}

export function WorkflowStepSecondaryFormDialog({
  stepId,
  trigger,
  defaultValues,
  mode = 'create'
}: WorkflowStepSecondaryFormDialogProps) {
  const [open, setOpen] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  const [recipientType, setRecipientType] = useState<RecipientTypeEnum>(
    RecipientTypeEnum.User
  );
  const [loading, setLoading] = useState(false);
  const { authApiCall } = useAuthApi();
  const router = useRouter();

  const isUpdateMode = mode === 'update';

  const form = useForm({
    resolver: zodResolver(
      isUpdateMode
        ? WorkflowStepSecondaryUpdateSchema
        : WorkflowStepSecondaryCreateSchema
    ),
    defaultValues: {
      stepId: stepId,
      recipientType: RecipientTypeEnum.User,
      recipientId: '',
      purpose: '',
      instructionText: '',
      ...(isUpdateMode && { id: '' }),
      ...defaultValues
    }
  });

  // Set stepId to form
  form.setValue('stepId', stepId);

  async function onFormSubmit(data: any) {
    setLoading(true);
    try {
      let response;

      if (isUpdateMode) {
        response = await authApiCall(() =>
          workflowStepSecondaryService.updateWorkflowStepSecondary(data)
        );
        if (response?.succeeded) {
          toast.success(
            `${isUpdateMode ? 'تم تحديث' : 'تم إنشاء'} المستلم الثانوي بنجاح`
          );
          setOpen(false);
          form.reset();
          setLoading(false);
          router.refresh();
        }
      } else {
        response = await authApiCall(() =>
          workflowStepSecondaryService.createWorkflowStepSecondary(data)
        );
        if (response?.succeeded) {
          toast.success(
            `${isUpdateMode ? 'تم تحديث' : 'تم إنشاء'} المستلم الثانوي بنجاح`
          );
          setOpen(false);
          form.reset();
          setLoading(false);
          router.refresh();
        }
      }

      if (response) {
        console.log({
          message: `${isUpdateMode ? 'تم تحديث' : 'تم إنشاء'} المستلم الثانوي بنجاح`
        });
        setOpen(false);
        form.reset();
      } else {
        console.error({
          error: `فشل في ${isUpdateMode ? 'تحديث' : 'إنشاء'} المستلم الثانوي`
        });
      }
    } catch (error) {
      console.error({
        error: `خطأ في ${isUpdateMode ? 'تحديث' : 'إنشاء'} المستلم الثانوي`,
        details: error
      });
    } finally {
      setLoading(false);
    }
  }

  const { data: organizationalUnits } = useQuery({
    queryKey: ['organizational-units'],
    queryFn: async () => {
      const response = await authApiCall(() =>
        organizationalService.getOrganizationalUnits({
          page: 1,
          pageSize: 100
        })
      );
      return response?.data?.items as unknown as IOrganizationalUnitDetails[];
    }
  });

  const organizationOptions = organizationalUnits?.map((unit) => ({
    label: unit.unitName,
    value: unit.id
  }));

  const onRecipientTypeChange = (value: RecipientTypeEnum) => {
    setRecipientType(value);
    form.setValue('recipientType', value);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant='outline' className='w-full'>
            {isUpdateMode ? (
              <>
                <Edit className='h-4 w-4' />
                تعديل مستلم ثانوي
              </>
            ) : (
              <>
                <Plus className='h-4 w-4' />
                إضافة مستلم ثانوي
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] w-[600px] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {isUpdateMode ? 'تعديل مستلم ثانوي' : 'إضافة مستلم ثانوي'}
          </DialogTitle>
          <DialogDescription>
            {isUpdateMode
              ? 'قم بتعديل بيانات المستلم الثانوي'
              : 'املأ النموذج أدناه لإضافة مستلم ثانوي جديد'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onFormSubmit)}
            className='space-y-6'
          >
            {isUpdateMode && <Input type='hidden' {...form.register('id')} />}

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='recipientType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع المستلم</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const enumValue = Number(value) as RecipientTypeEnum;
                        field.onChange(enumValue);
                        onRecipientTypeChange(enumValue);
                      }}
                      value={field.value?.toString()}
                    >
                      <FormControl className='w-full'>
                        <SelectTrigger>
                          <SelectValue placeholder='اختر نوع المستلم' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(RecipientTypeDisplay).map(
                          ([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='col-span-1'>
                {recipientType === RecipientTypeEnum.User ? (
                  <FormField
                    control={form.control}
                    name='recipientId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>معرف المستخدم</FormLabel>
                        <FormControl>
                          <Input placeholder='أدخل معرف المستخدم' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : recipientType === RecipientTypeEnum.Unit ? (
                  <FormField
                    control={form.control}
                    name='recipientId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الوحدة التنظيمية</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value)}
                          value={field.value}
                        >
                          <FormControl className='w-full'>
                            <SelectTrigger>
                              <SelectValue placeholder='اختر الوحدة التنظيمية' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {organizationOptions?.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value ?? ''}
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
                ) : (
                  <FormField
                    control={form.control}
                    name='recipientId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>معرف الجهة الخارجية</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='أدخل معرف الجهة الخارجية'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name='purpose'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الغرض</FormLabel>
                  <FormControl>
                    <Input placeholder='أدخل الغرض من التحويل' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='instructionText'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظة التحويل</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='أدخل ملاحظة التحويل'
                      className='min-h-[100px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
              >
                إلغاء
              </Button>
              <Button disabled={loading} type='submit'>
                {isUpdateMode ? 'تحديث' : 'إضافة'} مستلم ثانوي
                {loading && (
                  <Spinner variant='default' className='ml-2 h-4 w-4' />
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default WorkflowStepSecondaryFormDialog;
