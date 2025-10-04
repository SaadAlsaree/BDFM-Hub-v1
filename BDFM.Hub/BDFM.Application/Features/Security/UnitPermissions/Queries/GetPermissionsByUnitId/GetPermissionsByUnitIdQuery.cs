using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;

namespace BDFM.Application.Features.Security.UnitPermissions.Queries.GetPermissionsByUnitId;

public class GetPermissionsByUnitIdQuery : IRequest<Response<PagedResult<PermissionsByUnitViewModel>>>, IPaginationQuery
{
    public Guid UnitId { get; set; }

    // IPaginationQuery implementation
    public int Page { get; set; } = 1;
    public byte PageSize { get; set; } = 10;
    public string? SortField { get; set; }
    public string? SortDirection { get; set; }


}
