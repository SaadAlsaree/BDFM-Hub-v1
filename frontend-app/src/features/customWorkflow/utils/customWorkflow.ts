import { z } from 'zod';
import {
  CustomWorkflowDetails,
  CorrespondenceTypeEnum,
  ActionTypeEnum,
  CustomWorkflowTargetTypeEnum
} from '../types/customWorkflow';

// Enum validations
export const CorrespondenceTypeEnumSchema = z.nativeEnum({
  Draft: 0,
  IncomingExternal: 1,
  OutgoingExternal: 2,
  IncomingInternal: 3,
  OutgoingInternal: 4,
  Memorandum: 5,
  Reply: 6
} as const);

export const ActionTypeEnumSchema = z.nativeEnum({
  RegisterIncoming: 1,
  InitialReferral: 2,
  InternalReferral: 3,
  RequestApproval: 4,
  Approve: 5,
  Action: 6,
  Reject: 7,
  Return: 8,
  Send: 9,
  Archive: 10,
  TakeUnderConsideration: 11,
  RequestInformation: 12,
  SendToExternalReferral: 13,
  SendToInternalReferral: 14
} as const);

export const CustomWorkflowTargetTypeEnumSchema = z.nativeEnum({
  SpecificUser: 1,
  SpecificUnit: 2
} as const);

// Base validation schemas
export const UUIDSchema = z.string().uuid('Invalid UUID format');
export const ISODateSchema = z.string().datetime('Invalid ISO date format');
export const NonEmptyStringSchema = z.string().min(1, 'Field cannot be empty');

// CustomWorkflowList validation
export const CustomWorkflowListSchema = z.object({
  id: UUIDSchema,
  workflowName: NonEmptyStringSchema,
  triggeringUnitId: UUIDSchema,
  triggeringCorrespondenceType: CorrespondenceTypeEnumSchema,
  description: z.string(),
  isEnabled: z.boolean(),
  createAt: ISODateSchema,
  lastUpdateAt: ISODateSchema,
  createBy: NonEmptyStringSchema,
  lastUpdateBy: NonEmptyStringSchema
});

// CustomWorkflowStepList validation
export const CustomWorkflowStepListSchema = z.object({
  id: UUIDSchema,
  workflowId: UUIDSchema,
  workflowName: NonEmptyStringSchema,
  stepOrder: z.number().int().positive('Step order must be a positive integer'),
  actionType: ActionTypeEnumSchema,
  targetType: CustomWorkflowTargetTypeEnumSchema,
  targetIdentifier: NonEmptyStringSchema,
  defaultInstructionText: z.string(),
  defaultDueDateOffsetDays: z
    .number()
    .int()
    .min(0, 'Due date offset must be non-negative'),
  isActive: z.boolean(),
  sequence: z.number().int().positive('Sequence must be a positive integer'),
  createAt: ISODateSchema,
  lastUpdateAt: ISODateSchema,
  statusId: z.number().int(),
  statusName: NonEmptyStringSchema
});

// CustomWorkflowDetails validation
export const CustomWorkflowDetailsSchema = z.object({
  id: UUIDSchema,
  workflowName: NonEmptyStringSchema,
  triggeringUnitId: UUIDSchema,
  triggeringCorrespondenceType: CorrespondenceTypeEnumSchema,
  description: z.string(),
  isEnabled: z.boolean(),
  createAt: ISODateSchema,
  lastUpdateAt: ISODateSchema,
  createBy: NonEmptyStringSchema,
  lastUpdateBy: NonEmptyStringSchema,
  steps: z.array(CustomWorkflowStepListSchema)
});

// CustomWorkflowStepDetails validation
export const CustomWorkflowStepDetailsSchema = z.object({
  id: UUIDSchema,
  workflowId: UUIDSchema,
  stepOrder: z.number().int().positive('Step order must be a positive integer'),
  actionType: z.number().int().min(1).max(14, 'Invalid action type'),
  targetType: z.number().int().min(1).max(5, 'Invalid target type'),
  targetIdentifier: NonEmptyStringSchema,
  defaultInstructionText: z.string(),
  defaultDueDateOffsetDays: z
    .number()
    .int()
    .min(0, 'Due date offset must be non-negative'),
  isActive: z.boolean(),
  sequence: z.number().int().positive('Sequence must be a positive integer'),
  createAt: ISODateSchema,
  lastUpdateAt: ISODateSchema,
  createBy: NonEmptyStringSchema,
  lastUpdateBy: NonEmptyStringSchema,
  statusId: z.number().int(),
  statusName: NonEmptyStringSchema
});

