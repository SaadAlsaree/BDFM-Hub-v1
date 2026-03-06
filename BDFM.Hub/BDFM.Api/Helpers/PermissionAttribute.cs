namespace BDFM.API.Helpers;

/// <summary>
/// Permission-based authorization attribute that checks user permissions before allowing access
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
public class PermissionAttribute : Attribute, IAuthorizationFilter
{
    private readonly string? _metaPermission;
    private string _permissionName = string.Empty;

    public PermissionAttribute(string? metaPermission = null)
    {
        _metaPermission = metaPermission;
    }

    public void OnAuthorization(AuthorizationFilterContext context)
    {
        // Skip authorization if endpoint allows anonymous access
        var allowAnonymous = context.ActionDescriptor.EndpointMetadata
            .Any(m => m is Microsoft.AspNetCore.Authorization.AllowAnonymousAttribute);
        if (allowAnonymous)
        {
            return;
        }

        // Check if user is authenticated
        if (!context.HttpContext.User.Identity?.IsAuthenticated ?? true)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var actionName = context.RouteData.Values["action"]?.ToString();
        var controllerName = context.RouteData.Values["controller"]?.ToString();

        // Build permission name: "Controller|Action" or "Controller|Action|MetaPermission"
        _permissionName = $"{controllerName}|{actionName}";

        if (_metaPermission is not null)
        {
            _permissionName += $"|{_metaPermission}";
        }

        // Get user permissions from JWT claims
        var userPermissions = context.HttpContext.User.Claims
            .Where(c => c.Type == "Permission")
            .Select(c => c.Value)
            .ToList();

        // SECURITY FIX: Check if user DOES NOT have permission (inverted logic fixed)
        if (!userPermissions.Any(x => x == _permissionName))
        {
            context.Result = new ForbidResult();
            return;
        }

        // User has permission, allow access
        // (Don't set context.Result, allowing request to proceed)
    }
}
