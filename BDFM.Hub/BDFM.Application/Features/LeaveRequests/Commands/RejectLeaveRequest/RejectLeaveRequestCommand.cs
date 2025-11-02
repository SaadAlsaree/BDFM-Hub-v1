namespace BDFM.Application.Features.LeaveRequests.Commands.RejectLeaveRequest;

public class RejectLeaveRequestCommand : IRequest<Response<bool>>
{
    public Guid Id { get; set; }
    public string RejectionReason { get; set; } = string.Empty;
}

public class RejectLeaveRequestCommandValidator : AbstractValidator<RejectLeaveRequestCommand>
{
    public RejectLeaveRequestCommandValidator()
    {
        RuleFor(p => p.Id)
            .NotEmpty().WithMessage("معرف طلب الإجازة مطلوب");

        RuleFor(p => p.RejectionReason)
            .NotEmpty().WithMessage("سبب الرفض مطلوب")
            .MaximumLength(1000).WithMessage("سبب الرفض يجب ألا يتجاوز 1000 حرف");
    }
}



