namespace BDFM.Application.Contracts.SignalR
{
    public interface ICorrespondenceNotificationService
    {
        Task NotifyInboxUpdateAsync(Guid? userId = null);
        Task NotifyCorrespondenceCreatedAsync(Guid correspondenceId, Guid? userId = null);
        Task NotifyCorrespondenceUpdatedAsync(Guid correspondenceId, Guid? userId = null);
        Task NotifyCorrespondenceDeletedAsync(Guid correspondenceId, string? subject = null, Guid? deletedBy = null, Guid? userId = null);
        Task NotifyCorrespondenceStatusChangedAsync(Guid correspondenceId, string oldStatus, string newStatus, Guid? changedBy = null, Guid? userId = null);

        // Enhanced methods for notification system
        Task NotifyCorrespondenceAssignedToModuleAsync(Guid correspondenceId, Guid organizationalUnitId, string moduleName);
        Task NotifyCorrespondenceStatusChangedToUsersWithNotificationsAsync(Guid correspondenceId, string newStatus);
        Task NotifyWorkflowStepCreatedAsync(Guid workflowStepId, Guid correspondenceId, Guid? organizationalUnitId = null);

        // New methods for workflow operations
        Task NotifyWorkflowStepCompletedAsync(Guid workflowStepId, Guid correspondenceId, Guid completedBy, Guid? nextStepId = null);
        Task NotifyWorkflowStepAssignedAsync(Guid workflowStepId, Guid correspondenceId, Guid assignedTo, Guid assignedBy, DateTime? dueDate = null);
        Task NotifyWorkflowStepStatusChangedAsync(Guid workflowStepId, Guid correspondenceId, string oldStatus, string newStatus, Guid? changedBy = null, Guid? userId = null);
    }
}
