import { z } from 'zod';
import { RecipientTypeEnum } from '../types/workflow-step-secondary';

// Zod Schemas
export const WorkflowStepSecondaryCreateSchema = z.object({
  stepId: z.string().min(1, 'معرف الخطوة مطلوب'),
  recipientType: z.nativeEnum(RecipientTypeEnum),
  recipientId: z.string().min(1, 'معرف المستلم مطلوب'),
  purpose: z.string().min(1, 'الغرض مطلوب'),
  instructionText: z.string().min(1, 'هامش مخصص مطلوبة')
});

export const WorkflowStepSecondaryUpdateSchema = z.object({
  id: z.string().min(1, 'معرف الخطوة مطلوب'),
  stepId: z.string().min(1, 'معرف الخطوة مطلوب'),
  recipientType: z.nativeEnum(RecipientTypeEnum),
  recipientId: z.string().min(1, 'معرف المستلم مطلوب'),
  purpose: z.string().min(1, 'الغرض مطلوب'),
  instructionText: z.string().min(1, 'هامش مخصص مطلوبة')
});

export type WorkflowStepSecondaryCreateFormData = z.infer<
  typeof WorkflowStepSecondaryCreateSchema
>;
export type WorkflowStepSecondaryUpdateFormData = z.infer<
  typeof WorkflowStepSecondaryUpdateSchema
>;
