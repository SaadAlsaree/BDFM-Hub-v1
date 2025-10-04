

namespace BDFM.Application.Features.Security.Roles.Commands.CreateRole;

public class CreateRoleCommand : IRequest<Response<bool>>
{
    public string Name { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
}
