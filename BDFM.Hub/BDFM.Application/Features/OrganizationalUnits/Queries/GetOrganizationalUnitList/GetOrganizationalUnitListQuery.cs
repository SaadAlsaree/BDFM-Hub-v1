using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;

namespace BDFM.Application.Features.OrganizationalUnits.Queries.GetOrganizationalUnitList;

public class GetOrganizationalUnitListQuery : IRequest<Response<PagedResult<OrganizationalUnitListViewModel>>>, IPaginationQuery
{
    public string? SearchText { get; set; }
    public int Page { get; set; } = 1;
    public byte PageSize { get; set; } = 10;
    public Guid? ParentUnitId { get; set; }
    public int? Status { get; set; }
}
