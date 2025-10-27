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
import { toast } from 'sonner';
import { useAuthApi } from '@/hooks/use-auth-api';
import { workflowStepService } from '../api/workflow-step.service';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

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
  const [isCompleted, setIsCompleted] = useState(false);
  const { user } = useCurrentUser();
  const { authApiCall } = useAuthApi();
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

  const handelCompleteWorkflowStep = async () => {
    try {
      const result = await authApiCall(() =>
        workflowStepService.completeWorkflowStep(workflowStepId)
      );
      if (result?.succeeded) {
        toast.success('تم إكمال أجراء التحويل بنجاح');
        setIsCompleted(true);
      } else {
        const errorMessage =
          result?.message || 'حدث خطأ أثناء إكمال أجراء التحويل';
        toast.error(errorMessage);
        // eslint-disable-next-line no-console
        console.error('Workflow completion failed:', result);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error completing workflow step:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'حدث خطأ أثناء إكمال أجراء التحويل';
      toast.error(errorMessage);
    }
  };

  const signatureColor = form.watch('signatureColor');

  form.setValue('workflowStepId', workflowStepId);

  async function onFormSubmit(data: LogRecipientInternalActionInputFormData) {
    setLoading(true);
    try {
      // تسجيل الإجراء أولاً
      onSubmit?.(data);

      // إذا كان المستخدم يريد إكمال الخطوة
      if (isCompleted) {
        await handelCompleteWorkflowStep();
      }

      setOpen(false);
      form.reset();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error submitting form:', error);
      toast.error('حدث خطأ أثناء حفظ البيانات');
    } finally {
      setLoading(false);
    }
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

            <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
              <div className='flex-1 space-y-2'>
                <div className='flex items-center gap-2 space-x-2'>
                  <Checkbox
                    id='complete-step'
                    checked={isCompleted}
                    onCheckedChange={(checked) =>
                      setIsCompleted(checked === true)
                    }
                  />
                  <FormLabel
                    htmlFor='complete-step'
                    className='cursor-pointer text-base'
                  >
                    تحديث كمكتمل
                  </FormLabel>
                </div>
                <Alert className='border-amber-200 bg-amber-50 dark:bg-amber-900/5 dark:text-amber-100'>
                  <AlertTriangle className='h-4 w-4 text-amber-600' />
                  <AlertDescription className='text-sm text-amber-800'>
                    ⚠️ تحذير: عند تحديد هذا الخيار سيتم تحديث الخطوة كمكتمل عند
                    الضغط على زر الحفظ
                  </AlertDescription>
                </Alert>
              </div>
            </FormItem>

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
                      <FormLabel className='block text-center text-sm font-medium'>
                        اختر لون التوقيع
                      </FormLabel>
                      <FormControl>
                        <div className='flex flex-row justify-center gap-4'>
                          {Object.entries(SignatureColorDisplay).map(
                            ([key, value]) => (
                              <button
                                key={key}
                                type='button'
                                onClick={() => field.onChange(key)}
                                className={`focus:ring-primary h-6 w-6 rounded-sm border-2 transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:outline-none ${
                                  field.value === key
                                    ? 'border-primary ring-primary scale-105 shadow-lg ring-1 ring-offset-2'
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
                {isCompleted ? 'تسجيل الإجراء وتحديث كمكتمل' : 'تسجيل الإجراء'}
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
