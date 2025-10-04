'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import MultipleSelector, { Option } from '@/components/ui/multiple-selector';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
//services

import { useAuthApi } from '@/hooks/use-auth-api';
import { useRouter } from 'next/navigation';
import { AssignUserRolesDto, UserRole } from '../types/user';
import { userRoleService } from '../api/userRole.service';
import { z } from 'zod';

// Define the form schema for user roles
const formRoleSchema = z.object({
  roles: z.array(
    z.object({
      label: z.string(),
      value: z.string()
    })
  )
});

// Define the type for form values
type FormRoleValues = z.infer<typeof formRoleSchema>;

interface UserManageRolesProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  roles: UserRole[];
  userRoles?: UserRole[];
}

const UserManageRoles = ({
  isOpen,
  onClose,
  userId,
  roles,
  userRoles = []
}: UserManageRolesProps) => {
  const { authApiCall } = useAuthApi();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const roleOptions: Option[] = roles?.map((role) => ({
    label: role.name,
    value: role.id
  })) as Option[];

  const form = useForm<FormRoleValues>({
    resolver: zodResolver(formRoleSchema),
    defaultValues: {
      roles: userRoles?.map((role) => ({
        label: role.name,
        value: role.id
      }))
    }
  });

  const onSubmit = async (values: FormRoleValues) => {
    try {
      setIsLoading(true);

      // Collect all role IDs that need to be assigned
      const newRoleIds = values.roles.map((role) => role.value);

      // Create a payload for the API call with all role IDs
      const payload: AssignUserRolesDto = {
        userId: userId,
        roleIds: newRoleIds
      };

      // Make a single API call to update all roles at once
      const result = await authApiCall(async () => {
        return userRoleService.updateUserRoles(payload);
      });

      if (!result) {
        throw new Error('لم يتم تحديث الصلاحيات!');
      }

      // Refresh the router and navigate only after successful update
      router.refresh();
      router.push('/users');

      // Show a single success toast
      toast.success('تم تحديث الصلاحيات بنجاح!');
      onClose();
    } catch (error) {
      toast.error('لم يتم تحديث الصلاحيات!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>إدارة الصلاحيات</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='roles'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الصلاحيات</FormLabel>
                  <FormControl>
                    <MultipleSelector
                      value={field.value || []}
                      onChange={(options) => field.onChange(options)}
                      options={roleOptions}
                      placeholder='اختر الصلاحيات...'
                      className='w-full'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                variant='outline'
                type='button'
                onClick={onClose}
                disabled={isLoading}
              >
                إلغاء
              </Button>
              <Button type='submit' disabled={isLoading}>
                حفظ التغييرات
                {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UserManageRoles;
