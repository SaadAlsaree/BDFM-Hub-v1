using BDFM.Application.Features.Utility.BaseUtility.Command.Create;
using BDFM.Domain.Entities.Security;

namespace BDFM.Application.Features.Security.UserPermissions.Commands.CreateUserPermissions
{
    internal class CreateUserPermissionsHandler : CreateHandler<UserPermission, CreateUserPermissionsCommand>, IRequestHandler<CreateUserPermissionsCommand, Response<bool>>
    {
        public CreateUserPermissionsHandler(IBaseRepository<UserPermission> repository) : base(repository)
        {
        }


        protected override Expression<Func<UserPermission, bool>> ExistencePredicate(CreateUserPermissionsCommand request)
        {
            return up => up.UserId == request.UserId && up.PermissionId == request.PermissionIds;
        }

        protected override UserPermission MapToEntity(CreateUserPermissionsCommand request)
        {
            return new UserPermission
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                PermissionId = request.PermissionIds
            };
        }

        public async Task<Response<bool>> Handle(CreateUserPermissionsCommand request, CancellationToken cancellationToken)
        {
            return await HandleBase(request, cancellationToken);
        }

    }
}
