using BDFM.Application.Contracts.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace BDFM.Application.Hubs
{
    [Authorize]
    public class CorrespondenceHub : Hub
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly ILogger<CorrespondenceHub> _logger;

        public CorrespondenceHub(ICurrentUserService currentUserService, ILogger<CorrespondenceHub> logger)
        {
            _currentUserService = currentUserService;
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            try
            {
                // Enhanced debugging for authentication status
                var isAuthenticated = _currentUserService.IsAuthenticated;
                var contextUser = Context.User;
                var contextUserIdentity = Context.User?.Identity;
                var contextIsAuthenticated = Context.User?.Identity?.IsAuthenticated ?? false;

                _logger.LogInformation("SignalR Connection Debug - CurrentUserService.IsAuthenticated: {CurrentUserIsAuth}, Context.User.Identity.IsAuthenticated: {ContextIsAuth}, User: {User}",
                    isAuthenticated, contextIsAuthenticated, contextUser?.Identity?.Name ?? "null");

                // Try to get user info from SignalR context if CurrentUserService fails
                Guid? userId = null;
                string? userName = null;
                Guid? userOrganizationalUnitId = null;

                if (isAuthenticated)
                {
                    // Use CurrentUserService
                    try
                    {
                        userId = _currentUserService.UserId;
                        userName = _currentUserService.UserName ?? "Unknown";
                        userOrganizationalUnitId = _currentUserService.OrganizationalUnitId;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error getting user info from CurrentUserService");
                    }
                }
                else if (contextIsAuthenticated && Context.User != null)
                {
                    // Fallback to SignalR context
                    try
                    {
                        var uidClaim = Context.User.FindFirst("uid")?.Value;
                        var subClaim = Context.User.FindFirst("sub")?.Value;
                        var orgUnitClaim = Context.User.FindFirst("org_unit_id")?.Value;

                        if (!string.IsNullOrEmpty(uidClaim) && Guid.TryParse(uidClaim, out var parsedUserId))
                        {
                            userId = parsedUserId;
                            userName = subClaim ?? "Unknown";

                            if (!string.IsNullOrEmpty(orgUnitClaim) && Guid.TryParse(orgUnitClaim, out var parsedOrgUnit))
                            {
                                userOrganizationalUnitId = parsedOrgUnit;
                            }

                            _logger.LogInformation("Using SignalR context for authentication - UserId: {UserId}, UserName: {UserName}, OrgUnit: {OrgUnit}",
                                userId, userName, userOrganizationalUnitId);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error extracting user info from SignalR context");
                    }
                }

                if (userId.HasValue)
                {
                    // Handle authenticated user
                    _logger.LogInformation("Authenticated user connecting: {UserName} ({UserId}), OrgUnit: {OrganizationalUnitId}",
                        userName, userId, userOrganizationalUnitId);

                    // Add user to their personal group for targeted notifications
                    await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
                    _logger.LogInformation("✅ Added user {UserName} ({UserId}) to personal group User_{UserId}",
                        userName, userId, userId);

                    // Add user to general correspondence updates group
                    await Groups.AddToGroupAsync(Context.ConnectionId, "CorrespondenceUpdates");
                    _logger.LogDebug("✅ Added user {UserName} ({UserId}) to general updates group",
                        userName, userId);

                    // Add user to their organizational unit (module) group if they have one
                    if (userOrganizationalUnitId.HasValue)
                    {
                        await Groups.AddToGroupAsync(Context.ConnectionId, $"Module_{userOrganizationalUnitId.Value}");
                        _logger.LogInformation("✅ User {UserName} ({UserId}) added to module group Module_{OrganizationalUnitId}",
                            userName, userId, userOrganizationalUnitId.Value);
                    }
                    else
                    {
                        _logger.LogWarning("⚠️ User {UserName} ({UserId}) has no organizational unit - not added to any module group",
                            userName, userId);
                    }

                    _logger.LogInformation("🔔 Authenticated user {UserName} ({UserId}) successfully connected to CorrespondenceHub with connection {ConnectionId}. Groups: User_{UserId}, CorrespondenceUpdates{ModuleGroup}",
                        userName, userId, Context.ConnectionId, userId,
                        userOrganizationalUnitId.HasValue ? $", Module_{userOrganizationalUnitId.Value}" : "");
                }
                else
                {
                    // Handle unauthenticated user (should not happen with [Authorize])
                    _logger.LogWarning("❌ Unauthenticated user connected to CorrespondenceHub with connection {ConnectionId} - this should not happen with [Authorize]",
                        Context.ConnectionId);

                    // Still add to general group to receive public notifications
                    await Groups.AddToGroupAsync(Context.ConnectionId, "CorrespondenceUpdates");
                }

                await base.OnConnectedAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error during SignalR connection for connection {ConnectionId}", Context.ConnectionId);

                // Send error info to client for debugging
                await Clients.Caller.SendAsync("ConnectionError", new
                {
                    Error = ex.Message,
                    IsAuthenticated = _currentUserService.IsAuthenticated,
                    ContextIsAuthenticated = Context.User?.Identity?.IsAuthenticated ?? false,
                    ConnectionId = Context.ConnectionId
                });

                // Don't throw - allow connection to continue
            }
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            try
            {
                if (_currentUserService.IsAuthenticated)
                {
                    var userName = _currentUserService.UserName ?? "Unknown";
                    var userId = _currentUserService.UserId;

                    _logger.LogInformation("Authenticated user {UserName} ({UserId}) disconnected from CorrespondenceHub with connection {ConnectionId}",
                        userName, userId, Context.ConnectionId);
                }
                else
                {
                    _logger.LogInformation("Unauthenticated user disconnected from CorrespondenceHub with connection {ConnectionId}",
                        Context.ConnectionId);
                }

                await base.OnDisconnectedAsync(exception);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during SignalR disconnection for connection {ConnectionId}", Context.ConnectionId);
            }
        }

        // Optional: Method for clients to join specific correspondence groups if needed
        public async Task JoinCorrespondenceGroup(string correspondenceId)
        {
            try
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"Correspondence_{correspondenceId}");
                _logger.LogInformation("Connection {ConnectionId} joined correspondence group {CorrespondenceId}",
                    Context.ConnectionId, correspondenceId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error joining correspondence group {CorrespondenceId} for connection {ConnectionId}",
                    correspondenceId, Context.ConnectionId);
            }
        }

        public async Task LeaveCorrespondenceGroup(string correspondenceId)
        {
            try
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Correspondence_{correspondenceId}");
                _logger.LogInformation("Connection {ConnectionId} left correspondence group {CorrespondenceId}",
                    Context.ConnectionId, correspondenceId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error leaving correspondence group {CorrespondenceId} for connection {ConnectionId}",
                    correspondenceId, Context.ConnectionId);
            }
        }

        // New methods for module-based groups
        public async Task JoinModuleGroup(string organizationalUnitId)
        {
            try
            {
                if (_currentUserService.IsAuthenticated)
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, $"Module_{organizationalUnitId}");
                    _logger.LogInformation("User {UserId} joined module group {OrganizationalUnitId}",
                        _currentUserService.UserId, organizationalUnitId);
                }
                else
                {
                    _logger.LogWarning("Unauthenticated user attempted to join module group {OrganizationalUnitId}",
                        organizationalUnitId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error joining module group {OrganizationalUnitId} for connection {ConnectionId}",
                    organizationalUnitId, Context.ConnectionId);
            }
        }

        public async Task LeaveModuleGroup(string organizationalUnitId)
        {
            try
            {
                if (_currentUserService.IsAuthenticated)
                {
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Module_{organizationalUnitId}");
                    _logger.LogInformation("User {UserId} left module group {OrganizationalUnitId}",
                        _currentUserService.UserId, organizationalUnitId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error leaving module group {OrganizationalUnitId} for connection {ConnectionId}",
                    organizationalUnitId, Context.ConnectionId);
            }
        }

        // Method to get connection info for debugging
        public async Task GetConnectionInfo()
        {
            try
            {
                var isAuthenticated = _currentUserService.IsAuthenticated;
                var contextIsAuthenticated = Context.User?.Identity?.IsAuthenticated ?? false;

                Guid? userId = null;
                string? userName = null;
                Guid? userOrganizationalUnitId = null;
                List<string> groupsJoined = new List<string>();

                if (isAuthenticated)
                {
                    try
                    {
                        userId = _currentUserService.UserId;
                        userName = _currentUserService.UserName ?? "Unknown";
                        userOrganizationalUnitId = _currentUserService.OrganizationalUnitId;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error getting user info from CurrentUserService in GetConnectionInfo");
                    }
                }
                else if (contextIsAuthenticated && Context.User != null)
                {
                    try
                    {
                        var uidClaim = Context.User.FindFirst("uid")?.Value;
                        var subClaim = Context.User.FindFirst("sub")?.Value;
                        var orgUnitClaim = Context.User.FindFirst("org_unit_id")?.Value;

                        if (!string.IsNullOrEmpty(uidClaim) && Guid.TryParse(uidClaim, out var parsedUserId))
                        {
                            userId = parsedUserId;
                            userName = subClaim ?? "Unknown";

                            if (!string.IsNullOrEmpty(orgUnitClaim) && Guid.TryParse(orgUnitClaim, out var parsedOrgUnit))
                            {
                                userOrganizationalUnitId = parsedOrgUnit;
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error extracting user info from SignalR context in GetConnectionInfo");
                    }
                }

                if (userId.HasValue)
                {
                    groupsJoined.Add($"User_{userId}");
                    groupsJoined.Add("CorrespondenceUpdates");
                    if (userOrganizationalUnitId.HasValue)
                    {
                        groupsJoined.Add($"Module_{userOrganizationalUnitId.Value}");
                    }

                    await Clients.Caller.SendAsync("ConnectionInfo", new
                    {
                        IsAuthenticated = true,
                        UserId = userId,
                        UserName = userName,
                        OrganizationalUnitId = userOrganizationalUnitId,
                        ConnectionId = Context.ConnectionId,
                        Groups = groupsJoined,
                        AuthenticationSource = isAuthenticated ? "CurrentUserService" : "SignalRContext",
                        CurrentUserServiceAuth = isAuthenticated,
                        ContextAuth = contextIsAuthenticated,
                        DebugInfo = new
                        {
                            AvailableClaims = Context.User?.Claims?.Select(c => new { c.Type, c.Value }).ToList(),
                            ContextUserName = Context.User?.Identity?.Name,
                            AuthenticationType = Context.User?.Identity?.AuthenticationType
                        }
                    });

                    _logger.LogInformation("🔔 Connection info sent for user {UserName} ({UserId}) - Groups: {Groups}",
                        userName, userId, string.Join(", ", groupsJoined));
                }
                else
                {
                    await Clients.Caller.SendAsync("ConnectionInfo", new
                    {
                        IsAuthenticated = false,
                        ConnectionId = Context.ConnectionId,
                        Groups = new[] { "CorrespondenceUpdates" },
                        AuthenticationSource = "None",
                        CurrentUserServiceAuth = isAuthenticated,
                        ContextAuth = contextIsAuthenticated,
                        Error = "Unable to extract user information",
                        DebugInfo = new
                        {
                            AvailableClaims = Context.User?.Claims?.Select(c => new { c.Type, c.Value }).ToList(),
                            ContextUserName = Context.User?.Identity?.Name,
                            AuthenticationType = Context.User?.Identity?.AuthenticationType
                        }
                    });

                    _logger.LogWarning("❌ Connection info requested but user not authenticated - ConnectionId: {ConnectionId}",
                        Context.ConnectionId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error in GetConnectionInfo for connection {ConnectionId}", Context.ConnectionId);

                await Clients.Caller.SendAsync("ConnectionInfo", new
                {
                    IsAuthenticated = false,
                    ConnectionId = Context.ConnectionId,
                    Error = ex.Message
                });
            }
        }
    }
}
