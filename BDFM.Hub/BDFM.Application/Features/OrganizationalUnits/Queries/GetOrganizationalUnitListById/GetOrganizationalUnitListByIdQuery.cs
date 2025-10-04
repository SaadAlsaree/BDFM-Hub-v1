namespace BDFM.Application.Features.OrganizationalUnits.Queries.GetOrganizationalUnitListById;

public class GetOrganizationalUnitListByIdQuery : IRequest<Response<List<GetOrganizationalUnitListByIdVM>>>
{
    public bool IncludeInactive { get; set; } = false;
}
