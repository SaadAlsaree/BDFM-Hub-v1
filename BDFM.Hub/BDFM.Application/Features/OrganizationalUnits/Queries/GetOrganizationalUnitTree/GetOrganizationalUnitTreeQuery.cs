namespace BDFM.Application.Features.OrganizationalUnits.Queries.GetOrganizationalUnitTree;

public class GetOrganizationalUnitTreeQuery : IRequest<Response<List<OrganizationalUnitTreeViewModel>>>
{
    public Guid? RootUnitId { get; set; }
}
