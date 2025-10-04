import { z } from 'zod';
import { PersonalityLevelEnum, PriorityLevelEnum, SecrecyLevelEnum } from '../types/create-outgoing-internal';


export const createOutgoingInternalSchema = z.object({
    subject: z.string().min(1, 'موضوع الكتاب مطلوب'),
    bodyText: z.string().optional(),
    secrecyLevel: z.nativeEnum(SecrecyLevelEnum).optional(),
    priorityLevel: z.nativeEnum(PriorityLevelEnum).optional(),
    personalityLevel: z.nativeEnum(PersonalityLevelEnum).optional(),
    mailDate: z.coerce.string().optional(),
    fileId: z.string().optional(),
    linkMailId: z.string()
});

export const updateOutgoingInternalSchema = z.object({
    id: z.string().optional(),
    subject: z.string().optional(),
    bodyText: z.string().optional(),
    secrecyLevel: z.nativeEnum(SecrecyLevelEnum).optional(),
    priorityLevel: z.nativeEnum(PriorityLevelEnum).optional(),
    personalityLevel: z.nativeEnum(PersonalityLevelEnum).optional(),
});

export type OutgoingInternalSchema = z.infer<typeof createOutgoingInternalSchema>;
export type UpdateOutgoingInternalSchema = z.infer<typeof updateOutgoingInternalSchema>;