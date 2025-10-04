namespace BDFM.Application.Features.Security.UserPermissions.Queries.GetPermissionsByUserId;

public class PermissionsByUserViewModel
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public int StatusId { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? LastModifiedDate { get; set; }
}
