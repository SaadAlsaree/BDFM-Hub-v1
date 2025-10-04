using BDFM.Application.Features.Utility.BaseUtility.Command.Create;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Users.Commands.CreateUser;

public class CreateUserCommandHandler : CreateHandler<User, CreateUserCommand>, IRequestHandler<CreateUserCommand, Response<bool>>
{
    private readonly IBaseRepository<User> _userRepository;
    private readonly IBaseRepository<BDFM.Domain.Entities.Security.UserRole> _userRoleRepository;

    public CreateUserCommandHandler(
        IBaseRepository<User> repository,
        IBaseRepository<BDFM.Domain.Entities.Security.UserRole> userRoleRepository)
        : base(repository)
    {
        _userRepository = repository ?? throw new ArgumentNullException(nameof(repository));
        _userRoleRepository = userRoleRepository ?? throw new ArgumentNullException(nameof(userRoleRepository));
    }

    protected override Expression<Func<User, bool>> ExistencePredicate(CreateUserCommand request)
    {
        return u => u.Username == request.Username || u.UserLogin == request.UserLogin ||
                  (!string.IsNullOrEmpty(request.Email) && u.Email == request.Email) ||
                  (!string.IsNullOrEmpty(request.RfidTagId) && u.RfidTagId == request.RfidTagId);
    }

    protected override User MapToEntity(CreateUserCommand request)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = request.Username,
            UserLogin = request.UserLogin,
            FullName = request.FullName,
            Email = request.Email,
            OrganizationalUnitId = request.OrganizationalUnitId,
            PositionTitle = request.PositionTitle,
            RfidTagId = request.RfidTagId,
            IsActive = request.IsActive,
            TwoFactorSecret = string.Empty,
            CreateAt = DateTime.UtcNow
        };

        // Hash the password using BCrypt for consistency with AuthenticationService
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        return user;
    }

    public async Task<Response<bool>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var response = await HandleBase(request, cancellationToken);

        // If user creation was successful and there are roles to assign
        if (response.Succeeded && request.RoleIds.Any())
        {
            var userId = await GetCreatedUserId(request.Username, cancellationToken);
            if (userId != Guid.Empty)
            {
                var userRoles = request.RoleIds.Select(roleId => new BDFM.Domain.Entities.Security.UserRole
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    RoleId = roleId,
                    CreateAt = DateTime.UtcNow,
                    StatusId = Status.Active
                }).ToList();

                await _userRoleRepository.CreateRange(userRoles, cancellationToken: cancellationToken);
            }
        }

        return response;
    }

    private async Task<Guid> GetCreatedUserId(string username, CancellationToken cancellationToken)
    {
        var user = await _userRepository.Find(
            u => u.Username == username,
            cancellationToken: cancellationToken);

        return user?.Id ?? Guid.Empty;
    }
}
