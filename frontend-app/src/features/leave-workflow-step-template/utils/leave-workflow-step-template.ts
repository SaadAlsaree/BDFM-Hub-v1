import { z } from 'zod';
import {
  ActionTypeEnum,
  CustomWorkflowTargetTypeEnum
} from '../types/leave-workflow-step-template';

export const createLeaveWorkflowStepTemplateSchema = z.object({
  workflowId: z.string().uuid('معرف مسار العمل غير صحيح'),
  stepOrder: z.number().int().positive('ترتيب الخطوة يجب أن يكون أكبر من صفر'),
  actionType: z.number().int().min(1).max(11),
  targetType: z.number().int().min(1).max(5),
  targetIdentifier: z.string().max(255, 'معرف الهدف يجب ألا يتجاوز 255 حرف').optional(),
  defaultInstructionText: z.string().max(2000, 'نص التعليمات الافتراضي يجب ألا يتجاوز 2000 حرف').optional(),
  defaultDueDateOffsetDays: z.number().int().min(0, 'أيام التأخير الافتراضية يجب أن تكون أكبر من أو تساوي صفر').optional(),
  isActive: z.boolean().default(false)
});

export type CreateLeaveWorkflowStepTemplateFormValues = z.infer<
  typeof createLeaveWorkflowStepTemplateSchema
>;

export const updateLeaveWorkflowStepTemplateSchema = z.object({
  id: z.string().uuid('معرف قالب خطوة العمل غير صحيح'),
  workflowId: z.string().uuid('معرف مسار العمل غير صحيح'),
  stepOrder: z.number().int().positive('ترتيب الخطوة يجب أن يكون أكبر من صفر'),
  actionType: z.number().int().min(1).max(11),
  targetType: z.number().int().min(1).max(5),
  targetIdentifier: z.string().max(255, 'معرف الهدف يجب ألا يتجاوز 255 حرف').optional(),
  defaultInstructionText: z.string().max(2000, 'نص التعليمات الافتراضي يجب ألا يتجاوز 2000 حرف').optional(),
  defaultDueDateOffsetDays: z.number().int().min(0, 'أيام التأخير الافتراضية يجب أن تكون أكبر من أو تساوي صفر').optional(),
  isActive: z.boolean().default(false)
});

export type UpdateLeaveWorkflowStepTemplateFormValues = z.infer<
  typeof updateLeaveWorkflowStepTemplateSchema
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

