namespace BDFM.Web.Middleware
{
    public static class MiddlewareExtensions
    {
        public static IApplicationBuilder UseCustomExceptionHandler(this IApplicationBuilder builder)
        {
            builder.UseMiddleware<ExceptionHandlerMiddleware>();
            builder.UseMiddleware<AntiXssMiddleware>();

            return builder;
        }
    }
}
