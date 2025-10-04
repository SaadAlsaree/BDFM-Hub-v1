namespace BDFM.Application.Features.Users.Commands.ChangePassword;

public class ChangePasswordCommand : IRequest<Response<bool>>
{
    [Required]
    public Guid UserId { get; set; }

    [Required]
    [MaxLength(255)]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string NewPassword { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    [Compare("NewPassword", ErrorMessage = "Passwords do not match")]
    public string ConfirmPassword { get; set; } = string.Empty;
}
