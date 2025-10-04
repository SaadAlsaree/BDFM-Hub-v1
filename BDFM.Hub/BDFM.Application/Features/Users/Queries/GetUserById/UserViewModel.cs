namespace BDFM.Application.Features.Users.Queries.GetUserById;

public class UserViewModel
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string UserLogin { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public Guid? OrganizationalUnitId { get; set; }
    public string? OrganizationalUnitName { get; set; }
    public string? PositionTitle { get; set; }
    public string? RfidTagId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreateAt { get; set; }
    public int Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public List<UserRoleViewModel> UserRoles { get; set; } = new List<UserRoleViewModel>();
    public List<UserPermissionViewModel> UserPermissions { get; set; } = new List<UserPermissionViewModel>();
}

public class UserRoleViewModel
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class UserPermissionViewModel
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
