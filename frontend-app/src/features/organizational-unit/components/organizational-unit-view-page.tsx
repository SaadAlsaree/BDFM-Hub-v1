'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import { useParams, useRouter } from 'next/navigation';
import { getOrganizationalUnitStatusText } from '../utils/organizational';
import { IOrganizationalUnitDetails } from '../types/organizational';
import { Badge } from '@/components/ui/badge';
import moment from 'moment';

interface OrganizationalUnitViewProps {
  data: IOrganizationalUnitDetails;
}

export default function OrganizationalUnitViewPage({
  data
}: OrganizationalUnitViewProps) {
  const router = useRouter();
  const params = useParams();

  const formatBoolean = (value: boolean | undefined) => {
    return value ? 'Yes' : 'No';
  };

  return (
    <div className='flex flex-col gap-4 p-6'>
      <div className='flex items-center justify-between'>
        <Heading
          title={data.unitName || 'الجهة'}
          description={`عرض تفاصيل الجهة  ${data.unitCode || ''}`}
        />
        <Button
          onClick={() => router.push(`/organizational-unit/${params.id}/edit`)}
        >
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
                <dd>{data.unitName || '-'}</dd>
              </div>
              <div className='flex justify-between py-1'>
                <dt className='font-medium text-gray-500'>الكود:</dt>
                <dd>{data.unitCode || '-'}</dd>
              </div>
              <div className='flex justify-between py-1'>
                <dt className='font-medium text-gray-500'>الجهة الأم:</dt>
                <dd>{data.parentUnitName || 'Root Unit'}</dd>
              </div>
              <div className='flex justify-between py-1'>
                <dt className='font-medium text-gray-500'>المستوى:</dt>
                <dd>{data.unitLevel || '-'}</dd>
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
                    {getOrganizationalUnitStatusText(data.status || 0)}
                  </Badge>
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className='text-lg font-medium'>إعدادات البريد</h3>
            <Separator className='my-2' />
            <dl className='space-y-2'>
              <div className='flex justify-between py-1'>
                <dt className='font-medium text-gray-500'>
                  يمكن تلقي البريد الخارجي:
                </dt>
                <dd>
                  {formatBoolean(data.canReceiveExternalMail) ? 'نعم' : 'لا'}
                </dd>
              </div>
              <div className='flex justify-between py-1'>
                <dt className='font-medium text-gray-500'>
                  يمكن إرسال البريد الخارجي:
                </dt>
                <dd>
                  {formatBoolean(data.canSendExternalMail) ? 'نعم' : 'لا'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className='space-y-4'>
          <div>
            <h3 className='text-lg font-medium'>المعلومات الاتصالية</h3>
            <Separator className='my-2' />
            <dl className='space-y-2'>
              <div className='flex justify-between py-1'>
                <dt className='font-medium text-gray-500'>
                  البريد الإلكتروني:
                </dt>
                <dd>{data.email || '-'}</dd>
              </div>
              <div className='flex justify-between py-1'>
                <dt className='font-medium text-gray-500'>رقم الهاتف:</dt>
                <dd>{data.phoneNumber || '-'}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className='text-lg font-medium'>العنوان</h3>
            <Separator className='my-2' />
            <dl className='space-y-2'>
              <div className='flex justify-between py-1'>
                <dt className='font-medium text-gray-500'>العنوان:</dt>
                <dd>{data.address || '-'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className='mt-4'>
        <h3 className='text-lg font-medium'>الوصف</h3>
        <Separator className='my-2' />
        <p className='text-gray-700'>
          {data.unitDescription || 'لا يوجد وصف.'}
        </p>
      </div>

      <div className='mt-4'>
        <h3 className='text-lg font-medium'>المعلومات الإضافية</h3>
        <Separator className='my-2' />
        <dl className='space-y-2'>
          <div className='flex justify-between py-1'>
            <dt className='font-medium text-gray-500'>تاريخ الإنشاء:</dt>
            <dd>{moment(data.createdAt).format('YYYY-MM-DD')}</dd>
          </div>
          <div className='flex justify-between py-1'>
            <dt className='font-medium text-gray-500'>أنشئ بواسطة:</dt>
            <dd>{data.createdBy || '-'}</dd>
          </div>
          <div className='flex justify-between py-1'>
            <dt className='font-medium text-gray-500'>آخر تحديث:</dt>
            <dd>{moment(data.updatedAt).format('YYYY-MM-DD')}</dd>
          </div>
          <div className='flex justify-between py-1'>
            <dt className='font-medium text-gray-500'>تم التحديث بواسطة:</dt>
            <dd>{data.updatedBy || '-'}</dd>
          </div>
        </dl>
      </div>

      <div className='mt-6 flex justify-end gap-2'>
        <Button
          variant='outline'
          onClick={() => router.push('/organizational-unit')}
        >
          العودة للقائمة
        </Button>
        <Button
          onClick={() => router.push(`/organizational-unit/${params.id}/edit`)}
        >
          تعديل
        </Button>
      </div>
    </div>
  );
}
