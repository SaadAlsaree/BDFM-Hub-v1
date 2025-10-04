using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;

namespace BDFM.Application.Features.Security.AuditLogs.Queries.GetAuditLogList;

public class GetAuditLogListQuery : PaginationQuery, IRequest<Response<PagedResult<AuditLogListViewModel>>>
{
    public string? SearchTerm { get; set; }
    public string? Action { get; set; }
    public string? AffectedEntity { get; set; }
    public Guid? UserId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}
