'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import moment from 'moment';
import { IMailFileDetail } from '../types/mail-files';

interface MailFileViewProps {
  data: IMailFileDetail;
}

export default function MailFileViewPage({ data }: MailFileViewProps) {
  const router = useRouter();
  const params = useParams();

  const getStatusBadgeVariant = (status?: number) => {
    switch (status) {
      case 1: // Assuming 1 is for Active
        return 'default';
      case 2: // Assuming 2 is for Inactive
        return 'outline';
      case 3: // Assuming 3 is for Deleted
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status?: number) => {
    switch (status) {
      case 1:
        return 'نشط';
      case 2:
        return 'غير نشط';
      case 3:
        return 'محذوف';
      default:
        return 'غير معروف';
    }
  };

  return (
    <div className='flex flex-col gap-4 p-6'>
      <div className='flex items-center justify-between'>
        <Heading
          title={data?.name || 'ملف الكتب'}
          description={`عرض تفاصيل ملف الكتب ${data?.fileNumber || ''}`}
        />
        <div className='flex gap-2'>
          <Button onClick={() => router.push(`/mail-files/${params.id}/edit`)}>
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
                <dt className='font-medium text-gray-500'>رقم الملف:</dt>
                <dd>{data?.fileNumber || '-'}</dd>
              </div>
              <div className='flex justify-between py-1'>
                <dt className='font-medium text-gray-500'>الاسم:</dt>
                <dd>{data?.name || '-'}</dd>
              </div>
              <div className='flex justify-between py-1'>
                <dt className='font-medium text-gray-500'>الموضوع:</dt>
                <dd>{data?.subject || '-'}</dd>
              </div>
              <div className='flex justify-between py-1'>
                <dt className='font-medium text-gray-500'>الحالة:</dt>
                <dd>
                  <Badge variant={getStatusBadgeVariant(data?.status)}>
                    {getStatusText(data?.status)}
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
                <dt className='font-medium text-gray-500'>عدد الكتب:</dt>
                <dd>{data?.correspondenceCount || 0}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {data?.correspondenceCount && data?.correspondenceCount > 0 ? (
        <div className='mt-6'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-medium'>الكتب المرتبطة</h3>
            <Button
              onClick={() =>
                router.push(`/mail-files/${params.id}/correspondence/new`)
              }
            >
              إضافة كتاب
            </Button>
          </div>
          <Separator className='my-2' />
          {/* The correspondences would be loaded via a server component or useEffect */}
          <div className='mt-2'>
            <p className='text-gray-500'>
              اضغط على زر إضافة مراسلة لإضافة مراسلة جديدة لهذا الملف
            </p>
          </div>
        </div>
      ) : (
        <div className='mt-6'>
          <h3 className='text-lg font-medium'>الكتب المرتبطة</h3>
          <Separator className='my-2' />
          <div className='py-4 text-center text-gray-500'>
            <p>لا توجد كتب مرتبطة بهذا الملف</p>
            <Button
              onClick={() =>
                router.push(`/mail-files/${params.id}/correspondence/new`)
              }
              className='mt-2'
            >
              إضافة مراسلة
            </Button>
          </div>
        </div>
      )}

      <div className='mt-6 flex justify-end gap-2'>
        <Button variant='outline' onClick={() => router.push('/mail-files')}>
          العودة للقائمة
        </Button>
        <Button onClick={() => router.push(`/mail-files/${params.id}/edit`)}>
          تعديل
        </Button>
      </div>
    </div>
  );
}
