using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Users.Commands.UpdateUserRoles;

public class UpdateUserRolesCommandHandler : IRequestHandler<UpdateUserRolesCommand, Response<bool>>
{
    private readonly IBaseRepository<User> _userRepository;
    private readonly IBaseRepository<BDFM.Domain.Entities.Security.UserRole> _userRoleRepository;
    private readonly IBaseRepository<BDFM.Domain.Entities.Security.Role> _roleRepository;

    public UpdateUserRolesCommandHandler(
        IBaseRepository<User> userRepository,
        IBaseRepository<BDFM.Domain.Entities.Security.UserRole> userRoleRepository,
        IBaseRepository<BDFM.Domain.Entities.Security.Role> roleRepository)
    {
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _userRoleRepository = userRoleRepository ?? throw new ArgumentNullException(nameof(userRoleRepository));
        _roleRepository = roleRepository ?? throw new ArgumentNullException(nameof(roleRepository));
    }

    public async Task<Response<bool>> Handle(UpdateUserRolesCommand request, CancellationToken cancellationToken)
    {
        // Verify user exists
        var user = await _userRepository.Find(
            u => u.Id == request.UserId,
            cancellationToken: cancellationToken);

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
            filter: ur => ur.UserId == request.UserId,
            cancellationToken: cancellationToken);

        var existingUserRoles = existingUserRolesResult.Item1;

        // Delete existing roles
        if (existingUserRoles.Any())
        {
            foreach (var userRole in existingUserRoles)
            {
                userRole.IsDeleted = true;
                userRole.DeletedAt = DateTime.UtcNow;
            }
            await _userRoleRepository.UpdateRange(existingUserRoles.ToList(), cancellationToken: cancellationToken);
        }

        // Add new roles
        var userRoles = request.RoleIds.Select(roleId => new BDFM.Domain.Entities.Security.UserRole
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            RoleId = roleId,
            CreateAt = DateTime.UtcNow,
            StatusId = Status.Active
        }).ToList();

        var result = await _userRoleRepository.CreateRange(userRoles, cancellationToken: cancellationToken);

        return result
            ? SuccessMessage.Update.ToSuccessMessage(true)
            : ErrorsMessage.FailOnUpdate.ToErrorMessage(false);
    }
}
