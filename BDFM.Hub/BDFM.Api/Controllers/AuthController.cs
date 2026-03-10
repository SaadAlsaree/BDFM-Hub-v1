using BDFM.Api.Attributes;
using BDFM.Application.Contract.Identity;
using BDFM.Application.Models.Authentication;
using Microsoft.AspNetCore.RateLimiting;

namespace BDFM.Api.Controllers
{
    [Route("BDFM/v1/api/[controller]")]
    [ApiController]
    [FixedWindowRateLimit] // Apply strict rate limiting to prevent brute force
    [EnableRateLimiting("fixed")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthenticationService _authenticationService;

        public AuthController(IAuthenticationService authenticationService)
        {
            _authenticationService = authenticationService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AuthenticationRequest request)
        {
            var response = await _authenticationService.AuthenticateAsync(request);
            return Ok(response);
        }

        [HttpPost("register")]
        [Authorize(Roles = "SuAdmin")]
        public async Task<IActionResult> Register([FromBody] RegistrationRequest request)
        {
            var response = await _authenticationService.RegisterAsync(request);
            return Ok(response);
        }
    }
}
