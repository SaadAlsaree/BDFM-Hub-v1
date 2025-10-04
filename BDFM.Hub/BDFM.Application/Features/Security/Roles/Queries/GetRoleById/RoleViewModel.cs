namespace BDFM.Application.Features.Security.Roles.Queries.GetRoleById;

public class RoleViewModel
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public int StatusId { get; set; }
    public DateTime CreateAt { get; set; }
    public int UserCount { get; set; }
    public DateTime? LastModifiedDate { get; set; }
    public virtual ICollection<DelegationDto> Delegations { get; set; } = new HashSet<DelegationDto>();
}

public class PermissionsDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty; // e.g., CreateExternalMail
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; } // Text type in DB
}

public class DelegationDto
{
    public Guid DelegatorUserId { get; set; }
    public string DelegatorUserName { get; set; } = string.Empty;
    public Guid DelegateeUserId { get; set; }
    public string DelegateeUserName { get; set; } = string.Empty;
    public Guid? PermissionId { get; set; } // Specific permission delegated
    public string? PermissionName { get; set; } = string.Empty;
    public Guid? RoleId { get; set; } // Or entire role delegated
    public string RoleValue { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;
}
