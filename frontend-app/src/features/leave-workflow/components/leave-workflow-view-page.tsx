'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import { useParams, useRouter } from 'next/navigation';
import { formatDate } from '../utils/leave-workflow';
import { LeaveWorkflow, LeaveType, LeaveTypeDisplay } from '../types/leave-workflow';
import { Badge } from '@/components/ui/badge';

interface LeaveWorkflowViewProps {
  data: LeaveWorkflow;
}

export default function LeaveWorkflowViewPage({
  data
}: LeaveWorkflowViewProps) {
  const router = useRouter();
  const params = useParams();

  return (
    <div className='flex flex-col gap-4 p-6'>
      <div className='flex items-center justify-between'>
        <Heading
          title={data.workflowName || 'مسار العمل'}
          description={`مسار عمل لإدارة الإجازات`}
        />
        <Button
          onClick={() => router.push(`/leave-workflow/${params.id}/edit`)}
        >
          تعديل
        </Button>
      </div>
      <Separator />

      <div className='mt-4 grid grid-cols-1 gap-6 md:grid-cols-2'>
        <div className='space-y-4'>
          <div>
            <h3 className='text-lg font-medium'>معلومات مسار العمل</h3>
            <Separator className='my-2' />
            <dl className='space-y-2'>
              <div className='flex justify-between py-1'>
                <dt className='font-medium text-gray-500'>الاسم:</dt>
                <dd>{data.workflowName || '-'}</dd>
              </div>
              <div className='flex justify-between py-1'>
                <dt className='font-medium text-gray-500'>الوحدة المحفزة:</dt>
                <dd>{data.triggeringUnitName || '-'}</dd>
              </div>
              <div className='flex justify-between py-1'>
                <dt className='font-medium text-gray-500'>نوع الإجازة المحفزة:</dt>
                <dd>
                  {data.triggeringLeaveType
                    ? LeaveTypeDisplay[data.triggeringLeaveType as LeaveType]
                    : 'الكل'}
                </dd>
              </div>
              <div className='flex justify-between py-1'>
                <dt className='font-medium text-gray-500'>الحالة:</dt>
                <dd>
                  <Badge variant={data.isEnabled ? 'default' : 'outline'}>
                    {data.isEnabled ? 'مفعل' : 'غير مفعل'}
                  </Badge>
                </dd>
              </div>
              <div className='flex justify-between py-1'>
                <dt className='font-medium text-gray-500'>الحالة النظامية:</dt>
                <dd>
                  <Badge variant='outline'>{data.statusName || '-'}</Badge>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className='space-y-4'>
          <div>
            <h3 className='text-lg font-medium'>معلومات إضافية</h3>
            <Separator className='my-2' />
            <dl className='space-y-2'>
              <div className='flex justify-between py-1'>
                <dt className='font-medium text-gray-500'>أنشئ بواسطة:</dt>
                <dd>{data.createBy || '-'}</dd>
              </div>
              <div className='flex justify-between py-1'>
                <dt className='font-medium text-gray-500'>تاريخ الإنشاء:</dt>
                <dd>{formatDate(data.createAt)}</dd>
              </div>
              <div className='flex justify-between py-1'>
                <dt className='font-medium text-gray-500'>تم التحديث بواسطة:</dt>
                <dd>{data.lastUpdateBy || '-'}</dd>
              </div>
              <div className='flex justify-between py-1'>
                <dt className='font-medium text-gray-500'>آخر تحديث:</dt>
                <dd>{formatDate(data.lastUpdateAt)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {data.description && (
        <div className='mt-4'>
          <h3 className='text-lg font-medium'>الوصف</h3>
          <Separator className='my-2' />
          <p className='text-gray-700'>{data.description}</p>
        </div>
      )}

      {data.steps && data.steps.length > 0 && (
        <div className='mt-4'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-medium'>قوالب خطوات المسار</h3>
            <Button
              onClick={() => router.push(`/leave-workflow/${params.id}/step-templates`)}
            >
              إدارة القوالب
            </Button>
          </div>
          <Separator className='my-2' />
          <div className='space-y-2'>
            {data.steps
              .sort((a, b) => (a.stepOrder || 0) - (b.stepOrder || 0))
              .map((step, index) => (
                <div
                  key={step.id || index}
                  className='rounded-lg border p-3'
                >
                  <div className='flex items-center justify-between'>
                    <div>
                      <span className='font-medium'>الخطوة {step.stepOrder}:</span>
                      <span className='ml-2'>{step.actionTypeName}</span>
                    </div>
                    <Badge variant={step.isActive ? 'default' : 'outline'}>
                      {step.isActive ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </div>
                  {step.targetIdentifierName && (
                    <div className='mt-1 text-sm text-gray-600'>
                      الهدف: {step.targetIdentifierName}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      <div className='mt-6 flex justify-end gap-2'>
        <Button
          variant='outline'
          onClick={() => router.push('/leave-workflow')}
        >
          العودة للقائمة
        </Button>
        <Button
          onClick={() => router.push(`/leave-workflow/${params.id}/edit`)}
        >
          تعديل
        </Button>
      </div>
    </div>
  );
}

