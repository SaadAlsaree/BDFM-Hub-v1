using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using BDFM.Application.Models;

namespace BDFM.API.Helpers
{
    /// <summary>
    /// Base controller class providing common functionality for all API controllers
    /// </summary>
    /// <typeparam name="T">The controller type</typeparam>
    [Microsoft.AspNetCore.Authorization.Authorize]
    public abstract class Base<T> : ControllerBase where T : Base<T>
    {
        private readonly ILogger<T> _logger;

        protected Base(ILogger<T> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Extracts user information from JWT claims or Authorization header
        /// </summary>
        /// <param name="key">The claim key to extract</param>
        /// <returns>The claim value or null if not found</returns>
        protected string? GetInfoOfUser(string key)
        {
            try
            {
                string userId = string.Empty;

                // Try to get from Authorization header first (JWT token)
                if (AuthenticationHeaderValue.TryParse(Request.Headers["Authorization"], out AuthenticationHeaderValue? authenticationHeaderValue))
                {
                    if (authenticationHeaderValue?.Scheme.ToLower() == "bearer" && authenticationHeaderValue.Parameter != null)
                    {
                        var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                        var tokenOfUser = handler.ReadToken(authenticationHeaderValue.Parameter) as System.IdentityModel.Tokens.Jwt.JwtSecurityToken;

                        if (tokenOfUser != null && tokenOfUser.Claims.Any())
                        {
                            userId = tokenOfUser.Claims.SingleOrDefault(x => x.Type == key)?.Value!;
                        }
                    }
                }
                // Fallback to HttpContext.User claims
                else
                {
                    userId = User.Claims.FirstOrDefault(x => x.Type == key)?.Value!;
                }

                return userId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extracting user info for key: {Key}", key);
                return null;
            }
        }

        /// <summary>
        /// Executes a mediator request and returns a standardized API response
        /// with proper error handling and logging
        /// </summary>
        /// <typeparam name="TRequest">The response type</typeparam>
        /// <param name="func">The function to execute</param>
        /// <returns>An ObjectResult with standardized response format</returns>
        protected async Task<ObjectResult> Okey<TRequest>(Func<Task<Response<TRequest>>> func)
        {
            try
            {
                var action = new
                {
                    ControllerName = Request.RouteValues["controller"],
                    ActionName = Request.RouteValues["action"],
                    UserId = GetInfoOfUser("sub"),
                    Timestamp = DateTime.UtcNow
                };

                var result = await func();

                _logger.LogTrace("Response | Action: {Action} | Response: {Response}",
                    JsonConvert.SerializeObject(action),
                    JsonConvert.SerializeObject(new { result.Succeeded, result.Message, result.Code }));

                if (result.Succeeded)
                {
                    return Ok(result);
                }
                else
                {
                    return BadRequest(result);
                }
            }
            catch (FluentValidation.ValidationException ex)
            {
                // Handle validation errors separately
                _logger.LogWarning(ex, "Validation error for user: {UserId}", GetInfoOfUser("sub"));

                var errors = ex.Errors.Select(e => new
                {
                    Property = e.PropertyName,
                    Error = e.ErrorMessage
                }).Cast<object>().ToList();

                return StatusCode(StatusCodes.Status400BadRequest,
                    new Response<TRequest>
                    {
                        Succeeded = false,
                        Message = "Validation failed. Please check your input.",
                        Code = "ERR400",
                        Data = default!,
                        Errors = errors
                    });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt by user: {UserId}", GetInfoOfUser("sub"));

                return StatusCode(StatusCodes.Status403Forbidden,
                    new Response<TRequest>
                    {
                        Succeeded = false,
                        Message = "You do not have permission to perform this action.",
                        Code = "ERR403",
                        Data = default!,
                        Errors = new List<object> { new { message = ex.Message } }
                    });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Resource not found requested by user: {UserId}", GetInfoOfUser("sub"));

                return StatusCode(StatusCodes.Status404NotFound,
                    new Response<TRequest>
                    {
                        Succeeded = false,
                        Message = "The requested resource was not found.",
                        Code = "ERR404",
                        Data = default!,
                        Errors = new List<object> { new { message = ex.Message } }
                    });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument provided by user: {UserId}", GetInfoOfUser("sub"));

                return StatusCode(StatusCodes.Status400BadRequest,
                    new Response<TRequest>
                    {
                        Succeeded = false,
                        Message = "Invalid request parameters.",
                        Code = "ERR400",
                        Data = default!,
                        Errors = new List<object> { new { message = ex.Message } }
                    });
            }
            catch (Exception ex)
            {
                // SECURITY FIX: Do not expose internal details to client
                _logger.LogError(ex, "Unhandled exception for user: {UserId} | Controller: {Controller} | Action: {Action}",
                    GetInfoOfUser("sub"),
                    Request.RouteValues["controller"],
                    Request.RouteValues["action"]);

                // Return generic error message without stack traces or internal details
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new Response<TRequest>
                    {
                        Succeeded = false,
                        Message = "An error occurred while processing your request. Please try again later or contact support if the issue persists.",
                        Code = "ERR500",
                        Data = default!,
                        Errors = new List<object>()
                    });
            }
        }

