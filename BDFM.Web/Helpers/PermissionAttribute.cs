namespace BDFM.Web.Helpers;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
public class PermissionAttribute : Attribute, IAuthorizationFilter
{
    private readonly string MetaPermission;
    private string PermissionName;

    public PermissionAttribute(string metaPermission = null!)
    {
        MetaPermission = metaPermission;
    }
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var actionName = context.RouteData.Values["action"]!.ToString();
        var controllerName = context.RouteData.Values["controller"]!.ToString();

        PermissionName = $"{controllerName}|{actionName}";

        if (MetaPermission is not null)
            PermissionName += $"|{MetaPermission}";

        var userPermissions = context.HttpContext.User.Claims
            .Where(c => c.Type == "Permission")
            .Select(c => c.Value)
            .ToList();
        if (userPermissions.Any(x => x == PermissionName))
        {
            context.Result = new ForbidResult();
        }
    }
}