

namespace BDFM.Web.Helpers;

public class DynamicKeyJwtValidationHandler : JwtSecurityTokenHandler, ISecurityTokenValidator
{
    private readonly IRedisCacheLayer _redisCacheLayer;
    public DynamicKeyJwtValidationHandler()
    {
        _redisCacheLayer = IOC.Resolve<IRedisCacheLayer>() ?? throw new ArgumentNullException(nameof(_redisCacheLayer));
    }
    public SecurityKey GetKeyForClaimedId(string claimedId)
    {
        return _redisCacheLayer.TryGet($"UserKey:{claimedId}", out var securityKey) ? new SymmetricSecurityKey(Encoding.UTF8.GetBytes(securityKey!)) : null!;

    }
    public override ClaimsPrincipal ValidateToken(string token, TokenValidationParameters validationParameters, out SecurityToken validatedToken)
    {
        JwtSecurityToken incomingToken = ReadJwtToken(token);
        string externalSystemId = incomingToken
            .Claims
            .First(claim => claim.Type == "alphaKey")
            .Value;
        var keyForClaimedId = GetKeyForClaimedId(externalSystemId);
        SecurityKey publicKeyForExternalSystem = keyForClaimedId;
        validationParameters.IssuerSigningKey = publicKeyForExternalSystem;
        try
        {
            return base.ValidateToken(token, validationParameters, out validatedToken);
        }
        catch (Exception ex)
        {
            throw new SecurityTokenException(ex.Message);
        }
    }
}