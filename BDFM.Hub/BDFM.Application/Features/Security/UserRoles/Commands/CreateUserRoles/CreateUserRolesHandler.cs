

using BDFM.Application.Features.Utility.BaseUtility.Command.Create;
using BDFM.Domain.Entities.Security;

namespace BDFM.Application.Features.Security.UserRoles.Commands.CreateUserRoles
{
    public class CreateUserRolesHandler : CreateHandler<UserRole, CreateUserRolesCommand>, IRequestHandler<CreateUserRolesCommand, Response<bool>>
    {
        public CreateUserRolesHandler(IBaseRepository<UserRole> repository) : base(repository)
        {
        }

        protected override Expression<Func<UserRole, bool>> ExistencePredicate(CreateUserRolesCommand request)
        {
            return ur => ur.UserId == request.UserId && ur.RoleId == request.RoleId;
        }

        protected override UserRole MapToEntity(CreateUserRolesCommand request)
        {
            return new UserRole
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                RoleId = request.RoleId
            };
        }

        public async Task<Response<bool>> Handle(CreateUserRolesCommand request, CancellationToken cancellationToken)
        {
            return await HandleBase(request, cancellationToken);
        }
    }
}
