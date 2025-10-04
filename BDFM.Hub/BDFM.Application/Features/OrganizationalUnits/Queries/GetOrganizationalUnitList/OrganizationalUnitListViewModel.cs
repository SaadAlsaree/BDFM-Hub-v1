namespace BDFM.Application.Features.OrganizationalUnits.Queries.GetOrganizationalUnitList;

public class OrganizationalUnitListViewModel
{
    public Guid Id { get; set; }
    public string UnitName { get; set; } = string.Empty;
    public string UnitCode { get; set; } = string.Empty;
    public string? UnitDescription { get; set; }
    public Guid? ParentUnitId { get; set; }
    public string? ParentUnitName { get; set; }
    public UnitType UnitType { get; set; }
    public string UnitTypeName { get; set; } = string.Empty;
    public int? UnitLevel { get; set; }
    public bool CanReceiveExternalMail { get; set; }
    public bool CanSendExternalMail { get; set; }
    public int Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
