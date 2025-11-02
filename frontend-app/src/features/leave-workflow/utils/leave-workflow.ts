import { z } from 'zod';
import { LeaveWorkflow } from '../types/leave-workflow';

export const createLeaveWorkflowSchema = z.object({
  workflowName: z.string().min(1, 'اسم مسار العمل مطلوب').max(255, 'اسم مسار العمل يجب ألا يتجاوز 255 حرف'),
  triggeringUnitId: z.string().uuid('معرف الوحدة غير صحيح').optional(),
  triggeringLeaveType: z.number().int().min(1).max(7).optional(),
  description: z.string().max(2000, 'الوصف يجب ألا يتجاوز 2000 حرف').optional(),
  isEnabled: z.boolean().default(true)
});

export type CreateLeaveWorkflowFormValues = z.infer<
  typeof createLeaveWorkflowSchema
>;

export const updateLeaveWorkflowSchema = z.object({
  id: z.string().uuid('معرف مسار العمل غير صحيح'),
  workflowName: z.string().min(1, 'اسم مسار العمل مطلوب').max(255, 'اسم مسار العمل يجب ألا يتجاوز 255 حرف'),
  triggeringUnitId: z.string().uuid('معرف الوحدة غير صحيح').optional(),
  triggeringLeaveType: z.number().int().min(1).max(7).optional(),
  description: z.string().max(2000, 'الوصف يجب ألا يتجاوز 2000 حرف').optional(),
  isEnabled: z.boolean().default(true)
});

export type UpdateLeaveWorkflowFormValues = z.infer<
  typeof updateLeaveWorkflowSchema
>;

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

