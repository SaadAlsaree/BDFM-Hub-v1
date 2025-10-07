
namespace BDFM.Web.Helpers
{
    public class SecurityKeyGenerator
    {
        public static SecurityKey GetSecurityKey()
        {
            return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Guid.NewGuid().ToString()));
        }
    }
}
