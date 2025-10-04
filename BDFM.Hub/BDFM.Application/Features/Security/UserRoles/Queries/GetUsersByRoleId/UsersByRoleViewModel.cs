using System;

namespace BDFM.Application.Features.Security.UserRoles.Queries.GetUsersByRoleId;

public class UsersByRoleViewModel
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int StatusId { get; set; }
    public string StatusName { get; set; } = string.Empty;
}
