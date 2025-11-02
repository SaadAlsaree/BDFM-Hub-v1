namespace BDFM.Application.Features.LeaveRequests.Commands.ApproveLeaveRequest;

public class ApproveLeaveRequestCommand : IRequest<Response<bool>>
{
    public Guid Id { get; set; }
    public int? ApprovedDays { get; set; } // إذا لم يتم تحديده، يتم استخدام RequestedDays
    public string? Notes { get; set; }
}

public class ApproveLeaveRequestCommandValidator : AbstractValidator<ApproveLeaveRequestCommand>
{
    public ApproveLeaveRequestCommandValidator()
    {
        RuleFor(p => p.Id)
            .NotEmpty().WithMessage("معرف طلب الإجازة مطلوب");

        RuleFor(p => p.ApprovedDays)
            .GreaterThan(0).When(p => p.ApprovedDays.HasValue).WithMessage("عدد الأيام المعتمدة يجب أن يكون أكبر من صفر");

        RuleFor(p => p.Notes)
            .MaximumLength(1000).When(p => !string.IsNullOrEmpty(p.Notes)).WithMessage("الملاحظات يجب ألا تتجاوز 1000 حرف");
    }
}



