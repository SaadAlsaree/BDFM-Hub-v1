namespace BDFM.Application.Features.Users.Commands.UpdateUserRoles;

public class UpdateUserRolesCommand : IRequest<Response<bool>>
{
    [Required]
    public Guid UserId { get; set; }

    [Required]
    public List<Guid> RoleIds { get; set; } = new List<Guid>();
}
