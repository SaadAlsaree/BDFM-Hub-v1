using System.Security.Claims;
using Microsoft.AspNetCore.Components.Authorization;

namespace BDFM_Mobile.Authentication;

public class CustomAuthenticationStateProvider : AuthenticationStateProvider
{
    private readonly AuthenticationService _authService;
    private AuthenticationState? _cachedAuthenticationState;
    private bool _isInitialized = false;

    public CustomAuthenticationStateProvider(AuthenticationService authService)
    {
        _authService = authService;
    }

    public override async Task<AuthenticationState> GetAuthenticationStateAsync()
    {
        // Return cached state if available and initialized
        if (_isInitialized && _cachedAuthenticationState != null)
        {
            return _cachedAuthenticationState;
        }

        try
        {
            var userSession = await _authService.GetUserSessionAsync();

            AuthenticationState authState;
            if (userSession != null && userSession.Success)
            {
                var userName = await SecureStorage.GetAsync("userName");
                var userLogin = await SecureStorage.GetAsync("userLogin");

                var identity = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name, userName ?? "Unknown"),
                    new Claim(ClaimTypes.NameIdentifier, userLogin ?? "Unknown")
                }, "apiauth");

                var user = new ClaimsPrincipal(identity);
                authState = new AuthenticationState(user);
            }
            else
            {
                var identity = new ClaimsIdentity();
                var user = new ClaimsPrincipal(identity);
                authState = new AuthenticationState(user);
            }

            // Cache the result and mark as initialized
            _cachedAuthenticationState = authState;
            _isInitialized = true;

            return authState;
        }
        catch (Exception ex)
        {
            // In case of error, assume not authenticated
            Console.WriteLine($"Error in GetAuthenticationStateAsync: {ex.Message}");
            var identity = new ClaimsIdentity();
            var user = new ClaimsPrincipal(identity);
            var authState = new AuthenticationState(user);

            // Cache the error state as well
            _cachedAuthenticationState = authState;
            _isInitialized = true;

            return authState;
        }
    }

    public void NotifyAuthenticationStateChanged()
    {
        // Clear cache to force re-evaluation
        _cachedAuthenticationState = null;
        _isInitialized = false;

        NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());
    }
}