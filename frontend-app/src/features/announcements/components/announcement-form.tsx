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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { IAnnouncementDetail } from '../types/announcements';
import { announcementsService } from '../api/announcements.service';
import { formSchema, AnnouncementFormValues } from '../utils/announcements';
import { Spinner } from '@/components/spinner';
import { useAuthApi } from '@/hooks/use-auth-api';



interface AnnouncementFormProps {
  initialData: IAnnouncementDetail | null;
  pageTitle: string;
}

export default function AnnouncementForm({
  initialData,
  pageTitle
}: AnnouncementFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {authApiCall} = useAuthApi();
  // initial values
  const defaultValues = initialData
    ? {
        title: initialData.title || '',
        description: initialData.description || '',
        variant: initialData.variant || 'info', // default variant
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
        isActive: initialData.isActive ?? true,
      }
    : {
        title: '',
        description: '',
        variant: 'info',
        startDate: '',
        endDate: '',
        isActive: true,
      };

  // form
  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(formSchema()),
    defaultValues
  });

  // submit
  const onSubmit = async (data: AnnouncementFormValues) => {
    try {
      setLoading(true);

      if (initialData) {
        const payload = {
          id: initialData.id,
          ...data
        };

        const response = await authApiCall(()=>announcementsService.updateAnnouncement(payload));

        if (response?.succeeded) {
          toast.success('تم تعديل الإعلان بنجاح!');
          router.push('/announcements');
          router.refresh();
        } else {
          toast.error(response?.message || 'لم يتم تعديل الإعلان!');
        }
      } else {
        const response = await authApiCall(()=>announcementsService.createAnnouncement(data));

        if (response?.succeeded) {
          toast.success('تم إنشاء الإعلان بنجاح!');
          router.push('/announcements');
          router.refresh();
        } else {
          toast.error(response?.message || 'لم يتم إنشاء الإعلان!');
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
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان الإعلان</FormLabel>
                    <FormControl>
                      <Input placeholder='أدخل عنوان الإعلان' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='variant'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>النوع</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='اختر النوع' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="info">معلومات (Info)</SelectItem>
                        <SelectItem value="warning">تنبيه (Warning)</SelectItem>
                        <SelectItem value="success">نجاح (Success)</SelectItem>
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف</FormLabel>
                  <FormControl>
                    <Textarea placeholder='أدخل وصف الإعلان' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid gap-4 py-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='startDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ البدء</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='endDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ الانتهاء</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='isActive'
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">تفعيل الإعلان</FormLabel>
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
