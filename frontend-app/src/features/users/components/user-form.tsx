'use client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Heading } from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

import {
  UserDetailed,
  UserPayloadDto,
  UserRole
} from '@/features/users/types/user';
import { userService } from '@/features/users/api/user.service';
import { useAuthApi } from '@/hooks/use-auth-api';
import UserManageRoles from './user-manage-roles';

import { formSchema, UserFormValues } from '../utils/user';
import { Spinner } from '@/components/spinner';
import {
  IPermissionDetail,
  IPermissionList
} from '@/features/permissions/types/permission';
import UserPermissionDialog from './user-permission-dialog';
import UserRoleManage from './user-role-manage';
import UserPermissionManage from './user-permission-manage';

type UserFormProps = {
  initialData: UserDetailed | null;
  pageTitle: string;
  roles: UserRole[] | [];
  permissions?: IPermissionList[] | [];
  organizationalUnits: Array<{ id: string; unitName: string }>;
};

export default function UserForm({
  initialData,
  pageTitle,
  roles,
  organizationalUnits = [],
  permissions = []
}: UserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);

  const { authApiCall } = useAuthApi();

  // initial values
  const defaultValues = initialData
    ? {
        username: initialData.username,
        userLogin: initialData.userLogin,
        fullName: initialData.fullName,
        email: initialData.email || '',
        organizationalUnitId: initialData.organizationalUnitId || '',
        positionTitle: initialData.positionTitle || '',
        rfidTagId: initialData.rfidTagId || '',
        isActive: initialData.isActive,
        roleIds:
          initialData.userRoles?.map((role) => ({
            label: role.name || '',
            value: role.id || '',
            disable: false
          })) || [],
        permissionIds:
          initialData.userPermissions?.map((permission) => ({
            label: permission.name || '',
            value: permission.id || '',
            disable: false
          })) || []
      }
    : {};

  // form
  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema(initialData)),
    defaultValues
  });

  // on user login change
  const onUserLoginChange = (value: string) => {
    const formattedValue = value.toLowerCase().replace(/\s+/g, '');
    form.setValue('userLogin', formattedValue);
  };

  // submit
  const onSubmit = async (data: UserFormValues) => {
    try {
      setLoading(true);

      if (initialData) {
        const UserToUpdate = {
          id: initialData.id,
          ...data,
          roleIds: data.roleIds?.map((role) => role.value)
        };
        // const response = await authApiCall(() =>
        const response = await userService.updateUser(
          UserToUpdate as UserPayloadDto
        );
        // );
        if (response?.succeeded) {
          toast.success('تم تحديث المستخدم بنجاح!');
          router.push('/users');
          setLoading(false);
        } else {
          toast.error('لم يتم تحديث المستخدم!');
          setLoading(false);
        }
      } else {
        const userData = {
          ...data,
          roleIds: data.roleIds?.map((role) => role.value)
        };
        const response = await authApiCall(() =>
          userService.createUser(userData as UserPayloadDto)
        );
        if (response?.succeeded) {
          toast.success('تم إنشاء المستخدم بنجاح!');
          router.push('/users');
          setLoading(false);
        } else {
          toast.error('لم يتم إنشاء المستخدم!');
          setLoading(false);
        }
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col gap-4 p-6'>
      <div className='flex items-center justify-between'>
        <Heading title={pageTitle} description='إدارة بيانات المستخدم' />

        {initialData && (
          <div className='flex gap-2'>
            <Button onClick={() => setIsRolesModalOpen(true)}>
              إدارة الادوار
            </Button>

            <Button onClick={() => setIsPermissionsModalOpen(true)}>
              إدارة الصلاحيات
            </Button>
          </div>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full space-y-8'
        >
          <div className='grid gap-8 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المستخدم</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='اسم المستخدم'
                      disabled={loading}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (!initialData) {
                          onUserLoginChange(e.target.value);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='userLogin'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المعرف الدخول</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='username'
                      disabled={loading || !!initialData}
                      className='font-mono'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='grid gap-8 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='fullName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم الكامل</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='الاسم الكامل'
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='user@example.com'
                      disabled={loading || !!initialData}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='grid gap-8 md:grid-cols-2'>
            {!initialData && (
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كلمة المرور</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder='كلمة المرور'
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name='organizationalUnitId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوحدة التنظيمية</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='اختر الوحدة التنظيمية' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {organizationalUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.unitName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='grid gap-8 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='positionTitle'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المسمى الوظيفي</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='المسمى الوظيفي'
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='rfidTagId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم البطاقة RFID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='رقم البطاقة RFID'
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='grid gap-8 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='isActive'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>حالة الحساب</FormLabel>
                    <FormMessage />
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {initialData && (
            <div className='mt-8'>
              <Heading
                title='تفاصيل المستخدم'
                description='معلومات إضافية عن المستخدم'
              />
              <Separator className='my-4' />
              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <h3 className='text-sm font-medium'>تاريخ الإنشاء</h3>
                  <p className='text-muted-foreground text-sm'>
                    {initialData.createAt
                      ? new Date(initialData.createAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {initialData.userRoles && initialData.userRoles.length > 0 && (
                <>
                  <h3 className='mt-6 text-sm font-medium'>الادوار المعينة</h3>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {initialData.userRoles.map((role: UserRole) => (
                      <div
                        key={role.id}
                        className='bg-secondary rounded-md px-2 py-1 text-xs'
                      >
                        {role.name}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {initialData.userPermissions &&
                initialData.userPermissions.length > 0 && (
                  <>
                    <h3 className='mt-6 text-sm font-medium'>
                      الصلاحيات المعينة
                    </h3>
                    <div className='mt-2 flex flex-wrap gap-2'>
                      {initialData.userPermissions.map(
                        (permission: IPermissionDetail) => (
                          <div
                            key={permission.id}
                            className='bg-secondary rounded-md px-2 py-1 text-xs'
                          >
                            {permission.name}
                          </div>
                        )
                      )}
                    </div>
                  </>
                )}

              <div className='mt-8 gap-4'>
                <UserRoleManage
                  userId={initialData.id || ''}
                  roles={roles as []}
                  userRoles={initialData.userRoles}
                />

                <UserPermissionManage
                  userId={initialData.id || ''}
                  permissions={permissions}
                  userPermissions={initialData.userPermissions}
                />
              </div>
            </div>
          )}

          <div className='flex justify-end gap-2'>
            <Button disabled={loading} type='submit'>
              {initialData ? 'تعديل' : 'إنشاء'}
              {loading && (
                <Spinner variant='default' className='ml-2 h-4 w-4' />
              )}
            </Button>
          </div>
        </form>
      </Form>

      {initialData && (
        <>
          <UserManageRoles
            isOpen={isRolesModalOpen}
            onClose={() => setIsRolesModalOpen(false)}
            userId={initialData.id || ''}
            roles={roles as []}
            userRoles={initialData.userRoles}
          />

          <UserPermissionDialog
            isOpen={isPermissionsModalOpen}
            onClose={() => setIsPermissionsModalOpen(false)}
            userId={initialData.id || ''}
            permissions={permissions}
            userPermissions={initialData.userPermissions}
          />
        </>
      )}
    </div>
  );
}
