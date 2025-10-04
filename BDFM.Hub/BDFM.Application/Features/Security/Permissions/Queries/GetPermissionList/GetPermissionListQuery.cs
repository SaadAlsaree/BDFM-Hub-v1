using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;

namespace BDFM.Application.Features.Security.Permissions.Queries.GetPermissionList;

public class GetPermissionListQuery : PaginationQuery, IRequest<Response<PagedResult<PermissionListViewModel>>>
{
    public string? SearchTerm { get; set; }
    public int? Status { get; set; }
}
