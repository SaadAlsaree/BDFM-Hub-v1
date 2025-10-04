namespace BDFM.Application.Features.Security.UnitPermissions.Queries.GetPermissionsByUnitId;

public class PermissionsByUnitViewModel
{
    public Guid Id { get; set; }
    public Guid PermissionId { get; set; }
    public string PermissionName { get; set; } = string.Empty;
    public string PermissionValue { get; set; } = string.Empty;
    public string? PermissionDescription { get; set; }
    public bool GrantedBySystemAdmin { get; set; }
    public DateTime CreateAt { get; set; }
    public Status Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
}
