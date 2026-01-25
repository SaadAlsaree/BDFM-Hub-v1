using BDFM.Application.Features.Workflow.Queries.GetDelayedStepsReport;

namespace BDFM.Application.Contracts.Infrastructure;

public interface IPdfService
{
    byte[] GenerateDelayedStepsReport(List<DelayedStepReportDto> data);
}
