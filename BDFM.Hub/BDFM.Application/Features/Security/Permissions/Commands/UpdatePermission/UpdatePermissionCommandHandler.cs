using BDFM.Application.Features.Utility.BaseUtility.Command.Update;
using BDFM.Domain.Entities.Security;

namespace BDFM.Application.Features.Security.Permissions.Commands.UpdatePermission;

public class UpdatePermissionCommandHandler : UpdateHandler<Permission, UpdatePermissionCommand>, IRequestHandler<UpdatePermissionCommand, Response<bool>>
{
    public UpdatePermissionCommandHandler(IBaseRepository<Permission> repository) : base(repository)
    {
    }

    public override Expression<Func<Permission, bool>> EntityPredicate(UpdatePermissionCommand request)
    {
        return p => p.Id == request.Id;
    }

    public async Task<Response<bool>> Handle(UpdatePermissionCommand request, CancellationToken cancellationToken)
    {
        return await HandleBase(request, cancellationToken);
    }
}
