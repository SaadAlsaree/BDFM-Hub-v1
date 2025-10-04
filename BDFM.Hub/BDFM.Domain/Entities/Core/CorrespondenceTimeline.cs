using BDFM.Domain.Common;

namespace BDFM.Domain.Entities.Core;

public class CorrespondenceTimeline : AuditableEntity<Guid>
{
    public Guid CorrespondenceId { get; set; }
    public virtual Correspondence Correspondence { get; set; } = default!;

    // نوع الحدث، مثال: "Created", "Updated", "RuleActionExecuted", "WorkflowStepChanged", "CommentAdded"
    public string EventType { get; set; } = string.Empty;

    // وصف حر للحدث (عرض للمستخدم)
    public string Description { get; set; } = string.Empty;

    // بيانات مهيكلة/Json لاحتواء أي metadata (مثلاً تفاصيل RuleAction أو الناتج)
    public string? MetadataJson { get; set; }

    // مرجع اختياري إلى الكيانات المسببة للحدث
    public Guid? RelatedEntityId { get; set; }         // e.g., RuleAction.Id, AutomationExecutionLog.Id
    public string? RelatedEntityType { get; set; }     // e.g., "RuleAction", "AutomationExecutionLog"

    // وقت الحدث يورّث من AuditableEntity.CreateAt أو يمكنك استخدام هذا الحقل إذا أردت
    public DateTime EventAt => CreateAt;
}
