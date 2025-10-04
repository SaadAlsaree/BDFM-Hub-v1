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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  IDelegationDetail,
  CreateDelegationPayload
} from '@/features/delegations/types/delegation';
import { delegationService } from '@/features/delegations/api/delegation.service';
import { useAuthApi } from '@/hooks/use-auth-api';
import { DelegationStatus, delegationSchema } from '../utils/delegation';
import { Spinner } from '@/components/spinner';
import { z } from 'zod';
import { IRoleList } from '@/features/roles/types/role';
import { IPermissionList } from '@/features/permissions/types/permission';
import { useSession } from 'next-auth/react';
import EmployeeSearch from '@/components/employee-search';
import { EmployeeProfile } from '@/features/users/types/user';
// No DatePicker component available, using standard Input for dates

interface DelegationFormProps {
  initialData: IDelegationDetail | null;
  pageTitle: string;
  roles: IRoleList[];
  permissions: IPermissionList[];
}

// Form schema using Zod
const formSchema = () => {
  return z.object({
    delegatorUserId: z.string({
      required_error: `${delegationSchema.delegatorUserId.label} مطلوب`
    }),
    delegateeUserId: z.string({
      required_error: `${delegationSchema.delegateeUserId.label} مطلوب`
    }),
    permissionId: z.string({
      required_error: `${delegationSchema.permissionId.label} مطلوبة`
    }),
    roleId: z.string({
      required_error: `${delegationSchema.roleId.label} مطلوب`
    }),
    startDate: z.string({
      required_error: `${delegationSchema.startDate.label} مطلوب`
    }),
    endDate: z.string({
      required_error: `${delegationSchema.endDate.label} مطلوب`
    }),
    isActive: z.boolean().optional(),
    statusId: z.number().optional()
  });
};

type DelegationFormValues = z.infer<ReturnType<typeof formSchema>>;

export default function DelegationForm({
  initialData,
  pageTitle,
  roles,
  permissions
}: DelegationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { authApiCall } = useAuthApi();

  const session = useSession();

  const { data: sessionData } = session;

  // initial values
  const defaultValues = initialData
    ? {
        delegatorUserId: initialData.delegatorUserId,
        delegateeUserId: initialData.delegateeUserId,
        permissionId: initialData.permissionId,
        roleId: initialData.roleId,
        startDate: initialData.startDate,
        endDate: initialData.endDate,
        isActive: initialData.isActive,
        statusId: initialData.statusId || DelegationStatus.Active
      }
    : {
        isActive: true,
        statusId: DelegationStatus.Active
      };

  // form
  const form = useForm<DelegationFormValues>({
    resolver: zodResolver(formSchema()),
    defaultValues
  });

  form.setValue('delegatorUserId', sessionData?.user?.id || '');

  const roleOptions = roles?.map((role) => ({
    value: role.id || '',
    label: role.name || ''
  }));

  const permissionOptions = permissions?.map((permission) => ({
    value: permission.id || '',
    label: permission.name || ''
  }));

  const onSelectEmployee = (employee: EmployeeProfile | null) => {
    if (employee) {
      form.setValue('delegateeUserId', employee.id);
    }
  };

  // submit
  const onSubmit = async (data: DelegationFormValues) => {
    try {
      setLoading(true);

      const delegationData: CreateDelegationPayload = {
        ...data
      };

      if (initialData) {
        delegationData.id = initialData.id;

        const response = await authApiCall(() =>
          delegationService.updateDelegation(delegationData)
        );

        if (response?.succeeded) {
          toast.success('تم تعديل التفويض بنجاح!');
          router.push('/delegation');
          router.refresh();
        } else {
          toast.error('لم يتم تعديل التفويض!');
        }
      } else {
        const response = await authApiCall(() =>
          delegationService.createDelegation(delegationData)
        );

        if (response?.succeeded) {
          toast.success('تم إنشاء التفويض بنجاح!');
          router.push('/delegation');
          router.refresh();
        } else {
          toast.error('لم يتم إنشاء التفويض!');
        }
      }
    } catch (error) {
      // Log error and show toast message
      toast.error('حدث خطأ!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-right text-2xl font-bold'>
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Separator className='my-4' />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='w-full space-y-4'
          >
            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='delegatorUserId'
                disabled
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {delegationSchema.delegatorUserId.label}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={`أدخل ${delegationSchema.delegatorUserId.label}`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='delegateeUserId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {delegationSchema.delegateeUserId.label}
                    </FormLabel>
                    <FormControl>
                      <EmployeeSearch onSelectUser={onSelectEmployee} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='roleId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{delegationSchema.roleId.label}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className='w-full'>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={`اختر ${delegationSchema.roleId.label}`}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roleOptions?.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='permissionId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{delegationSchema.permissionId.label}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className='w-full'>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={`اختر ${delegationSchema.permissionId.label}`}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {permissionOptions?.map((permission) => (
                          <SelectItem
                            key={permission.value}
                            value={permission.value}
                          >
                            {permission.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='startDate'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>{delegationSchema.startDate.label}</FormLabel>
                    <FormControl>
                      <Input
                        type='date'
                        placeholder={`اختر ${delegationSchema.startDate.label}`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='endDate'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>{delegationSchema.endDate.label}</FormLabel>
                    <FormControl>
                      <Input
                        type='date'
                        placeholder={`اختر ${delegationSchema.endDate.label}`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='statusId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الحالة</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl className='w-full'>
                        <SelectTrigger>
                          <SelectValue placeholder='اختر الحالة' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={DelegationStatus.Active.toString()}>
                          نشط
                        </SelectItem>
                        <SelectItem
                          value={DelegationStatus.Inactive.toString()}
                        >
                          غير نشط
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='isActive'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{delegationSchema.isActive.label}</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === 'true')
                      }
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl className='w-full'>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={`اختر ${delegationSchema.isActive.label}`}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='true'>نعم</SelectItem>
                        <SelectItem value='false'>لا</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button disabled={loading} type='submit' className='mr-auto'>
              {initialData ? 'تعديل' : 'إنشاء'}
              {loading && (
                <Spinner variant='default' className='mr-2 h-4 w-4' />
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
