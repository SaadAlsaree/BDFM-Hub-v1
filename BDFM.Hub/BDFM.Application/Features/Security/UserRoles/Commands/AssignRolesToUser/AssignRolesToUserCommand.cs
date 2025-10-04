namespace BDFM.Application.Features.Security.UserRoles.Commands.AssignRolesToUser;

public class AssignRolesToUserCommand : IRequest<Response<bool>>
{
    [Required]
    public Guid UserId { get; set; }

    [Required]
    public List<Guid> RoleIds { get; set; } = new List<Guid>();
}
