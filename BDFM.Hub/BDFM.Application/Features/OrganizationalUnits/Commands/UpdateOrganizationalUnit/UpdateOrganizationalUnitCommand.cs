namespace BDFM.Application.Features.OrganizationalUnits.Commands.UpdateOrganizationalUnit;

public class UpdateOrganizationalUnitCommand : IRequest<Response<bool>>
{
    public Guid Id { get; set; }
    public string UnitName { get; set; } = string.Empty;
    public string UnitCode { get; set; } = string.Empty;
    public string? UnitDescription { get; set; }
    public Guid? ParentUnitId { get; set; }
    public string? Email { get; set; }
    public UnitType UnitType { get; set; }
    public string? PhoneNumber { get; set; }
    public string? FaxNumber { get; set; }
    public string? Address { get; set; }
    public string? PostalCode { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? UnitLogo { get; set; }
    public int? UnitLevel { get; set; }
    public bool CanReceiveExternalMail { get; set; } = false;
    public bool CanSendExternalMail { get; set; } = false;
}
