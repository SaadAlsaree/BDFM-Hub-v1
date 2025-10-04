namespace BDFM.Application.Features.Security.Permissions.Commands.DeletePermission;

public class DeletePermissionCommand : IRequest<Response<bool>>
{
    public Guid Id { get; set; }
}
