using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace BDFM.Api.Attributes;

/// <summary>
/// Attribute to apply rate limiting to controllers or actions
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public class RateLimitAttribute : Attribute
{
    /// <summary>
    /// The name of the rate limit policy to apply
    /// </summary>
    public string PolicyName { get; }

    /// <summary>
    /// Creates a new RateLimitAttribute with the specified policy name
    /// </summary>
    /// <param name="policyName">The name of the rate limit policy (e.g., "fixed", "per-user")</param>
    public RateLimitAttribute(string policyName = "per-user")
    {
        PolicyName = policyName;
    }
}

/// <summary>
/// Attribute to apply fixed window rate limiting (strict rate limiting)
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class FixedWindowRateLimitAttribute : RateLimitAttribute
{
    public FixedWindowRateLimitAttribute()
        : base("fixed")
    {
    }
}

/// <summary>
/// Attribute to apply per-user rate limiting (allows higher limits for authenticated users)
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class PerUserRateLimitAttribute : RateLimitAttribute
{
    public PerUserRateLimitAttribute()
        : base("per-user")
    {
    }
}

/// <summary>
/// Attribute to disable rate limiting for specific endpoints (use sparingly)
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class DisableRateLimitAttribute : Attribute
{
}
