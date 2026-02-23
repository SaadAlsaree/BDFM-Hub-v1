using BDFM.Application.Features.Workflow.Queries.GetDelayedStepsReport;
using BDFM.Application.Features.Users.Queries.GetUsersPerEntityReport;

namespace BDFM.Application.Contracts.Infrastructure;

public interface IPdfService
{
    byte[] GenerateDelayedStepsReport(List<DelayedStepReportDto> data);
    byte[] GenerateUsersPerEntityReport(List<UsersPerEntityReportDto> data);
}

