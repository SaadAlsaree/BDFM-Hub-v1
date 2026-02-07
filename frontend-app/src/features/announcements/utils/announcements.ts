import * as z from 'zod';

export enum AnnouncementStatus {
  Active = 1,
  Inactive = 0,
  Deleted = 2
}

export const statusLabels: Record<number, { label: string; variant: 'default' | 'destructive' | 'outline' | 'secondary' }> = {
  [AnnouncementStatus.Active]: { label: 'نشط', variant: 'default' },
  [AnnouncementStatus.Inactive]: { label: 'غير نشط', variant: 'secondary' },
  [AnnouncementStatus.Deleted]: { label: 'محذوف', variant: 'destructive' }
};

export const isAnnouncementActive = (status: number) => status === AnnouncementStatus.Active;

export const formSchema = () =>
  z.object({
    title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
    description: z.string().min(5, { message: 'Description must be at least 5 characters' }),
    variant: z.string().optional(),
    startDate: z.string().min(1, { message: 'Start date is required' }),
    endDate: z.string().min(1, { message: 'End date is required' }),
    isActive: z.boolean().default(true)
  });

export type AnnouncementFormValues = z.infer<ReturnType<typeof formSchema>>;
