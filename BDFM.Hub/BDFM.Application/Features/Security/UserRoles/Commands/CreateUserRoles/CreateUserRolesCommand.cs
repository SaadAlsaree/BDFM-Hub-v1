

namespace BDFM.Application.Features.Security.UserRoles.Commands.CreateUserRoles
{
    public class CreateUserRolesCommand : IRequest<Response<bool>>
    {
        public Guid UserId { get; set; }
        public Guid RoleId { get; set; }
    }
}
