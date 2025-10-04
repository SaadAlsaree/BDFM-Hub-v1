namespace BDFM.Application.Features.Security.Permissions.Commands.UpdatePermission;

public class UpdatePermissionCommand : IRequest<Response<bool>>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
}
