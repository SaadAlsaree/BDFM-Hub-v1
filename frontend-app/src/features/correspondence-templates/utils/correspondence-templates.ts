import { z } from 'zod';
import { CorrespondenceTemplatesDetail } from '../types/correspondence-templates';

// Define the CorrespondenceTemplateStatus enum
export enum CorrespondenceTemplateStatus {
  Active = 1,
  Inactive = 0
}

// Correspondence type enum
export enum CorrespondenceType {
  Email = 1,
  Letter = 2,
  SMS = 3,
  Notification = 4
}

// Status label configuration for UI display with proper variant types
export const statusLabels: Record<
  CorrespondenceTemplateStatus,
  {
    label: string;
    variant: 'default' | 'destructive' | 'outline' | 'secondary';
  }
> = {
  [CorrespondenceTemplateStatus.Active]: { label: 'نشط', variant: 'default' },
  [CorrespondenceTemplateStatus.Inactive]: {
    label: 'غير نشط',
    variant: 'outline'
  }
};

// Type label configuration for UI display
export const typeLabels: Record<
  CorrespondenceType,
  {
    label: string;
    variant: 'default' | 'destructive' | 'outline' | 'secondary';
  }
> = {
  [CorrespondenceType.Email]: { label: 'Email', variant: 'default' },
  [CorrespondenceType.Letter]: { label: 'Letter', variant: 'secondary' },
  [CorrespondenceType.SMS]: { label: 'SMS', variant: 'outline' },
  [CorrespondenceType.Notification]: {
    label: 'Notification',
    variant: 'default'
  }
};

// Dynamic form schema based on whether it's an edit or create operation
export const formSchema = (
  _initialData: CorrespondenceTemplatesDetail | null
) => {
  return z.object({
    id: z.string().optional(),
    templateName: z
      .string()
      .min(3, { message: 'Template name must be at least 3 characters' }),
    subject: z
      .string()
      .min(5, { message: 'Subject must be at least 5 characters' }),
    bodyText: z
      .string()
      .min(10, { message: 'Body text must be at least 10 characters' }),
    organizationalUnitId: z.string().optional(),
    status: z
      .number()
      .int()
      .min(0)
      .max(1)
      .default(CorrespondenceTemplateStatus.Active),
    createBy: z.string().optional()
  });
};

// Type definition derived from the Zod schema
export type CorrespondenceTemplateFormValues = z.infer<
  ReturnType<typeof formSchema>
>;

// Utility function to format correspondence template data for API calls
export const formatCorrespondenceTemplatePayload = (
  formData: CorrespondenceTemplateFormValues,
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

// Helper to check if a correspondence template is active
export const isCorrespondenceTemplateActive = (status: number): boolean => {
  return status === CorrespondenceTemplateStatus.Active;
};

// Helper to get status text for display
export const getCorrespondenceTemplateStatusText = (status: number): string => {
  return (
    statusLabels[status as CorrespondenceTemplateStatus]?.label || 'Unknown'
  );
};

// Helper to get correspondence type text for display
export const getCorrespondenceTypeText = (type: number): string => {
  return typeLabels[type as CorrespondenceType]?.label || 'Unknown';
};

// Format date for display
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Not available';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid date';
  }
};
