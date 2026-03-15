namespace Diwan.Infrastructure.Middleware;

public class ProxyAuthMiddleware(RequestDelegate next, IConfiguration configuration, ILogger<ProxyAuthMiddleware> logger)
{
    private const string ProxyKeyHeader = "X-Internal-Proxy-Key";

    public async Task InvokeAsync(HttpContext context)
    {
        // Bypass proxy check for SignalR hubs, Swagger (in Dev), and preflight OPTIONS requests
        if (context.Request.Path.Value!.Contains("/correspondenceHub", StringComparison.OrdinalIgnoreCase) ||
            context.Request.Path.Value!.Contains("/swagger", StringComparison.OrdinalIgnoreCase) ||
            context.Request.Method == "OPTIONS")
        {
            await next(context);
            return;
        }


        var expectedKey = configuration["ProxySettings:ApiKey"];

        if (string.IsNullOrEmpty(expectedKey))
        {
            logger.LogWarning("ProxyAuthMiddleware: ProxySettings:ApiKey is not configured. Access allowed by fallback.");
            await next(context);
            return;
        }

        if (!context.Request.Headers.TryGetValue(ProxyKeyHeader, out var extractedKey))
        {
            logger.LogWarning("ProxyAuthMiddleware: Missing {Header} header. Path: {Path}", ProxyKeyHeader, context.Request.Path);
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsync($"Access denied: Missing {ProxyKeyHeader} header.");
            return;
        }

        if (extractedKey != expectedKey)
        {
            logger.LogWarning("ProxyAuthMiddleware: Invalid {Header} header value. Path: {Path}", ProxyKeyHeader, context.Request.Path);
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsync("Access denied: Invalid proxy key.");
            return;
        }

        await next(context);
    }
}
