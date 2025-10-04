using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Security.UserRoles.Commands.AssignRolesToUser;

public class AssignRolesToUserCommandHandler : IRequestHandler<AssignRolesToUserCommand, Response<bool>>
{
    private readonly IBaseRepository<User> _userRepository;
    private readonly IBaseRepository<BDFM.Domain.Entities.Security.Role> _roleRepository;
    private readonly IBaseRepository<BDFM.Domain.Entities.Security.UserRole> _userRoleRepository;

    public AssignRolesToUserCommandHandler(
        IBaseRepository<User> userRepository,
        IBaseRepository<BDFM.Domain.Entities.Security.Role> roleRepository,
        IBaseRepository<BDFM.Domain.Entities.Security.UserRole> userRoleRepository)
    {
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _roleRepository = roleRepository ?? throw new ArgumentNullException(nameof(roleRepository));
        _userRoleRepository = userRoleRepository ?? throw new ArgumentNullException(nameof(userRoleRepository));
    }

    public async Task<Response<bool>> Handle(AssignRolesToUserCommand request, CancellationToken cancellationToken)
    {
        // Verify user exists
        var user = await _userRepository.Find(u => u.Id == request.UserId, cancellationToken: cancellationToken);
        if (user == null)
            return ErrorsMessage.NotFoundData.ToErrorMessage(false);

        // Verify all roles exist
        foreach (var roleId in request.RoleIds)
        {
            var role = await _roleRepository.Find(
                r => r.Id == roleId,
                cancellationToken: cancellationToken);

            if (role == null)
                return ErrorsMessage.NotFoundData.ToErrorMessage(false);
        }

        // Get existing user roles
        var existingUserRolesResult = await _userRoleRepository.GetAsync<BDFM.Domain.Entities.Security.UserRole>(
            filter: ur => ur.UserId == request.UserId && !ur.IsDeleted,
            selector: ur => ur, // Add explicit selector to avoid null parameter error
            cancellationToken: cancellationToken);

        var existingUserRoles = existingUserRolesResult.Item1;

        // Hard delete all existing user roles
        if (existingUserRoles.Any())
        {
            var userRoleIds = existingUserRoles.Select(ur => ur.Id).ToList();
            var deleteResult = await _userRoleRepository.DeleteRange(existingUserRoles, cancellationToken: cancellationToken);

            if (!deleteResult)
                return ErrorsMessage.FailOnDelete.ToErrorMessage(false);
        }

        // If no new roles to add, return success
        if (!request.RoleIds.Any())
            return SuccessMessage.Update.ToSuccessMessage(true);

        // Create new user-role relationships for all requested roles
        var userRolesToAdd = request.RoleIds.Select(roleId => new BDFM.Domain.Entities.Security.UserRole
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            RoleId = roleId,
            CreateAt = DateTime.UtcNow,
            StatusId = Status.Active
        }).ToList();

        var result = await _userRoleRepository.CreateRange(userRolesToAdd, cancellationToken: cancellationToken);

        return result
            ? SuccessMessage.Create.ToSuccessMessage(true)
            : ErrorsMessage.FailOnCreate.ToErrorMessage(false);
    }
}