        /// <summary>
        /// Validates file upload for security threats
        /// </summary>
        /// <param name="file">The file to validate</param>
        /// <returns>Tuple indicating if valid and error message if invalid</returns>
        protected (bool isValid, string? error) ValidateFileUpload(IFormFile? file)
        {
            if (file == null || file.Length == 0)
            {
                return (false, "No file provided or file is empty.");
            }

            // File size limit: 10MB
            const long maxFileSize = 10 * 1024 * 1024;
            if (file.Length > maxFileSize)
            {
                return (false, $"File size exceeds maximum allowed size of {maxFileSize / (1024 * 1024)}MB.");
            }

            // Allowed file extensions
            var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png", ".gif", ".txt" };
            var extension = System.IO.Path.GetExtension(file.FileName).ToLowerInvariant();

            if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
            {
                return (false, $"Invalid file type. Allowed types: {string.Join(", ", allowedExtensions)}");
            }

            // Validate MIME type matches extension
            var allowedMimeTypes = new Dictionary<string, string[]>
            {
                { ".pdf", new[] { "application/pdf" } },
                { ".doc", new[] { "application/msword" } },
                { ".docx", new[] { "application/vnd.openxmlformats-officedocument.wordprocessingml.document" } },
                { ".xls", new[] { "application/vnd.ms-excel" } },
                { ".xlsx", new[] { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" } },
                { ".jpg", new[] { "image/jpeg" } },
                { ".jpeg", new[] { "image/jpeg" } },
                { ".png", new[] { "image/png" } },
                { ".gif", new[] { "image/gif" } },
                { ".txt", new[] { "text/plain" } }
            };

            if (allowedMimeTypes.TryGetValue(extension, out var allowedMimes))
            {
                if (!allowedMimes.Contains(file.ContentType.ToLowerInvariant()))
                {
                    return (false, $"File content type {file.ContentType} does not match extension {extension}.");
                }
            }

            // Check for malicious file names
            var fileName = System.IO.Path.GetFileNameWithoutExtension(file.FileName);
            var dangerousPatterns = new[] { "..", "\\", "/", "<", ">", ":", "*", "?", "\"", "|", "\0" };
            if (dangerousPatterns.Any(pattern => fileName.Contains(pattern, StringComparison.OrdinalIgnoreCase)))
            {
                return (false, "File name contains invalid characters.");
            }

            return (true, null);
        }

        /// <summary>
        /// Sanitizes string input to prevent XSS attacks
        /// </summary>
        /// <param name="input">The input string to sanitize</param>
        /// <returns>Sanitized string</returns>
        protected string SanitizeInput(string? input)
        {
            if (string.IsNullOrEmpty(input))
                return input ?? string.Empty;

            // Remove potentially dangerous patterns
            var sanitized = input
                .Replace("<script>", string.Empty, StringComparison.OrdinalIgnoreCase)
                .Replace("</script>", string.Empty, StringComparison.OrdinalIgnoreCase)
                .Replace("javascript:", string.Empty, StringComparison.OrdinalIgnoreCase)
                .Replace("onerror=", string.Empty, StringComparison.OrdinalIgnoreCase)
                .Replace("onload=", string.Empty, StringComparison.OrdinalIgnoreCase)
                .Replace("onclick=", string.Empty, StringComparison.OrdinalIgnoreCase)
                .Replace("onmouseover=", string.Empty, StringComparison.OrdinalIgnoreCase)
                .Replace("onfocus=", string.Empty, StringComparison.OrdinalIgnoreCase)
                .Replace("onblur=", string.Empty, StringComparison.OrdinalIgnoreCase)
                .Replace("onkeydown=", string.Empty, StringComparison.OrdinalIgnoreCase)
                .Replace("onkeyup=", string.Empty, StringComparison.OrdinalIgnoreCase)
                .Replace("onkeypress=", string.Empty, StringComparison.OrdinalIgnoreCase);

            return sanitized;
        }
    }
}
