namespace BDFM.Application.Features.Users.Commands.CreateUser;

public class CreateUserCommand : IRequest<Response<bool>>
{
    [Required]
    [MaxLength(255)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string UserLogin { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string FullName { get; set; } = string.Empty;

    [EmailAddress]
    [MaxLength(255)]
    public string? Email { get; set; }

    public Guid? OrganizationalUnitId { get; set; }

    [MaxLength(255)]
    public string? PositionTitle { get; set; }

    [MaxLength(100)]
    public string? RfidTagId { get; set; }

    public bool IsActive { get; set; } = true;

    public List<Guid> RoleIds { get; set; } = new List<Guid>();
}
