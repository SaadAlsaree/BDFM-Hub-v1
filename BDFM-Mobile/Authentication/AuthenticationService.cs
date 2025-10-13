using System.Net.Http.Json;

namespace BDFM_Mobile.Authentication;

public class AuthenticationService
{
    private readonly HttpClient _httpClient;
    private readonly IServiceProvider _serviceProvider;

    public AuthenticationService(IHttpClientFactory httpClientFactory, IServiceProvider serviceProvider)
    {
        _httpClient = httpClientFactory.CreateClient("client");
        _serviceProvider = serviceProvider;
    }

    /// <summary>
    /// Attempts to log in the user with the provided credentials.
    /// If successful, saves the authentication token to secure storage.
    /// </summary>
    /// <param name="request">The authentication request containing user login and password.</param>
    /// <returns>The authentication response if successful, otherwise null.</returns>
    public async Task<AuthenticationResponse?> LoginAsync(AuthenticationRequest request)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync("/api/auth/login", request);

            if (response.IsSuccessStatusCode)
            {
                var authResponse = await response.Content.ReadFromJsonAsync<AuthenticationResponse>();
                if (authResponse != null && authResponse.Success && !string.IsNullOrEmpty(authResponse.Token))
                {
                    // Save authentication data with proper error handling
                    try
                    {
                        await SaveAuthenticationDataAsync(authResponse);

                        // Notify authentication state changed
                        var authStateProvider = _serviceProvider.GetRequiredService<CustomAuthenticationStateProvider>();
                        authStateProvider.NotifyAuthenticationStateChanged();

                        return authResponse;
                    }
                    catch (Exception storageEx)
                    {
                        return new AuthenticationResponse
                        {
                            Success = false,
                            Message = $"فشل في حفظ بيانات المصادقة: {storageEx.Message}"
                        };
                    }
                }
                else
                {
                    return new AuthenticationResponse
                    {
                        Success = false,
                        Message = authResponse?.Message ?? "فشل في تسجيل الدخول. البيانات المُرجعة غير صحيحة."
                    };
                }
            }
            else
            {
                // Handle HTTP error status codes
                var errorContent = await response.Content.ReadAsStringAsync();
                return new AuthenticationResponse
                {
                    Success = false,
                    Message = $"خطأ في الخادم: {response.StatusCode}. {(!string.IsNullOrEmpty(errorContent) ? errorContent : "يرجى المحاولة مرة أخرى.")}"
                };
            }
        }
        catch (HttpRequestException httpEx)
        {
            return new AuthenticationResponse
            {
                Success = false,
                Message = $"خطأ في الاتصال بالخادم: {httpEx.Message}"
            };
        }
        catch (TaskCanceledException tcEx)
        {
            return new AuthenticationResponse
            {
                Success = false,
                Message = tcEx.InnerException is TimeoutException ? "انتهت مهلة الاتصال" : "تم إلغاء العملية"
            };
        }
        catch (Exception ex)
        {
            return new AuthenticationResponse
            {
                Success = false,
                Message = $"حدث خطأ غير متوقع: {ex.Message}"
            };
        }
    }

    /// <summary>
    /// Safely saves authentication data to secure storage
    /// </summary>
    private async Task SaveAuthenticationDataAsync(AuthenticationResponse authResponse)
    {
        // Validate and clean data before saving
        var token = !string.IsNullOrWhiteSpace(authResponse.Token) ? authResponse.Token.Trim() : string.Empty;
        var userName = !string.IsNullOrWhiteSpace(authResponse.UserName) ? authResponse.UserName.Trim() : string.Empty;
        var userLogin = !string.IsNullOrWhiteSpace(authResponse.UserLogin) ? authResponse.UserLogin.Trim() : string.Empty;
        var email = !string.IsNullOrWhiteSpace(authResponse.Email) ? authResponse.Email.Trim() : string.Empty;
        var id = !string.IsNullOrWhiteSpace(authResponse.Id) ? authResponse.Id.Trim() : string.Empty;

        // Save each item individually with try-catch for better error isolation
        var saveOperations = new[]
        {
            ("authToken", token),
            ("userName", userName),
            ("userLogin", userLogin),
            ("email", email),
            ("id", id)
        };

        foreach (var (key, value) in saveOperations)
        {
            try
            {
                if (!string.IsNullOrEmpty(value))
                {
                    await SecureStorage.SetAsync(key, value);
                }
                else
                {
                    // Remove key if value is empty to avoid storage issues
                    SecureStorage.Remove(key);
                }
            }
            catch (Exception ex)
            {
                // Log individual storage failure but continue with others
                System.Diagnostics.Debug.WriteLine($"Failed to save {key}: {ex.Message}");

                // For critical token, re-throw the exception
                if (key == "authToken")
                {
                    throw new InvalidOperationException($"فشل في حفظ رمز المصادقة: {ex.Message}", ex);
                }
            }
        }
    }

    /// <summary>
    /// Logs out the user by removing the token from secure storage.
    /// </summary>
    public Task LogoutAsync()
    {
        try
        {
            // Remove all stored authentication data safely
            var keysToRemove = new[] { "authToken", "userName", "userLogin", "email", "id" };

            foreach (var key in keysToRemove)
            {
                try
                {
                    SecureStorage.Remove(key);
                }
                catch (Exception ex)
                {
                    // Log individual removal failure but continue
                    System.Diagnostics.Debug.WriteLine($"Failed to remove {key}: {ex.Message}");
                }
            }

            // Notify authentication state changed
            var authStateProvider = _serviceProvider.GetRequiredService<CustomAuthenticationStateProvider>();
            authStateProvider.NotifyAuthenticationStateChanged();
        }
        catch (Exception)
        {
            // Silently fail for logout - but still notify state change
            try
            {
                var authStateProvider = _serviceProvider.GetRequiredService<CustomAuthenticationStateProvider>();
                authStateProvider.NotifyAuthenticationStateChanged();
            }
            catch
            {
                // Complete silent failure
            }
        }
        return Task.CompletedTask;
    }

    /// <summary>
    /// Checks if the user is currently authenticated by verifying the presence of a token.
    /// </summary>
    /// <returns>True if a token exists in secure storage, otherwise false.</returns>
    public async Task<bool> IsAuthenticatedAsync()
    {
        try
        {
            var token = await SecureStorage.GetAsync("authToken");
            return !string.IsNullOrEmpty(token);
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Get User Session.
    /// </summary>
    /// <returns>The authentication token if it exists, otherwise null.</returns>
    public async Task<AuthenticationResponse?> GetUserSessionAsync()
    {
        AuthenticationResponse? authResponse = new AuthenticationResponse();
        try
        {
            var token = await SecureStorage.GetAsync("authToken");
            if (!string.IsNullOrEmpty(token))
            {
                authResponse.Token = token;
                authResponse.Success = true;
                return authResponse;
            }
            else
            {
                authResponse.Success = false;
                authResponse.Message = "No active session found.";
                return null;
            }
        }
        catch (Exception ex)
        {
            authResponse.Success = false;
            authResponse.Message = $"An error occurred while retrieving the session: {ex.Message}";
            return null;
        }
    }
}
