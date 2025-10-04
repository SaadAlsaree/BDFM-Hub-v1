# CreateBulkWorkflowSteps Feature

## Overview

This feature allows creating multiple workflow steps for a single correspondence in one operation, with a fixed `CorrespondenceId`.

## Components

### 1. CreateBulkWorkflowStepsCommand

-  **CorrespondenceId**: Fixed ID for all workflow steps
-  **WorkflowSteps**: List of `WorkflowStepItem` objects

### 2. WorkflowStepItem

-  **ActionType**: Type of action for the workflow step
-  **ToPrimaryRecipientType**: Type of recipient (User/Unit)
-  **ToPrimaryRecipientId**: ID of the recipient
-  **InstructionText**: Instructions for the step
-  **DueDate**: Due date for the step
-  **Status**: Status of the step (default: Pending)
-  **IsTimeSensitive**: Whether the step is time-sensitive

### 3. CreateBulkWorkflowStepsHandler

-  Creates multiple workflow steps in a single transaction
-  Handles duplicate step detection (skips existing steps)
-  Sends bulk notifications for organizational units
-  Maintains all the same functionality as single step creation

### 4. CreateBulkWorkflowStepsValidator

-  Validates the command and each workflow step item
-  Ensures required fields are provided
-  Validates that at least one workflow step is provided

## API Usage

### Endpoint

```
POST /BDFM/v1/api/Workflow/CreateBulkWorkflowSteps
```

### Request Body Example

```json
{
   "correspondenceId": "12345678-1234-1234-1234-123456789012",
   "workflowSteps": [
      {
         "actionType": 1,
         "toPrimaryRecipientType": 1,
         "toPrimaryRecipientId": "87654321-4321-4321-4321-210987654321",
         "instructionText": "Please review and approve this document",
         "dueDate": "2024-12-31T23:59:59Z",
         "status": 0,
         "isTimeSensitive": false
      },
      {
         "actionType": 2,
         "toPrimaryRecipientType": 2,
         "toPrimaryRecipientId": "11111111-2222-3333-4444-555555555555",
         "instructionText": "Please provide feedback on this proposal",
         "dueDate": "2024-12-25T18:00:00Z",
         "status": 0,
         "isTimeSensitive": true
      }
   ]
}
```

### Response

```json
{
   "succeeded": true,
   "message": "Success",
   "data": true
}
```

## Key Features

1. **Bulk Creation**: Create multiple workflow steps in one API call
2. **Fixed CorrespondenceId**: All steps are associated with the same correspondence
3. **Duplicate Prevention**: Automatically skips steps that already exist
4. **Bulk Notifications**: Efficiently handles notifications for multiple organizational units
5. **Error Handling**: Continues processing even if individual steps fail
6. **Logging**: Comprehensive logging for debugging and monitoring

## Benefits

-  **Performance**: Reduces API calls from N to 1
-  **Consistency**: Ensures all steps are created for the same correspondence
-  **Efficiency**: Bulk notification handling
-  **Reliability**: Continues processing even if some steps fail
-  **Maintainability**: Follows the same patterns as single step creation
