
namespace BDFM.Application.Contract.Identity;

/// <summary>
/// Service for validating user permissions at the handler level
/// </summary>
public interface IPermissionValidationService
{
    /// <summary>
    /// Validates if the current user has the required permission
    /// </summary>
    /// <param name="permissionName">The permission name to validate (e.g., "Correspondence|GetUserInbox")</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if user has permission, false otherwise</returns>
    Task<bool> HasPermissionAsync(string permissionName, CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates if the current user has any of the required permissions
    /// </summary>
    /// <param name="permissionNames">List of permission names to validate</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if user has at least one permission, false otherwise</returns>
    Task<bool> HasAnyPermissionAsync(IEnumerable<string> permissionNames, CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates if the current user has all the required permissions
    /// </summary>
    /// <param name="permissionNames">List of permission names to validate</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if user has all permissions, false otherwise</returns>
    Task<bool> HasAllPermissionsAsync(IEnumerable<string> permissionNames, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all effective permissions for the current user (including role-based, unit-based, and delegated permissions)
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of permission names</returns>
    Task<IEnumerable<string>> GetUserPermissionsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates permission and throws UnauthorizedAccessException if not authorized
    /// </summary>
    /// <param name="permissionName">The permission name to validate</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <exception cref="UnauthorizedAccessException">Thrown when user doesn't have the required permission</exception>
    Task ValidatePermissionAsync(string permissionName, CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates if user has permission for a specific organizational unit
    /// </summary>
    /// <param name="permissionName">The permission name to validate</param>
    /// <param name="unitId">The organizational unit ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if user has permission for the unit, false otherwise</returns>
    Task<bool> HasUnitPermissionAsync(string permissionName, Guid unitId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all organizational unit IDs that the current user can access (their unit + all sub-units in hierarchy)
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of unit IDs the user can access</returns>
    Task<IEnumerable<Guid>> GetAccessibleUnitIdsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the current user's organizational unit ID (NOT including sub-units)
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The user's organizational unit ID if assigned, null otherwise</returns>
    Task<Guid?> GetUserOrganizationalUnitIdAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if the current user can access correspondence for a specific unit (considering hierarchy)
    /// </summary>
    /// <param name="unitId">The unit ID to check access for</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if user can access the unit's correspondence, false otherwise</returns>
    Task<bool> CanAccessUnitCorrespondenceAsync(Guid unitId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if the current user can access a specific correspondence based on:
    /// 1. Being the creator
    /// 2. WorkflowStep participation (primary/secondary recipients)
    /// 3. WorkflowStepInteraction participation (forwarded within modules)
    /// </summary>
    /// <param name="correspondenceId">The correspondence ID to check access for</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if user can access the correspondence, false otherwise</returns>
    Task<bool> CanAccessCorrespondenceAsync(Guid correspondenceId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all WorkflowStep IDs that the current user can access for a specific correspondence
    /// based on WorkflowStep participation and WorkflowStepInteraction forwarding
    /// </summary>
    /// <param name="correspondenceId">The correspondence ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of WorkflowStep IDs the user can access</returns>
    Task<IEnumerable<Guid>> GetAccessibleWorkflowStepIdsAsync(Guid correspondenceId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if the current user can access a specific WorkflowStep based on:
    /// 1. Being a primary/secondary recipient in the WorkflowStep
    /// 2. Having WorkflowStepInteraction access (forwarded within module)
    /// </summary>
    /// <param name="workflowStepId">The WorkflowStep ID to check access for</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if user can access the WorkflowStep, false otherwise</returns>
    Task<bool> CanAccessWorkflowStepAsync(Guid workflowStepId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Efficiently filters correspondence query to only include items the user can access
    /// through the complete workflow hierarchy (WorkflowStep + WorkflowStepInteraction)
    /// </summary>
    /// <param name="query">Base correspondence query</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Filtered query with workflow-based access control</returns>
    Task<IQueryable<T>> ApplyWorkflowAccessFilterAsync<T>(IQueryable<T> query, CancellationToken cancellationToken = default)
        where T : class;
}
