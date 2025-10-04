'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import { useParams, useRouter } from 'next/navigation';
import { getRoleStatusText } from '../utils/role';
import { IRoleDetails } from '../types/role';
import { Badge } from '@/components/ui/badge';
import moment from 'moment';
import { IPermissionList } from '@/features/permissions/types/permission';
import RolePermissionDialog from './role-permission-dialog';
import { useState } from 'react';

interface RoleViewProps {
  data: IRoleDetails;
  permissions: IPermissionList[]
  // rolePermissions: IPermissionList[
}

export default function RoleViewPage({ data, permissions }: RoleViewProps) {
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();
  const params = useParams();

  return (
    <div className='flex flex-col gap-4 p-6'>
      <div className='flex items-center justify-between'>
        <Heading
          title={data.name.toUpperCase() || 'الدور'}
          description={`عرض تفاصيل الدور ${data.value || ''}`}
        />
      <div className='flex gap-2'>
     
        <Button onClick={() => setIsOpen(true)}>
          تعيين صلاحيات
        </Button>

        <Button onClick={() => router.push(`/roles/${params.id}/edit`)}>
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
                      data.statusId === 1
                        ? 'default'
                        : data.statusId === 2
                          ? 'outline'
                          : 'destructive'
                    }
                  >
                    {getRoleStatusText(data.statusId || 0)}
                  </Badge>
                </dd>
              </div>
              <div className='flex justify-between py-1'>
                <dt className='font-medium text-gray-500'>عدد المستخدمين:</dt>
                <dd>{data.userCount || 0}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className='space-y-4'>
          <div>
            <h3 className='text-lg font-medium'>الصلاحيات</h3>
            <Separator className='my-2' />
            <dl className='space-y-2'>
              {data.rolePermissions && data.rolePermissions.length > 0 ? (
                data.rolePermissions.map((permission) => (
                  <div
                    key={permission.id}
                    className='flex justify-between py-1'
                  >
                    <dt className='font-medium text-gray-500'>
                      {permission.name}:
                    </dt>
                    <dd>{permission.value}</dd>
                  </div>
                ))
              ) : (
                <div className='py-2 text-center text-gray-500'>
                  لا توجد صلاحيات مرتبطة بهذا الدور
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      <div className='mt-4'>
        <h3 className='text-lg font-medium'>الوصف</h3>
        <Separator className='my-2' />
        <p className='text-gray-700'>{data.description || 'لا يوجد وصف.'}</p>
      </div>

      {data.delegations && data.delegations.length > 0 && (
        <div className='mt-4'>
          <h3 className='text-lg font-medium'>التفويضات</h3>
          <Separator className='my-2' />
          <div className='space-y-3'>
            {data.delegations.map((delegation) => (
              <div
                key={`${delegation.delegatorUserId}-${delegation.delegateeUserId}`}
                className='rounded-md border p-3'
              >
                <div className='flex justify-between'>
                  <span className='font-medium'>
                    من: {delegation.delegatorUserName}
                  </span>
                  <span className='font-medium'>
                    إلى: {delegation.delegateeUserName}
                  </span>
                </div>
                <div className='mt-2 flex justify-between text-sm text-gray-500'>
                  <span>الصلاحية: {delegation.permissionName}</span>
                  <span>
                    {moment(delegation.startDate).format('YYYY-MM-DD')} -{' '}
                    {moment(delegation.endDate).format('YYYY-MM-DD')}
                  </span>
                </div>
                <div className='mt-1 text-sm'>
                  <Badge variant={delegation.isActive ? 'default' : 'outline'}>
                    {delegation.isActive ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className='mt-4'>
        <h3 className='text-lg font-medium'>المعلومات الإضافية</h3>
        <Separator className='my-2' />
        <dl className='space-y-2'>
          <div className='flex justify-between py-1'>
            <dt className='font-medium text-gray-500'>تاريخ الإنشاء:</dt>
            <dd>{moment(data.createdDate).format('YYYY-MM-DD')}</dd>
          </div>
          <div className='flex justify-between py-1'>
            <dt className='font-medium text-gray-500'>آخر تحديث:</dt>
            <dd>{moment(data.lastModifiedDate).format('YYYY-MM-DD')}</dd>
          </div>
        </dl>
      </div>

      <div className='mt-6 flex justify-end gap-2'>
        <Button variant='outline' onClick={() => router.push('/roles')}>
          العودة للقائمة
        </Button>
        <Button onClick={() => router.push(`/roles/${params.id}/edit`)}>
          تعديل
        </Button>
      </div>

      <RolePermissionDialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      roleId={data.id || ''}
      permissions={permissions}
      rolePermissions={data.rolePermissions}
    />
    </div>
  );
}
