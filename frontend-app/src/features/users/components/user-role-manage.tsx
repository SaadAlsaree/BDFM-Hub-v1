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
import { UserRole, AssignUserRolesDto } from '../types/user';
import { userRoleService } from '../api/userRole.service';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuthApi } from '@/hooks/use-auth-api';

type UserRoleManageProps = {
  userId: string;
  roles: UserRole[];
  userRoles?: UserRole[];
  onRolesUpdate?: (updatedRoles: UserRole[]) => void;
  isLoading?: boolean;
};

const UserRoleManage = ({
  userId,
  roles,
  userRoles = [],
  onRolesUpdate,
  isLoading = false
}: UserRoleManageProps) => {
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(
    new Set(userRoles.map((role) => role.id).filter(Boolean) as string[])
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  const { authApiCall } = useAuthApi();

  // Check if a role is currently assigned to the user
  const isRoleAssigned = useCallback(
    (roleId: string) => {
      return selectedRoles.has(roleId);
    },
    [selectedRoles]
  );

  // Handle role toggle
  const onRoleToggle = useCallback((roleId: string, isChecked: boolean) => {
    setSelectedRoles((prev) => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(roleId);
      } else {
        newSet.delete(roleId);
      }
      return newSet;
    });
  }, []);

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    const currentRoleIds = new Set(
      userRoles.map((role) => role.id).filter(Boolean) as string[]
    );
    return (
      selectedRoles.size !== currentRoleIds.size ||
      !Array.from(selectedRoles).every((id) => currentRoleIds.has(id))
    );
  }, [selectedRoles, userRoles]);

  // Save role changes
  const onSaveChanges = useCallback(async () => {
    if (!hasChanges || isUpdating) return;

    setIsUpdating(true);
    try {
      const roleIds = Array.from(selectedRoles);
      const assignUserRolesDto: AssignUserRolesDto = {
        userId,
        roleIds
      };

      const response = await authApiCall(async () => {
        return userRoleService.updateUserRoles(assignUserRolesDto);
      });

      if (response?.succeeded) {
        const updatedRoles = roles.filter(
          (role) => role.id && selectedRoles.has(role.id)
        );
        onRolesUpdate?.(updatedRoles);

        toast.success('تم تحديث أدوار المستخدم بنجاح');
        router.refresh();
      } else {
        throw new Error('Failed to update user roles');
      }
    } catch (error) {
      console.error('Error updating user roles:', error);
      toast.error('حدث خطأ أثناء تحديث أدوار المستخدم');

      // Revert changes on error
      setSelectedRoles(
        new Set(userRoles.map((role) => role.id).filter(Boolean) as string[])
      );
    } finally {
      setIsUpdating(false);
    }
  }, [
    hasChanges,
    isUpdating,
    selectedRoles,
    userId,
    roles,
    onRolesUpdate,
    userRoles
  ]);

  // Reset changes
  const onResetChanges = useCallback(() => {
    setSelectedRoles(
      new Set(userRoles.map((role) => role.id).filter(Boolean) as string[])
    );
  }, [userRoles]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRoles = roles.length;
    const assignedRoles = selectedRoles.size;
    const availableRoles = totalRoles - assignedRoles;

    return { totalRoles, assignedRoles, availableRoles };
  }, [roles.length, selectedRoles.size]);

  if (isLoading) {
    return (
      <Card className='mt-4'>
        <CardHeader>
          <CardTitle>إدارة أدوار المستخدم</CardTitle>
          <CardDescription>جاري التحميل...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
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
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>إدارة أدوار المستخدم</CardTitle>
            <CardDescription>
              قم بتعيين أو إلغاء تعيين الأدوار للمستخدم
            </CardDescription>
          </div>
          <div className='flex gap-2'>
            <Badge variant='outline'>المجموع: {stats.totalRoles}</Badge>
            <Badge variant='default'>المعين: {stats.assignedRoles}</Badge>
            <Badge variant='secondary'>المتاح: {stats.availableRoles}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className='h-[400px] w-full'>
          <div className='grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4'>
            {roles.map((role) => (
              <div
                key={role.id}
                className='flex flex-col rounded-lg border p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800'
              >
                <div className='mb-3 flex-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <h4 className='text-sm font-medium'>
                      {role.name || 'بدون اسم'}
                    </h4>
                    {role.value && (
                      <Badge variant='outline' className='text-xs'>
                        {role.value}
                      </Badge>
                    )}
                  </div>
                  {role.description && (
                    <p className='text-muted-foreground line-clamp-2 text-sm'>
                      {role.description}
                    </p>
                  )}
                </div>
                <div className='flex justify-end'>
                  <Switch
                    checked={role.id ? isRoleAssigned(role.id) : false}
                    onCheckedChange={(checked) => {
                      if (role.id) {
                        onRoleToggle(role.id, checked);
                      }
                    }}
                    disabled={!role.id || isUpdating}
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

        {roles.length === 0 && (
          <div className='py-8 text-center'>
            <p className='text-muted-foreground'>لا توجد أدوار متاحة</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserRoleManage;
