namespace BDFM.Application.Features.OrganizationalUnits.Queries.GetOrganizationalUnitById;

public class GetOrganizationalUnitByIdQuery : IRequest<Response<OrganizationalUnitViewModel>>
{
    public Guid Id { get; set; }
}
