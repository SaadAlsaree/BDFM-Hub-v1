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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

import { useWizard } from '../context/wizard-context';
import { WizardStepProps } from '../types/wizard-types';
import {
  internalInfoSchema,
  InternalInfoFormValues
} from '../utils/wizard-schemas';
import {
  PriorityLevelEnumDisplay,
  SecrecyLevelEnumDisplay,
  PersonalityLevelEnumDisplay
} from '@/features/correspondence/types/register-incoming-external-mail';
import MailFileSearch from '@/components/mailFile-search';
import { IMailFileList } from '@/features/mail-files/types/mail-files';
import { Card, CardContent } from '@/components/ui/card';

export function StepInternalInfo({
  onNext,
  onPrevious,
  isFirstStep
}: WizardStepProps) {
  const {
    formData,
    updateFormData,
    externalEntitiesList,
    setSelectedMailFile,
    selectedMailFile
  } = useWizard();

  const form = useForm<InternalInfoFormValues>({
    resolver: zodResolver(internalInfoSchema),
    defaultValues: {
      recipientExternalEntityId: formData.recipientExternalEntityId || '',
      recipientSubEntities: formData.recipientSubEntities || [],
      subject: formData.subject || '',
      bodyText: formData.bodyText || '',
      mailDate: formData.mailDate || new Date().toISOString().split('T')[0],
      fileNumberToReuse: formData.fileNumberToReuse || ''
    },
    mode: 'onChange'
  });

  // Watch for form changes and update context
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateFormData(value as Partial<InternalInfoFormValues>);
    });
    return () => subscription.unsubscribe();
  }, [form, updateFormData]);

  // Handle mail file selection
  const handleMailFileSelect = (mailFile: IMailFileList | null) => {
    setSelectedMailFile(mailFile);
    if (mailFile?.fileNumber) {
      form.setValue('fileNumberToReuse', mailFile.fileNumber);
      updateFormData({ fileNumberToReuse: mailFile.fileNumber });
    } else {
      form.setValue('fileNumberToReuse', '');
      updateFormData({ fileNumberToReuse: '' });
    }
  };

  const externalEntitiesListOption = externalEntitiesList.map((entity) => ({
    value: entity.id,
    label: entity.entityName
  }));

  const onSubmit = async (data: InternalInfoFormValues) => {
    updateFormData(data);
    onNext();
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-right text-xl font-semibold'>
          معلومات الكتاب الصادر
        </h2>
        <p className='text-right text-sm'>
          أدخل تفاصيل الكتاب الصادر والجهة المستقبلة والمستويات المطلوبة
        </p>
      </div>
      {/*List Error message Validation */}
      <div className='space-y-2'>
        <div className='text-right text-sm text-red-500'>
          {Object.values(form.formState.errors).map((error) => (
            <div
              key={error.message}
              className='text-right text-sm text-red-500'
            >
              <span className='text-right text-sm text-red-500'>
                {error.message}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          {/* Recipient External Entity */}
          <FormField
            control={form.control}
            name='recipientExternalEntityId'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='block text-right'>
                  الجهة الخارجية المستقبلة *
                </FormLabel>
                <Select
                  dir='rtl'
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl className='w-full'>
                    <SelectTrigger>
                      <SelectValue placeholder='اختر الجهة الخارجية المستقبلة' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {externalEntitiesListOption.map((entity) => (
                      <SelectItem
                        key={entity.value}
                        value={entity.value?.toString() || ''}
                      >
                        {entity.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className='text-right' />
              </FormItem>
            )}
          />

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
                  <Input
                    dir='rtl'
                    placeholder='أدخل موضوع الكتاب الصادر'
                    {...field}
                  />
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
                    placeholder='أدخل نص الكتاب الصادر'
                    className='min-h-[120px]'
                    {...field}
                  />
                </FormControl>
                <FormMessage className='text-right' />
              </FormItem>
            )}
          />

          {/* Mail File Search Section */}
          <div className='space-y-4'>
            <h3 className='text-right text-lg font-medium text-zinc-900 dark:text-zinc-100'>
              إعادة استخدام رقم ضبارة
            </h3>
            <div className='space-y-3'>
              <label className='block text-right text-sm font-medium text-zinc-700 dark:text-zinc-300'>
                البحث عن أضبارة لإعادة استخدام رقمها (اختياري)
              </label>
              <MailFileSearch onSelectMailFile={handleMailFileSelect} />
              {selectedMailFile && (
                <Card className='rounded-md p-3 text-right text-sm'>
                  <CardContent className='p-0'>
                    <p className='mb-1 font-medium'>تم اختيار الأضبارة:</p>
                    <p className='text-zinc-600 dark:text-zinc-400'>
                      {selectedMailFile.name} - {selectedMailFile.fileNumber}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

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

          {/* Priority, Secrecy, and Personality Levels */}
          <div className='grid gap-6 md:grid-cols-3'>
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
                    value={field.value?.toString()}
                  >
                    <FormControl className='w-full'>
                      <SelectTrigger>
                        <SelectValue placeholder='اختر مستوى الأولوية' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(PriorityLevelEnumDisplay).map(
                        ([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className='text-right' />
                </FormItem>
              )}
            />

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
                    value={field.value?.toString()}
                  >
                    <FormControl className='w-full'>
                      <SelectTrigger>
                        <SelectValue placeholder='اختر مستوى السرية' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(SecrecyLevelEnumDisplay).map(
                        ([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value}
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
                    value={field.value?.toString()}
                  >
                    <FormControl className='w-full'>
                      <SelectTrigger>
                        <SelectValue placeholder='اختر مستوى الشخصية' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(PersonalityLevelEnumDisplay).map(
                        ([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value}
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

          {/* Navigation Buttons */}
          <div className='flex justify-between pt-6'>
            <Button
              type='button'
              variant='outline'
              onClick={onPrevious}
              disabled={isFirstStep}
              className='px-8'
            >
              السابق
            </Button>
            <Button type='submit' className='px-8'>
              التالي
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
