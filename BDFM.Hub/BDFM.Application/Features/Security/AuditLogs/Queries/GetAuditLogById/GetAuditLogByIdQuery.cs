namespace BDFM.Application.Features.Security.AuditLogs.Queries.GetAuditLogById;

public class GetAuditLogByIdQuery : IRequest<Response<AuditLogViewModel>>
{
    public Guid Id { get; set; }
}
