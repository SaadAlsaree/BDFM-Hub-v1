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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

import { useWizard } from '../context/wizard-context';
import { WizardStepProps } from '../types/wizard-types';
import { linkingSchema, LinkingFormValues } from '../utils/wizard-schemas';
import CorrespondenceSearch from '@/components/correspondence-search';
import { SearchCorrespondenceList } from '@/features/correspondence/types/register-incoming-external-mail';
import { Card, CardContent } from '@/components/ui/card';
import { CorrespondenceLinkType } from '@/features/correspondence/types/register-incoming-external-mail';

// Link type display names in Arabic
const LinkTypeDisplay: Record<CorrespondenceLinkType, string> = {
  [CorrespondenceLinkType.RefersTo]: 'يشير إلى',
  [CorrespondenceLinkType.ReplyTo]: 'رد على',
  [CorrespondenceLinkType.FollowUpTo]: 'متابعة لـ',
  [CorrespondenceLinkType.RelatedTo]: 'متعلق بـ',
  [CorrespondenceLinkType.Supersedes]: 'يحل محل',
  [CorrespondenceLinkType.ContinuationOf]: 'استكمال لـ'
};

export function StepLinking({
  onNext,
  onPrevious,
  isFirstStep
}: WizardStepProps) {
  const {
    formData,
    updateFormData,
    selectedCorrespondence,
    setSelectedCorrespondence
  } = useWizard();

  const form = useForm<LinkingFormValues>({
    resolver: zodResolver(linkingSchema),
    defaultValues: {
      refersToPreviousInternalCorrespondenceId:
        formData.refersToPreviousInternalCorrespondenceId || '',
      linkType: formData.linkType || CorrespondenceLinkType.RefersTo,
      notes: formData.notes || ''
    },
    mode: 'onChange'
  });

  // Watch for form changes and update context
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateFormData(value as Partial<LinkingFormValues>);
    });
    return () => subscription.unsubscribe();
  }, [form, updateFormData]);

  // Handle correspondence selection
  const handleCorrespondenceSelect = (
    correspondence: SearchCorrespondenceList | null
  ) => {
    setSelectedCorrespondence(correspondence);
    if (correspondence?.id) {
      form.setValue(
        'refersToPreviousInternalCorrespondenceId',
        correspondence.id.toString()
      );
      updateFormData({
        refersToPreviousInternalCorrespondenceId: correspondence.id.toString()
      });
    } else {
      form.setValue('refersToPreviousInternalCorrespondenceId', '');
      updateFormData({ refersToPreviousInternalCorrespondenceId: '' });
    }
  };

  const onSubmit = async (data: LinkingFormValues) => {
    updateFormData(data);
    onNext();
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-right text-xl font-semibold text-zinc-900 dark:text-zinc-100'>
          ربط الكتاب
        </h2>
        <p className='text-right text-sm text-zinc-600 dark:text-zinc-400'>
          ربط هذا الكتاب بكتاب داخلي آخر موجود في النظام (اختياري)
        </p>
      </div>

      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          {/* Correspondence Search Section */}
          <div className='space-y-4'>
            <h3 className='text-right text-lg font-medium text-zinc-900 dark:text-zinc-100'>
              البحث عن الكتاب المراد الربط به
            </h3>

            <div className='space-y-3'>
              <label className='block text-right text-sm font-medium text-zinc-700 dark:text-zinc-300'>
                البحث عن كتاب داخلي
              </label>
              <CorrespondenceSearch
                onSelectCorrespondence={handleCorrespondenceSelect}
              />
              {selectedCorrespondence && (
                <Card className='rounded-md p-3 text-right text-sm'>
                  <CardContent className='p-0'>
                    <p className='mb-1 font-medium'>تم اختيار الكتاب:</p>
                    <p className='text-zinc-600 dark:text-zinc-400'>
                      {selectedCorrespondence.subject}
                    </p>
                    {selectedCorrespondence.internalNumber && (
                      <p className='text-zinc-600 dark:text-zinc-400'>
                        رقم: {selectedCorrespondence.internalNumber}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Link Configuration Section */}
          {selectedCorrespondence && (
            <div className='space-y-4'>
              <h3 className='text-right text-lg font-medium text-zinc-900 dark:text-zinc-100'>
                تفاصيل الربط
              </h3>

              <div className='grid gap-6 md:grid-cols-1'>
                {/* Link Type */}
                <FormField
                  control={form.control}
                  name='linkType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='block text-right'>
                        نوع الربط *
                      </FormLabel>
                      <Select
                        dir='rtl'
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl className='w-full'>
                          <SelectTrigger>
                            <SelectValue placeholder='اختر نوع الربط' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(LinkTypeDisplay).map(
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

                {/* Notes */}
                <FormField
                  control={form.control}
                  name='notes'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='block text-right'>
                        ملاحظات الربط
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          dir='rtl'
                          placeholder='أدخل ملاحظات حول الربط (اختياري)'
                          className='min-h-[100px]'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='text-right' />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Hidden field for internal correspondence ID */}
          <FormField
            control={form.control}
            name='refersToPreviousInternalCorrespondenceId'
            render={({ field }) => (
              <FormItem className='hidden'>
                <FormControl>
                  <Input type='hidden' {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Navigation Buttons */}
          <div className='flex justify-between pt-6'>
            <Button
              type='button'
              variant='outline'
              onClick={onPrevious}
              disabled={isFirstStep}
            >
              السابق
            </Button>
            <Button type='submit'>التالي</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
