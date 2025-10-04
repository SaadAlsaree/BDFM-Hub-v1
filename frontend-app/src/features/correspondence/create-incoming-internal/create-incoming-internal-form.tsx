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
import { createIncomingInternalSchema } from './utils/create-incoming-internal';

import {
  SecrecyLevelEnum,
  PriorityLevelEnum,
  PersonalityLevelEnum,
  SecrecyLevelEnumDisplay,
  PriorityLevelEnumDisplay,
  PersonalityLevelEnumDisplay
} from './types/create-incoming-internal';
import {
  InboxList,
  IncomingInternalMailPayload
} from '../types/register-incoming-external-mail';

import MailFileSearch from '@/components/mailFile-search';
import { IMailFileList } from '@/features/mail-files/types/mail-files';
import { Spinner } from '@/components/spinner';
import { useRouter } from 'next/navigation';
import { useAuthApi } from '@/hooks/use-auth-api';
import { useSession } from 'next-auth/react';
import { correspondenceService } from '../api/correspondence.service';
import CorrespondenceSearch from '@/components/correspondence-search';

type IncomingInternalFormValues = z.infer<typeof createIncomingInternalSchema>;

interface CreateIncomingInternalFormProps {
  onSuccess?: (incomingInternalId: string) => void;
  onCancel?: () => void;
  initialData?: Partial<IncomingInternalFormValues>;
}

