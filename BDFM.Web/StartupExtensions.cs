using BDFM.Web.Components;

namespace BDFM.Web;

public static class StartupExtensions
{

    public static WebApplication ConfigureServices(this WebApplicationBuilder builder)
    {


        builder.Services.AddApplictionService();
        builder.Services.AddInfrastructureServices(builder.Configuration);
        builder.Services.AddPersistenceServices(builder.Configuration);
        builder.Services.AddIdentityServices(builder.Configuration);

        // Add MudBlazor services
        builder.Services.AddMudServices();

        // Add services to the container.
        // For Blazor Server we need Razor Pages and Server Side Blazor
        builder.Services.AddRazorPages();
        builder.Services.AddServerSideBlazor();

        builder.Services.AddScoped<ThemeSettings>();


        // Add SignalR services
        builder.Services.AddSignalR(options =>
        {
            options.EnableDetailedErrors = builder.Environment.IsDevelopment();
            options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
            options.KeepAliveInterval = TimeSpan.FromSeconds(15);
        });

        builder.Services.AddScoped<LogActionArguments>();

        builder.Services.AddScoped<ILoggedInUserService, LoggedInUserService>();

        builder.Services.ConfigureHttpJsonOptions(options =>
        {
            options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        });

        builder.Services.AddLogging();
        builder.Services.AddHttpContextAccessor();

        return builder.Build();
    }



    public static WebApplication ConfigurePipeline(this WebApplication app)
    {

        if (app.Environment.IsDevelopment() | app.Environment.IsProduction())
        {
            app.UseExceptionHandler("/Error", createScopeForErrors: true);
            // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
            app.UseHsts();
        }

        app.UseHttpsRedirection();

        //app.UseRouting();

        app.UseAuthentication();

        app.UseCustomExceptionHandler();

        //app.UseCors("AllowSpecificOrigin");

        app.UseAuthorization();

        app.UseAntiforgery();

        app.MapStaticAssets();
        // Map API controllers
        app.MapControllers();


        app.MapHub<CorrespondenceHub>("/correspondenceHub");

        // Map Blazor SignalR hub and fallback to the host page
        app.MapBlazorHub();

        app.MapRazorComponents<App>();

        return app;
    }


}
