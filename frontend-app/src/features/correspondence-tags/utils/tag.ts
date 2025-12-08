import { z } from 'zod';
import { TagCategoryEnum } from '../types/tags';

export const correspondenceTagItemSchema = z.object({
  name: z.string().optional(),
  category: z.nativeEnum(TagCategoryEnum).optional(),
  isAll: z.boolean().optional(),
  toPrimaryRecipientType: z.number().optional(),
  toPrimaryRecipientId: z.string().uuid().optional()
});

export const correspondenceTagsRequestSchema = z.object({
  correspondenceId: z.string().uuid('معرف المراسلة غير صحيح'),
  data: z.array(correspondenceTagItemSchema).min(1, 'يجب إضافة علامة واحدة على الأقل')
});

export const correspondenceTagSchema = z.object({
  id: z.string().uuid().optional(),
  correspondenceId: z.string().uuid('معرف المراسلة غير صحيح'),
  name: z.string().optional(),
  category: z.nativeEnum(TagCategoryEnum).optional(),
  isAll: z.boolean().optional(),
  toPrimaryRecipientType: z.number().optional(),
  toPrimaryRecipientId: z.string().uuid().optional()
});

export type CorrespondenceTagItemFormValues = z.infer<typeof correspondenceTagItemSchema>;
export type CorrespondenceTagsRequestFormValues = z.infer<typeof correspondenceTagsRequestSchema>;
export type CorrespondenceTagFormValues = z.infer<typeof correspondenceTagSchema>;

