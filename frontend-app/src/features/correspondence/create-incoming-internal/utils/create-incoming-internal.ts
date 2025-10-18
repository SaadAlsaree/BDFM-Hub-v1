import { z } from 'zod';
import {
  SecrecyLevelEnum,
  PriorityLevelEnum,
  PersonalityLevelEnum
} from '../types/create-incoming-internal';

export const createIncomingInternalSchema = z.object({
  subject: z.string().min(1, 'موضوع الكتاب مطلوب'),
  bodyText: z.string().optional(),
  secrecyLevel: z.nativeEnum(SecrecyLevelEnum).optional(),
  priorityLevel: z.nativeEnum(PriorityLevelEnum).optional(),
  personalityLevel: z.nativeEnum(PersonalityLevelEnum).optional(),
  mailDate: z.coerce.string().optional(),
  fileId: z.string().optional(),
  linkMailId: z.string()
});

export const updateIncomingInternalSchema = z.object({
  id: z.string().optional(),
  subject: z.string().optional(),
  bodyText: z.string().optional(),
  secrecyLevel: z.nativeEnum(SecrecyLevelEnum).optional(),
  priorityLevel: z.nativeEnum(PriorityLevelEnum).optional(),
  personalityLevel: z.nativeEnum(PersonalityLevelEnum).optional()
});

export type IncomingInternalSchema = z.infer<
  typeof createIncomingInternalSchema
>;
export type UpdateIncomingInternalSchema = z.infer<
  typeof updateIncomingInternalSchema
>;
