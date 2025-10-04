using System;

namespace BDFM.Application.Features.Security.UserRoles.Queries.GetRolesByUserId;

public class RolesByUserViewModel
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int StatusId { get; set; }
    public string StatusName { get; set; } = string.Empty;
}