// Create/Update payload validations
export const CreateWorkflowPayloadSchema = z
  .object({
    id: UUIDSchema.optional(),
    workflowName: z.string().min(1, 'Workflow name is required').optional(),
    triggeringUnitId: UUIDSchema.optional(),
    triggeringCorrespondenceType: CorrespondenceTypeEnumSchema.optional(),
    description: z.string().optional(),
    isEnabled: z.boolean().optional()
  })
  .refine(
    (data) => {
      // For create operations, require essential fields
      if (!data.id) {
        return (
          data.workflowName &&
          data.triggeringUnitId &&
          data.triggeringCorrespondenceType !== undefined
        );
      }
      return true;
    },
    {
      message:
        'For new workflows, workflowName, triggeringUnitId, and triggeringCorrespondenceType are required'
    }
  );

export const CreateWorkflowStepPayloadSchema = z
  .object({
    id: UUIDSchema.optional(),
    workflowId: UUIDSchema.optional(),
    stepOrder: z
      .number()
      .int()
      .positive('Step order must be a positive integer')
      .optional(),
    actionType: ActionTypeEnumSchema.optional(),
    targetType: CustomWorkflowTargetTypeEnumSchema.optional(),
    targetIdentifier: z
      .string()
      .min(1, 'Target identifier is required')
      .optional(),
    defaultInstructionText: z.string().optional(),
    defaultDueDateOffsetDays: z
      .number()
      .int()
      .min(0, 'Due date offset must be non-negative')
      .optional(),
    isActive: z.boolean().optional()
  })
  .refine(
    (data) => {
      // For create operations, require essential fields
      if (!data.id) {
        return (
          data.workflowId &&
          data.stepOrder !== undefined &&
          data.actionType !== undefined &&
          data.targetType !== undefined &&
          data.targetIdentifier
        );
      }
      return true;
    },
    {
      message:
        'For new workflow steps, workflowId, stepOrder, actionType, targetType, and targetIdentifier are required'
    }
  );

// Query parameter validation for API calls
export const CustomWorkflowQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(100).optional(),
  search: z.string().optional(),
  isEnabled: z.boolean().optional(),
  triggeringUnitId: UUIDSchema.optional(),
  triggeringCorrespondenceType: CorrespondenceTypeEnumSchema.optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export const CustomWorkflowStepQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(100).optional(),
  workflowId: UUIDSchema.optional(),
  actionType: ActionTypeEnumSchema.optional(),
  targetType: CustomWorkflowTargetTypeEnumSchema.optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

// Validation helper functions
export function validateCustomWorkflow(data: unknown) {
  return CustomWorkflowListSchema.safeParse(data);
}

export function validateCustomWorkflowDetails(data: unknown) {
  return CustomWorkflowDetailsSchema.safeParse(data);
}

export function validateCreateWorkflowPayload(data: unknown) {
  return CreateWorkflowPayloadSchema.safeParse(data);
}

export function validateCreateWorkflowStepPayload(data: unknown) {
  return CreateWorkflowStepPayloadSchema.safeParse(data);
}

export function validateCustomWorkflowQuery(data: unknown) {
  return CustomWorkflowQuerySchema.safeParse(data);
}

export function validateCustomWorkflowStepQuery(data: unknown) {
  return CustomWorkflowStepQuerySchema.safeParse(data);
}

// Type inference from schemas
export type ValidatedCustomWorkflow = z.infer<typeof CustomWorkflowListSchema>;
export type ValidatedCustomWorkflowDetails = z.infer<
  typeof CustomWorkflowDetailsSchema
>;
export type ValidatedCreateWorkflowPayload = z.infer<
  typeof CreateWorkflowPayloadSchema
>;
export type ValidatedCreateWorkflowStepPayload = z.infer<
  typeof CreateWorkflowStepPayloadSchema
>;
export type ValidatedCustomWorkflowQuery = z.infer<
  typeof CustomWorkflowQuerySchema
>;
export type ValidatedCustomWorkflowStepQuery = z.infer<
  typeof CustomWorkflowStepQuerySchema
>;

// Form schema for custom workflow
export const customWorkflowFormSchema = (
  initialData: CustomWorkflowDetails | null
) => {
  return z.object({
    workflowName: z.string().min(1, 'اسم سير العمل مطلوب'),
    triggeringUnitId: z.string().uuid('معرف الوحدة المحفزة غير صحيح'),
    triggeringCorrespondenceType: z.nativeEnum(CorrespondenceTypeEnum, {
      errorMap: () => ({ message: 'نوع المراسلة مطلوب' })
    }),
    description: z.string().optional(),
    isEnabled: z.boolean().default(true)
  });
};

