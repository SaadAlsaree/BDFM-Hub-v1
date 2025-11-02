namespace BDFM.Application.Features.LeaveRequests.Commands.InterruptLeaveRequest;

public class InterruptLeaveRequestCommand : IRequest<Response<bool>>
{
    public Guid Id { get; set; }
    public DateTime InterruptionDate { get; set; }
    public DateTime ReturnDate { get; set; }
    public LeaveInterruptionTypeEnum InterruptionType { get; set; }
    public string? Reason { get; set; }
}

public class InterruptLeaveRequestCommandValidator : AbstractValidator<InterruptLeaveRequestCommand>
{
    public InterruptLeaveRequestCommandValidator()
    {
        RuleFor(p => p.Id)
            .NotEmpty().WithMessage("معرف طلب الإجازة مطلوب");

        RuleFor(p => p.InterruptionDate)
            .NotEmpty().WithMessage("تاريخ قطع الإجازة مطلوب")
            .Must(BeValidDate).WithMessage("تاريخ قطع الإجازة غير صحيح");

        RuleFor(p => p.ReturnDate)
            .NotEmpty().WithMessage("تاريخ العودة مطلوب")
            .Must(BeValidDate).WithMessage("تاريخ العودة غير صحيح")
            .GreaterThanOrEqualTo(p => p.InterruptionDate).WithMessage("تاريخ العودة يجب أن يكون بعد تاريخ قطع الإجازة");

        RuleFor(p => p.InterruptionType)
            .IsInEnum().WithMessage("نوع قطع الإجازة غير صحيح");

        RuleFor(p => p.Reason)
            .MaximumLength(1000).When(p => !string.IsNullOrEmpty(p.Reason)).WithMessage("السبب يجب ألا يتجاوز 1000 حرف");
    }

    private bool BeValidDate(DateTime date)
    {
        return date != default && date.Year >= 1900;
    }
}



