using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Security;

namespace BDFM.Application.Features.Security.UserPermissions.Commands.AssignPermissionsToUser;

public class AssignPermissionsToUserCommandHandler : IRequestHandler<AssignPermissionsToUserCommand, Response<bool>>
{
    private readonly IBaseRepository<User> _userRepository;
    private readonly IBaseRepository<Permission> _permissionRepository;
    private readonly IBaseRepository<UserPermission> _userPermissionRepository;

    public AssignPermissionsToUserCommandHandler(
        IBaseRepository<User> userRepository,
        IBaseRepository<Permission> permissionRepository,
        IBaseRepository<UserPermission> userPermissionRepository)
    {
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _permissionRepository = permissionRepository ?? throw new ArgumentNullException(nameof(permissionRepository));
        _userPermissionRepository = userPermissionRepository ?? throw new ArgumentNullException(nameof(userPermissionRepository));
    }

    public async Task<Response<bool>> Handle(AssignPermissionsToUserCommand request, CancellationToken cancellationToken)
    {
        // Verify user exists
        var user = await _userRepository.Find(u => u.Id == request.UserId, cancellationToken: cancellationToken);
        if (user == null)
            return ErrorsMessage.NotFoundData.ToErrorMessage(false);

        // Verify all permissions exist
        foreach (var permissionId in request.PermissionIds)
        {
            var permission = await _permissionRepository.Find(
                p => p.Id == permissionId,
                cancellationToken: cancellationToken);

            if (permission == null)
                return ErrorsMessage.NotFoundData.ToErrorMessage(false);
        }

        // Get existing user permissions to avoid duplicates
        var existingUserPermissions = await _userPermissionRepository.Query(
            filter: up => up.UserId == request.UserId && !up.IsDeleted)
            .ToListAsync(cancellationToken);

        var existingPermissionIds = existingUserPermissions.Select(up => up.PermissionId).ToHashSet();

        // Hard delete all existing user permissions
        if (existingUserPermissions.Any())
        {
            var userPermissionIds = existingUserPermissions.Select(up => up.Id).ToList();
            var deleteResult = await _userPermissionRepository.DeleteRange(existingUserPermissions, cancellationToken: cancellationToken);

            if (!deleteResult)
                return ErrorsMessage.FailOnDelete.ToErrorMessage(false);
        }

        // Create new user-Permission relationships for all requested permissions
        var userPermissionsToAdd = request.PermissionIds.Select(permissionId => new UserPermission
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            PermissionId = permissionId,
            CreateAt = DateTime.UtcNow,
            StatusId = Status.Active
        }).ToList();

        var result = await _userPermissionRepository.CreateRange(userPermissionsToAdd, cancellationToken: cancellationToken);

        return result
            ? SuccessMessage.Create.ToSuccessMessage(true)
            : ErrorsMessage.FailOnCreate.ToErrorMessage(false);
    }
}
