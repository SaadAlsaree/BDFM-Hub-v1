using BDFM.Domain.Common;
using MediatR;

namespace BDFM.Application.Features.Workflow.Queries.GetDelayedStepsReport
{
    public class GetDelayedStepsReportQuery : IRequest<Response<List<DelayedStepReportDto>>>
    {
        public Guid? OrganizationalUnitId { get; set; } // Optional filter by specific Unit
        public bool IncludeUsers { get; set; } = true; // Group by Users
        public bool IncludeUnits { get; set; } = true; // Group by Units
    }
}
