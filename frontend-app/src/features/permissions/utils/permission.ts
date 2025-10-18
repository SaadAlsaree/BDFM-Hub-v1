import { z } from 'zod';
import {
  IPermissionDetail,
  IPermissionList,
  IPermissionPayload
} from '../types/permission';

// Define the Permission Status enum
export enum PermissionStatus {
  Active = 1,
  Inactive = 2,
  Deleted = 3
}

// Status label configuration for UI display with proper variant types
export const statusLabels: Record<
  PermissionStatus,
  {
    label: string;
    variant: 'default' | 'destructive' | 'outline' | 'secondary';
  }
> = {
  [PermissionStatus.Active]: { label: 'نشط', variant: 'default' },
  [PermissionStatus.Inactive]: { label: 'غير نشط', variant: 'outline' },
  [PermissionStatus.Deleted]: { label: 'محذوف', variant: 'destructive' }
};

// Permission form validation schema
export const permissionFormSchema = (initialData: IPermissionDetail | null) => {
  return z.object({
    name: z.string().min(1, 'اسم الصلاحية مطلوب'),
    value: z.string().min(1, 'قيمة الصلاحية مطلوبة'),
    description: z.string().optional(),
    statusId: z.number().int().min(1, 'حالة الصلاحية مطلوبة')
  });
};

// Define the form values type based on the schema
export type PermissionFormValues = z.infer<
  ReturnType<typeof permissionFormSchema>
>;

// Utility function to format permission data for API calls
export const formatPermissionPayload = (
  formData: PermissionFormValues,
  id?: string
): IPermissionPayload => {
  const payload: IPermissionPayload = {
    name: formData.name,
    value: formData.value,
    description: formData.description,
    statusId: formData.statusId
  };

  if (id) {
    return { id, ...payload };
  }

  return payload;
};

// Helper to check if a permission is active
export const isPermissionActive = (status: number): boolean => {
  return status === PermissionStatus.Active;
};

// Helper to get status text for display
export const getPermissionStatusText = (status: number): string => {
  return statusLabels[status as PermissionStatus]?.label || 'غير معروف';
};

// Helper to get status variant for UI components
export const getPermissionStatusVariant = (
  status: number
): 'default' | 'destructive' | 'outline' | 'secondary' => {
  return statusLabels[status as PermissionStatus]?.variant || 'outline';
};

// Helper to sort permissions by name
export const sortPermissionsByName = (
  permissions: IPermissionList[]
): IPermissionList[] => {
  return [...permissions].sort((a, b) => {
    const nameA = a.name?.toLowerCase() || '';
    const nameB = b.name?.toLowerCase() || '';
    return nameA.localeCompare(nameB);
  });
};

// Helper to validate permission value format (e.g., feature:action)
export const isValidPermissionFormat = (value: string): boolean => {
  // Check if the permission value follows the format "feature:action"
  const regex = /^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/;
  return regex.test(value);
};

// Permission value validation schema
export const permissionValueSchema = z
  .string()
  .min(3, 'قيمة الصلاحية يجب أن تكون على الأقل 3 أحرف')
  .refine((value) => isValidPermissionFormat(value), {
    message: "قيمة الصلاحية يجب أن تكون بتنسيق 'feature:action'"
  });
