namespace BDFM.Application.Features.Security.Roles.Commands.UpdateRole;

public class UpdateRoleCommand : IRequest<Response<bool>>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
}
