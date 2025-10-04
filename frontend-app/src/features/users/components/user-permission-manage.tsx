'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  IUserPermissionResponse,
  AssignUserPermissionsDto
} from '../types/user';
import { IPermissionList } from '@/features/permissions/types/permission';
import { userPermissionService } from '../api/user-permistion.service';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type UserPermissionManageProps = {
  userId: string;
  permissions: IPermissionList[];
  userPermissions?: IUserPermissionResponse[];
  onPermissionsUpdate?: (updatedPermissions: IUserPermissionResponse[]) => void;
  isLoading?: boolean;
};

const UserPermissionManage = ({
  userId,
  permissions,
  userPermissions = [],
  onPermissionsUpdate,
  isLoading = false
}: UserPermissionManageProps) => {
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(
      userPermissions
        .map((permission) => permission.id)
        .filter(Boolean) as string[]
    )
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  // Check if a permission is currently assigned to the user
  const isPermissionAssigned = useCallback(
    (permissionId: string) => {
      return selectedPermissions.has(permissionId);
    },
    [selectedPermissions]
  );

  // Handle permission toggle
  const onPermissionToggle = useCallback(
    (permissionId: string, isChecked: boolean) => {
      setSelectedPermissions((prev) => {
        const newSet = new Set(prev);
        if (isChecked) {
          newSet.add(permissionId);
        } else {
          newSet.delete(permissionId);
        }
        return newSet;
      });
    },
    []
  );

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    const currentPermissionIds = new Set(
      userPermissions
        .map((permission) => permission.id)
        .filter(Boolean) as string[]
    );
    return (
      selectedPermissions.size !== currentPermissionIds.size ||
      !Array.from(selectedPermissions).every((id) =>
        currentPermissionIds.has(id)
      )
    );
  }, [selectedPermissions, userPermissions]);

  // Save permission changes
  const onSaveChanges = useCallback(async () => {
    if (!hasChanges || isUpdating) return;

    setIsUpdating(true);
    try {
      const permissionIds = Array.from(selectedPermissions);
      const assignUserPermissionsDto: AssignUserPermissionsDto = {
        userId,
        permissionIds
      };

      const response = await userPermissionService.assignUserPermissions(
        assignUserPermissionsDto
      );

      if (response?.succeeded) {
        const updatedPermissions = permissions
          .filter(
            (permission) =>
              permission.id && selectedPermissions.has(permission.id)
          )
          .map((permission) => ({
            id: permission.id!,
            name: permission.name!,
            value: permission.value!,
            description: permission.description!,
            statusName: permission.statusName!,
            statusId: permission.status!,
            createdDate: new Date().toISOString(),
            lastModifiedDate: new Date().toISOString()
          }));

        onPermissionsUpdate?.(updatedPermissions);

        toast.success('تم تحديث صلاحيات المستخدم بنجاح');
        router.refresh();
      } else {
        throw new Error('Failed to update user permissions');
      }
    } catch (error) {
      console.error('Error updating user permissions:', error);
      toast.error('حدث خطأ أثناء تحديث صلاحيات المستخدم');

      // Revert changes on error
      setSelectedPermissions(
        new Set(
          userPermissions
            .map((permission) => permission.id)
            .filter(Boolean) as string[]
        )
      );
    } finally {
      setIsUpdating(false);
    }
  }, [
    hasChanges,
    isUpdating,
    selectedPermissions,
    userId,
    permissions,
    onPermissionsUpdate,
    userPermissions,
    router
  ]);

  // Reset changes
  const onResetChanges = useCallback(() => {
    setSelectedPermissions(
      new Set(
        userPermissions
          .map((permission) => permission.id)
          .filter(Boolean) as string[]
      )
    );
  }, [userPermissions]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalPermissions = permissions.length;
    const assignedPermissions = selectedPermissions.size;
    const availablePermissions = totalPermissions - assignedPermissions;

    return { totalPermissions, assignedPermissions, availablePermissions };
  }, [permissions.length, selectedPermissions.size]);

  if (isLoading) {
    return (
      <Card className='mt-4'>
        <CardHeader>
          <CardTitle>إدارة صلاحيات المستخدم</CardTitle>
          <CardDescription>جاري التحميل...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className='flex animate-pulse items-center justify-between rounded-lg border p-3'
              >
                <div className='space-y-2'>
                  <div className='h-4 w-32 rounded bg-gray-200'></div>
                  <div className='h-3 w-48 rounded bg-gray-100'></div>
                </div>
                <div className='h-6 w-11 rounded bg-gray-200'></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='mt-4'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>إدارة صلاحيات المستخدم</CardTitle>
            <CardDescription>
              قم بتعيين أو إلغاء تعيين الصلاحيات للمستخدم
            </CardDescription>
          </div>
          <div className='flex gap-2'>
            <Badge variant='outline'>المجموع: {stats.totalPermissions}</Badge>
            <Badge variant='default'>المعين: {stats.assignedPermissions}</Badge>
            <Badge variant='secondary'>
              المتاح: {stats.availablePermissions}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className='h-[700px] w-full'>
          <div className='grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4'>
            {permissions.map((permission) => (
              <div
                key={permission.id}
                className='flex flex-col rounded-lg border p-1 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800'
              >
                <div className='mb-3 flex-1 space-y-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <h4 className='text-sm font-medium'>
                      {permission.name || 'بدون اسم'}
                    </h4>
                    {permission.value && (
                      <Badge variant='outline' className='text-xs'>
                        {permission.value}
                      </Badge>
                    )}
                    {permission.statusName && (
                      <Badge
                        variant={
                          permission.status === 1 ? 'default' : 'secondary'
                        }
                        className='text-xs'
                      >
                        {permission.statusName}
                      </Badge>
                    )}
                  </div>
                  {permission.description && (
                    <p className='text-muted-foreground line-clamp-2 text-sm'>
                      {permission.description}
                    </p>
                  )}
                  {permission.userCount !== undefined && (
                    <p className='text-muted-foreground text-xs'>
                      عدد المستخدمين: {permission.userCount}
                    </p>
                  )}
                </div>
                <div className='flex justify-end'>
                  <Switch
                    checked={
                      permission.id
                        ? isPermissionAssigned(permission.id)
                        : false
                    }
                    onCheckedChange={(checked) => {
                      if (permission.id) {
                        onPermissionToggle(permission.id, checked);
                      }
                    }}
                    disabled={
                      !permission.id || isUpdating || permission.status !== 1
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {hasChanges && (
          <>
            <Separator className='my-4' />
            <div className='flex items-center justify-between'>
              <p className='text-muted-foreground text-sm'>
                لديك تغييرات غير محفوظة
              </p>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={onResetChanges}
                  disabled={isUpdating}
                >
                  إلغاء التغييرات
                </Button>
                <Button size='sm' onClick={onSaveChanges} disabled={isUpdating}>
                  {isUpdating ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
              </div>
            </div>
          </>
        )}

        {permissions.length === 0 && (
          <div className='py-8 text-center'>
            <p className='text-muted-foreground'>لا توجد صلاحيات متاحة</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserPermissionManage;
