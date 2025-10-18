import { z } from 'zod';
import { IRoleDetails } from '../types/role';

// Define the RoleStatus enum
export enum RoleStatus {
  Active = 1,
  Inactive = 2,
  Deleted = 4
}

// Status label configuration for UI display with proper variant types
export const statusLabels: Record<
  RoleStatus,
  {
    label: string;
    variant: 'default' | 'destructive' | 'outline' | 'secondary';
  }
> = {
  [RoleStatus.Active]: { label: 'Active', variant: 'default' },
  [RoleStatus.Inactive]: { label: 'Inactive', variant: 'outline' },
  [RoleStatus.Deleted]: { label: 'Deleted', variant: 'destructive' }
};

// Dynamic form schema based on whether it's an edit or create operation
export const formSchema = (initialData: IRoleDetails | null) => {
  return z.object({
    name: z.string().min(1, 'Role name is required'),
    value: z.string().min(1, 'Role value is required'),
    description: z.string().optional(),
    statusId: z.number().int().min(1).max(4).default(RoleStatus.Active)
  });
};

// Define the form values type based on the schema
export type RoleFormValues = z.infer<ReturnType<typeof formSchema>>;

// Utility function to format role data for API calls
export const formatRolePayload = (formData: RoleFormValues, id?: string) => {
  const payload = {
    ...formData
  };

  if (id) {
    return { id, ...payload };
  }

  return payload;
};

// Helper to check if a role is active
export const isRoleActive = (status: number): boolean => {
  return status === RoleStatus.Active;
};

// Helper to get status text for display
export const getRoleStatusText = (status: number): string => {
  return statusLabels[status as RoleStatus]?.label || 'Unknown';
};

// Format date for display
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Not available';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (error) {
    return 'Invalid date';
  }
};
