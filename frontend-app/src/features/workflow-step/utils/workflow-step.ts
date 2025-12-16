import { z } from 'zod';
import {
  ActionTypeEnum,
  InternalActionTypeEnum,
  RecipientTypeEnum,
  WorkflowStepStatus
} from '../types/workflow-step';
import { CorrespondenceTypeEnum } from '@/features/customWorkflow/types/customWorkflow';

export enum SignatureColorEnum {
  Black = 'black',
  Blue = 'blue',
  Green = 'green'
}

export const SignatureColorDisplay: Record<SignatureColorEnum, string> = {
  [SignatureColorEnum.Black]: 'الأسود',
  [SignatureColorEnum.Blue]: 'الأزرق',
  [SignatureColorEnum.Green]: 'الأخضر'
};
export const WorkflowStepInputSchema = z.object({
  correspondenceId: z.string().min(1, 'Correspondence ID is required'),
  actionType: z.nativeEnum(ActionTypeEnum),
  toPrimaryRecipientType: z.nativeEnum(RecipientTypeEnum),
  toPrimaryRecipientId: z.string().min(1, 'Primary Recipient ID is required'),
  instructionText: z.string().min(1, 'Instruction text is required'),
  dueDate: z.coerce.date().min(new Date(), 'Due date must be in the future'),
  status: z.nativeEnum(WorkflowStepStatus),
  isTimeSensitive: z.boolean().optional()
});

export const LogRecipientInternalActionInputSchema = z.object({
  workflowStepId: z.string().min(1, 'Workflow Step ID is required'),
  actionTimestamp: z.coerce
    .date()
    .min(new Date(), 'Action timestamp must be in the future'),
  actionDescription: z.string().min(1, 'Action description is required'),
  notes: z.string().optional(),
  internalActionType: z.nativeEnum(InternalActionTypeEnum),
  signatureColor: z.nativeEnum(SignatureColorEnum).optional()
});

// Bulk Insert Schemas
export const WorkflowStepBulkItemSchema = z.object({
  actionType: z.nativeEnum(ActionTypeEnum, {
    required_error: 'Action type is required',
    invalid_type_error: 'Invalid action type'
  }),
  toPrimaryRecipientType: z.nativeEnum(RecipientTypeEnum, {
    required_error: 'Recipient type is required',
    invalid_type_error: 'Invalid recipient type'
  }),
  toPrimaryRecipientId: z.string().min(1, 'Primary Recipient ID is required'),
  instructionText: z.string().min(1, 'Instruction text is required'),
  dueDate: z.string().refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()) && parsedDate > new Date();
  }, 'Due date must be a valid future date'),
  status: z.nativeEnum(WorkflowStepStatus, {
    required_error: 'Status is required',
    invalid_type_error: 'Invalid status'
  }),
  isTimeSensitive: z.boolean()
});

// update workflow step status schema
export const UpdateWorkflowStepStatusSchema = z.object({
  workflowStepId: z.string().min(1, 'Workflow step ID is required'),
  correspondenceType: z.nativeEnum(CorrespondenceTypeEnum, {
    required_error: 'Correspondence type is required',
    invalid_type_error: 'Invalid correspondence type'
  }),
  status: z.nativeEnum(WorkflowStepStatus, {
    required_error: 'Status is required',
    invalid_type_error: 'Invalid status'
  }),
  notes: z.string().optional()
});

// simpler schema for update status dialog (status only)
export const UpdateStatusDialogSchema = z.object({
  workflowStepId: z.string().min(1, 'Workflow step ID is required'),
  status: z.nativeEnum(WorkflowStepStatus, {
    required_error: 'Status is required',
    invalid_type_error: 'Invalid status'
  }),
  internalActionType: z.nativeEnum(InternalActionTypeEnum, {
    required_error: 'Internal action type is required',
    invalid_type_error: 'Invalid internal action type'
  }),
  actionDescription: z.string().min(1, 'Action description is required')
});

export const WorkflowStepBulkInsertSchema = z.object({
  correspondenceId: z.string().min(1, 'Correspondence ID is required'),
  workflowSteps: z
    .array(WorkflowStepBulkItemSchema)
    .min(1, 'At least one workflow step is required')
});

export type WorkflowStepInputFormData = z.infer<typeof WorkflowStepInputSchema>;
export type LogRecipientInternalActionInputFormData = z.infer<
  typeof LogRecipientInternalActionInputSchema
>;
export type WorkflowStepBulkItemFormData = z.infer<
  typeof WorkflowStepBulkItemSchema
>;
export type WorkflowStepBulkInsertFormData = z.infer<
  typeof WorkflowStepBulkInsertSchema
>;
export type UpdateWorkflowStepStatusFormData = z.infer<
  typeof UpdateWorkflowStepStatusSchema
>;
export type UpdateStatusDialogFormData = z.infer<
  typeof UpdateStatusDialogSchema
>;
