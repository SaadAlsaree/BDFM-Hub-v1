namespace BDFM.Application.Features.Users.Commands.ResetPassword;

public class ResetPasswordCommand : IRequest<Response<bool>>
{
    [Required]
    public Guid UserId { get; set; }

    [Required]
    [MinLength(8)]
    [MaxLength(255)]
    public string NewPassword { get; set; } = string.Empty;
}
