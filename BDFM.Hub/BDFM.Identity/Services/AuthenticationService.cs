using BDFM.Application.Contract.Identity;
using BDFM.Application.Contracts.Persistence;
using BDFM.Application.Models.Authentication;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BDFM.Identity.Services
{
    public class AuthenticationService : IAuthenticationService
    {

        private readonly IBaseRepository<User> _context;
        private readonly JwtSettings _jwtSettings;

        public AuthenticationService(IBaseRepository<User> context, IOptions<JwtSettings> jwtSettings)
        {
            _context = context;
            _jwtSettings = jwtSettings.Value;
        }
        public async Task<AuthenticationResponse> AuthenticateAsync(AuthenticationRequest request)
        {
            var auth = await _context.Find(u => u.UserLogin == request.UserLogin || u.Email == request.UserLogin);

            if (auth == null)
            {
                throw new Exception($"User with {request.UserLogin} not found.");
            }

            //Check if Password is correct
            if (!BCrypt.Net.BCrypt.Verify(request.Password, auth.PasswordHash))
            {
                throw new Exception("Invalid Password");
            }

            JwtSecurityToken jwtSecurityToken = await GenerateToken(auth);

            AuthenticationResponse response = new AuthenticationResponse
            {
                Id = auth.Id.ToString(),
                Token = new JwtSecurityTokenHandler().WriteToken(jwtSecurityToken),
                Email = auth.Email!,
                UserLogin = auth.UserLogin,
            };
            return response;
        }

        public async Task<RegistrationResponse> RegisterAsync(RegistrationRequest request)
        {
            var userExists = await _context.Find(u => u.UserLogin == request.UserLogin || u.Email == request.Email);
            if (userExists != null)
            {
                throw new Exception("User already exists");
            }

            var user = new User
            {
                UserLogin = request.UserLogin,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                FullName = request.FirstName + " " + request.LastName,
            };

            await _context.Create(user);

            var response = new RegistrationResponse
            {
                UserId = user.Id.ToString(),

            };

            return response;
        }


        // Generate JWT Token
        private async Task<JwtSecurityToken> GenerateToken(User auth)
        {
            // Query to include user roles
            var userWithRoles = await _context.Find(
                u => u.Id == auth.Id,
                null!,
                query => query.Include(u => u.UserRoles)
                             .ThenInclude(ur => ur.Role)
            );

            var claims = new List<Claim>
            {
               new Claim(JwtRegisteredClaimNames.Sub, auth.UserLogin),
               new Claim(JwtRegisteredClaimNames.Jti, auth.Id.ToString()),
               new Claim(JwtRegisteredClaimNames.Email, auth.Email ?? string.Empty),
               new Claim("name",auth.FullName ?? string.Empty),
               new Claim("uid", auth.Id.ToString()),
               new Claim("org_unit_id", auth.OrganizationalUnitId?.ToString() ?? string.Empty)
            };

            // Add roles to claims
            var roles = userWithRoles?.UserRoles ?? new List<UserRole>();
            foreach (var role in roles)
            {
                claims.Add(new Claim("role", role.Role.Name));
            }

            var symmetricSecurityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));
            // Assign a key ID to the security key
            symmetricSecurityKey.KeyId = "auth_key_1"; // This is the key ID that will be included in the token header
            var signingCredentials = new SigningCredentials(symmetricSecurityKey, SecurityAlgorithms.HmacSha256);

            var jwtSecurityToken = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwtSettings.DurationInMinutes),
                signingCredentials: signingCredentials);

            return jwtSecurityToken;
        }
    }
}
