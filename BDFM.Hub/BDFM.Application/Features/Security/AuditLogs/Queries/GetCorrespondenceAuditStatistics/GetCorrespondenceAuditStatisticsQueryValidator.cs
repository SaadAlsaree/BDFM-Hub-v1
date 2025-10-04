using FluentValidation;

namespace BDFM.Application.Features.Security.AuditLogs.Queries.GetCorrespondenceAuditStatistics;

public class GetCorrespondenceAuditStatisticsQueryValidator : AbstractValidator<GetCorrespondenceAuditStatisticsQuery>
{
    public GetCorrespondenceAuditStatisticsQueryValidator()
    {
        RuleFor(x => x.CorrespondenceId)
            .NotEmpty()
            .WithMessage("معرف الكتاب مطلوب");
    }
}