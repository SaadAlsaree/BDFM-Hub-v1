using BDFM.Application.Features.Utility.BaseUtility.Command.Create;

namespace BDFM.Application.Features.Security.Roles.Commands.CreateRole;

public class CreateRoleCommandHandler : CreateHandler<BDFM.Domain.Entities.Security.Role, CreateRoleCommand>, IRequestHandler<CreateRoleCommand, Response<bool>>
{
    public CreateRoleCommandHandler(IBaseRepository<BDFM.Domain.Entities.Security.Role> repository) : base(repository)
    {
    }

    protected override Expression<Func<BDFM.Domain.Entities.Security.Role, bool>> ExistencePredicate(CreateRoleCommand request)
    {
        return r => r.Name == request.Name || r.Value == request.Value;
    }

    protected override BDFM.Domain.Entities.Security.Role MapToEntity(CreateRoleCommand request)
    {
        return new BDFM.Domain.Entities.Security.Role
        {
            Name = request.Name,
            Value = request.Value,
            Description = request.Description
        };
    }

    public async Task<Response<bool>> Handle(CreateRoleCommand request, CancellationToken cancellationToken)
    {
        return await HandleBase(request, cancellationToken);
    }
}
