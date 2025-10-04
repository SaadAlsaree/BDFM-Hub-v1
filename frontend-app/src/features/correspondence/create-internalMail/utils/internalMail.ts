import { z } from 'zod';
import {
    SecrecyLevelEnum,
    PriorityLevelEnum,
    PersonalityLevelEnum
} from '@/features/correspondence/types/register-incoming-external-mail';



export const createInternalMailSchema = z.object({
    subject: z.string().min(1, 'موضوع الكتاب مطلوب'),
    bodyText: z.string().optional(),
    templateId: z.string().optional(),
    secrecyLevel: z.nativeEnum(SecrecyLevelEnum).optional(),
    priorityLevel: z.nativeEnum(PriorityLevelEnum).optional(),
    personalityLevel: z.nativeEnum(PersonalityLevelEnum).optional(),
    mailDate: z.coerce.string().optional(),
    fileId: z.string().optional()
});

export const updateInternalMailSchema = z.object({
    id: z.string().optional(),
    subject: z.string().optional(),
    bodyText: z.string().optional(),
    templateId: z.string().optional(),
    secrecyLevel: z.nativeEnum(SecrecyLevelEnum).optional(),
    priorityLevel: z.nativeEnum(PriorityLevelEnum).optional(),
    personalityLevel: z.nativeEnum(PersonalityLevelEnum).optional(),
});

export type InternalMailSchema = z.infer<typeof createInternalMailSchema>;
export type UpdateInternalMailSchema = z.infer<typeof updateInternalMailSchema>;
