namespace BDFM.Application.Features.LeaveRequests.Commands.CreateLeaveRequest;

public class CreateLeaveRequestCommand : IRequest<Response<Guid>>
{
    // بيانات الموظف من HR (تُرسل من الفرونت إند)
    public string EmployeeId { get; set; } = string.Empty; // معرف الموظف من نظام HR
    public string? EmployeeNumber { get; set; } // رقم الموظف من HR
    public string? EmployeeName { get; set; } // اسم الموظف من HR
    public Guid? OrganizationalUnitId { get; set; }
    
    // بيانات الرصيد من HR (تُرسل من الفرونت إند)
    public decimal TotalBalance { get; set; } // الرصيد الكلي من نظام HR
    public decimal MonthlyBalance { get; set; } // الرصيد الشهري - 3 أيام للعادية
    public decimal UsedBalance { get; set; } // المستخدم
    public decimal AvailableBalance { get; set; } // المتاح = Total - Used
    public decimal MonthlyUsedBalance { get; set; } // المستخدم شهرياً
    public DateTime? LastMonthlyResetDate { get; set; } // تاريخ آخر إعادة تعيين شهري
    
    // بيانات الطلب
    public LeaveTypeEnum LeaveType { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Reason { get; set; }
}

public class CreateLeaveRequestCommandValidator : AbstractValidator<CreateLeaveRequestCommand>
{
    public CreateLeaveRequestCommandValidator()
    {
        RuleFor(p => p.EmployeeId)
            .NotEmpty().WithMessage("معرف الموظف مطلوب")
            .MaximumLength(100).WithMessage("معرف الموظف يجب ألا يتجاوز 100 حرف");

        RuleFor(p => p.LeaveType)
            .IsInEnum().WithMessage("نوع الإجازة غير صحيح");

        RuleFor(p => p.StartDate)
            .NotEmpty().WithMessage("تاريخ بداية الإجازة مطلوب")
            .Must(BeValidDate).WithMessage("تاريخ بداية الإجازة غير صحيح");

        RuleFor(p => p.EndDate)
            .NotEmpty().WithMessage("تاريخ نهاية الإجازة مطلوب")
            .Must(BeValidDate).WithMessage("تاريخ نهاية الإجازة غير صحيح")
            .GreaterThanOrEqualTo(p => p.StartDate).WithMessage("تاريخ نهاية الإجازة يجب أن يكون بعد تاريخ البداية");

        RuleFor(p => p.Reason)
            .MaximumLength(1000).WithMessage("السبب يجب ألا يتجاوز 1000 حرف");
    }

    private bool BeValidDate(DateTime date)
    {
        return date != default && date.Year >= 1900;
    }
}



