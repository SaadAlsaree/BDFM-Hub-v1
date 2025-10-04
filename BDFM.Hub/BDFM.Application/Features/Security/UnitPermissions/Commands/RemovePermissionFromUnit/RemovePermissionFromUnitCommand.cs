namespace BDFM.Application.Features.Security.UnitPermissions.Commands.RemovePermissionFromUnit;

public class RemovePermissionFromUnitCommand : IRequest<Response<bool>>
{
    [Required]
    public Guid UnitId { get; set; }

    [Required]
    public Guid PermissionId { get; set; }
}
