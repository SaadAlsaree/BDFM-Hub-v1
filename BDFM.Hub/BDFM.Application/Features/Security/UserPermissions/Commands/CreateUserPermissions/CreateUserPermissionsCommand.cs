namespace BDFM.Application.Features.Security.UserPermissions.Commands.CreateUserPermissions
{
    public class CreateUserPermissionsCommand : IRequest<Response<bool>>
    {
        public Guid UserId { get; set; }
        public Guid PermissionIds { get; set; }
    }
}
