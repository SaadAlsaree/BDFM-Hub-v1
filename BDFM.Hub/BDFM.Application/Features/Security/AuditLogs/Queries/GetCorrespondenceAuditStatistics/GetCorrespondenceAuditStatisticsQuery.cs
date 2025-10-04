using MediatR;

namespace BDFM.Application.Features.Security.AuditLogs.Queries.GetCorrespondenceAuditStatistics;

public class GetCorrespondenceAuditStatisticsQuery : IRequest<Response<CorrespondenceAuditStatisticsViewModel>>
{
    public Guid CorrespondenceId { get; set; }
} 