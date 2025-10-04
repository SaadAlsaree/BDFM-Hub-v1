using BDFM.Application.Features.Utility.BaseUtility.Command.Create;
using BDFM.Domain.Entities.Security;

namespace BDFM.Application.Features.Security.Permissions.Commands.CreatePermission;

public class CreatePermissionCommandHandler :
    CreateHandler<Permission, CreatePermissionCommand>,
    IRequestHandler<CreatePermissionCommand, Response<bool>>
{
    public CreatePermissionCommandHandler(IBaseRepository<Permission> repository) : base(repository)
    {
    }

    protected override Expression<Func<Permission, bool>> ExistencePredicate(CreatePermissionCommand request)
    {
        return p => p.Name == request.Name;
    }

    protected override Permission MapToEntity(CreatePermissionCommand request)
    {
        return new Permission
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Value = request.Value,
            Description = request.Description
        };
    }

    public async Task<Response<bool>> Handle(
        CreatePermissionCommand request,
        CancellationToken cancellationToken)
    {
        return await HandleBase(request, cancellationToken);
    }
}
