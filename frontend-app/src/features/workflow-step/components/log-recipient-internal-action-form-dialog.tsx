'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import Signature from '@uiw/react-signature';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import {
  InternalActionTypeDisplay,
  InternalActionTypeEnum
} from '../types/workflow-step';
import {
  LogRecipientInternalActionInputFormData,
  LogRecipientInternalActionInputSchema,
  SignatureColorEnum,
  SignatureColorDisplay
} from '../utils/workflow-step';
import { Spinner } from '@/components/spinner';
import { useCurrentUser } from '@/hooks/use-current-user';
import { hasAnyRole } from '@/utils/auth/auth-utils';

interface LogRecipientInternalActionFormDialogProps {
  workflowStepId: string;
  trigger?: React.ReactNode;
  onSubmit?: (data: LogRecipientInternalActionInputFormData) => void;
  defaultValues?: Partial<LogRecipientInternalActionInputFormData>;
}

export function LogRecipientInternalActionFormDialog({
  workflowStepId,
  trigger,
  onSubmit,
  defaultValues
}: LogRecipientInternalActionFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useCurrentUser();

  const $svg = useRef<any>(null);
  const handle = () => $svg.current?.clear?.();

  const form = useForm<LogRecipientInternalActionInputFormData>({
    resolver: zodResolver(LogRecipientInternalActionInputSchema),
    defaultValues: {
      workflowStepId: '',
      actionTimestamp: new Date(),
      actionDescription: '',
      notes: '',
      internalActionType: InternalActionTypeEnum.Answer,
      signatureColor: SignatureColorEnum.Black,
      ...defaultValues
    }
  });

  const signatureColor = form.watch('signatureColor');

  form.setValue('workflowStepId', workflowStepId);

  function onFormSubmit(data: LogRecipientInternalActionInputFormData) {
    setLoading(true);
    onSubmit?.(data);
    setOpen(false);
    form.reset();
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>تسجيل إجراء داخلي</Button>}
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>تسجيل إجراء داخلي</DialogTitle>
          <DialogDescription>
            املأ النموذج أدناه لتسجيل إجراء داخلي للمستلم في خطوة العمل
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onFormSubmit)}
            className='space-y-6'
          >
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='actionTimestamp'
                render={({ field }) => (
                  <FormItem className='md:col-span-2'>
                    <FormLabel>توقيت الإجراء</FormLabel>
                    <FormControl>
                      <Input
                        type='datetime-local'
                        value={
                          field.value
                            ? new Date(field.value).toISOString().slice(0, 16)
                            : ''
                        }
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value).toISOString())
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='internalActionType'
                render={({ field }) => (
                  <FormItem className='md:col-span-2'>
                    <FormLabel>نوع الإجراء الداخلي</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl className='w-full'>
                        <SelectTrigger>
                          <SelectValue placeholder='اختر نوع الإجراء الداخلي' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(InternalActionTypeDisplay).map(
                          ([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='actionDescription'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وصف الإجراء</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='أدخل وصف الإجراء المتخذ'
                      className='min-h-[100px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {hasAnyRole(user ?? null, ['Admin', 'Manager']) && (
              <>
                <FormField
                  control={form.control}
                  name='notes'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>التوقيع (نسخة التوقيع تحت الاختبار)</FormLabel>
                      <FormControl>
                        {/* Avoid spreading field because it contains a ref which would conflict with Signature's ref.
                          Use onPointer to capture points and store them as a JSON string in the form field. */}
                        <Signature
                          fill={signatureColor || SignatureColorEnum.Black}
                          style={{
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                          }}
                          ref={$svg}
                          onPointer={(points: any) =>
                            field.onChange(JSON.stringify(points))
                          }
                          options={{
                            size: 3,

                            smoothing: 0.99,
                            thinning: 0.73,
                            streamline: 0.5,
                            easing: (t) => t,
                            simulatePressure: true,
                            last: true,
                            start: {
                              cap: true,
                              taper: 0,
                              easing: (t) => t
                            },
                            end: {
                              cap: true,
                              taper: 0,
                              easing: (t) => t
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='signatureColor'
                  render={({ field }) => (
                    <FormItem className='space-y-1'>
                      <FormLabel className='text-sm font-medium text-center block'>اختر لون التوقيع</FormLabel>
                      <FormControl>
                        <div className='flex flex-row gap-4 justify-center'>
                          {Object.entries(SignatureColorDisplay).map(
                            ([key, value]) => (
                              <button
                                key={key}
                                type='button'
                                onClick={() => field.onChange(key)}
                                className={`w-6 h-6 rounded-sm border-2 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${field.value === key
                                  ? 'border-primary shadow-lg scale-105 ring-1 ring-primary ring-offset-2'
                                  : 'border-gray-300 hover:border-gray-400'
                                  }`}
                                style={{ backgroundColor: key }}
                                aria-label={`اختيار لون ${value}`}
                              />
                            )
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <div className='flex justify-end gap-2'>
              {hasAnyRole(user ?? null, ['Admin', 'Manager']) && (
                <Button type='button' variant='outline' onClick={handle}>
                  مسح التوقيع
                </Button>
              )}
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
              >
                إلغاء
              </Button>
              <Button disabled={loading} type='submit'>
                تسجيل الإجراء
                {loading && (
                  <Spinner variant='default' className='ml-2 h-4 w-4' />
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
