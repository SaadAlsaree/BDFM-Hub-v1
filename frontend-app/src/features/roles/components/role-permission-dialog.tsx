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

import { useAuthApi } from '@/hooks/use-auth-api';
import { useRouter } from 'next/navigation';
import { IPermissionList } from '@/features/permissions/types/permission';
import { RolePermissionDto } from '../types/role';
import { z } from 'zod';
import { rolePermissionService } from '../api/role-permission.service';

// Define the form schema for role permissions
const formPermissionSchema = z.object({
  permissions: z.array(
    z.object({
      label: z.string(),
      value: z.string()
    })
  )
});

// Define the type for form values
type FormPermissionValues = z.infer<typeof formPermissionSchema>;

// Define the DTO for updating role permissions
interface AssignRolePermissionsDto {
  roleId: string;
  permissionIds: string[];
}

interface RolePermissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roleId: string;
  permissions: IPermissionList[];
  rolePermissions?: RolePermissionDto[];
}


const RolePermissionDialog = ({
  isOpen,
  onClose,
  roleId,
  permissions,
  rolePermissions = []
}: RolePermissionDialogProps) => {
  const { authApiCall } = useAuthApi();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();


  const permissionOptions: Option[] = permissions?.map((permission) => ({
    label: permission.name,
    value: permission.id
  })) as Option[];

  const form = useForm<FormPermissionValues>({
    resolver: zodResolver(formPermissionSchema),
    defaultValues: {
      permissions: rolePermissions?.map((permission) => ({
        label: permission.name,
        value: permission.id
      }))
    }
  });

  const onSubmit = async (values: FormPermissionValues) => {
    try {
      setIsLoading(true);

      // Collect all permission IDs that need to be assigned
      const newPermissionIds = values.permissions.map((permission) => permission.value);

      // Create a payload for the API call with all permission IDs
      const payload: AssignRolePermissionsDto = {
        roleId: roleId,
        permissionIds: newPermissionIds
      };

      // Make a single API call to update all permissions at once
      const result = await authApiCall(async () => {
        return await rolePermissionService.updateRolePermissions(payload);
      });

      if (!result?.succeeded) {
        throw new Error('لم يتم تحديث الصلاحيات!');
      }

      // Refresh the router and navigate only after successful update
      router.refresh();
      router.push(`/roles/${roleId}`);

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
              name='permissions'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الصلاحيات</FormLabel>
                  <FormControl>
                    <MultipleSelector
                      value={field.value || []}
                      onChange={(options) => field.onChange(options)}
                      options={permissionOptions}
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

export default RolePermissionDialog;
