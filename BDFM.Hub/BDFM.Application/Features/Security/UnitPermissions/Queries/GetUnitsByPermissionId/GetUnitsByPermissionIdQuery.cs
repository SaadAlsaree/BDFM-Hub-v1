using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;

namespace BDFM.Application.Features.Security.UnitPermissions.Queries.GetUnitsByPermissionId;

public class GetUnitsByPermissionIdQuery : IRequest<Response<PagedResult<UnitsByPermissionViewModel>>>, IPaginationQuery
{
    public Guid PermissionId { get; set; }

    // IPaginationQuery implementation
    public int Page { get; set; } = 1;
    public byte PageSize { get; set; } = 10;
    public string? SortField { get; set; }
    public string? SortDirection { get; set; }

    // Filter properties
    public string? SearchTerm { get; set; }
}
