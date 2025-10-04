'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import { useParams, useRouter } from 'next/navigation';
import { getPermissionStatusText } from '../utils/permission';
import { IPermissionDetail } from '../types/permission';
import { Badge } from '@/components/ui/badge';

interface PermissionViewProps {
  data: IPermissionDetail;
}

export default function PermissionViewPage({ data }: PermissionViewProps) {
  const router = useRouter();
  const params = useParams();

  return (
    <div className='flex flex-col gap-4 p-6'>
      <div className='flex items-center justify-between'>
        <Heading
          title={data.name || 'الصلاحية'}
          description={`عرض تفاصيل الصلاحية ${data.value || ''}`}
        />
        <Button onClick={() => router.push(`/permission/${params.id}/edit`)}>
          تعديل
        </Button>
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
                <dd>{data.name || '-'}</dd>
              </div>
              <div className='flex justify-between py-1'>
                <dt className='font-medium text-gray-500'>القيمة:</dt>
                <dd>{data.value || '-'}</dd>
              </div>
              <div className='flex justify-between py-1'>
                <dt className='font-medium text-gray-500'>الحالة:</dt>
                <dd>
                  <Badge
                    variant={
                      data.status === 1
                        ? 'default'
                        : data.status === 2
                          ? 'outline'
                          : 'destructive'
                    }
                  >
                    {getPermissionStatusText(data.status || 0)}
                  </Badge>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className='space-y-4'>
          <div>
            <h3 className='text-lg font-medium'>الاستخدام</h3>
            <Separator className='my-2' />
            <p className='text-gray-700'>
              هذه الصلاحية تتحكم في الوصول إلى وظائف النظام المرتبطة بـ{' '}
              <code className='rounded bg-gray-100 px-1 py-0.5'>
                {data.value || '-'}
              </code>
            </p>
          </div>
        </div>
      </div>

      <div className='mt-4'>
        <h3 className='text-lg font-medium'>الوصف</h3>
        <Separator className='my-2' />
        <p className='text-gray-700'>{data.description || 'لا يوجد وصف.'}</p>
      </div>

      <div className='mt-6 flex justify-end gap-2'>
        <Button variant='outline' onClick={() => router.push('/permission')}>
          العودة للقائمة
        </Button>
        <Button onClick={() => router.push(`/permission/${params.id}/edit`)}>
          تعديل
        </Button>
      </div>
    </div>
  );
}