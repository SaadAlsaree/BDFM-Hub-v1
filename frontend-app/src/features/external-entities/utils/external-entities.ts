import { z } from 'zod';
import { IExternalEntityDetails } from '../types/external-entities';

// Define the ExternalEntityStatus enum
export enum ExternalEntityStatus {
  Active = 1,
  Inactive = 2,
  Deleted = 4
}

// Define the ExternalEntityType enum
export enum ExternalEntityType {
  Ministry = 1,
  Authority = 2,
  Company = 3,
  Individual = 4,
  Other = 5
}

// Status label configuration for UI display with proper variant types
export const statusLabels: Record<
  ExternalEntityStatus,
  {
    label: string;
    variant: 'default' | 'destructive' | 'outline' | 'secondary';
  }
> = {
  [ExternalEntityStatus.Active]: { label: 'Active', variant: 'default' },
  [ExternalEntityStatus.Inactive]: { label: 'Inactive', variant: 'outline' },
  [ExternalEntityStatus.Deleted]: { label: 'Deleted', variant: 'destructive' }
};

// Entity Type labels
export const entityTypeLabels: Record<ExternalEntityType, string> = {
  [ExternalEntityType.Ministry]: 'وزارة',
  [ExternalEntityType.Authority]: 'هيئة',
  [ExternalEntityType.Company]: 'شركة',
  [ExternalEntityType.Individual]: 'مؤسسة',
  [ExternalEntityType.Other]: 'أخرى'
};

// Dynamic form schema based on whether it's an edit or create operation
export const formSchema = (initialData: IExternalEntityDetails | null) => {
  return z.object({
    entityName: z.string().min(1, 'Entity name is required'),
    entityCode: z.string().min(1, 'Entity code is required'),
    entityType: z.number().int().min(1, 'Entity type is required'),
    contactInfo: z.string().min(1, 'Contact information is required'),
    // Keeping status as it's important for system functionality
    status: z.number().int().min(1).max(4).default(ExternalEntityStatus.Active)
  });
};

// Define the form values type based on the schema
export type ExternalEntityFormValues = z.infer<ReturnType<typeof formSchema>>;

// Utility function to format external entity data for API calls
export const formatExternalEntityPayload = (
  formData: ExternalEntityFormValues,
  id?: string
) => {
  const payload = {
    ...formData
  };

  if (id) {
    return { id, ...payload };
  }

  return payload;
};

// Helper to check if an external entity is active
export const isExternalEntityActive = (status: number): boolean => {
  return status === ExternalEntityStatus.Active;
};

// Helper to get status text for display
export const getExternalEntityStatusText = (status: number): string => {
  return statusLabels[status as ExternalEntityStatus]?.label || 'Unknown';
};

// Helper to get entity type text for display
export const getExternalEntityTypeText = (type: number): string => {
  return entityTypeLabels[type as ExternalEntityType] || 'Unknown';
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
