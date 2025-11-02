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
import { Input } from '@/components/ui/input';
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
  approveLeaveRequestSchema,
  ApproveLeaveRequestFormValues
} from '../utils/leave-request';
import { Spinner } from '@/components/spinner';
import { Card, CardContent } from '@/components/ui/card';

interface LeaveRequestApproveDialogProps {
  leaveRequest: LeaveRequest;
}

export default function LeaveRequestApproveDialog({
  leaveRequest
}: LeaveRequestApproveDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { authApiCall } = useAuthApi();

  const form = useForm<ApproveLeaveRequestFormValues>({
    resolver: zodResolver(approveLeaveRequestSchema),
    defaultValues: {
      id: leaveRequest.id!,
      approvedDays: leaveRequest.approvedDays || leaveRequest.requestedDays,
      notes: ''
    }
  });

  const onSubmit = async (data: ApproveLeaveRequestFormValues) => {
    try {
      setLoading(true);

      const response = await authApiCall(() =>
        leaveRequestService.approveLeaveRequest(data)
      );

      if (response?.succeeded) {
        toast.success('تم الموافقة على طلب الإجازة بنجاح!');
        router.push(`/leave-request/${leaveRequest.id}`);
        router.refresh();
      } else {
        toast.error('لم يتم الموافقة على طلب الإجازة!');
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
            <DialogTitle>الموافقة على طلب الإجازة</DialogTitle>
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
                    عدد الأيام المطلوبة:
                  </span>
                  <p>{leaveRequest.requestedDays} يوم</p>
                </div>
                <div>
                  <span className='font-medium text-gray-500'>تاريخ البداية:</span>
                  <p>
                    {leaveRequest.startDate
                      ? new Date(leaveRequest.startDate).toLocaleDateString(
                          'ar-SA'
                        )
                      : '-'}
                  </p>
                </div>
                <div>
                  <span className='font-medium text-gray-500'>تاريخ النهاية:</span>
                  <p>
                    {leaveRequest.endDate
                      ? new Date(leaveRequest.endDate).toLocaleDateString(
                          'ar-SA'
                        )
                      : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='approvedDays'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عدد الأيام المعتمدة</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={1}
                        placeholder='عدد الأيام المعتمدة'
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          field.onChange(isNaN(value) ? undefined : value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='notes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملاحظات (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='أدخل ملاحظات الموافقة'
                        {...field}
                        rows={3}
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
                <Button disabled={loading} type='submit'>
                  موافقة
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

