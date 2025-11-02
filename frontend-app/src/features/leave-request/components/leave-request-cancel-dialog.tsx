'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { LeaveRequest } from '../types/leave-request';
import { leaveRequestService } from '../api/leave-request.service';
import { useAuthApi } from '@/hooks/use-auth-api';
import {
  cancelLeaveRequestSchema,
  CancelLeaveRequestFormValues
} from '../utils/leave-request';
import { Spinner } from '@/components/spinner';
import { Card, CardContent } from '@/components/ui/card';

interface LeaveRequestCancelDialogProps {
  leaveRequest: LeaveRequest;
}

export default function LeaveRequestCancelDialog({
  leaveRequest
}: LeaveRequestCancelDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { authApiCall } = useAuthApi();

  const form = useForm<CancelLeaveRequestFormValues>({
    resolver: zodResolver(cancelLeaveRequestSchema),
    defaultValues: {
      id: leaveRequest.id!,
      cancellationReason: ''
    }
  });

  const onSubmit = async (data: CancelLeaveRequestFormValues) => {
    try {
      setLoading(true);

      const response = await authApiCall(() =>
        leaveRequestService.cancelLeaveRequest(data)
      );

      if (response?.succeeded) {
        toast.success('تم إلغاء طلب الإجازة بنجاح!');
        router.push(`/leave-request/${leaveRequest.id}`);
        router.refresh();
      } else {
        toast.error('لم يتم إلغاء طلب الإجازة!');
      }
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col gap-4 p-6'>
      <Dialog open={true} onOpenChange={() => router.back()}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>إلغاء طلب الإجازة</DialogTitle>
            <DialogDescription>
              طلب إجازة: {leaveRequest.requestNumber || leaveRequest.id}
            </DialogDescription>
          </DialogHeader>

          <Card className='mb-4'>
            <CardContent className='pt-6'>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='font-medium text-gray-500'>الموظف:</span>
                  <p>{leaveRequest.employeeName || leaveRequest.employeeId}</p>
                </div>
                <div>
                  <span className='font-medium text-gray-500'>
                    عدد الأيام المعتمدة:
                  </span>
                  <p>{leaveRequest.approvedDays || leaveRequest.requestedDays} يوم</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='cancellationReason'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>سبب الإلغاء (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='أدخل سبب الإلغاء'
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => router.back()}
                >
                  إلغاء
                </Button>
                <Button disabled={loading} type='submit' variant='destructive'>
                  إلغاء الطلب
                  {loading && (
                    <Spinner variant='default' className='ml-2 h-4 w-4' />
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