// Form schema for custom workflow step
export const customWorkflowStepFormSchema = z.object({
  stepOrder: z.number().min(1, 'ترتيب الخطوة يجب أن يكون أكبر من 0'),
  actionType: z.nativeEnum(ActionTypeEnum, {
    errorMap: () => ({ message: 'نوع الإجراء مطلوب' })
  }),
  targetType: z.nativeEnum(CustomWorkflowTargetTypeEnum, {
    errorMap: () => ({ message: 'نوع الهدف مطلوب' })
  }),
  targetIdentifier: z.string().min(1, 'معرف الهدف مطلوب'),
  defaultInstructionText: z.string().optional(),
  defaultDueDateOffsetDays: z
    .number()
    .min(0, 'عدد الأيام يجب أن يكون أكبر من أو يساوي 0')
    .default(0),
  isActive: z.boolean().default(true),
  sequence: z.number().int().positive('Sequence must be a positive integer').default(1)
});

// Define the form values types
export type CustomWorkflowFormValues = z.infer<
  ReturnType<typeof customWorkflowFormSchema>
>;
export type CustomWorkflowStepFormValues = z.infer<
  typeof customWorkflowStepFormSchema
>;

// Utility function to format workflow data for API calls
export const formatWorkflowPayload = (
  formData: CustomWorkflowFormValues,
  id?: string
) => {
  const payload = {
    ...formData
  };

  if (id) {
    return { id, ...payload };
  }

  return payload;
};

// Utility function to format workflow step data for API calls
export const formatWorkflowStepPayload = (
  formData: CustomWorkflowStepFormValues,
  workflowId: string,
  id?: string
) => {
  const payload = {
    ...formData,
    workflowId
  };

  if (id) {
    return { id, ...payload };
  }

  return payload;
};

// Helper to check if a workflow is enabled
export const isWorkflowEnabled = (isEnabled: boolean): boolean => {
  return isEnabled;
};

// Format date for display
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'غير متوفر';

  try {
    const date = new Date(dateString);
    // Use a consistent format that works the same on server and client
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  } catch (error) {
    return 'تاريخ غير صحيح';
  }
};

// Helper to get correspondence type display name
export const getCorrespondenceTypeDisplay = (
  type: CorrespondenceTypeEnum
): string => {
  const typeNames = {
    [CorrespondenceTypeEnum.Draft]: 'مسودة',
    [CorrespondenceTypeEnum.IncomingExternal]: 'وارد خارجي',
    [CorrespondenceTypeEnum.OutgoingExternal]: 'صادر خارجي',
    [CorrespondenceTypeEnum.IncomingInternal]: 'وارد داخلي',
    [CorrespondenceTypeEnum.OutgoingInternal]: 'صادر داخلي',
    [CorrespondenceTypeEnum.Memorandum]: 'المطالعة',
    [CorrespondenceTypeEnum.Reply]: 'رد',
    [CorrespondenceTypeEnum.Public]: 'أعمام'
  };
  return typeNames[type] || 'غير محدد';
};

// Helper to get action type display name
export const getActionTypeDisplay = (type: ActionTypeEnum): string => {
  const typeNames = {
    [ActionTypeEnum.RegisterIncoming]: 'تسجيل الوارد',
    [ActionTypeEnum.RequestApproval]: 'طلب الموافقة',
    [ActionTypeEnum.Action]: 'أجراء الازم',
    [ActionTypeEnum.Reject]: 'رفض',
    [ActionTypeEnum.Return]: 'إرجاع',
    [ActionTypeEnum.Send]: 'إرسال',
    [ActionTypeEnum.Archive]: 'أرشيف',
    [ActionTypeEnum.TakeUnderConsideration]: 'وضع تحت اليد',
    [ActionTypeEnum.RequestInformation]: 'طلب معلومات',
    [ActionTypeEnum.SendToExternalReferral]: 'إرسال إلى جهة خارجية',
    [ActionTypeEnum.SendToInternalReferral]: 'إرسال إلى جهة داخلية'
  };
  return typeNames[type] || 'غير محدد';
};

// Helper to get target type display name
export const getTargetTypeDisplay = (
  type: CustomWorkflowTargetTypeEnum
): string => {
  const typeNames = {
    [CustomWorkflowTargetTypeEnum.SpecificUser]: 'مستخدم',
    [CustomWorkflowTargetTypeEnum.SpecificUnit]: 'جهة'
  };
  return typeNames[type] || 'غير محدد';
};
