import { z } from 'zod';
import {
    SecrecyLevelEnum,
    PriorityLevelEnum,
    PersonalityLevelEnum
} from '@/features/correspondence/types/register-incoming-external-mail';




// Step 2: Internal Information Schema
export const createPublicMailSchema = z.object({
    subject: z.string().min(1, 'موضوع الكتاب مطلوب'),
    bodyText: z.string().optional(),
    secrecyLevel: z.nativeEnum(SecrecyLevelEnum).optional(),
    priorityLevel: z.nativeEnum(PriorityLevelEnum).optional(),
    personalityLevel: z.nativeEnum(PersonalityLevelEnum).optional(),
    mailDate: z.string().min(1, 'التاريخ الكتاب'),
    fileId: z.string().optional()
});
