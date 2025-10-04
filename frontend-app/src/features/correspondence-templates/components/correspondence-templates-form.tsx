'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { Switch } from '@/components/ui/switch';
import { useCurrentUser } from '@/hooks/use-current-user';

import { correspondenceTemplatesService } from '../api/correspondence-templates.service';
import { CorrespondenceTemplatesDetail } from '../types/correspondence-templates';
import {
  CorrespondenceTemplateFormValues,
  formatCorrespondenceTemplatePayload,
  formSchema
} from '../utils/correspondence-templates';
import { useAuthApi } from '@/hooks/use-auth-api';

interface CorrespondenceTemplatesFormProps {
  initialData?: CorrespondenceTemplatesDetail;
}

export function CorrespondenceTemplatesForm({
  initialData
}: CorrespondenceTemplatesFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = useCurrentUser();
  const { authApiCall } = useAuthApi();

  // console.log(currentUser.user);

  const isEditMode = !!initialData?.id;
  const title = isEditMode ? 'تعديل القالب' : 'إنشاء قالب';
  const description = isEditMode
    ? 'تحديث قالب مراسلات موجود'
    : 'إنشاء قالب مراسلات جديد';
  const action = isEditMode ? 'حفظ التغييرات' : 'إنشاء القالب';

  const form = useForm<CorrespondenceTemplateFormValues>({
    resolver: zodResolver(formSchema(initialData || null)),
    defaultValues: {
      id: initialData?.id || undefined,
      templateName: initialData?.templateName || '',
      subject: initialData?.subject || '',
      bodyText: initialData?.bodyText || '',
      organizationalUnitId: initialData?.organizationalUnitId || '',
      status: initialData?.status || 1 // Default to Active
    }
  });

  const onSubmit = async (data: CorrespondenceTemplateFormValues) => {
    try {
      setIsLoading(true);
      if (!currentUser.user) {
        toast.error('المستخدم غير مُصادق عليه');
        return;
      }

      // Set additional fields
      data.createBy = currentUser.user.id || '';
      data.organizationalUnitId =
        currentUser.user.organizationalUnitId ||
        data.organizationalUnitId ||
        '';

      const payload = formatCorrespondenceTemplatePayload(
        data,
        initialData?.id
      );

      if (isEditMode && initialData?.id) {
        const response = await authApiCall(() =>
          correspondenceTemplatesService.updateCorrespondenceTemplate(
            initialData.id as string,
            payload
          )
        );
        if (response?.data) {
          toast.success('تم تحديث القالب بنجاح');
          router.push('/correspondence-template');
          router.refresh();
          return;
        }
      } else {
        const response = await authApiCall(() =>
          correspondenceTemplatesService.createCorrespondenceTemplate(payload)
        );
        if (response?.data) {
          toast.success('تم إنشاء القالب بنجاح');
          router.push('/correspondence-template');
          router.refresh();
          return;
        }
      }

      toast.error('حدث خطأ أثناء حفظ القالب');
    } catch (error) {
      toast.error('حدث خطأ. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='templateName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>أسم القالب</FormLabel>
                    <FormControl>
                      <Input placeholder='أدخل أسم القالب' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='subject'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>أسم الموضوع</FormLabel>
                    <FormControl>
                      <Input placeholder='أدخل أسم الموضوع' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base'>الحالة النشطة</FormLabel>
                      <FormDescription>
                        حدد ما إذا كان هذا القالب نشطًا أم غير نشط
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value === 1}
                        onCheckedChange={(checked) =>
                          field.onChange(checked ? 1 : 0)
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='bodyText'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نص القالب</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='أدخل نص القالب'
                      className='min-h-[200px] resize-y'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className='mt-6 flex justify-between'>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.back()}
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {action}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
