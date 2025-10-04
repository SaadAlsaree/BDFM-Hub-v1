namespace BDFM.Application.Features.Notifications.Queries.GetUserNotifications
{
    public class UserNotificationVm
    {
        public Guid Id { get; set; }
        public string Message { get; set; } = string.Empty;
        public NotificationTypeEnum NotificationType { get; set; }
        public string NotificationTypeName { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreateAt { get; set; }
        public Guid? LinkToCorrespondenceId { get; set; }
        public Guid? LinkToWorkflowStepId { get; set; }

        // Additional properties for linked entities
        public string? CorrespondenceSubject { get; set; }
        public string? CorrespondenceMailNum { get; set; }
    }
}
