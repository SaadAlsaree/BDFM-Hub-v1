namespace BDFM.Api.Middleware;

public class ApiKeyMiddleware
{
    private readonly RequestDelegate _next;
    // اسم الترويسة التي سنرسل فيها المفتاح
    private const string APIKEYNAME = "X-Api-Key";

    public ApiKeyMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IConfiguration appSettings)
    {
        // التحقق مما إذا كان الطلب يحتوي على الترويسة
        if (!context.Request.Headers.TryGetValue(APIKEYNAME, out var extractedApiKey))
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("API Key was not provided.");
            return;
        }

        // جلب المفتاح السري الحقيقي من إعدادات الباكيند
        var apiKey = appSettings.GetValue<string>("FrontendApiKey");

        // مقارنة المفتاح المرسل بالمفتاح الحقيقي
        if (!apiKey.Equals(extractedApiKey))
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("Unauthorized client.");
            return;
        }

        // إذا كان المفتاح صحيحاً، يمر الطلب إلى المرحلة التالية
        await _next(context);
    }
}