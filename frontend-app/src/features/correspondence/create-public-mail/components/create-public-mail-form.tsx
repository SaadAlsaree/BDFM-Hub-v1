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
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import { createPublicMailSchema } from '../utils/create-public-mail';
import { CreatePublicMailPayload } from '../types/create-public-mail';
import { correspondenceService } from '../../api/correspondence.service';
import {
  PriorityLevelEnumDisplay,
  SecrecyLevelEnumDisplay,
  PersonalityLevelEnumDisplay
} from '@/features/correspondence/types/register-incoming-external-mail';
import MailFileSearch from '@/components/mailFile-search';
import { IMailFileList } from '@/features/mail-files/types/mail-files';
import { Spinner } from '@/components/spinner';
import { useRouter } from 'next/navigation';
import { useAuthApi } from '@/hooks/use-auth-api';
import { useSession } from 'next-auth/react';

type CreatePublicMailFormValues = z.infer<typeof createPublicMailSchema>;

interface CreatePublicMailFormProps {
  correspondenceId?: string;
  onSuccess?: (correspondenceId: string) => void;
  onCancel?: () => void;
  initialData?: Partial<CreatePublicMailFormValues>;
}

const CreatePublicMailForm = ({
  correspondenceId,
  onSuccess,
  onCancel,
  initialData
}: CreatePublicMailFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMailFile, setSelectedMailFile] =
    useState<IMailFileList | null>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const { authApiCall } = useAuthApi();

  const form = useForm<CreatePublicMailFormValues>({
    resolver: zodResolver(createPublicMailSchema),
    defaultValues: {
      subject: initialData?.subject || '',
      bodyText: initialData?.bodyText || '',
      secrecyLevel: initialData?.secrecyLevel,
      priorityLevel: initialData?.priorityLevel,
      personalityLevel: initialData?.personalityLevel,
      mailDate: initialData?.mailDate || new Date().toISOString().split('T')[0],
      fileId: initialData?.fileId || undefined
    },
    mode: 'onChange'
  });

  // Handle mail file selection
  const handleMailFileSelect = (mailFile: IMailFileList | null) => {
    setSelectedMailFile(mailFile);
    if (mailFile?.id) {
      form.setValue('fileId', mailFile.id);
    } else {
      form.setValue('fileId', undefined);
    }
  };

  const onSubmit = async (data: CreatePublicMailFormValues) => {
    setIsSubmitting(true);

    if (!session?.user?.id) {
      toast.error('يجب عليك تسجيل الدخول لإنشاء كتاب عام');
      setIsSubmitting(false);
      return;
    }

    try {
      if (!initialData) {
        const payload: CreatePublicMailPayload = {
          subject: data.subject,
          bodyText: data.bodyText,
          secrecyLevel: data.secrecyLevel,
          priorityLevel: data.priorityLevel,
          personalityLevel: data.personalityLevel,
          mailDate: data.mailDate,
          fileId: data.fileId,
          createdByUserId: session?.user?.id
        };

        const result = await authApiCall(() =>
          correspondenceService.createPublicCorrespondence(payload)
        );

        if (result?.data) {
          toast.success('تم إنشاء الكتاب العام بنجاح');
          onSuccess?.(result.data);
          form.reset();
          setSelectedMailFile(null);
          router.push(`/correspondence`);
        } else {
          toast.error('حدث خطأ أثناء إنشاء الكتاب العام');
        }
      } else {
        const payload: CreatePublicMailPayload = {
          correspondenceId: correspondenceId,
          subject: data.subject,
          bodyText: data.bodyText,
          secrecyLevel: data.secrecyLevel,
          priorityLevel: data.priorityLevel,
          personalityLevel: data.personalityLevel,
          mailDate: data.mailDate,
          fileId: data.fileId,
          updatedByUserId: session?.user?.id
        };

        const result = await authApiCall(() =>
          correspondenceService.updateCorrespondenceContent(payload)
        );

        if (result?.data) {
          toast.success('تم تعديل الكتاب العام بنجاح');
          onSuccess?.(correspondenceId || '');
          form.reset();
          setSelectedMailFile(null);
          router.push(`/correspondence`);
        } else {
          toast.error('حدث خطأ أثناء تعديل الكتاب العام');
        }
      }
    } catch (error) {
      console.error('Error creating public mail:', error);
      toast.error('حدث خطأ أثناء إنشاء الكتاب العام');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-right text-xl font-semibold'>إنشاء كتاب عام</h2>
        <p className='text-muted-foreground text-right text-sm'>
          أدخل تفاصيل الكتاب العام لحفظه
        </p>
      </div>

      <Separator />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-6'
          autoComplete='off'
        >
          {/* Subject */}
          <FormField
            control={form.control}
            name='subject'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='block text-right'>
                  موضوع الكتاب *
                </FormLabel>
                <FormControl>
                  <Input dir='rtl' placeholder='أدخل موضوع الكتاب' {...field} />
                </FormControl>
                <FormMessage className='text-right' />
              </FormItem>
            )}
          />

          {/* Internal Number and Date */}
          <div className='grid gap-6 md:grid-cols-2'>
            {/* Internal Number */}
            <FormItem>
              <FormLabel className='block text-right'>رقم الكتاب</FormLabel>
              <FormControl>
                <Input placeholder='سيتم توليده تلقائياً' disabled />
              </FormControl>
              <FormMessage className='text-right' />
            </FormItem>

            {/* Internal Date */}
            <FormField
              control={form.control}
              name='mailDate'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel className='block text-right'>
                    تاريخ الكتاب *
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'flex w-full justify-between pl-3 text-right font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value && field.value !== '' ? (
                            format(new Date(field.value), 'yyyy-MM-dd', {
                              locale: ar
                            })
                          ) : (
                            <span>اختر تاريخ الكتاب</span>
                          )}
                          <CalendarIcon className='h-4 w-4' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) =>
                          field.onChange(
                            date ? date.toISOString().split('T')[0] : ''
                          )
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className='text-right' />
                </FormItem>
              )}
            />
          </div>

          {/* Body Text */}
          <FormField
            control={form.control}
            name='bodyText'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='block text-right'>محتوى الكتاب</FormLabel>
                <FormControl>
                  <Textarea
                    dir='rtl'
                    placeholder='أدخل محتوى الكتاب'
                    className='min-h-[120px]'
                    {...field}
                  />
                </FormControl>
                <FormMessage className='text-right' />
              </FormItem>
            )}
          />

          {/* Action Buttons */}
          <div className='flex justify-between pt-6'>
            {onCancel && (
              <Button
                type='button'
                variant='outline'
                onClick={onCancel}
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
            )}
            <Button type='submit' disabled={isSubmitting}>
              {initialData ? 'تعديل' : 'حفظ'}
              {isSubmitting && (
                <Spinner variant='default' className='ml-2 h-4 w-4' />
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreatePublicMailForm;
