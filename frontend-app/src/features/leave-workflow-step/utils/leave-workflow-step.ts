import { z } from 'zod';
import {
  WorkflowStepStatus,
  ActionTypeEnum,
  RecipientTypeEnum
} from '../types/leave-workflow-step';

export const createLeaveWorkflowStepSchema = z.object({
  leaveRequestId: z.string().uuid('معرف طلب الإجازة غير صحيح'),
  actionType: z.number().int().min(1).max(11),
  toPrimaryRecipientType: z.number().int().min(1).max(3),
  toPrimaryRecipientId: z.string().uuid('معرف المستلم الرئيسي غير صحيح'),
  instructionText: z.string().max(2000, 'نص التعليمات يجب ألا يتجاوز 2000 حرف').optional(),
  dueDate: z.string().optional(),
  status: z.number().int().min(1).max(5).optional(),
  isTimeSensitive: z.boolean().default(false)
});

export type CreateLeaveWorkflowStepFormValues = z.infer<
  typeof createLeaveWorkflowStepSchema
>;

export const updateLeaveWorkflowStepStatusSchema = z.object({
  id: z.string().uuid('معرف خطوة العمل غير صحيح'),
  status: z.number().int().min(1).max(5)
});

export type UpdateLeaveWorkflowStepStatusFormValues = z.infer<
  typeof updateLeaveWorkflowStepStatusSchema
>;

export const completeLeaveWorkflowStepSchema = z.object({
  id: z.string().uuid('معرف خطوة العمل غير صحيح')
});

export type CompleteLeaveWorkflowStepFormValues = z.infer<
  typeof completeLeaveWorkflowStepSchema
>;

// Status label configuration for UI display
export const statusLabels: Record<
  WorkflowStepStatus,
  {
    label: string;
    variant: 'default' | 'destructive' | 'outline' | 'secondary';
  }
> = {
  [WorkflowStepStatus.Pending]: {
    label: 'قيد الانتظار',
    variant: 'outline'
  },
  [WorkflowStepStatus.InProgress]: {
    label: 'قيد التنفيذ',
    variant: 'default'
  },
  [WorkflowStepStatus.Completed]: {
    label: 'مكتمل',
    variant: 'default'
  },
  [WorkflowStepStatus.Rejected]: {
    label: 'مرفوض',
    variant: 'destructive'
  },
  [WorkflowStepStatus.Delegated]: {
    label: 'تعيين',
    variant: 'secondary'
  }
};

// Helper to get status text for display
export const getWorkflowStepStatusText = (status: number): string => {
  return statusLabels[status as WorkflowStepStatus]?.label || 'غير معروف';
};

// Format date for display
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'غير متوفر';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
  } catch (error) {
    return 'تاريخ غير صحيح';
  }
};

