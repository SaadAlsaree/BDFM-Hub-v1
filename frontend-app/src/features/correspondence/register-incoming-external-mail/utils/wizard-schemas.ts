import { z } from 'zod';
import {
    SecrecyLevelEnum,
    PriorityLevelEnum,
    PersonalityLevelEnum
} from '@/features/correspondence/types/register-incoming-external-mail';

// Step 1: External Information Schema
export const externalInfoSchema = z.object({
    externalReferenceNumber: z.string().min(1, 'رقم كتاب الجهة مطلوب'),
    externalReferenceDate: z.string().min(1, 'تاريخ كتاب الجهة مطلوب'),
    originatingExternalEntityId: z.string().min(1, 'الجهة الخارجية المنشئة مطلوبة'),
    originatingSubEntities: z.array(z.string()).optional().default([])
});

// Step 2: Internal Information Schema
export const internalInfoSchema = z.object({
    subject: z.string().min(1, 'موضوع الكتاب مطلوب'),
    bodyText: z.string().optional(),
    secrecyLevel: z.nativeEnum(SecrecyLevelEnum),
    priorityLevel: z.nativeEnum(PriorityLevelEnum),
    personalityLevel: z.nativeEnum(PersonalityLevelEnum),
    externalEntityId: z.string().optional(),
    mailDate: z.string().min(1, 'التاريخ الداخلي مطلوب'),
    fileNumberToReuse: z.string().optional()
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

// Complete form schema - consolidated from the old register-incoming-external-mail.ts
export const completeWizardSchema = z.object({
    ...externalInfoSchema.shape,
    ...internalInfoSchema.shape,
    ...linkingSchema.shape,
    ...attachmentsSchema.shape
});

// Type exports
export type ExternalInfoFormValues = z.infer<typeof externalInfoSchema>;
export type InternalInfoFormValues = z.infer<typeof internalInfoSchema>;
export type LinkingFormValues = z.infer<typeof linkingSchema>;
export type AttachmentsFormValues = z.infer<typeof attachmentsSchema>;
export type CompleteWizardFormValues = z.infer<typeof completeWizardSchema>;

// Default values helper
export function getDefaultFormValues(): Partial<CompleteWizardFormValues> {
    return {
        originatingSubEntities: [],
        bodyText: '',
        externalEntityId: '',
        mailDate: new Date().toISOString().split('T')[0], // Default to today
        refersToPreviousInternalCorrespondenceId: '',
        linkType: undefined, // Optional field
        notes: '',
        attachments: [],
        attachmentDescriptions: [],
        fileNumberToReuse: ''
    };
} 