import { z } from 'zod';

// Base partials
const baseWorkflow = {
    workflowName: z.string().min(1),
    triggeringUnitId: z.string().uuid().nullable(),
    triggeringCorrespondenceType: z.number().int(),
    description: z.string().nullable().optional(),
    isEnabled: z.boolean(),
};

const baseStep = {
    workflowId: z.string().uuid(),
    stepOrder: z.number().int().min(0),
    actionType: z.number().int(),
    targetType: z.number().int(),
    targetIdentifier: z.string().optional().nullable(),
    defaultInstructionText: z.string().optional().nullable(),
    defaultDueDateOffsetDays: z.number().int().optional().nullable(),
};

// CREATE schemas (id must NOT be present)
export const customWorkflowCreateSchema = z.object({
    ...baseWorkflow,
});
export type CustomWorkflowCreateSchema = z.infer<typeof customWorkflowCreateSchema>;

export const customWorkflowStepCreateSchema = z.object({
    ...baseStep,
});
export type CustomWorkflowStepCreateSchema = z.infer<typeof customWorkflowStepCreateSchema>;

// UPDATE schemas (id required)
export const customWorkflowUpdateSchema = z.object({
    id: z.string(),
    ...baseWorkflow,
});
export type CustomWorkflowUpdateSchema = z.infer<typeof customWorkflowUpdateSchema>;

export const customWorkflowStepUpdateSchema = z.object({
    id: z.string(),
    ...baseStep,
});
export type CustomWorkflowStepUpdateSchema = z.infer<typeof customWorkflowStepUpdateSchema>;

// Generic validators
export function validateCustomWorkflowCreate(payload: unknown): CustomWorkflowCreateSchema {
    return customWorkflowCreateSchema.parse(payload);
}

export function validateCustomWorkflowUpdate(payload: unknown): CustomWorkflowUpdateSchema {
    return customWorkflowUpdateSchema.parse(payload);
}

export function validateCustomWorkflowStepCreate(payload: unknown): CustomWorkflowStepCreateSchema {
    return customWorkflowStepCreateSchema.parse(payload);
}

export function validateCustomWorkflowStepUpdate(payload: unknown): CustomWorkflowStepUpdateSchema {
    return customWorkflowStepUpdateSchema.parse(payload);
}
