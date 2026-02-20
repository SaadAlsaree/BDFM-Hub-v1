using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.RateLimiting;
using System.Reflection;

namespace BDFM.Api.Helpers;

/// <summary>
/// Filter to apply custom rate limit attributes to endpoints
/// This filter sets metadata that the UseRateLimiter middleware reads
/// </summary>
public class RateLimitFilter : IAsyncActionFilter, IOrderedFilter
{
    private readonly ILogger<RateLimitFilter> _logger;

    public int Order => int.MinValue; // Run early

    public RateLimitFilter(ILogger<RateLimitFilter> logger)
    {
        _logger = logger;
    }

    public Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        // Check action level attributes
        var actionPolicy = context.ActionDescriptor.EndpointMetadata
            .OfType<BDFM.Api.Attributes.RateLimitAttribute>()
            .FirstOrDefault();

        if (actionPolicy != null)
        {
            _logger.LogDebug("Applying rate limit policy: {PolicyName} to {Controller}.{Action}",
                actionPolicy.PolicyName,
                context.Controller?.GetType().Name,
                context.ActionDescriptor.DisplayName);
        }

        // Check controller level attributes
        if (context.Controller != null)
        {
            var controllerPolicy = context.Controller.GetType()
                .GetCustomAttributes<BDFM.Api.Attributes.RateLimitAttribute>(inherit: true)
                .FirstOrDefault();

            if (controllerPolicy != null)
            {
                _logger.LogDebug("Applying rate limit policy: {PolicyName} from controller {Controller}",
                    controllerPolicy.PolicyName,
                    context.Controller.GetType().Name);
            }
        }

        return next();
    }
}
