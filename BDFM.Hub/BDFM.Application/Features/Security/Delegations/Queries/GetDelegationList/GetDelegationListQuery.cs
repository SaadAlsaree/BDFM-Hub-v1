using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;

namespace BDFM.Application.Features.Security.Delegations.Queries.GetDelegationList;

public class GetDelegationListQuery : PaginationQuery, IRequest<Response<PagedResult<DelegationListViewModel>>>
{
    public string? SearchTerm { get; set; }
    public Guid? DelegatorUserId { get; set; }
    public Guid? DelegateeUserId { get; set; }
    public Guid? PermissionId { get; set; }
    public Guid? RoleId { get; set; }
    public bool? IsActive { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int? StatusId { get; set; }
}
