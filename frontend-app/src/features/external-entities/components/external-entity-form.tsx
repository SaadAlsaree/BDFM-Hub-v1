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
import { IExternalEntityDetails } from '@/features/external-entities/types/external-entities';
import { externalEntitiesService } from '@/features/external-entities/api/external-entities.service';
import { useAuthApi } from '@/hooks/use-auth-api';
import {
  ExternalEntityStatus,
  formSchema,
  ExternalEntityFormValues,
  entityTypeLabels
} from '../utils/external-entities';
import { Spinner } from '@/components/spinner';

interface ExternalEntityFormProps {
  initialData: IExternalEntityDetails | null;
  pageTitle: string;
}

export default function ExternalEntityForm({
  initialData,
  pageTitle
}: ExternalEntityFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { authApiCall } = useAuthApi();

  // initial values
  const defaultValues = initialData
    ? {
        entityName: initialData.entityName,
        entityCode: initialData.entityCode,
        entityType: initialData.entityType,
        contactInfo: initialData.contactInfo || '',
        status: initialData.status || ExternalEntityStatus.Active
      }
    : {};

  // form
  const form = useForm<ExternalEntityFormValues>({
    resolver: zodResolver(formSchema(initialData)),
    defaultValues
  });

  // submit
  const onSubmit = async (data: ExternalEntityFormValues) => {
    try {
      setLoading(true);

      if (initialData) {
        const entityToUpdate = {
          id: initialData.id,
          ...data
        };

        const response =
          await externalEntitiesService.updateExternalEntity(entityToUpdate);

        if (response?.succeeded) {
          toast.success('تم تعديل الجهة الخارجية بنجاح!');
          router.push('/external-entities');
          router.refresh();
        } else {
          toast.error('لم يتم تعديل الجهة الخارجية!');
        }
      } else {
        const response =
          await externalEntitiesService.createExternalEntity(data);

        if (response?.succeeded) {
          toast.success('تم إنشاء الجهة الخارجية بنجاح!');
          router.push('/external-entities');
          router.refresh();
        } else {
          toast.error('لم يتم إنشاء الجهة الخارجية!');
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
                name='entityName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الجهة</FormLabel>
                    <FormControl>
                      <Input placeholder='أدخل اسم الجهة' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='entityCode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رمز الجهة</FormLabel>
                    <FormControl>
                      <Input placeholder='أدخل رمز الجهة' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='entityType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع الجهة</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl className='w-full'>
                        <SelectTrigger>
                          <SelectValue placeholder='اختر نوع الجهة' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(entityTypeLabels).map(
                          ([key, label]) => (
                            <SelectItem key={key} value={key}>
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
                name='status'
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
                        <SelectItem
                          value={ExternalEntityStatus.Active.toString()}
                        >
                          مفعل
                        </SelectItem>
                        <SelectItem
                          value={ExternalEntityStatus.Inactive.toString()}
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
                name='contactInfo'
                render={({ field }) => (
                  <FormItem className='col-span-2'>
                    <FormLabel>معلومات الاتصال</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='أدخل معلومات الاتصال'
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
                <Spinner variant='default' className='ml-2 h-4 w-4' />
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
