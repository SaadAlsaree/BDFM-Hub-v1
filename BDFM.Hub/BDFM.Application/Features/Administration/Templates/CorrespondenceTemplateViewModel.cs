namespace BDFM.Application.Features.Administration.Templates;

public class CorrespondenceTemplateViewModel
{
    public Guid Id { get; set; }
    public string TemplateName { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string? BodyText { get; set; }
    public Guid? OrganizationalUnitId { get; set; }
    public string? OrganizationalUnitName { get; set; }
    // Note: CorrespondenceTemplate no longer has a CorrespondenceType field in the domain model.
    public Status Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public DateTime CreateAt { get; set; }
    public Guid? CreateBy { get; set; }
    public DateTime? LastUpdateAt { get; set; }
    public Guid? LastUpdateBy { get; set; }
}

public class CorrespondenceTemplateListViewModel
{
    public Guid Id { get; set; }
    public string TemplateName { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string? BodyText { get; set; }
    public Guid? OrganizationalUnitId { get; set; }
    public string? OrganizationalUnitName { get; set; }
    // CorrespondenceType removed from domain; list view excludes it.
    public Status Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public DateTime CreateAt { get; set; }
}
