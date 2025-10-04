namespace BDFM.Application.Features.Users.Queries.GetMe
{
    public class GetMeVm
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string UserLogin { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public Guid? OrganizationalUnitId { get; set; }
        public string? PositionTitle { get; set; }
        public string? RfidTagId { get; set; } // Make sure it's unique in DB context
        public bool IsActive { get; set; } = true;
        public string? TwoFactorSecret { get; set; }
        public DateTime? LastLogin { get; set; }

        // Navigation Properties
        public virtual ICollection<UserRoleDto> UserRoles { get; set; } = default!;
        public virtual ICollection<UserPermissionDto> UserPermissions { get; set; } = default!;
        public virtual OrganizationalUnitDto OrganizationalUnit { get; set; } = default!;
    }


    public class UserRoleDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty; // e.g., "Admin", "User", "Manager"
        public string Value { get; set; } = string.Empty;
        public string? Description { get; set; } // Text type in DB

        // Navigation Properties
        public virtual ICollection<DelegationDto> Delegations { get; set; } = default!;

    }

    public class UserPermissionDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string? Description { get; set; }
    }


    public class OrganizationalUnitDto
    {
        public Guid Id { get; set; }
        public string UnitName { get; set; } = string.Empty;
        public string UnitCode { get; set; } = string.Empty;
        public string? UnitDescription { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? PostalCode { get; set; }
        public string? UnitLogo { get; set; }
        public int? UnitLevel { get; set; }
        public bool CanReceiveExternalMail { get; set; } = false;
        public bool CanSendExternalMail { get; set; } = false;
    }

    public class DelegationDto
    {
        public Guid Id { get; set; }
        public Guid DelegatorUserId { get; set; }
        public Guid DelegateeUserId { get; set; }
        public Guid? PermissionId { get; set; }
        public Guid? RoleId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; } = true;

        //public virtual RoleDelegationDto? Role { get; set; } = default!;
        //public virtual PermissionDelegationDto? Permission { get; set; }
    }

    public class RoleDelegationDto
    {
        public string Name { get; set; } = string.Empty; // e.g., "Admin", "User", "Manager"
        public string Value { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class PermissionDelegationDto
    {
        public string Name { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

    }
}
