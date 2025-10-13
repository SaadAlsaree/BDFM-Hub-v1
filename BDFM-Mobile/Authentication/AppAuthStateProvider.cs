using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Components.Authorization;

namespace BDFM_Mobile.Authentication;

public class AppAuthStateProvider : AuthenticationStateProvider
{
    private const string AuthType = "app-auth";
    private const string storageKey = "authToken";


    private readonly static Task<AuthenticationState> anonymous = Task.FromResult(
        new AuthenticationState(new ClaimsPrincipal(new ClaimsIdentity()))
    );

    private Task<AuthenticationState> _currentAuthState = anonymous;

    public AppAuthStateProvider()
    {
        AuthenticationStateChanged += AppAuthStateProvider_AuthenticationStateChanged;
    }

    public string? Token { get; private set; }
    public LoggedInUser? CurrentUser { get; private set; }

    public bool IsLoggedIn => CurrentUser is not null;

    private async void AppAuthStateProvider_AuthenticationStateChanged(Task<AuthenticationState> task)
    {
        var authState = await task;
        if (authState.User.Identity?.IsAuthenticated == true)
        {
            var claims = authState.User.Claims.ToList();
            var nameClaim = claims.FirstOrDefault(c => c.Type == ClaimTypes.Name);
            var nameIdentifierClaim = claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);

            if (nameClaim != null)
            {
                await SecureStorage.SetAsync("userName", nameClaim.Value);
            }

            if (nameIdentifierClaim != null)
            {
                await SecureStorage.SetAsync("userLogin", nameIdentifierClaim.Value);
            }
        }
        else
        {
            SecureStorage.Remove("userName");
            SecureStorage.Remove("userLogin");
            SecureStorage.Remove(storageKey);
        }
    }

    public override Task<AuthenticationState> GetAuthenticationStateAsync()
    {
        var serializedLoginResponse = Preferences.Default.Get<string>(storageKey, string.Empty);

        if (!string.IsNullOrEmpty(serializedLoginResponse))
        {
            try
            {
                var loginResponse = JsonSerializer.Deserialize<AuthenticationResponse>(serializedLoginResponse);
                if (loginResponse != null)
                {
                    Login(loginResponse, saveToStorage: false);
                    return _currentAuthState;
                }
            }
            catch
            {
                // فشل في التحليل؛ تنظيف التخزين لتجنب محاولات متكررة خاطئة
                Preferences.Default.Remove(storageKey);
            }
        }
        return anonymous;
    }

    public void Login(AuthenticationResponse response, bool saveToStorage = true)
    {
        Token = response.Token;
        CurrentUser = new LoggedInUser(
            Id: int.TryParse(response.Id, out int id) ? id : 0,
            UserName: response.UserName,
            UserLogin: response.UserLogin,
            Email: response.Email
        );

        var identity = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, CurrentUser.Id.ToString()),
            new Claim(ClaimTypes.Name, CurrentUser.UserName),
            new Claim(ClaimTypes.Email, CurrentUser.Email),
            new Claim("UserLogin", CurrentUser.UserLogin)
        }, AuthType);

        var user = new ClaimsPrincipal(identity);
        var authState = Task.FromResult(new AuthenticationState(user));
        _currentAuthState = authState;
        NotifyAuthenticationStateChanged(authState);

        if (saveToStorage)
            Preferences.Default.Set<string>(storageKey, JsonSerializer.Serialize(response) ?? string.Empty);

    }


    public void Logout()
    {
        Token = null;
        CurrentUser = null;

        var identity = new ClaimsIdentity();
        var user = new ClaimsPrincipal(identity);
        var authState = Task.FromResult(new AuthenticationState(user));
        _currentAuthState = authState;
        NotifyAuthenticationStateChanged(authState);

        SecureStorage.Remove("userName");
        SecureStorage.Remove("userLogin");
        SecureStorage.Remove(storageKey);
    }
}
