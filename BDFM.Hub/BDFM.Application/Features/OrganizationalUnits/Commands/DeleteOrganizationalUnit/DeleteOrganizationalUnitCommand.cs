namespace BDFM.Application.Features.OrganizationalUnits.Commands.DeleteOrganizationalUnit;

public class DeleteOrganizationalUnitCommand : IRequest<Response<bool>>
{
    public Guid Id { get; set; }
}
