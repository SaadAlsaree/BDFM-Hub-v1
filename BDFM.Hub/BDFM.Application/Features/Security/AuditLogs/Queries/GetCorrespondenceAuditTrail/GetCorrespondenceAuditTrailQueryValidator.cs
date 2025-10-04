using FluentValidation;

namespace BDFM.Application.Features.Security.AuditLogs.Queries.GetCorrespondenceAuditTrail;

public class GetCorrespondenceAuditTrailQueryValidator : AbstractValidator<GetCorrespondenceAuditTrailQuery>
{
    public GetCorrespondenceAuditTrailQueryValidator()
    {
        RuleFor(x => x.CorrespondenceId)
            .NotEmpty()
            .WithMessage("معرف الكتاب مطلوب");

        RuleFor(x => x.FromDate)
            .LessThanOrEqualTo(x => x.ToDate)
            .When(x => x.FromDate.HasValue && x.ToDate.HasValue)
            .WithMessage("تاريخ البداية يجب أن يكون أقل من أو يساوي تاريخ النهاية");

        RuleFor(x => x.ToDate)
            .GreaterThanOrEqualTo(x => x.FromDate)
            .When(x => x.FromDate.HasValue && x.ToDate.HasValue)
            .WithMessage("تاريخ النهاية يجب أن يكون أكبر من أو يساوي تاريخ البداية");

        RuleFor(x => x.ToDate)
            .LessThanOrEqualTo(DateTime.UtcNow)
            .When(x => x.ToDate.HasValue)
            .WithMessage("تاريخ النهاية لا يمكن أن يكون في المستقبل");

        RuleFor(x => x.ActionTypes)
            .Must(BeValidActionTypes)
            .When(x => x.ActionTypes != null && x.ActionTypes.Any())
            .WithMessage("أنواع الإجراءات تحتوي على قيم غير صحيحة");
    }

    private bool BeValidActionTypes(List<string>? actionTypes)
    {
        if (actionTypes == null || !actionTypes.Any())
            return true;

        var validActions = new[]
        {
            "Create", "Update", "Delete", "Login", "Logout", "View", "Download",
            "Upload", "Assign", "Forward", "Reply", "Approve", "Reject",
            "Complete", "Archive", "Restore", "Export", "Import", "Print", "Share"
        };

        return actionTypes.All(action => validActions.Contains(action));
    }
}