using BDFM.Application.Contracts.Identity;
using Microsoft.AspNetCore.Http;
using System.IdentityModel.Tokens.Jwt;

namespace BDFM.Identity.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private const string ROLE_CLAIM_TYPE = "role";
        private const string PERMISSION_CLAIM_TYPE = "Permission";

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        }

        public Guid UserId
        {
            get
            {
                var claimValue = GetClaimValue("uid");
                if (string.IsNullOrEmpty(claimValue))
                {
                    throw new InvalidOperationException("User is not authenticated or 'uid' claim is missing.");
                }
                return Guid.Parse(claimValue);
            }
        }

        public string UserName => GetClaimValue(JwtRegisteredClaimNames.Sub);

        public string Email => GetClaimValue(JwtRegisteredClaimNames.Email);

        public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;

        public Guid? OrganizationalUnitId
        {
            get
            {
                var claimValue = GetClaimValue("org_unit_id");
                if (string.IsNullOrEmpty(claimValue))
                    return null;

                if (Guid.TryParse(claimValue, out var orgUnitId))
                    return orgUnitId;

                return null;
            }
        }

        public string GetClaimValue(string claimType)
        {
            if (string.IsNullOrEmpty(claimType) || !IsAuthenticated)
                return null!;

            var claim = _httpContextAccessor.HttpContext?.User?.FindFirst(claimType);
            return claim?.Value!;
        }

        public bool HasRole(string role)
        {
            if (string.IsNullOrEmpty(role) || !IsAuthenticated)
                return false;

            var roles = GetRoles();

            return roles.Any(r => string.Equals(r, role, StringComparison.OrdinalIgnoreCase));
        }

        public bool HasPermission(string permission)
        {
            if (string.IsNullOrEmpty(permission) || !IsAuthenticated)
                return false;

            var permissions = GetPermissions();
            return permissions.Any(p => string.Equals(p, permission, StringComparison.OrdinalIgnoreCase));
        }

        public IEnumerable<string> GetRoles()
        {
            if (!IsAuthenticated)
                return Enumerable.Empty<string>();

            // JWT middleware automatically expands JSON arrays into multiple claims
            // So we just need to get all claims with type "role"
            var roles = _httpContextAccessor.HttpContext!.User.Claims
                .Where(c => c.Type == ROLE_CLAIM_TYPE)
                .Select(c => c.Value)
                .ToList();

            return roles;
        }

        public IEnumerable<string> GetPermissions()
        {
            if (!IsAuthenticated)
                return Enumerable.Empty<string>();

            return _httpContextAccessor.HttpContext!.User.Claims
                .Where(c => c.Type == PERMISSION_CLAIM_TYPE)
                .Select(c => c.Value)
                .ToList();
        }
    }
}
