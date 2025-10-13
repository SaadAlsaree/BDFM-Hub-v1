using Microsoft.JSInterop;
using System.Text.Json;

namespace BDFM_Mobile.Services;

public class ThemeSettings
{
    private readonly IJSRuntime _jsRuntime;
    private const string SETTINGS_KEY = "app-settings";

    public ThemeSettings(IJSRuntime jsRuntime)
    {
        _jsRuntime = jsRuntime;
    }

    public async Task<AppSettings> LoadSettingsAsync()
    {
        try
        {
            var json = await _jsRuntime.InvokeAsync<string>("localStorage.getItem", SETTINGS_KEY);
            if (!string.IsNullOrEmpty(json))
            {
                return JsonSerializer.Deserialize<AppSettings>(json) ?? new AppSettings();
            }
        }
        catch (Exception)
        {
            // If there's an error loading settings, return defaults
        }
        return new AppSettings();
    }

    public async Task SaveSettingsAsync(AppSettings settings)
    {
        try
        {
            var json = JsonSerializer.Serialize(settings);
            await _jsRuntime.InvokeVoidAsync("localStorage.setItem", SETTINGS_KEY, json);
        }
        catch (Exception)
        {
            // Handle save errors silently
        }
    }
}

public class AppSettings
{
    public bool IsDarkMode { get; set; }
    public bool RightToLeft { get; set; } = true;
}