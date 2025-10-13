

using System.Security.Claims;

namespace BDFM_Mobile.Authentication;

public record LoggedInUser(int Id, string UserName, string UserLogin, string Email)
{
    public Claim[] ToClaims() =>
[
            new Claim(ClaimTypes.NameIdentifier, Id.ToString()),
                new Claim(ClaimTypes.Name, UserName),
                new Claim(ClaimTypes.Email, Email),
                new Claim("UserLogin", UserLogin)
        ];


    public static LoggedInUser? FromClaimsPrincipal(ClaimsPrincipal claimsPrincipal)
    {
        if (claimsPrincipal.Identity is not { IsAuthenticated: true })
        {
            return null;
        }

        var idClaim = claimsPrincipal.FindFirst(ClaimTypes.NameIdentifier);
        var nameClaim = claimsPrincipal.FindFirst(ClaimTypes.Name);
        var emailClaim = claimsPrincipal.FindFirst(ClaimTypes.Email);
        var userLoginClaim = claimsPrincipal.FindFirst("UserLogin");

        if (idClaim == null || nameClaim == null || emailClaim == null || userLoginClaim == null)
        {
            return null;
        }

        if (!int.TryParse(idClaim.Value, out int id))
        {
            return null;
        }

        return new LoggedInUser(
            Id: id,
            UserName: nameClaim.Value,
            UserLogin: userLoginClaim.Value,
            Email: emailClaim.Value
        );
    }
}



