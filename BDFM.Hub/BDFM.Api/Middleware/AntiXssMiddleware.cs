using BDFM.Api.Attributes;
using Microsoft.AspNetCore.Mvc.Controllers;
using System.Net;
using System.Text;
using Newtonsoft.Json;

namespace BDFM.API.Middleware
{

    public class AntiXssMiddleware
    {
        private readonly RequestDelegate _next;
        private ErrorResponse _error;
        private readonly int _statusCode = (int)HttpStatusCode.BadRequest;

        public AntiXssMiddleware(RequestDelegate next)
        {
            _next = next ?? throw new ArgumentNullException(nameof(next));
        }

        public async Task Invoke(HttpContext context)
        {
            // Skip XSS validation for file upload endpoints or multipart form data
            if (IsFileUploadRequest(context))
            {
                await _next(context).ConfigureAwait(false);
                return;
            }

            // Check XSS in URL
            if (!string.IsNullOrWhiteSpace(context.Request.Path.Value))
            {
                var url = context.Request.Path.Value;

                if (CrossSiteScriptingValidation.IsDangerousString(url, out _))
                {
                    await RespondWithAnError(context).ConfigureAwait(false);
                    return;
                }
            }

            // Check XSS in query string
            if (!string.IsNullOrWhiteSpace(context.Request.QueryString.Value))
            {
                var queryString = WebUtility.UrlDecode(context.Request.QueryString.Value);

                if (CrossSiteScriptingValidation.IsDangerousString(queryString, out _))
                {
                    await RespondWithAnError(context).ConfigureAwait(false);
                    return;
                }
            }

            // Check XSS in request content
            var originalBody = context.Request.Body;
            try
            {
                var content = await ReadRequestBody(context);

                if (CrossSiteScriptingValidation.IsDangerousString(content, out _))
                {
                    await RespondWithAnError(context).ConfigureAwait(false);
                    return;
                }
                await _next(context).ConfigureAwait(false);
            }
            finally
            {
                context.Request.Body = originalBody;
            }
        }

        private static async Task<string> ReadRequestBody(HttpContext context)
        {
            var buffer = new MemoryStream();
            await context.Request.Body.CopyToAsync(buffer);
            context.Request.Body = buffer;
            buffer.Position = 0;

            var encoding = Encoding.UTF8;

            var requestContent = await new StreamReader(buffer, encoding).ReadToEndAsync();
            context.Request.Body.Position = 0;

            return requestContent;
        }

        private async Task RespondWithAnError(HttpContext context)
        {
            context.Response.Clear();
            context.Response.Headers.AddHeaders();
            context.Response.ContentType = "application/json; charset=utf-8";
            context.Response.StatusCode = _statusCode;

            if (_error == null)
            {
                _error = new ErrorResponse
                {
                    Description = "Error from Anti Xss Middleware",
                    Message = "https://c.tenor.com/IWlyeP1ut98AAAAC/social-distancing-fuck-off-bitch.gif",
                    ErrorCode = 500
                };
            }

            await context.Response.WriteAsync(_error.ToJSON());
        }

        private static bool IsFileUploadRequest(HttpContext context)
        {
            // Check if the endpoint has SkipAntiXssValidationAttribute
            var endpoint = context.GetEndpoint();
            if (endpoint?.Metadata.GetMetadata<SkipAntiXssValidationAttribute>() != null)
            {
                return true;
            }

            // Check if the controller has SkipAntiXssValidationAttribute
            if (endpoint?.Metadata.GetMetadata<ControllerActionDescriptor>() is ControllerActionDescriptor actionDescriptor)
            {
                // Check action method
                if (actionDescriptor.MethodInfo.GetCustomAttributes(typeof(SkipAntiXssValidationAttribute), false).Any())
                {
                    return true;
                }

                // Check controller class
                if (actionDescriptor.ControllerTypeInfo.GetCustomAttributes(typeof(SkipAntiXssValidationAttribute), false).Any())
                {
                    return true;
                }
            }

            // Skip validation for multipart/form-data content type (file uploads)
            if (context.Request.ContentType?.StartsWith("multipart/form-data", StringComparison.OrdinalIgnoreCase) == true)
            {
                return true;
            }

            // Skip validation for specific file upload endpoints
            var path = context.Request.Path.Value?.ToLowerInvariant();
            if (path != null && (
                path.Contains("/attachment") ||
                path.Contains("/upload") ||
                path.Contains("/file")))
            {
                return true;
            }

            return false;
        }
    }

    public static class AntiXssMiddlewareExtension
    {
        public static IApplicationBuilder UseAntiXssMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<AntiXssMiddleware>();
        }
    }
    public static class CrossSiteScriptingValidation
    {
        private static readonly char[] StartingChars = { '<', '&' };

        #region Public methods

        public static bool IsDangerousString(string s, out int matchIndex)
        {
            //bool inComment = false;
            matchIndex = 0;

            // Skip validation for content that looks like Base64 encoded data
            if (IsLikelyBase64Content(s))
            {
                return false;
            }

            // Skip validation for multipart form data boundaries
            if (IsMultipartBoundary(s))
            {
                return false;
            }

            for (var i = 0; ;)
            {

                // Look for the start of one of our patterns 
                var n = s.IndexOfAny(StartingChars, i);

                // If not found, the string is safe
                if (n < 0) return false;

                // If it's the last char, it's safe 
                if (n == s.Length - 1) return false;

                matchIndex = n;

                switch (s[n])
                {
                    case '<':
                        // If the < is followed by a letter or '!', it's unsafe (looks like a tag or HTML comment)
                        if (IsAtoZ(s[n + 1]) || s[n + 1] == '!' || s[n + 1] == '/' || s[n + 1] == '?') return true;
                        break;
                    case '&':
                        // If the & is followed by a #, it's unsafe (e.g. S) 
                        if (s[n + 1] == '#') return true;
                        break;

                }

                // Continue searching
                i = n + 1;
            }
        }

        #endregion

        #region Private methods

        private static bool IsAtoZ(char c)
        {
            return c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z';
        }

        private static bool IsLikelyBase64Content(string content)
        {
            // Check if content looks like Base64 (high ratio of valid Base64 characters)
            if (string.IsNullOrEmpty(content) || content.Length < 100) // Skip short strings
                return false;

            const string base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            int validBase64Count = content.Count(c => base64Chars.Contains(c));
            double ratio = (double)validBase64Count / content.Length;

            // If more than 80% of characters are valid Base64 characters, consider it Base64 content
            return ratio > 0.8;
        }

        private static bool IsMultipartBoundary(string content)
        {
            // Check for multipart form data patterns
            return content.Contains("Content-Disposition: form-data") ||
                   content.Contains("boundary=") ||
                   content.Contains("Content-Type: multipart/form-data");
        }

        #endregion

        public static void AddHeaders(this IHeaderDictionary headers)
        {
            if (headers["P3P"].IsNullOrEmpty())
            {
                headers.Append("P3P", "CP=\"IDC DSP COR ADM DEVi TAIi PSA PSD IVAi IVDi CONi HIS OUR IND CNT\"");
            }
        }

        public static bool IsNullOrEmpty<T>(this IEnumerable<T> source)
        {
            return source == null || !source.Any();
        }
        public static string ToJSON(this object value)
        {
            return JsonConvert.SerializeObject(value);
        }
    }

    public class ErrorResponse
    {
        public int ErrorCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}
