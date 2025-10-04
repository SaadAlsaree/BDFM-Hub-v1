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
  externalInfoSchema,
  ExternalInfoFormValues
} from '../utils/wizard-schemas';

export function StepExternalInfo({ onNext, isFirstStep }: WizardStepProps) {
  const { formData, updateFormData, externalEntitiesList } = useWizard();

  const form = useForm<ExternalInfoFormValues>({
    resolver: zodResolver(externalInfoSchema),
    defaultValues: {
      externalReferenceNumber: formData.externalReferenceNumber || '',
      externalReferenceDate: formData.externalReferenceDate || '',
      originatingExternalEntityId: formData.originatingExternalEntityId || '',
      originatingSubEntities: formData.originatingSubEntities || []
    },
    mode: 'onChange'
  });

  const externalEntitiesListOption = externalEntitiesList.map((entity) => ({
    value: entity.id,
    label: entity.entityName
  }));

  // Watch for form changes and update context
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateFormData(value as Partial<ExternalInfoFormValues>);
    });
    return () => subscription.unsubscribe();
  }, [form, updateFormData]);

  const onSubmit = async (data: ExternalInfoFormValues) => {
    updateFormData(data);
    onNext();
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-right text-xl font-semibold'>
          المعلومات الكتاب الخارجي
        </h2>
        <p className='text-right text-sm'>
          أدخل بيانات الجهة الخارجية ومعلومات الكتاب المرسل
        </p>
      </div>

      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <div className='grid gap-6 md:grid-cols-1'>
            {/* Originating External Entity */}
            <FormField
              control={form.control}
              name='originatingExternalEntityId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='block text-right'>
                    الجهة الخارجية المنشئة *
                  </FormLabel>
                  <Select
                    dir='rtl'
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl className='w-full'>
                      <SelectTrigger>
                        <SelectValue placeholder='اختر الجهة الخارجية' />
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

            <div className='grid gap-6 md:grid-cols-2'>
              {/* External Reference Number */}
              <FormField
                control={form.control}
                name='externalReferenceNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='block text-right'>
                      رقم كتاب الجهة *
                    </FormLabel>
                    <FormControl>
                      <Input
                        dir='rtl'
                        placeholder='أدخل رقم كتاب الجهة الخارجي'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='text-right' />
                  </FormItem>
                )}
              />

              {/* External Reference Date */}
              <FormField
                control={form.control}
                name='externalReferenceDate'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel className='block text-right'>
                      تاريخ كتاب الجهة *
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
                              <span>اختر تاريخ كتاب الجهة</span>
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
                            field.onChange(date ? date.toISOString() : '')
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
          </div>

          {/* Navigation Buttons */}
          <div className='flex justify-between pt-6'>
            <Button
              type='button'
              variant='outline'
              disabled={isFirstStep}
              className='cursor-not-allowed opacity-50'
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
