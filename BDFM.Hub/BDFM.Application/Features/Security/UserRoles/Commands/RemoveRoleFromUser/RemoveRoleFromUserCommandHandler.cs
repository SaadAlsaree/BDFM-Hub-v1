using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Security.UserRoles.Commands.RemoveRoleFromUser;

public class RemoveRoleFromUserCommandHandler : IRequestHandler<RemoveRoleFromUserCommand, Response<bool>>
{
    private readonly IBaseRepository<BDFM.Domain.Entities.Security.UserRole> _userRoleRepository;
    private readonly IBaseRepository<User> _userRepository;
    private readonly IBaseRepository<BDFM.Domain.Entities.Security.Role> _roleRepository;

    public RemoveRoleFromUserCommandHandler(
        IBaseRepository<BDFM.Domain.Entities.Security.UserRole> userRoleRepository,
        IBaseRepository<User> userRepository,
        IBaseRepository<BDFM.Domain.Entities.Security.Role> roleRepository)
    {
        _userRoleRepository = userRoleRepository ?? throw new ArgumentNullException(nameof(userRoleRepository));
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _roleRepository = roleRepository ?? throw new ArgumentNullException(nameof(roleRepository));
    }

    public async Task<Response<bool>> Handle(RemoveRoleFromUserCommand request, CancellationToken cancellationToken)
    {
        // Verify user exists
        var user = await _userRepository.Find(u => u.Id == request.UserId, cancellationToken: cancellationToken);
        if (user == null)
            return ErrorsMessage.NotFoundData.ToErrorMessage(false);

        // Verify role exists
        var role = await _roleRepository.Find(r => r.Id == request.RoleId, cancellationToken: cancellationToken);
        if (role == null)
            return ErrorsMessage.NotFoundData.ToErrorMessage(false);

        // Find the user-role relationship
        var userRole = await _userRoleRepository.Find(
            ur => ur.UserId == request.UserId && ur.RoleId == request.RoleId && !ur.IsDeleted,
            cancellationToken: cancellationToken);

        if (userRole == null)
            return ErrorsMessage.NotFoundData.ToErrorMessage(false);

        // Define the filter to find the specific user role
        Expression<Func<BDFM.Domain.Entities.Security.UserRole, bool>> filter =
            ur => ur.UserId == request.UserId && ur.RoleId == request.RoleId && !ur.IsDeleted;

        // Define the properties to update
        var updateProperties = new
        {
            IsDeleted = true,
            StatusId = Status.InActive,
            DeletedAt = DateTime.UtcNow
        };

        var result = await _userRoleRepository.UpdateEntity(filter, updateProperties, cancellationToken);

        return result
            ? SuccessMessage.Delete.ToSuccessMessage(true)
            : ErrorsMessage.FailOnDelete.ToErrorMessage(false);
    }
}
