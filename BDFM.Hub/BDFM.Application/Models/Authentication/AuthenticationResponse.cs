

namespace BDFM.Application.Models.Authentication;

public class AuthenticationResponse
{
    public string Id { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string UserLogin { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public bool Success { get; set; } = true;
    public string Message { get; set; } = string.Empty;
}
