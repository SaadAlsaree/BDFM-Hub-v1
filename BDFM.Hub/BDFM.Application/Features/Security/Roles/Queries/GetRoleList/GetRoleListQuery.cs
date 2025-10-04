using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;

namespace BDFM.Application.Features.Security.Roles.Queries.GetRoleList;

public class GetRoleListQuery : PaginationQuery, IRequest<Response<PagedResult<RoleListViewModel>>>
{
    public string? SearchTerm { get; set; }
    public int? StatusId { get; set; }
}
