import { z } from 'zod';
import {
  SecrecyLevelEnum,
  PriorityLevelEnum,
  PersonalityLevelEnum
} from '@/features/correspondence/types/register-incoming-external-mail';

// Step 1: Internal Information Schema (includes recipient info)
export const internalInfoSchema = z.object({
  recipientExternalEntityId: z
    .string()
    .min(1, 'الجهة الخارجية المستقبلة مطلوبة'),
  recipientSubEntities: z.array(z.string()).optional().default([]),
  subject: z.string().min(1, 'موضوع الكتاب مطلوب'),
  bodyText: z.string().optional(),
  secrecyLevel: z.nativeEnum(SecrecyLevelEnum),
  priorityLevel: z.nativeEnum(PriorityLevelEnum),
  personalityLevel: z.nativeEnum(PersonalityLevelEnum),
  mailDate: z.string().min(1, 'التاريخ الداخلي مطلوب'),
  fileNumberToReuse: z.string().min(1, 'رقم الضبارة مطلوب')
});

// Step 3: Linking Schema
export const linkingSchema = z.object({
  refersToPreviousInternalCorrespondenceId: z.string().optional(),
  linkType: z.number().min(1).max(6).optional(),
  notes: z.string().optional()
});

// Step 4: Attachments Schema
export const attachmentsSchema = z.object({
  attachments: z.array(z.instanceof(File)).optional().default([]),
  attachmentDescriptions: z.array(z.string()).optional().default([])
});

// Complete form schema
export const completeWizardSchema = z.object({
  ...internalInfoSchema.shape,
  ...linkingSchema.shape,
  ...attachmentsSchema.shape
});

// Type exports
export type InternalInfoFormValues = z.infer<typeof internalInfoSchema>;
export type LinkingFormValues = z.infer<typeof linkingSchema>;
export type AttachmentsFormValues = z.infer<typeof attachmentsSchema>;
export type CompleteWizardFormValues = z.infer<typeof completeWizardSchema>;

// Default values helper
export function getDefaultFormValues(): Partial<CompleteWizardFormValues> {
  return {
    recipientSubEntities: [],
    bodyText: '',
    mailDate: new Date().toISOString().split('T')[0], // Default to today
    refersToPreviousInternalCorrespondenceId: '',
    linkType: undefined, // Optional field
    notes: '',
    attachments: [],
    attachmentDescriptions: [],
    fileNumberToReuse: ''
  };
}
