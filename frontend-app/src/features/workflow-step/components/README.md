# Workflow Step Forms

This directory contains form dialog components for managing workflow steps and internal actions.

## Components

### WorkflowStepFormDialog

A dialog component for creating new workflow steps.

#### Props

- `trigger?: React.ReactNode` - Custom trigger element (optional, defaults to a button)
- `onSubmit?: (data: WorkflowStepInputFormData) => void` - Callback function when form is submitted
- `defaultValues?: Partial<WorkflowStepInputFormData>` - Default values for form fields

#### Usage

```tsx
import { WorkflowStepFormDialog } from '@/components/workflow-step-forms';

function MyComponent() {
  const handleSubmit = (data: WorkflowStepInputFormData) => {
    console.log('Workflow step data:', data);
    // Handle form submission
  };

  return (
    <WorkflowStepFormDialog
      onSubmit={handleSubmit}
      defaultValues={{
        correspondenceId: 'CORR-001',
        isTimeSensitive: true
      }}
    />
  );
}
```

### LogRecipientInternalActionFormDialog

A dialog component for logging internal actions taken by recipients.

#### Props

- `trigger?: React.ReactNode` - Custom trigger element (optional, defaults to a button)
- `onSubmit?: (data: LogRecipientInternalActionInputFormData) => void` - Callback function when form is submitted
- `defaultValues?: Partial<LogRecipientInternalActionInputFormData>` - Default values for form fields

#### Usage

```tsx
import { LogRecipientInternalActionFormDialog } from '@/components/workflow-step-forms';

function MyComponent() {
  const handleSubmit = (data: LogRecipientInternalActionInputFormData) => {
    console.log('Internal action data:', data);
    // Handle form submission
  };

  return (
    <LogRecipientInternalActionFormDialog
      onSubmit={handleSubmit}
      defaultValues={{
        workflowStepId: 'WS-001',
        actionDescription: 'Reviewed document'
      }}
    />
  );
}
```

## Form Fields

### WorkflowStepInput Fields

- **correspondenceId**: Unique identifier for the correspondence
- **actionType**: Type of action (from ActionTypeEnum)
- **fromUserId**: ID of the user initiating the workflow step
- **fromUnitId**: ID of the unit initiating the workflow step
- **toPrimaryRecipientType**: Type of primary recipient (from RecipientTypeEnum)
- **toPrimaryRecipientId**: ID of the primary recipient
- **instructionText**: Instructions for the recipient
- **dueDate**: Due date for completion (ISO date string)
- **status**: Current status (from Status enum)
- **isTimeSensitive**: Boolean indicating if the step is time-sensitive

### LogRecipientInternalActionInput Fields

- **workflowStepId**: ID of the workflow step this action relates to
- **actionTakenByUnitId**: ID of the unit that took the action
- **actionTakenByUserId**: ID of the user that took the action
- **actionTimestamp**: When the action was taken (ISO 8601 string)
- **actionDescription**: Description of the action taken
- **notes**: Optional additional notes
- **internalActionType**: Type of internal action (from InternalActionTypeEnum)

## Validation

Both forms use Zod schemas for validation:

- `WorkflowStepInputSchema`
- `LogRecipientInternalActionInputSchema`

All required fields are validated and will show error messages if not properly filled.

## Styling

The forms are built using:

- Shadcn UI components
- Tailwind CSS for styling
- Responsive design (mobile-first approach)
- Arabic RTL support

## Demo

See `workflow-step-forms-demo.tsx` for usage examples with different configurations.
