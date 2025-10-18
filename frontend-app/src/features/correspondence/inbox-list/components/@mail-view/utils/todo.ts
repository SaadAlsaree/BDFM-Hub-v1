import { z } from 'zod';
import { WorkflowStepTodoPayload } from '../../../types/correspondence-details';

// Todo status enum
export enum TodoStatus {
  Pending = 0,
  Completed = 1
}

// Form values interface
export interface TodoFormValues {
  title: string;
  description?: string;
  isCompleted: boolean;
  dueDate?: Date;
  notes?: string;
}

// Schema validation
export const todoFormSchema = (initialData: WorkflowStepTodoPayload | null) =>
  z.object({
    title: z
      .string()
      .min(1, 'العنوان مطلوب')
      .max(200, 'العنوان يجب أن يكون أقل من 200 حرف'),
    description: z.string().optional(),
    isCompleted: z.boolean().default(false),
    dueDate: z.date().optional(),
    notes: z.string().optional()
  });

// Helper function to convert form values to API payload
export const convertFormValuesToPayload = (
  values: TodoFormValues,
  workflowStepId: string,
  id?: string
): WorkflowStepTodoPayload => {
  return {
    id,
    workflowStepId,
    title: values.title,
    description: values.description,
    isCompleted: values.isCompleted,
    dueDate: values.dueDate?.toISOString(),
    notes: values.notes
  };
};

// Helper function to convert API payload to form values
export const convertPayloadToFormValues = (
  todo: WorkflowStepTodoPayload
): TodoFormValues => {
  return {
    title: todo.title || '',
    description: todo.description || '',
    isCompleted: todo.isCompleted || false,
    dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
    notes: todo.notes || ''
  };
};
