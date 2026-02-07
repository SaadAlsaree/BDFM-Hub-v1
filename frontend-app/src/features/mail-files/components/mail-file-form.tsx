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
import { IMailFileDetail } from '@/features/mail-files/types/mail-files';
import { mailFilesService } from '@/features/mail-files/api/mail-files.service';
import { useAuthApi } from '@/hooks/use-auth-api';
import {
  MailFileStatus,
  formSchema,
  MailFileFormValues
} from '../utils/mail-files';
import { Spinner } from '@/components/spinner';

interface MailFileFormProps {
  initialData: IMailFileDetail | null;
  pageTitle: string;
}

export default function MailFileForm({
  initialData,
  pageTitle
}: MailFileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {authApiCall} = useAuthApi(); // Auth API hook for future use if needed

  // initial values
  const defaultValues = initialData
    ? {
        name: initialData.name || '',
        subject: initialData.subject || '',
        status: initialData.status || MailFileStatus.Active
      }
    : {};

  // form
  const form = useForm<MailFileFormValues>({
    resolver: zodResolver(formSchema()),
    defaultValues
  });

  // submit
  const onSubmit = async (data: MailFileFormValues) => {
    try {
      setLoading(true);

      if (initialData) {
        const fileToUpdate = {
          id: initialData.id,
          ...data
        };

        const response = await mailFilesService.updateMailFile(fileToUpdate);

        if (response?.succeeded) {
          toast.success('تم تعديل الأضبارة بنجاح!');
          router.push('/mail-files');
          router.refresh();
        } else {
          toast.error('لم يتم تعديل الأضبارة!');
        }
      } else {
        const response = await mailFilesService.createMailFile(data);

        if (response?.succeeded) {
          toast.success('تم إنشاء الأضبارة بنجاح!');
          router.push('/mail-files');
          router.refresh();
        } else {
          toast.error('لم يتم إنشاء الأضبارة!');
        }
      }
    } catch (error) {
      // Handle error without console.error
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
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان الأضبارة</FormLabel>
                    <FormControl>
                      <Input placeholder='أدخل عنوان الأضبارة' {...field} />
                    </FormControl>
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
                      disabled={!initialData}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='اختر الحالة' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={MailFileStatus.Active.toString()}>
                          مفعل
                        </SelectItem>
                        <SelectItem value={MailFileStatus.Inactive.toString()}>
                          غير مفعل
                        </SelectItem>
                        <SelectItem value={MailFileStatus.Completed.toString()}>
                          مكتمل
                        </SelectItem>
                        <SelectItem value={MailFileStatus.Archived.toString()}>
                          مؤرشف
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='subject'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الموضوع</FormLabel>
                  <FormControl>
                    <Input placeholder='أدخل الموضوع' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
