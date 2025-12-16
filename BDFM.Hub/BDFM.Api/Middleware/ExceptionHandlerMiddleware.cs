

namespace BDFM.API.Middleware
{
    public class ExceptionHandlerMiddleware
    {
        private readonly RequestDelegate _next;

        public ExceptionHandlerMiddleware(RequestDelegate next)
        {
            _next = next;
        }



        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await ConvertException(context, ex);
            }
        }

        private async Task ConvertException(HttpContext context, Exception exception)
        {
            // If response has already started, we cannot modify headers or status code
            if (context.Response.HasStarted)
            {
                Log.Error(exception, "An error occurred but response has already started. Exception: {ExceptionMessage}", exception.Message);
                return;
            }

            try
            {
                HttpStatusCode httpStatusCode = HttpStatusCode.InternalServerError;

                context.Response.ContentType = "application/json";

                var result = string.Empty;

                switch (exception)
                {
                    case ValidationException validationException:
                        httpStatusCode = HttpStatusCode.BadRequest;
                        result = System.Text.Json.JsonSerializer.Serialize(validationException.ValdationErrors);
                        break;
                    case BadRequestException badRequestException:
                        httpStatusCode = HttpStatusCode.BadRequest;
                        result = badRequestException.Message;
                        break;
                    case NotFoundException:
                        httpStatusCode = HttpStatusCode.NotFound;
                        break;
                    case Exception:
                        httpStatusCode = HttpStatusCode.BadRequest;
                        break;
                }

                // Double-check before setting status code in case response started between checks
                if (!context.Response.HasStarted)
                {
                    context.Response.StatusCode = (int)httpStatusCode;
                }

                if (result == string.Empty)
                {
                    result = System.Text.Json.JsonSerializer.Serialize(new { error = exception.Message });
                }

                // Only write if response hasn't started
                if (!context.Response.HasStarted)
                {
                    await context.Response.WriteAsync(result);
                }
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("response has already started") || ex.Message.Contains("Headers are read-only"))
            {
                // Response started during our processing, just log it
                Log.Error(exception, "An error occurred but response started during exception handling. Original Exception: {ExceptionMessage}", exception.Message);
            }
        }


    }
}