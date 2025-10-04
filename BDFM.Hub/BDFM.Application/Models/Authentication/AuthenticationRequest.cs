

namespace BDFM.Application.Models.Authentication;

public class AuthenticationRequest
{
    public string UserLogin { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
