namespace BDFM.Application.Features.Security.Roles.Queries.GetRoleList;

public class RoleListViewModel
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public int StatusId { get; set; }
    public DateTime CreatedDate { get; set; }
    public int UserCount { get; set; }
}
