'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import moment from 'moment';
import { CustomWorkflowItem } from '../types/custom-workflow';

interface CustomWorkflowViewProps {
  data: CustomWorkflowItem;
}

export default function CustomWorkflowViewPage({
  data
}: CustomWorkflowViewProps) {
  const router = useRouter();
  const params = useParams();

  return (
    <div className='flex flex-col gap-4 p-6'>
      <div className='flex items-center justify-between'>
        <Heading
          title={data?.workflowName || 'سير العمل'}
          description={`عرض تفاصيل سير العمل ${data?.workflowName || ''}`}
        />
        <div className='flex gap-2'>
          <Button
            onClick={() => router.push(`/custom-workflow/${params.id}/edit`)}
          >
            تعديل
          </Button>
        </div>
      </div>
      <Separator />

      <div className='mt-4 grid grid-cols-1 gap-6 md:grid-cols-2'>
        <div className='space-y-4'>
          <div>
            <h3 className='text-lg font-medium'>المعلومات الأساسية</h3>
            <Separator className='my-2' />
            <dl className='space-y-2'>
              <div className='flex justify-between py-1'>
                <dt className='font-medium text-gray-500'>الاسم:</dt>
                <dd>{data?.workflowName || '-'}</dd>
              </div>
              <div className='flex justify-between py-1'>
                <dt className='font-medium text-gray-500'>الوصف:</dt>
                <dd>{data?.description || '-'}</dd>
              </div>
              <div className='flex justify-between py-1'>
                <dt className='font-medium text-gray-500'>الحالة:</dt>
                <dd>
                  <Badge variant={data?.isEnabled ? 'default' : 'secondary'}>
                    {data?.isEnabled ? 'مفعل' : 'غير مفعل'}
                  </Badge>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className='space-y-4'>
          <div>
            <h3 className='text-lg font-medium'>المعلومات الإضافية</h3>
            <Separator className='my-2' />
            <dl className='space-y-2'>
              <div className='flex justify-between py-1'>
                <dt className='font-medium text-gray-500'>تاريخ الإنشاء:</dt>
                <dd>
                  {data?.createAt
                    ? moment(data.createAt).format('YYYY-MM-DD')
                    : '-'}
                </dd>
              </div>
              <div className='flex justify-between py-1'>
                <dt className='font-medium text-gray-500'>
                  تم الإنشاء بواسطة:
                </dt>
                <dd>{data?.createBy || '-'}</dd>
              </div>
              <div className='flex justify-between py-1'>
                <dt className='font-medium text-gray-500'>عدد الخطوات:</dt>
                <dd>{(data as any)?.stepsCount ?? '-'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className='mt-6 flex justify-end gap-2'>
        <Button
          variant='outline'
          onClick={() => router.push('/custom-workflow')}
        >
          العودة للقائمة
        </Button>
        <Button
          onClick={() => router.push(`/custom-workflow/${params.id}/edit`)}
        >
          تعديل
        </Button>
      </div>
    </div>
  );
}
