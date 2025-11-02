namespace BDFM.Application.Features.LeaveRequests.Commands.CancelLeaveRequest;

public class CancelLeaveRequestCommand : IRequest<Response<bool>>
{
    public Guid Id { get; set; }
    public string? CancellationReason { get; set; }
}

public class CancelLeaveRequestCommandValidator : AbstractValidator<CancelLeaveRequestCommand>
{
    public CancelLeaveRequestCommandValidator()
    {
        RuleFor(p => p.Id)
            .NotEmpty().WithMessage("معرف طلب الإجازة مطلوب");

        RuleFor(p => p.CancellationReason)
            .MaximumLength(1000).When(p => !string.IsNullOrEmpty(p.CancellationReason))
            .WithMessage("سبب الإلغاء يجب ألا يتجاوز 1000 حرف");
    }
}



