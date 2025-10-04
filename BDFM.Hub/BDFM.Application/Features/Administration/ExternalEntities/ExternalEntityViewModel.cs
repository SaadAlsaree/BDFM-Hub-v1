namespace BDFM.Application.Features.Administration.ExternalEntities;

public class ExternalEntityViewModel
{
    public Guid Id { get; set; }
    public string EntityName { get; set; } = string.Empty;
    public string EntityCode { get; set; } = string.Empty;
    public EntityType? EntityType { get; set; }
    public string EntityTypeName { get; set; } = string.Empty;
    public string? ContactInfo { get; set; }
    public Status Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public DateTime CreateAt { get; set; }
    public Guid? CreateBy { get; set; }
    public DateTime? LastUpdateAt { get; set; }
    public Guid? LastUpdateBy { get; set; }
}

public class ExternalEntityListViewModel
{
    public Guid Id { get; set; }
    public string EntityName { get; set; } = string.Empty;
    public string EntityCode { get; set; } = string.Empty;
    public EntityType? EntityType { get; set; }
    public string EntityTypeName { get; set; } = string.Empty;
    public Status Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public DateTime CreateAt { get; set; }
}
