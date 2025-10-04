namespace BDFM.Application.Contracts.Identity
{
    public interface ICurrentUserService
    {
        Guid UserId { get; }
        string UserName { get; }

        string Email { get; }
        bool IsAuthenticated { get; }

        /// <summary>
        /// Gets the current user's organizational unit ID if available
        /// </summary>
        Guid? OrganizationalUnitId { get; }

        /// <summary>
        /// Gets a specific claim from the current user's claims collection
        /// </summary>
        /// <param name="claimType">The claim type to retrieve</param>
        /// <returns>The claim value if found, otherwise null</returns>
        string GetClaimValue(string claimType);

        /// <summary>
        /// Checks if the current user has a specific role
        /// </summary>
        /// <param name="role">The role to check</param>
        /// <returns>True if the user has the role, otherwise false</returns>
        bool HasRole(string role);

        /// <summary>
        /// Checks if the current user has a specific permission
        /// </summary>
        /// <param name="permission">The permission to check</param>
        /// <returns>True if the user has the permission, otherwise false</returns>
        bool HasPermission(string permission);

        /// <summary>
        /// Gets all roles assigned to the current user
        /// </summary>
        /// <returns>List of role names</returns>
        IEnumerable<string> GetRoles();

        /// <summary>
        /// Gets all permissions assigned to the current user
        /// </summary>
        /// <returns>List of permission names</returns>
        IEnumerable<string> GetPermissions();
    }
}
