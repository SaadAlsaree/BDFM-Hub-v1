using BDFM.Application.Contracts.SignalR;
using BDFM.Domain.Entities.Supporting;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

namespace BDFM.Application.Services.SignalR
{
    public class NotificationService : INotificationService
    {
        private readonly IBaseRepository<Notification> _notificationRepository;
        private readonly IBaseRepository<User> _userRepository;
        private readonly IBaseRepository<UserCorrespondenceInteraction> _userCorrespondenceInteractionRepository;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            IBaseRepository<Notification> notificationRepository,
            IBaseRepository<User> userRepository,
            IBaseRepository<UserCorrespondenceInteraction> userCorrespondenceInteractionRepository,
            ILogger<NotificationService> logger)
        {
            _notificationRepository = notificationRepository;
            _userRepository = userRepository;
            _userCorrespondenceInteractionRepository = userCorrespondenceInteractionRepository;
            _logger = logger;
        }

        public async Task<Notification> CreateNotificationAsync(
            Guid userId,
            string message,
            NotificationTypeEnum notificationType,
            Guid? linkToCorrespondenceId = null,
            Guid? linkToWorkflowStepId = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var notification = new Notification
                {
                    UserId = userId,
                    Message = message,
                    NotificationType = notificationType,
                    LinkToCorrespondenceId = linkToCorrespondenceId,
                    LinkToWorkflowStepId = linkToWorkflowStepId,
                    IsRead = false,
                    CreateAt = DateTime.UtcNow,
                    StatusId = Status.Unverified
                };

                var result = await _notificationRepository.Create(notification, cancellationToken);

                _logger.LogInformation("Created notification {NotificationId} for user {UserId} with type {NotificationType}",
                    result.Id, userId, notificationType);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating notification for user {UserId}", userId);
                throw;
            }
        }

        public async Task CreateModuleNotificationsAsync(
            Guid organizationalUnitId,
            string message,
            NotificationTypeEnum notificationType,
            Guid? linkToCorrespondenceId = null,
            Guid? linkToWorkflowStepId = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                // Get all users in the organizational unit (module)
                var usersInModule = await _userRepository.Query()
                    .Where(u => u.OrganizationalUnitId == organizationalUnitId && !u.IsDeleted)
                    .Select(u => u.Id)
                    .ToListAsync(cancellationToken);

                if (!usersInModule.Any())
                {
                    _logger.LogInformation("No users found in module {OrganizationalUnitId} for notification creation", organizationalUnitId);
                    return;
                }

                // Create notifications for all users in the module
                var notifications = usersInModule.Select(userId => new Notification
                {
                    UserId = userId,
                    Message = message,
                    NotificationType = notificationType,
                    LinkToCorrespondenceId = linkToCorrespondenceId,
                    LinkToWorkflowStepId = linkToWorkflowStepId,
                    IsRead = false,
                    CreateAt = DateTime.UtcNow,
                    StatusId = Status.Unverified
                }).ToList();

                // Bulk create notifications
                foreach (var notification in notifications)
                {
                    await _notificationRepository.Create(notification, cancellationToken);
                }

                _logger.LogInformation("Created {NotificationCount} notifications for module {OrganizationalUnitId} with type {NotificationType}",
                    notifications.Count, organizationalUnitId, notificationType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating module notifications for organizational unit {OrganizationalUnitId}", organizationalUnitId);
                throw;
            }
        }

        public async Task CreateNotificationsForUsersWithCorrespondenceNotificationsAsync(
            Guid correspondenceId,
            string message,
            NotificationTypeEnum notificationType,
            Guid? linkToWorkflowStepId = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                // Get users who have enabled notifications for this correspondence
                var usersWithNotifications = await _userCorrespondenceInteractionRepository.Query()
                    .Where(uci => uci.CorrespondenceId == correspondenceId && uci.ReceiveNotifications == true && !uci.IsDeleted)
                    .Select(uci => uci.UserId)
                    .ToListAsync(cancellationToken);

                if (!usersWithNotifications.Any())
                {
                    _logger.LogInformation("No users with notifications enabled found for correspondence {CorrespondenceId}", correspondenceId);
                    return;
                }

                // Create notifications for users who have enabled notifications
                var notifications = usersWithNotifications.Select(userId => new Notification
                {
                    UserId = userId,
                    Message = message,
                    NotificationType = notificationType,
                    LinkToCorrespondenceId = correspondenceId,
                    LinkToWorkflowStepId = linkToWorkflowStepId,
                    IsRead = false,
                    CreateAt = DateTime.UtcNow,
                    StatusId = Status.Unverified
                }).ToList();

                // Bulk create notifications
                foreach (var notification in notifications)
                {
                    await _notificationRepository.Create(notification, cancellationToken);
                }

                _logger.LogInformation("Created {NotificationCount} notifications for users with correspondence notifications enabled for correspondence {CorrespondenceId}",
                    notifications.Count, correspondenceId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating notifications for users with correspondence notifications for correspondence {CorrespondenceId}", correspondenceId);
                throw;
            }
        }

        public async Task MarkNotificationAsReadAsync(Guid notificationId, CancellationToken cancellationToken = default)
        {
            try
            {
                var notification = await _notificationRepository.Find(n => n.Id == notificationId, cancellationToken: cancellationToken);
                if (notification != null)
                {
                    notification.IsRead = true;
                    notification.LastUpdateAt = DateTime.UtcNow;
                    _notificationRepository.Update(notification);

                    _logger.LogInformation("Marked notification {NotificationId} as read", notificationId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification {NotificationId} as read", notificationId);
                throw;
            }
        }

        public async Task MarkAllUserNotificationsAsReadAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            try
            {
                var unreadNotifications = await _notificationRepository.Query()
                    .Where(n => n.UserId == userId && !n.IsRead && !n.IsDeleted)
                    .ToListAsync(cancellationToken);

                foreach (var notification in unreadNotifications)
                {
                    notification.IsRead = true;
                    notification.LastUpdateAt = DateTime.UtcNow;
                    _notificationRepository.Update(notification);
                }

                _logger.LogInformation("Marked {NotificationCount} notifications as read for user {UserId}",
                    unreadNotifications.Count, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking all notifications as read for user {UserId}", userId);
                throw;
            }
        }
    }
}
