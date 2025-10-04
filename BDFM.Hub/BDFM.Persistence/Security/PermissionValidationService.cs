using BDFM.Application.Contract.Identity;
using BDFM.Application.Contracts.Identity;
using Microsoft.Extensions.Logging;

namespace BDFM.Persistence.Security;

/// <summary>
/// Implementation of permission validation service for handler-level authorization
/// </summary>
public class PermissionValidationService : IPermissionValidationService
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IBaseRepository<User> _userRepository;
    private readonly IBaseRepository<UserPermission> _userPermissionRepository;
    private readonly IBaseRepository<UnitPermission> _unitPermissionRepository;
    private readonly IBaseRepository<Delegation> _delegationRepository;
    private readonly IBaseRepository<OrganizationalUnit> _organizationalUnitRepository;
    private readonly IBaseRepository<WorkflowStep> _workflowStepRepository;
    private readonly IBaseRepository<WorkflowStepSecondaryRecipient> _workflowStepSecondaryRecipientRepository;
    private readonly IBaseRepository<WorkflowStepInteraction> _workflowStepInteractionRepository;
    private readonly IBaseRepository<Correspondence> _correspondenceRepository;
    private readonly ILogger<PermissionValidationService> _logger;

    public PermissionValidationService(
        IBaseRepository<User> userRepository,
        IBaseRepository<UserPermission> userPermissionRepository,
        IBaseRepository<UnitPermission> unitPermissionRepository,
        IBaseRepository<Delegation> delegationRepository,
        IBaseRepository<OrganizationalUnit> organizationalUnitRepository,
        IBaseRepository<WorkflowStep> workflowStepRepository,
        IBaseRepository<WorkflowStepSecondaryRecipient> workflowStepSecondaryRecipientRepository,
        IBaseRepository<WorkflowStepInteraction> workflowStepInteractionRepository,
        IBaseRepository<Correspondence> correspondenceRepository,
        ICurrentUserService currentUserService,
        ILogger<PermissionValidationService> logger)
    {
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _userPermissionRepository = userPermissionRepository ?? throw new ArgumentNullException(nameof(userPermissionRepository));
        _unitPermissionRepository = unitPermissionRepository ?? throw new ArgumentNullException(nameof(unitPermissionRepository));
        _delegationRepository = delegationRepository ?? throw new ArgumentNullException(nameof(delegationRepository));
        _organizationalUnitRepository = organizationalUnitRepository ?? throw new ArgumentNullException(nameof(organizationalUnitRepository));
        _workflowStepRepository = workflowStepRepository ?? throw new ArgumentNullException(nameof(workflowStepRepository));
        _workflowStepSecondaryRecipientRepository = workflowStepSecondaryRecipientRepository ?? throw new ArgumentNullException(nameof(workflowStepSecondaryRecipientRepository));
        _workflowStepInteractionRepository = workflowStepInteractionRepository ?? throw new ArgumentNullException(nameof(workflowStepInteractionRepository));
        _correspondenceRepository = correspondenceRepository ?? throw new ArgumentNullException(nameof(correspondenceRepository));
        _currentUserService = currentUserService ?? throw new ArgumentNullException(nameof(currentUserService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<bool> HasPermissionAsync(string permissionName, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(permissionName))
        {
            _logger.LogWarning("Permission name is null or empty");
            return false;
        }

        if (!_currentUserService.IsAuthenticated)
        {
            _logger.LogWarning("User is not authenticated");
            return false;
        }

        try
        {
            var userPermissions = await GetUserPermissionsAsync(cancellationToken);
            var hasPermission = userPermissions.Any(p => string.Equals(p, permissionName, StringComparison.OrdinalIgnoreCase));

            _logger.LogDebug("Permission check for user {UserId}: {PermissionName} = {HasPermission}",
                _currentUserService.UserId, permissionName, hasPermission);

            return hasPermission;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking permission {PermissionName} for user {UserId}",
                permissionName, _currentUserService.UserId);
            return false;
        }
    }

    public async Task<bool> HasAnyPermissionAsync(IEnumerable<string> permissionNames, CancellationToken cancellationToken = default)
    {
        if (permissionNames == null || !permissionNames.Any())
        {
            _logger.LogWarning("Permission names list is null or empty");
            return false;
        }

        var userPermissions = await GetUserPermissionsAsync(cancellationToken);
        return permissionNames.Any(perm => userPermissions.Any(userPerm =>
            string.Equals(userPerm, perm, StringComparison.OrdinalIgnoreCase)));
    }

    public async Task<bool> HasAllPermissionsAsync(IEnumerable<string> permissionNames, CancellationToken cancellationToken = default)
    {
        if (permissionNames == null || !permissionNames.Any())
        {
            _logger.LogWarning("Permission names list is null or empty");
            return false;
        }

        var userPermissions = await GetUserPermissionsAsync(cancellationToken);
        return permissionNames.All(perm => userPermissions.Any(userPerm =>
            string.Equals(userPerm, perm, StringComparison.OrdinalIgnoreCase)));
    }

    public async Task<IEnumerable<string>> GetUserPermissionsAsync(CancellationToken cancellationToken = default)
    {
        if (!_currentUserService.IsAuthenticated)
        {
            return Enumerable.Empty<string>();
        }

        var userId = _currentUserService.UserId;
        var permissions = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        try
        {
            // Get user information including organizational unit
            var user = await _userRepository.Query()
                .Where(u => u.Id == userId && !u.IsDeleted)
                .Include(u => u.OrganizationalUnit)
                .AsNoTracking()
                .FirstOrDefaultAsync(cancellationToken);

            if (user == null)
            {
                _logger.LogWarning("User {UserId} not found", userId);
                return permissions;
            }

            // 1. Get direct user permissions
            var userPermissions = await _userPermissionRepository.Query()
                .Where(up => up.UserId == userId && !up.IsDeleted)
                .Include(up => up.Permission)
                .AsNoTracking()
                .Select(up => up.Permission.Name)
                .ToListAsync(cancellationToken);

            foreach (var permission in userPermissions)
            {
                permissions.Add(permission);
            }

            // 2. Get permissions from organizational unit (if user belongs to a unit)
            if (user.OrganizationalUnitId.HasValue)
            {
                var unitPermissions = await _unitPermissionRepository.Query()
                    .Where(up => up.UnitId == user.OrganizationalUnitId.Value && !up.IsDeleted)
                    .Include(up => up.Permission)
                    .Select(up => up.Permission.Name)
                    .ToListAsync(cancellationToken);

                foreach (var permission in unitPermissions)
                {
                    permissions.Add(permission);
                }
            }

            // 3. Get permissions from delegations
            var delegations = await _delegationRepository.Query()
                .Where(d => d.DelegateeUserId == userId && d.IsActive &&
                           d.StartDate <= DateTime.UtcNow && d.EndDate >= DateTime.UtcNow &&
                           !d.IsDeleted)
                .Include(d => d.Permission)
                .Include(d => d.Role)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            foreach (var delegation in delegations)
            {
                // Add direct permission delegations
                if (delegation.Permission != null)
                {
                    permissions.Add(delegation.Permission.Name);
                }

                // For role delegations, we would need to get the user permissions of the delegator
                // This is more complex and may require additional logic based on your business requirements
                if (delegation.Role != null)
                {
                    // Since roles no longer have direct permissions, role delegation logic needs to be reconsidered
                    // You may want to delegate specific permissions instead of entire roles
                    _logger.LogWarning("Role delegation found but roles no longer have direct permissions. DelegationId: {DelegationId}", delegation.Id);
                }
            }

            _logger.LogDebug("Retrieved {PermissionCount} permissions for user {UserId}",
                permissions.Count, userId);

            return permissions;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving permissions for user {UserId}", userId);
            return permissions;
        }
    }

    public async Task ValidatePermissionAsync(string permissionName, CancellationToken cancellationToken = default)
    {
        var hasPermission = await HasPermissionAsync(permissionName, cancellationToken);

        if (!hasPermission)
        {
            _logger.LogWarning("Access denied for user {UserId} to permission {PermissionName}",
                _currentUserService.UserId, permissionName);

            throw new UnauthorizedAccessException($"Access denied. Required permission: {permissionName}");
        }
    }

    public async Task<bool> HasUnitPermissionAsync(string permissionName, Guid unitId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(permissionName))
        {
            _logger.LogWarning("Permission name is null or empty");
            return false;
        }

        if (!_currentUserService.IsAuthenticated)
        {
            _logger.LogWarning("User is not authenticated");
            return false;
        }

        try
        {
            var userId = _currentUserService.UserId;

            // Check if user belongs to the specified unit
            var user = await _userRepository.Query()
                .Where(u => u.Id == userId && u.OrganizationalUnitId == unitId && !u.IsDeleted)
                .FirstOrDefaultAsync(cancellationToken);

            if (user == null)
            {
                _logger.LogDebug("User {UserId} does not belong to unit {UnitId}", userId, unitId);
                return false;
            }

            // Check if the unit has the specific permission
            var hasUnitPermission = await _unitPermissionRepository.Query()
                .AnyAsync(up => up.UnitId == unitId &&
                               up.Permission.Name == permissionName &&
                               !up.IsDeleted &&
                               !up.Permission.IsDeleted,
                         cancellationToken);

            _logger.LogDebug("Unit permission check for user {UserId}, unit {UnitId}, permission {PermissionName} = {HasPermission}",
                userId, unitId, permissionName, hasUnitPermission);

            return hasUnitPermission;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking unit permission {PermissionName} for user {UserId} and unit {UnitId}",
                permissionName, _currentUserService.UserId, unitId);
            return false;
        }
    }

    public async Task<IEnumerable<Guid>> GetAccessibleUnitIdsAsync(CancellationToken cancellationToken = default)
    {
        if (!_currentUserService.IsAuthenticated)
        {
            return Enumerable.Empty<Guid>();
        }

        try
        {
            var userId = _currentUserService.UserId;
            var accessibleUnitIds = new HashSet<Guid>();

            // Get user's organizational unit
            var user = await _userRepository.Query()
                .Where(u => u.Id == userId && !u.IsDeleted)
                .Select(u => new { u.OrganizationalUnitId })
                .FirstOrDefaultAsync(cancellationToken);

            if (!user?.OrganizationalUnitId.HasValue == true)
            {
                _logger.LogDebug("User {UserId} does not belong to any organizational unit", userId);
                return accessibleUnitIds;
            }

            var userUnitId = user.OrganizationalUnitId.Value;
            accessibleUnitIds.Add(userUnitId);

            // Get all sub-units recursively
            var subUnitIds = await GetAllSubUnitIdsAsync(userUnitId, cancellationToken);
            foreach (var subUnitId in subUnitIds)
            {
                accessibleUnitIds.Add(subUnitId);
            }

            _logger.LogDebug("User {UserId} can access {UnitCount} organizational units", userId, accessibleUnitIds.Count);
            return accessibleUnitIds;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving accessible unit IDs for user {UserId}", _currentUserService.UserId);
            return Enumerable.Empty<Guid>();
        }
    }

    public async Task<bool> CanAccessUnitCorrespondenceAsync(Guid unitId, CancellationToken cancellationToken = default)
    {
        if (!_currentUserService.IsAuthenticated)
        {
            return false;
        }

        try
        {
            // Check if user has permission to view all correspondence (overrides unit restrictions)
            var canViewAll = await HasPermissionAsync("Correspondence|ViewAll", cancellationToken);
            if (canViewAll)
            {
                _logger.LogDebug("User {UserId} has ViewAll permission for correspondence", _currentUserService.UserId);
                return true;
            }

            // Check if the unit is in the user's accessible units (their unit + sub-units)
            var accessibleUnitIds = await GetAccessibleUnitIdsAsync(cancellationToken);
            var canAccess = accessibleUnitIds.Contains(unitId);

            _logger.LogDebug("User {UserId} access to unit {UnitId}: {CanAccess}",
                _currentUserService.UserId, unitId, canAccess);

            return canAccess;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking unit correspondence access for user {UserId} and unit {UnitId}",
                _currentUserService.UserId, unitId);
            return false;
        }
    }

    /// <summary>
    /// Recursively gets all sub-unit IDs for a given unit
    /// </summary>
    /// <param name="unitId">The parent unit ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of all sub-unit IDs</returns>
    private async Task<IEnumerable<Guid>> GetAllSubUnitIdsAsync(Guid unitId, CancellationToken cancellationToken)
    {
        var allSubUnitIds = new HashSet<Guid>();

        // Get direct child units
        var childUnits = await _organizationalUnitRepository.Query()
            .Where(u => u.ParentUnitId == unitId && !u.IsDeleted)
            .Select(u => u.Id)
            .ToListAsync(cancellationToken);

        foreach (var childUnitId in childUnits)
        {
            allSubUnitIds.Add(childUnitId);

            // Recursively get sub-units of this child unit
            var subSubUnitIds = await GetAllSubUnitIdsAsync(childUnitId, cancellationToken);
            foreach (var subSubUnitId in subSubUnitIds)
            {
                allSubUnitIds.Add(subSubUnitId);
            }
        }

        return allSubUnitIds;
    }

    public async Task<bool> CanAccessCorrespondenceAsync(Guid correspondenceId, CancellationToken cancellationToken = default)
    {
        try
        {
            var currentUserId = _currentUserService.UserId;

            if (currentUserId == Guid.Empty)
            {
                _logger.LogWarning("Cannot validate correspondence access: No current user");
                return false;
            }

            // Check if user has ViewAll permission
            if (await HasPermissionAsync("Correspondence|ViewAll", cancellationToken))
            {
                _logger.LogDebug("User {UserId} has ViewAll permission for correspondence {CorrespondenceId}", currentUserId, correspondenceId);
                return true;
            }

            // Check if user is the creator of the correspondence
            var isCreator = await _correspondenceRepository.Query()
                .Where(c => c.Id == correspondenceId && (c.CreateBy == currentUserId || c.CreateByUserId == currentUserId))
                .AnyAsync(cancellationToken);

            if (isCreator)
            {
                _logger.LogDebug("User {UserId} is creator of correspondence {CorrespondenceId}", currentUserId, correspondenceId);
                return true;
            }

            // Get user's accessible unit IDs (including hierarchy)
            var accessibleUnitIds = await GetAccessibleUnitIdsAsync(cancellationToken);

            // Optimized single query to check all access paths
            var hasAccess = await _workflowStepRepository.Query()
                .Where(ws => ws.CorrespondenceId == correspondenceId)
                .AnyAsync(ws =>
                    // 1. Primary recipient is the user
                    (ws.ToPrimaryRecipientType == Domain.Enums.RecipientTypeEnum.User && ws.ToPrimaryRecipientId == currentUserId) ||
                    // 2. Primary recipient is a unit the user has access to
                    (ws.ToPrimaryRecipientType == Domain.Enums.RecipientTypeEnum.Unit && accessibleUnitIds.Contains(ws.ToPrimaryRecipientId)) ||
                    // 3. User is a secondary recipient
                    ws.SecondaryRecipients.Any(sr =>
                        (sr.RecipientType == Domain.Enums.RecipientTypeEnum.User && sr.RecipientId == currentUserId) ||
                        (sr.RecipientType == Domain.Enums.RecipientTypeEnum.Unit && accessibleUnitIds.Contains(sr.RecipientId))
                    ) ||
                    // 4. User has WorkflowStepInteraction access (forwarded within module)
                    ws.Interactions.Any(wsi => wsi.InteractingUserId == currentUserId),
                    cancellationToken);

            _logger.LogDebug("User {UserId} access to correspondence {CorrespondenceId}: {HasAccess}",
                currentUserId, correspondenceId, hasAccess);

            return hasAccess;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking correspondence access for user {UserId} and correspondence {CorrespondenceId}",
                _currentUserService.UserId, correspondenceId);
            return false;
        }
    }

    public async Task<IEnumerable<Guid>> GetAccessibleWorkflowStepIdsAsync(Guid correspondenceId, CancellationToken cancellationToken = default)
    {
        try
        {
            var currentUserId = _currentUserService.UserId;
            if (currentUserId == Guid.Empty)
            {
                _logger.LogWarning("Cannot get accessible workflow steps: No current user");
                return Enumerable.Empty<Guid>();
            }

            // Check if user has ViewAll permission - can see all workflow steps
            if (await HasPermissionAsync("Correspondence|ViewAll", cancellationToken))
            {
                var allStepIds = await _workflowStepRepository.Query()
                    .Where(ws => ws.CorrespondenceId == correspondenceId)
                    .Select(ws => ws.Id)
                    .ToListAsync(cancellationToken);

                _logger.LogDebug("User {UserId} has ViewAll permission, returning {Count} workflow steps for correspondence {CorrespondenceId}",
                    currentUserId, allStepIds.Count, correspondenceId);

                return allStepIds;
            }

            // Check if user is the creator of the correspondence
            var isCreator = await _correspondenceRepository.Query()
                .Where(c => c.Id == correspondenceId && c.CreateBy == currentUserId)
                .AnyAsync(cancellationToken);

            if (isCreator)
            {
                // Creator can see all workflow steps
                var creatorStepIds = await _workflowStepRepository.Query()
                    .Where(ws => ws.CorrespondenceId == correspondenceId)
                    .Select(ws => ws.Id)
                    .ToListAsync(cancellationToken);

                _logger.LogDebug("User {UserId} is creator, returning {Count} workflow steps for correspondence {CorrespondenceId}",
                    currentUserId, creatorStepIds.Count, correspondenceId);

                return creatorStepIds;
            }

            // Get user's accessible unit IDs (including hierarchy)
            var accessibleUnitIds = await GetAccessibleUnitIdsAsync(cancellationToken);

            // Get workflow steps where user is involved (including WorkflowStepInteraction)
            var accessibleStepIds = await _workflowStepRepository.Query()
                .Where(ws => ws.CorrespondenceId == correspondenceId)
                .Where(ws =>
                    // Primary recipient is the user
                    (ws.ToPrimaryRecipientType == Domain.Enums.RecipientTypeEnum.User && ws.ToPrimaryRecipientId == currentUserId) ||
                    // Primary recipient is a unit the user has access to
                    (ws.ToPrimaryRecipientType == Domain.Enums.RecipientTypeEnum.Unit && accessibleUnitIds.Contains(ws.ToPrimaryRecipientId)) ||
                    // User is a secondary recipient
                    ws.SecondaryRecipients.Any(sr =>
                        (sr.RecipientType == Domain.Enums.RecipientTypeEnum.User && sr.RecipientId == currentUserId) ||
                        (sr.RecipientType == Domain.Enums.RecipientTypeEnum.Unit && accessibleUnitIds.Contains(sr.RecipientId))
                    ) ||
                    // User has WorkflowStepInteraction access (forwarded within module)
                    ws.Interactions.Any(wsi => wsi.InteractingUserId == currentUserId)
                )
                .Select(ws => ws.Id)
                .ToListAsync(cancellationToken);

            _logger.LogDebug("User {UserId} has access to {Count} workflow steps for correspondence {CorrespondenceId}",
                currentUserId, accessibleStepIds.Count, correspondenceId);

            return accessibleStepIds;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting accessible workflow steps for user {UserId} and correspondence {CorrespondenceId}",
                _currentUserService.UserId, correspondenceId);
            return Enumerable.Empty<Guid>();
        }
    }

    public async Task<bool> CanAccessWorkflowStepAsync(Guid workflowStepId, CancellationToken cancellationToken = default)
    {
        try
        {
            var currentUserId = _currentUserService.UserId;
            if (currentUserId == Guid.Empty)
            {
                _logger.LogWarning("Cannot validate workflow step access: No current user");
                return false;
            }

            // Check if user has ViewAll permission
            if (await HasPermissionAsync("Correspondence|ViewAll", cancellationToken))
            {
                _logger.LogDebug("User {UserId} has ViewAll permission for workflow step {WorkflowStepId}", currentUserId, workflowStepId);
                return true;
            }

            // Check if user is the creator of the correspondence
            var isCreator = await _workflowStepRepository.Query()
                .Where(ws => ws.Id == workflowStepId)
                .Join(_correspondenceRepository.Query(),
                    ws => ws.CorrespondenceId,
                    c => c.Id,
                    (ws, c) => c.CreateBy == currentUserId)
                .AnyAsync(cancellationToken);

            if (isCreator)
            {
                _logger.LogDebug("User {UserId} is creator of correspondence for workflow step {WorkflowStepId}", currentUserId, workflowStepId);
                return true;
            }

            // Get user's accessible unit IDs (including hierarchy)
            var accessibleUnitIds = await GetAccessibleUnitIdsAsync(cancellationToken);

            // Check if user is involved in this specific WorkflowStep (including WorkflowStepInteraction)
            var hasStepAccess = await _workflowStepRepository.Query()
                .Where(ws => ws.Id == workflowStepId)
                .AnyAsync(ws =>
                    // Primary recipient is the user
                    (ws.ToPrimaryRecipientType == Domain.Enums.RecipientTypeEnum.User && ws.ToPrimaryRecipientId == currentUserId) ||
                    // Primary recipient is a unit the user has access to
                    (ws.ToPrimaryRecipientType == Domain.Enums.RecipientTypeEnum.Unit && accessibleUnitIds.Contains(ws.ToPrimaryRecipientId)) ||
                    // User is a secondary recipient
                    ws.SecondaryRecipients.Any(sr =>
                        (sr.RecipientType == Domain.Enums.RecipientTypeEnum.User && sr.RecipientId == currentUserId) ||
                        (sr.RecipientType == Domain.Enums.RecipientTypeEnum.Unit && accessibleUnitIds.Contains(sr.RecipientId))
                    ) ||
                    // User has WorkflowStepInteraction access (forwarded within module)
                    ws.Interactions.Any(wsi => wsi.InteractingUserId == currentUserId),
                    cancellationToken);

            _logger.LogDebug("User {UserId} workflow step access to {WorkflowStepId}: {HasAccess}",
                currentUserId, workflowStepId, hasStepAccess);

            return hasStepAccess;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking workflow step access for user {UserId} and step {WorkflowStepId}",
                _currentUserService.UserId, workflowStepId);
            return false;
        }
    }

    public async Task<IQueryable<T>> ApplyWorkflowAccessFilterAsync<T>(IQueryable<T> query, CancellationToken cancellationToken = default) where T : class
    {
        try
        {
            var currentUserId = _currentUserService.UserId;
            if (currentUserId == Guid.Empty)
            {
                _logger.LogWarning("Cannot apply workflow access filter: No current user");
                return query.Where(x => false); // Return empty result
            }

            // Check if user has ViewAll permission
            if (await HasPermissionAsync("Correspondence|ViewAll", cancellationToken))
            {
                _logger.LogDebug("User {UserId} has ViewAll permission, no filtering applied", currentUserId);
                return query; // No filtering needed
            }

            // Get user's accessible unit IDs (including hierarchy)
            var accessibleUnitIds = await GetAccessibleUnitIdsAsync(cancellationToken);
            var accessibleUnitIdsList = accessibleUnitIds.ToList();

            // Apply filtering based on the entity type
            if (typeof(T) == typeof(Correspondence))
            {
                var correspondenceQuery = query as IQueryable<Correspondence>;
                var filteredQuery = correspondenceQuery!.Where(c =>
                    // User is the creator
                    c.CreateBy == currentUserId ||
                    // User is involved in WorkflowSteps
                    c.WorkflowSteps.Any(ws =>
                        // Primary recipient is the user
                        (ws.ToPrimaryRecipientType == Domain.Enums.RecipientTypeEnum.User && ws.ToPrimaryRecipientId == currentUserId) ||
                        // Primary recipient is a unit the user has access to
                        (ws.ToPrimaryRecipientType == Domain.Enums.RecipientTypeEnum.Unit && accessibleUnitIdsList.Contains(ws.ToPrimaryRecipientId)) ||
                        // User is a secondary recipient
                        ws.SecondaryRecipients.Any(sr =>
                            (sr.RecipientType == Domain.Enums.RecipientTypeEnum.User && sr.RecipientId == currentUserId) ||
                            (sr.RecipientType == Domain.Enums.RecipientTypeEnum.Unit && accessibleUnitIdsList.Contains(sr.RecipientId))
                        ) ||
                        // User has WorkflowStepInteraction access (forwarded within module)
                        ws.Interactions.Any(wsi => wsi.InteractingUserId == currentUserId)
                    )
                );

                return filteredQuery as IQueryable<T>;
            }

            _logger.LogWarning("ApplyWorkflowAccessFilterAsync called with unsupported type {TypeName}", typeof(T).Name);
            return query;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error applying workflow access filter for user {UserId}", _currentUserService.UserId);
            return query.Where(x => false); // Return empty result on error for security
        }
    }
}