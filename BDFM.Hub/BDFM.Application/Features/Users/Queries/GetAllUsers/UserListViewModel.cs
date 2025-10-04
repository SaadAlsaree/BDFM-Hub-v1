namespace BDFM.Application.Features.Users.Queries.GetAllUsers;

public class UserListViewModel
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string UserLogin { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public Guid? OrganizationalUnitId { get; set; }
    public string? OrganizationalUnitName { get; set; }
    public string? PositionTitle { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreateAt { get; set; }
    public int Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
}
