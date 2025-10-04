namespace BDFM.Application.Features.Security.UserPermissions.Commands.RemovePermissionFromUser;

public class RemovePermissionFromUserCommand : IRequest<Response<bool>>
{
    [Required]
    public Guid UserId { get; set; }

    [Required]
    public Guid PermissionId { get; set; }
}
