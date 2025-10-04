using BDFM.Domain.Entities.Supporting;
using BDFM.Domain.Enums;

namespace BDFM.Application.Contracts.SignalR
{
    public interface INotificationService
    {
        Task<Notification> CreateNotificationAsync(
            Guid userId,
            string message,
            NotificationTypeEnum notificationType,
            Guid? linkToCorrespondenceId = null,
            Guid? linkToWorkflowStepId = null,
            CancellationToken cancellationToken = default);

        Task CreateModuleNotificationsAsync(
            Guid organizationalUnitId,
            string message,
            NotificationTypeEnum notificationType,
            Guid? linkToCorrespondenceId = null,
            Guid? linkToWorkflowStepId = null,
            CancellationToken cancellationToken = default);

        Task CreateNotificationsForUsersWithCorrespondenceNotificationsAsync(
            Guid correspondenceId,
            string message,
            NotificationTypeEnum notificationType,
            Guid? linkToWorkflowStepId = null,
            CancellationToken cancellationToken = default);

        Task MarkNotificationAsReadAsync(Guid notificationId, CancellationToken cancellationToken = default);
        Task MarkAllUserNotificationsAsReadAsync(Guid userId, CancellationToken cancellationToken = default);
    }
}
