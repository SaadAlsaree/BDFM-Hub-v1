using BDFM_Mobile.Authentication;
using BDFM_Mobile.Services;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.Extensions.Logging;
using MudBlazor.Services;

namespace BDFM_Mobile
{
    public static class MauiProgram
    {
        public static MauiApp CreateMauiApp()
        {
            var builder = MauiApp.CreateBuilder();
            builder
                .UseMauiApp<App>()
                .ConfigureFonts(fonts =>
                {
                    fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                });

            builder.Services.AddMudServices();
            builder.Services.AddMauiBlazorWebView();
            builder.Services.AddHttpClient("client", httpClient =>
            {
                httpClient.BaseAddress = new Uri("http://192.168.100.31:5000");
                httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
                httpClient.Timeout = TimeSpan.FromSeconds(30); // Set a timeout if needed

            });

            builder.Services.AddScoped<AuthenticationService>();
            builder.Services.AddScoped<CustomAuthenticationStateProvider>();
            builder.Services.AddScoped<AuthenticationStateProvider>(provider => provider.GetRequiredService<CustomAuthenticationStateProvider>());

            // Add Authorization services
            builder.Services.AddAuthorizationCore();

            builder.Services.AddScoped<ThemeSettings>();

#if DEBUG
            builder.Services.AddBlazorWebViewDeveloperTools();
            builder.Logging.AddDebug();
#endif

            return builder.Build();
        }
    }
}
