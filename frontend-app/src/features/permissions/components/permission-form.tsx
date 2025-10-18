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
import { IPermissionDetail } from '@/features/permissions/types/permission';
import { permissionService } from '@/features/permissions/api/permission.service';
import { useAuthApi } from '@/hooks/use-auth-api';
import {
  PermissionStatus,
  permissionFormSchema,
  PermissionFormValues
} from '../utils/permission';
import { Spinner } from '@/components/spinner';

interface PermissionFormProps {
  initialData: IPermissionDetail | null;
  pageTitle: string;
}

export default function PermissionForm({
  initialData,
  pageTitle
}: PermissionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { authApiCall } = useAuthApi();

  // initial values
  const defaultValues = initialData
    ? {
        name: initialData.name,
        value: initialData.value,
        description: initialData.description || '',
        statusId: initialData.status || PermissionStatus.Active
      }
    : {};

  // form
  const form = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionFormSchema(initialData)),
    defaultValues
  });

  // submit
  const onSubmit = async (data: PermissionFormValues) => {
    try {
      setLoading(true);

      if (initialData) {
        const permissionToUpdate = {
          id: initialData.id,
          ...data
        };

        const response = await authApiCall(() =>
          permissionService.updatePermission(permissionToUpdate)
        );

        if (response?.succeeded) {
          toast.success('تم تعديل الصلاحية بنجاح!');
          router.push('/permission');
          router.refresh();
        } else {
          toast.error('لم يتم تعديل الصلاحية!');
        }
      } else {
        const response = await authApiCall(() =>
          permissionService.createPermission(data)
        );

        if (response?.succeeded) {
          toast.success('تم إنشاء الصلاحية بنجاح!');
          router.push('/permission');
          router.refresh();
        } else {
          toast.error('لم يتم إنشاء الصلاحية!');
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
        <Separator className='my-4' />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='w-full space-y-4'
          >
            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم</FormLabel>
                    <FormControl>
                      <Input placeholder='أدخل اسم الصلاحية' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='value'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>القيمة</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='أدخل قيمة الصلاحية (مثال: feature:action)'
                        {...field}
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
                name='statusId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الحالة</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl className='w-full'>
                        <SelectTrigger>
                          <SelectValue placeholder='اختر الحالة' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={PermissionStatus.Active.toString()}>
                          مفعل
                        </SelectItem>
                        <SelectItem
                          value={PermissionStatus.Inactive.toString()}
                        >
                          غير مفعل
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='space-y-4'>
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem className='col-span-2'>
                    <FormLabel>الوصف</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='أدخل وصف الصلاحية'
                        {...field}
                        rows={3}
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
                <Spinner variant='default' className='mr-2 h-4 w-4' />
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
