namespace BDFM.Application.Features.Security.UnitPermissions.Queries.GetUnitsByPermissionId;

public class UnitsByPermissionViewModel
{
    public Guid Id { get; set; }
    public Guid UnitId { get; set; }
    public string UnitName { get; set; } = string.Empty;
    public string UnitCode { get; set; } = string.Empty;
    public string? UnitDescription { get; set; }
    public bool GrantedBySystemAdmin { get; set; }
    public DateTime CreateAt { get; set; }
    public int Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
}
