using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Application.Helper.Pagination;

namespace BDFM.Application.Features.Security.UserPermissions.Queries.GetPermissionsByUserId;

public class GetPermissionsByUserIdQuery : IRequest<Response<PagedResult<PermissionsByUserViewModel>>>, IPaginationQuery
{
    public Guid UserId { get; set; }
    public int Page { get; set; } = 1;
    public byte PageSize { get; set; } = 10;
    public string? SearchTerm { get; set; }
    public int? StatusId { get; set; }
}
