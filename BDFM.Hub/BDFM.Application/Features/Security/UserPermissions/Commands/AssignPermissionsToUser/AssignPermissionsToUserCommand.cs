namespace BDFM.Application.Features.Security.UserPermissions.Commands.AssignPermissionsToUser;

public class AssignPermissionsToUserCommand : IRequest<Response<bool>>
{
    [Required]
    public Guid UserId { get; set; }

    [Required]
    public List<Guid> PermissionIds { get; set; } = new List<Guid>();
}
