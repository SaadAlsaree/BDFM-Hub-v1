namespace BDFM.Application.Features.LeaveRequests.Commands.UpdateLeaveRequest;

public class UpdateLeaveRequestCommand : IRequest<Response<bool>>
{
    public Guid Id { get; set; }
    public LeaveTypeEnum? LeaveType { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Reason { get; set; }
}

public class UpdateLeaveRequestCommandValidator : AbstractValidator<UpdateLeaveRequestCommand>
{
    public UpdateLeaveRequestCommandValidator()
    {
        RuleFor(p => p.Id)
            .NotEmpty().WithMessage("معرف طلب الإجازة مطلوب");

        RuleFor(p => p.LeaveType)
            .IsInEnum().When(p => p.LeaveType.HasValue).WithMessage("نوع الإجازة غير صحيح");

        RuleFor(p => p.StartDate)
            .Must(BeValidDate).When(p => p.StartDate.HasValue).WithMessage("تاريخ بداية الإجازة غير صحيح");

        RuleFor(p => p.EndDate)
            .Must(BeValidDate).When(p => p.EndDate.HasValue).WithMessage("تاريخ نهاية الإجازة غير صحيح")
            .GreaterThanOrEqualTo(p => p.StartDate).When(p => p.StartDate.HasValue && p.EndDate.HasValue)
            .WithMessage("تاريخ نهاية الإجازة يجب أن يكون بعد تاريخ البداية");

        RuleFor(p => p.Reason)
            .MaximumLength(1000).When(p => !string.IsNullOrEmpty(p.Reason)).WithMessage("السبب يجب ألا يتجاوز 1000 حرف");
    }

    private bool BeValidDate(DateTime? date)
    {
        return !date.HasValue || (date.Value != default && date.Value.Year >= 1900);
    }
}



