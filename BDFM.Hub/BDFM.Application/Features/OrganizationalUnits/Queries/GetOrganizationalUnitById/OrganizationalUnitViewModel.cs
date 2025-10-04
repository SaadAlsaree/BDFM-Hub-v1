namespace BDFM.Application.Features.OrganizationalUnits.Queries.GetOrganizationalUnitById;

public class OrganizationalUnitViewModel
{
    public Guid Id { get; set; }
    public string UnitName { get; set; } = string.Empty;
    public string UnitCode { get; set; } = string.Empty;
    public string? UnitDescription { get; set; }
    public Guid? ParentUnitId { get; set; }
    public string? ParentUnitName { get; set; }
    public UnitType UnitType { get; set; }
    public string UnitTypeName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public string? UnitLogo { get; set; }
    public int? UnitLevel { get; set; }
    public bool CanReceiveExternalMail { get; set; }
    public bool CanSendExternalMail { get; set; }
    public int Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}
