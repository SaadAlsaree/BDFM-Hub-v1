'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import moment from 'moment';
import { IDelegationDetail } from '../types/delegation';
import { DelegationStatus, statusLabels } from '../utils/delegation';

interface DelegationViewProps {
  data: IDelegationDetail;
}

export default function DelegationViewPage({ data }: DelegationViewProps) {
  const router = useRouter();
  const params = useParams();

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <Heading
          title="تفاصيل التفويض"
          description={`عرض تفاصيل التفويض بين ${data?.delegatorUserName} و ${data?.delegateeUserName}`}
        />
        <Button onClick={() => router.push(`/delegation/${params.id}/edit`)}>
          تعديل
        </Button>
      </div>
      <Separator />

      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">معلومات التفويض</h3>
            <Separator className="my-2" />
            <dl className="space-y-2">
              <div className="flex justify-between py-1">
                <dt className="font-medium text-gray-500">المفوض:</dt>
                <dd>{data?.delegatorUserName || '-'}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="font-medium text-gray-500">المفوض إليه:</dt>
                <dd>{data?.delegateeUserName || '-'}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="font-medium text-gray-500">الدور:</dt>
                <dd>{data?.roleName || '-'}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="font-medium text-gray-500">الصلاحية:</dt>
                <dd>{data?.permissionName || '-'}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">حالة التفويض</h3>
            <Separator className="my-2" />
            <dl className="space-y-2">
              <div className="flex justify-between py-1">
                <dt className="font-medium text-gray-500">الحالة:</dt>
                <dd>
                  <Badge
                    variant={statusLabels[data?.statusId as DelegationStatus]?.variant || 'outline'}
                  >
                    {statusLabels[data?.statusId as DelegationStatus]?.label || 'غير معروف'}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="font-medium text-gray-500">نشط:</dt>
                <dd>
                  <Badge variant={data?.isActive ? 'default' : 'secondary'}>
                    {data?.isActive ? 'نشط' : 'غير نشط'}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="font-medium text-gray-500">تاريخ البدء:</dt>
                <dd>{data?.startDate ? moment(data.startDate).format('YYYY-MM-DD') : '-'}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="font-medium text-gray-500">تاريخ الانتهاء:</dt>
                <dd>{data?.endDate ? moment(data.endDate).format('YYYY-MM-DD') : '-'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-medium">المعلومات الإضافية</h3>
        <Separator className="my-2" />
        <dl className="space-y-2">
          <div className="flex justify-between py-1">
            <dt className="font-medium text-gray-500">تاريخ الإنشاء:</dt>
            <dd>{data?.createdDate ? moment(data.createdDate).format('YYYY-MM-DD') : '-'}</dd>
          </div>
          <div className="flex justify-between py-1">
            <dt className="font-medium text-gray-500">آخر تحديث:</dt>
            <dd>{data?.lastModifiedDate ? moment(data.lastModifiedDate).format('YYYY-MM-DD') : '-'}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push('/delegations')}>
          العودة للقائمة
        </Button>
        <Button onClick={() => router.push(`/delegation/${params.id}/edit`)}>
          تعديل
        </Button>
      </div>
    </div>
  );
}
