namespace BDFM.Application.Features.Security.UserRoles.Commands.RemoveRoleFromUser;

public class RemoveRoleFromUserCommand : IRequest<Response<bool>>
{
    [Required]
    public Guid UserId { get; set; }

    [Required]
    public Guid RoleId { get; set; }
}
