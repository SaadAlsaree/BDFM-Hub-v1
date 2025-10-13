
using System.Net.Http.Headers;

namespace BDFM_Mobile.Extensions;

public static class HttpClientExtensions
{
    /// <summary>
    /// Adds a Bearer authorization header to the HttpClient using a token retrieved from secure storage.
    /// </summary>
    /// <param name="client">The HttpClient instance to configure.</param>
    /// <param name="key">The key used to retrieve the token from secure storage. Defaults to "authToken".</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    public static async Task AddBearerTokenFromSecureStorageAsync(this HttpClient client, string key = "authToken")
    {
        try
        {
            var token = await SecureStorage.GetAsync(key);
            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            }
        }
        catch (Exception)
        {
            // Log the exception or handle it as needed. For now, silently fail to avoid breaking the app.
            // In a production app, consider logging this.
        }
    }
}
