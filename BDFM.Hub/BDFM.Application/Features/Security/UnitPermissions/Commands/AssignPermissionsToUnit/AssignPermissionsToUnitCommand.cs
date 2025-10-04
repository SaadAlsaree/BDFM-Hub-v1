namespace BDFM.Application.Features.Security.UnitPermissions.Commands.AssignPermissionsToUnit;

public class AssignPermissionsToUnitCommand : IRequest<Response<bool>>
{
    [Required]
    public Guid UnitId { get; set; }

    [Required]
    public List<Guid> PermissionIds { get; set; } = new List<Guid>();
}
