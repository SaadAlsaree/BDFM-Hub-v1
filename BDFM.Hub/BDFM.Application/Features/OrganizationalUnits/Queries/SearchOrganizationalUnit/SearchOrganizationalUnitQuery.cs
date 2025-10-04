namespace BDFM.Application.Features.OrganizationalUnits.Queries.SearchOrganizationalUnit;

public class SearchOrganizationalUnitQuery : IRequest<Response<IEnumerable<SearchOrganizationalUnitVm>>>
{
    public string Unit { get; set; } = string.Empty;
}