const CreateIncomingInternalForm = ({
  onSuccess,
  onCancel,
  initialData
}: CreateIncomingInternalFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // selectedMailFile is used in handleMailFileSelect to track the selected mail file
  // even though it appears unused, it's needed for the component's state management
  const [selectedMailFile, setSelectedMailFile] =
    useState<IMailFileList | null>(null);
  const [selectedBookNum, setSelectedBookNum] = useState<InboxList | null>(
    null
  );
  const router = useRouter();
  const { data: session } = useSession();
  const { authApiCall } = useAuthApi();

  const form = useForm<IncomingInternalFormValues>({
    resolver: zodResolver(createIncomingInternalSchema),
    defaultValues: {
      subject: initialData?.subject || '',
      bodyText: initialData?.bodyText || '',
      secrecyLevel: initialData?.secrecyLevel || undefined,
      priorityLevel: initialData?.priorityLevel || undefined,
      personalityLevel: initialData?.personalityLevel || undefined,
      mailDate: initialData?.mailDate || new Date().toISOString().split('T')[0],
      fileId: initialData?.fileId || undefined,
      linkMailId: initialData?.linkMailId || undefined
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

  const handleBookNumSelect = (bookNum: InboxList | null) => {
    setSelectedBookNum(bookNum);
    if (bookNum?.correspondenceId) {
      form.setValue('subject', bookNum.subject);
      form.setValue('bodyText', bookNum.subject);
      form.setValue('linkMailId', bookNum.correspondenceId);
    } else {
      form.setValue('linkMailId', '');
    }
  };

  const onSubmit = async (data: IncomingInternalFormValues) => {
    setIsSubmitting(true);

    if (!session?.user?.id) {
      toast.error('يجب عليك تسجيل الدخول لإنشاء كتاب وارد داخلي');
      setIsSubmitting(false);
      return;
    }

    if (!data.linkMailId) {
      toast.error('يجب عليك اختيار كتاب لربطه بالكتاب الداخلي');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload: IncomingInternalMailPayload = {
        mailDate: data.mailDate || new Date().toISOString().split('T')[0],
        subject: data.subject,
        bodyText: data.bodyText || '',
        secrecyLevel: data.secrecyLevel || SecrecyLevelEnum.None,
        priorityLevel: data.priorityLevel || PriorityLevelEnum.None,
        personalityLevel: data.personalityLevel || PersonalityLevelEnum.General,
        fileId: data.fileId || undefined,
        linkMailId: data.linkMailId || '',
        createdByUserId: session.user.id,
        fileNumberToReuse: ''
      };

      const response = await authApiCall(() =>
        correspondenceService.createIncomingInternalMail(payload)
      );

      if (response && response.data) {
        toast.success('تم إنشاء الكتاب الوارد الداخلي بنجاح');
        if (onSuccess) {
          onSuccess(response.data);
        } else {
          router.push('/correspondence/incoming-internal-book-list');
        }
      }
    } catch (error) {
      // Error creating incoming internal mail
      toast.error('حدث خطأ أثناء إنشاء الكتاب الوارد الداخلي');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-right text-lg font-medium'>
          إنشاء كتاب وارد داخلي
        </h3>
        <p className='text-muted-foreground text-right text-sm'>
          قم بإدخال بيانات الكتاب الوارد الداخلي
        </p>
      </div>
      <Separator />

      {/* Mail File Search Section */}
      <div className='space-y-4'>
        <h3 className='text-right text-lg font-medium text-zinc-900 dark:text-zinc-100'>
          ربط بكتاب
        </h3>
        <div className='space-y-3'>
          <label className='block text-right text-sm font-medium text-zinc-700 dark:text-zinc-300'>
            البحث عن كتاب لربطه بالكتاب الداخلي
          </label>
          <CorrespondenceSearch onSelectCorrespondence={handleBookNumSelect} />
          {selectedBookNum && (
            <Card className='rounded-md p-3 text-right text-sm'>
              <CardContent className='p-0'>
                <p className='mb-1 font-medium'>تم اختيار الكتاب:</p>
                <p className='text-zinc-600 dark:text-zinc-400'>
                  {selectedBookNum.subject} - {selectedBookNum.mailNum}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          {/* Subject */}
          <FormField
            control={form.control}
            name='subject'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='block text-right'>الموضوع</FormLabel>
                <FormControl>
                  <Input dir='rtl' placeholder='أدخل موضوع الكتاب' {...field} />
                </FormControl>
                <FormMessage className='text-right' />
              </FormItem>
            )}
          />

          {/* Body Text */}
          <FormField
            control={form.control}
            name='bodyText'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='block text-right'>نص الكتاب</FormLabel>
                <FormControl>
                  <Textarea
                    dir='rtl'
                    placeholder='أدخل نص الكتاب'
                    className='min-h-[200px]'
                    {...field}
                  />
                </FormControl>
                <FormMessage className='text-right' />
              </FormItem>
            )}
          />

          {/* Mail Number and Date */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {/* Mail Number */}

            <FormItem>
              <FormLabel className='block text-right'>رقم الكتاب</FormLabel>
              <FormControl>
                <Input placeholder='سيتم توليده تلقائياً' disabled />
              </FormControl>
              <FormMessage className='text-right' />
            </FormItem>

            {/* Mail Date */}
            <FormField
              control={form.control}
              name='mailDate'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel className='block text-right'>
                    تاريخ الكتاب
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-right font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), 'yyyy/MM/dd', {
                              locale: ar
                            })
                          ) : (
                            <span>اختر تاريخ</span>
                          )}
                          <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
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
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
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

          {/* Mail File Search Section */}
          <div className='space-y-4'>
            <h3 className='text-right text-lg font-medium text-zinc-900 dark:text-zinc-100'>
              ربط بملف (اختياري)
            </h3>
            <div className='space-y-3'>
              <label className='block text-right text-sm font-medium text-zinc-700 dark:text-zinc-300'>
                البحث عن ملف لربطه بالكتاب الداخلي
              </label>
              <MailFileSearch onSelectMailFile={handleMailFileSelect} />
              {selectedMailFile && (
                <Card className='rounded-md p-3 text-right text-sm'>
                  <CardContent className='p-0'>
                    <p className='mb-1 font-medium'>تم اختيار الملف:</p>
                    <p className='text-zinc-600 dark:text-zinc-400'>
                      {selectedMailFile.name} - {selectedMailFile.fileNumber}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Secrecy, Priority, Personality Levels */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            {/* Secrecy Level */}
            <FormField
              control={form.control}
              name='secrecyLevel'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='block text-right'>
                    مستوى السرية
                  </FormLabel>
                  <Select
                    dir='rtl'
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl className='w-full'>
                      <SelectTrigger>
                        <SelectValue placeholder='اختر مستوى السرية' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(SecrecyLevelEnumDisplay).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className='text-right' />
                </FormItem>
              )}
            />

            {/* Priority Level */}
            <FormField
              control={form.control}
              name='priorityLevel'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='block text-right'>
                    مستوى الأولوية
                  </FormLabel>
                  <Select
                    dir='rtl'
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl className='w-full'>
                      <SelectTrigger>
                        <SelectValue placeholder='اختر مستوى الأولوية' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(PriorityLevelEnumDisplay).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className='text-right' />
                </FormItem>
              )}
            />

            {/* Personality Level */}
            <FormField
              control={form.control}
              name='personalityLevel'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='block text-right'>
                    مستوى الشخصية
                  </FormLabel>
                  <Select
                    dir='rtl'
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl className='w-full'>
                      <SelectTrigger>
                        <SelectValue placeholder='اختر مستوى الشخصية' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(PersonalityLevelEnumDisplay).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className='text-right' />
                </FormItem>
              )}
            />
          </div>

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
              {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء الكتاب الوارد الداخلي'}
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

export default CreateIncomingInternalForm;
