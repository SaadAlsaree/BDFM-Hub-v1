namespace BDFM.Application.Features.OrganizationalUnits.Queries.GetOrganizationalUnitTree;

public class OrganizationalUnitTreeViewModel
{
    public Guid Id { get; set; }
    public string UnitName { get; set; } = string.Empty;
    public string UnitCode { get; set; } = string.Empty;
    public UnitType UnitType { get; set; }
    public string UnitTypeName { get; set; } = string.Empty;
    public Guid? ParentUnitId { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public string? UnitLogo { get; set; } // Path to logo image

    public int? UnitLevel { get; set; }
    public bool CanReceiveExternalMail { get; set; } = false;
    public bool CanSendExternalMail { get; set; } = false;
    public List<OrganizationalUnitTreeViewModel> Children { get; set; } = new List<OrganizationalUnitTreeViewModel>();
}
