using FluentValidation;

namespace BDFM.Application.Features.Security.AuditLogs.Commands.CreateAuditLog;

public class CreateAuditLogCommandValidator : AbstractValidator<CreateAuditLogCommand>
{
    public CreateAuditLogCommandValidator()
    {
        RuleFor(x => x.Action)
            .NotEmpty().WithMessage("نوع الإجراء مطلوب")
            .MaximumLength(255).WithMessage("نوع الإجراء يجب أن لا يتجاوز 255 حرف");

        RuleFor(x => x.AffectedEntity)
            .NotEmpty().WithMessage("اسم الجدول المتأثر مطلوب")
            .MaximumLength(100).WithMessage("اسم الجدول يجب أن لا يتجاوز 100 حرف");

        RuleFor(x => x.Details)
            .MaximumLength(4000).WithMessage("التفاصيل يجب أن لا تتجاوز 4000 حرف")
            .When(x => !string.IsNullOrEmpty(x.Details));

        RuleFor(x => x.IpAddress)
            .MaximumLength(45).WithMessage("عنوان IP يجب أن لا يتجاوز 45 حرف")
            .When(x => !string.IsNullOrEmpty(x.IpAddress));

        // التحقق من صحة عنوان IP إذا تم توفيره
        When(x => !string.IsNullOrEmpty(x.IpAddress), () =>
        {
            RuleFor(x => x.IpAddress)
                .Matches(@"^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$")
                .WithMessage("عنوان IP غير صحيح");
        });
    }
}