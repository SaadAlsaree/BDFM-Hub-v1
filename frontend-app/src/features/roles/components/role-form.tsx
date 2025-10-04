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
import { IRoleDetails } from '@/features/roles/types/role';
import { roleService } from '@/features/roles/api/role.service';
import { useAuthApi } from '@/hooks/use-auth-api';
import { RoleStatus, formSchema, RoleFormValues } from '../utils/role';
import { Spinner } from '@/components/spinner';

interface RoleFormProps {
  initialData: IRoleDetails | null;
  pageTitle: string;
}

export default function RoleForm({ initialData, pageTitle }: RoleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { authApiCall } = useAuthApi();

  // initial values
  const defaultValues = initialData
    ? {
        name: initialData.name,
        value: initialData.value,
        description: initialData.description || '',
        statusId: initialData.statusId || RoleStatus.Active
      }
    : {};

  // form
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(formSchema(initialData)),
    defaultValues
  });

  // submit
  const onSubmit = async (data: RoleFormValues) => {
    try {
      setLoading(true);

      if (initialData) {
        const roleToUpdate = {
          id: initialData.id,
          ...data
        };

        const response = await roleService.updateRole(roleToUpdate);

        if (response?.succeeded) {
          toast.success('تم تعديل الدور بنجاح!');
          router.push('/roles');
          router.refresh();
        } else {
          toast.error('لم يتم تعديل الدور!');
        }
      } else {
        const response = await roleService.createRole(data);

        if (response?.succeeded) {
          toast.success('تم إنشاء الدور بنجاح!');
          router.push('/roles');
          router.refresh();
        } else {
          toast.error('لم يتم إنشاء الدور!');
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
                      <Input placeholder='أدخل الاسم' {...field} />
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
                      <Input placeholder='أدخل القيمة' {...field} />
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
                        <SelectItem value={RoleStatus.Active.toString()}>
                          مفعل
                        </SelectItem>
                        <SelectItem value={RoleStatus.Inactive.toString()}>
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
                      <Textarea placeholder='أدخل الوصف' {...field} rows={3} />
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
