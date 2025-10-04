using MediatR;

namespace BDFM.Application.Features.Security.AuditLogs.Queries.GetCorrespondenceAuditTrail;

public class GetCorrespondenceAuditTrailQuery : IRequest<Response<List<CorrespondenceAuditTrailViewModel>>>
{
    public Guid CorrespondenceId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public List<string>? ActionTypes { get; set; }
    public bool IncludeUserDetails { get; set; } = true;
} 