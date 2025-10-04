using BDFM.Application.Features.Utility.BaseUtility.Command.Update;
using static BDFM.Domain.Common.EnumExtensions;

namespace BDFM.Application.Features.Security.Roles.Commands.UpdateRole;

public class UpdateRoleCommandHandler : UpdateHandler<BDFM.Domain.Entities.Security.Role, UpdateRoleCommand>, IRequestHandler<UpdateRoleCommand, Response<bool>>
{
    public UpdateRoleCommandHandler(IBaseRepository<BDFM.Domain.Entities.Security.Role> repository) : base(repository)
    {
    }

    public override Expression<Func<BDFM.Domain.Entities.Security.Role, bool>> EntityPredicate(UpdateRoleCommand request)
    {
        return r => r.Id == request.Id;
    }

    public async Task<Response<bool>> Handle(UpdateRoleCommand request, CancellationToken cancellationToken)
    {
        // Check for duplicate names or values before updating
        var duplicate = await _repository.Find(r => (r.Name == request.Name || r.Value == request.Value) && r.Id != request.Id, cancellationToken: cancellationToken);
        if (duplicate != null)
        {
            return ErrorsMessage.ExistOnCreate.ToErrorMessage(false);
        }

        return await HandleBase(request, cancellationToken);
    }
}
