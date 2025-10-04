
namespace Identity.API.Helpers
{
    public class LogActionArguments : ActionFilterAttribute
    {
        private readonly ILogger<LogActionArguments> _logger;
        private readonly IMediator _mediator;

        public LogActionArguments(ILogger<LogActionArguments> logger, IMediator mediator)
        {
            _logger = logger;
            _mediator = mediator;
        }
        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var controllerName = context.Controller.GetType().Name.Replace("Controller", "");
            var actionName = context.ActionDescriptor.RouteValues["action"];

            // Check if the user is authenticated
            bool isAuthenticated = context.HttpContext.User?.Identity?.IsAuthenticated ?? false;

            Guid? userAuthId = null;
            string userIdString = "Anonymous";

            if (isAuthenticated)
            {
                userIdString = GetInfoOfUser("sub", context);
                var authId = GetInfoOfUser("jti", context);

                _logger.LogDebug("Extracted claims - sub: {Sub}, jti: {Jti}", userIdString, authId);

                if (Guid.TryParse(authId, out Guid parsedAuthId))
                {
                    userAuthId = parsedAuthId;
                    _logger.LogDebug("Successfully parsed auth ID '{AuthId}' as GUID: {ParsedAuthId}", authId, parsedAuthId);
                }
                else if (authId != "Anonymous")
                {
                    _logger.LogWarning("Failed to parse auth ID '{AuthId}' as GUID", authId);
                }
            }
            else
            {
                _logger.LogDebug("User is not authenticated for action {ActionName} on controller {ControllerName}",
                    actionName, controllerName);
            }

            _logger.LogInformation("Executing action {ActionName} on controller {ControllerName}. Username: {Username}, Auth ID: {AuthId}",
                actionName, controllerName, userIdString, userAuthId?.ToString() ?? "Anonymous");

            // Create Audit Log
            try
            {
                //var auditLogCommand = new CreateAuditLogCommand
                //{
                //    EntityName = controllerName,
                //    EntityId = 0,
                //    Action = actionName ?? "Unknown",
                //    OldValues = string.Empty,
                //    NewValues = JsonConvert.SerializeObject(context.ActionArguments),
                //    IpAddress = context.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "N/A",
                //    UserAgent = context.HttpContext.Request.Headers["User-Agent"].FirstOrDefault() ?? "N/A",
                //    UserId = userAuthId,
                //};

                //await _mediator.Send(auditLogCommand);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Failed to create audit log for action {ActionName} on controller {ControllerName}", actionName, controllerName);
            }

            await base.OnActionExecutionAsync(context, next);
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            base.OnActionExecuting(context);
        }

        protected string GetInfoOfUser(string key, ActionExecutingContext context)
        {
            var userClaim = context.HttpContext.User?.FindFirst(key);
            if (userClaim == null)
            {
                _logger.LogWarning("Claim {ClaimType} not found in user token. User may not be properly authenticated.", key);
                return "Anonymous";
            }
            return userClaim.Value;
        }
    }
}
