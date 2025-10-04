using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Security;

namespace BDFM.Application.Features.Security.UserPermissions.Commands.RemovePermissionFromUser;

public class RemovePermissionFromUserCommandHandler : IRequestHandler<RemovePermissionFromUserCommand, Response<bool>>
{
    private readonly IBaseRepository<UserPermission> _userPermissionRepository;
    private readonly IBaseRepository<User> _userRepository;
    private readonly IBaseRepository<Permission> _permissionRepository;

    public RemovePermissionFromUserCommandHandler(
        IBaseRepository<UserPermission> userPermissionRepository,
        IBaseRepository<User> userRepository,
        IBaseRepository<Permission> permissionRepository)
    {
        _userPermissionRepository = userPermissionRepository ?? throw new ArgumentNullException(nameof(userPermissionRepository));
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _permissionRepository = permissionRepository ?? throw new ArgumentNullException(nameof(permissionRepository));
    }

    public async Task<Response<bool>> Handle(RemovePermissionFromUserCommand request, CancellationToken cancellationToken)
    {
        // Verify user exists
        var user = await _userRepository.Find(u => u.Id == request.UserId, cancellationToken: cancellationToken);
        if (user == null)
            return ErrorsMessage.NotFoundData.ToErrorMessage(false);

        // Verify permission exists
        var permission = await _permissionRepository.Find(p => p.Id == request.PermissionId, cancellationToken: cancellationToken);
        if (permission == null)
            return ErrorsMessage.NotFoundData.ToErrorMessage(false);

        // Find the user-permission relationship
        var userPermission = await _userPermissionRepository.Find(
            up => up.UserId == request.UserId && up.PermissionId == request.PermissionId && !up.IsDeleted,
            cancellationToken: cancellationToken);

        if (userPermission == null)
            return ErrorsMessage.NotFoundData.ToErrorMessage(false);

        // Soft delete the user permission
        await _userPermissionRepository.Delete(userPermission, cancellationToken);

        return SuccessMessage.Delete.ToSuccessMessage(true);
    }
}
